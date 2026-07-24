/**
 * OpenAI Realtime upstream failure classification — never exposes API keys or client secrets.
 */

export type UpstreamFailureClassification =
  | "invalid_api_key"
  | "project_or_model_access_denied"
  | "insufficient_quota"
  | "rate_limited"
  | "invalid_realtime_request"
  | "upstream_unreachable"
  | "upstream_service_error"
  | "invalid_upstream_credential_shape";

export type OpenAiErrorPayload = {
  readonly message?: string;
  readonly type?: string;
  readonly code?: string;
  readonly param?: string;
};

export type OpenAiErrorBody = {
  readonly error?: OpenAiErrorPayload;
};

export type UpstreamDiagnostics = {
  readonly classification: UpstreamFailureClassification;
  readonly upstreamStatus: number;
  readonly openAiType?: string;
  readonly openAiCode?: string;
  readonly message?: string;
  readonly requestId?: string;
};

const SECRET_PATTERNS: readonly RegExp[] = [
  /\bsk-[A-Za-z0-9_-]{3,}\b/g,
  /\bek_[A-Za-z0-9_-]{8,}\b/g,
  /\bBearer\s+[A-Za-z0-9._-]+\b/gi,
];

export function redactUpstreamMessage(text: string, apiKey?: string): string {
  let sanitized = text;
  if (apiKey?.trim()) {
    sanitized = sanitized.split(apiKey.trim()).join("[REDACTED]");
  }
  for (const pattern of SECRET_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }
  return sanitized;
}

export function truncateDiagnosticMessage(text: string, apiKey?: string): string {
  return redactUpstreamMessage(text, apiKey).slice(0, 280);
}

export function parseOpenAiErrorBody(raw: string): OpenAiErrorBody | null {
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as OpenAiErrorBody;
  } catch {
    return null;
  }
}

export function classifyUpstreamFailure(input: {
  readonly status: number;
  readonly errorBody?: OpenAiErrorBody | null;
  readonly cause?: "network" | "timeout" | "invalid_shape";
  readonly requestId?: string | null;
  readonly apiKey?: string;
}): UpstreamDiagnostics {
  const errorPayload = input.errorBody?.error;
  const openAiType = errorPayload?.type?.trim() || undefined;
  const openAiCode = errorPayload?.code?.trim() || undefined;
  const message = errorPayload?.message
    ? truncateDiagnosticMessage(errorPayload.message, input.apiKey)
    : undefined;
  const requestId = input.requestId?.trim() || undefined;

  if (input.cause === "network" || input.cause === "timeout" || input.status === 0) {
    return {
      classification: "upstream_unreachable",
      upstreamStatus: input.status,
      openAiType,
      openAiCode,
      message: input.cause === "timeout" ? "Upstream request timed out." : "Upstream network request failed.",
      requestId,
    };
  }

  if (input.cause === "invalid_shape") {
    return {
      classification: "invalid_upstream_credential_shape",
      upstreamStatus: input.status,
      openAiType,
      openAiCode,
      message: "Upstream credential response shape was invalid.",
      requestId,
    };
  }

  if (input.status === 401) {
    return {
      classification: "invalid_api_key",
      upstreamStatus: input.status,
      openAiType,
      openAiCode,
      message,
      requestId,
    };
  }

  if (input.status === 403) {
    return {
      classification: "project_or_model_access_denied",
      upstreamStatus: input.status,
      openAiType,
      openAiCode,
      message,
      requestId,
    };
  }

  if (input.status === 429) {
    const classification =
      openAiCode === "insufficient_quota" ? "insufficient_quota" : "rate_limited";
    return {
      classification,
      upstreamStatus: input.status,
      openAiType,
      openAiCode,
      message,
      requestId,
    };
  }

  if (input.status === 400) {
    return {
      classification: "invalid_realtime_request",
      upstreamStatus: input.status,
      openAiType,
      openAiCode,
      message,
      requestId,
    };
  }

  if (input.status >= 500) {
    return {
      classification: "upstream_service_error",
      upstreamStatus: input.status,
      openAiType,
      openAiCode,
      message,
      requestId,
    };
  }

  return {
    classification: "invalid_realtime_request",
    upstreamStatus: input.status,
    openAiType,
    openAiCode,
    message,
    requestId,
  };
}

export function upstreamNextAction(classification: UpstreamFailureClassification): string {
  switch (classification) {
    case "invalid_api_key":
      return "Set a valid OPENAI_API_KEY in .dev.vars (full project key from https://platform.openai.com/api-keys), then restart npm run dev:voice.";
    case "insufficient_quota":
      return "Add billing credits or raise project usage limits in your OpenAI account, then retry.";
    case "project_or_model_access_denied":
      return "Enable Realtime model access for your OpenAI project/org, then retry.";
    case "rate_limited":
      return "Wait briefly and retry; reduce concurrent Realtime session creation.";
    case "invalid_realtime_request":
      return "Check broker Realtime payload against the current OpenAI GA contract and retry.";
    case "upstream_unreachable":
      return "Verify network access to https://api.openai.com and restart the local voice broker.";
    case "upstream_service_error":
      return "Retry later; if persistent, check OpenAI status and project health.";
    case "invalid_upstream_credential_shape":
      return "Broker received an unexpected credential shape from OpenAI — update response parsing or report upstream drift.";
  }
}

export type UpstreamDiagnosticPayload = {
  readonly status: number;
  readonly type?: string;
  readonly code?: string;
  readonly message?: string;
  readonly requestId?: string;
};

export function buildUpstreamErrorResponseBody(
  diagnostics: UpstreamDiagnostics,
  exposeDiagnostics: boolean,
): { error: string; upstream?: UpstreamDiagnosticPayload } {
  if (!exposeDiagnostics) {
    return { error: "broker_upstream_error" };
  }

  return {
    error: diagnostics.classification,
    upstream: {
      status: diagnostics.upstreamStatus,
      ...(diagnostics.openAiType ? { type: diagnostics.openAiType } : {}),
      ...(diagnostics.openAiCode ? { code: diagnostics.openAiCode } : {}),
      ...(diagnostics.message ? { message: diagnostics.message } : {}),
      ...(diagnostics.requestId ? { requestId: diagnostics.requestId } : {}),
    },
  };
}
