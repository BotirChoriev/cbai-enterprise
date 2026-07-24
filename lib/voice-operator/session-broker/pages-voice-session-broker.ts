/**
 * Cloudflare Pages Function core — POST /api/voice/session
 * Creates ephemeral OpenAI Realtime client secrets; never exposes long-lived API keys.
 */

import { buildPlatformRealtimeTools } from "@/lib/platform-actions/realtime-tool-schemas";
import { buildVoiceOperatorInstructions } from "@/lib/voice-operator/instructions";
import {
  buildUpstreamErrorResponseBody,
  classifyUpstreamFailure,
  parseOpenAiErrorBody,
  redactUpstreamMessage,
  type UpstreamDiagnostics,
} from "@/lib/voice-operator/session-broker/upstream-diagnostics";
import { VOICE_VAD_CONFIG } from "@/lib/voice-operator/vad-config";

export const OPENAI_REALTIME_CLIENT_SECRETS_URL = "https://api.openai.com/v1/realtime/client_secrets";
export const REALTIME_MODEL = "gpt-realtime";
export const REALTIME_OUTPUT_VOICE = "marin";
export const MAX_VOICE_SESSION_BODY_BYTES = 4096;

export type VoiceSessionBrokerEnv = {
  readonly OPENAI_API_KEY?: string;
  readonly VOICE_ALLOWED_ORIGINS?: string;
};

export type VoiceSessionBrokerRequestBody = {
  readonly language?: string;
  readonly origin?: string;
  readonly sessionHint?: string;
};

export type OpenAiClientSecretCreateResponse = {
  readonly value?: string;
  readonly expires_at?: number | string;
  readonly session?: {
    readonly id?: string;
    readonly model?: string;
  };
  readonly client_secret?: {
    readonly value?: string;
    readonly expires_at?: number | string;
  };
};

export type VoiceSessionBrokerSuccess = {
  readonly clientSecret: string;
  readonly expiresAt: string;
  readonly sessionId: string;
  readonly model: string;
};

export type FetchLike = typeof fetch;

export type VoiceSessionBrokerOptions = {
  readonly fetchFn?: FetchLike;
  readonly exposeUpstreamDiagnostics?: boolean;
};

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  origin: string | null,
  allowedOrigins: readonly string[],
): Response {
  const headers = new Headers(JSON_HEADERS);
  headers.set("Cache-Control", "no-store");
  applyCors(headers, origin, allowedOrigins);
  return new Response(JSON.stringify(body), { status, headers });
}

function applyCors(headers: Headers, origin: string | null, allowedOrigins: readonly string[]): void {
  if (origin && isOriginAllowed(origin, allowedOrigins)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
}

/** Soft in-memory rate limit (abuse mitigation — not end-user auth). SF-1 remains productionBlocker. */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateBuckets = new Map<string, { count: number; windowStart: number }>();

export function resetVoiceBrokerRateLimitForTests(): void {
  rateBuckets.clear();
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
}

export function parseAllowedOrigins(raw: string | undefined): readonly string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * Exact origins plus optional wildcard entries like `https://*.cbai-enterprise.pages.dev`
 * so Preview hash aliases and branch aliases share one allowlist entry.
 */
export function isOriginAllowed(origin: string | null, allowedOrigins: readonly string[]): boolean {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;

  let hostname: string;
  try {
    hostname = new URL(origin).hostname;
  } catch {
    return false;
  }

  for (const entry of allowedOrigins) {
    const match = /^(https?):\/\/\*\.([^/]+)$/i.exec(entry);
    if (!match) continue;
    const scheme = match[1].toLowerCase();
    const suffix = match[2].toLowerCase();
    if (!origin.toLowerCase().startsWith(`${scheme}://`)) continue;
    const host = hostname.toLowerCase();
    if (host === suffix || host.endsWith(`.${suffix}`)) return true;
  }
  return false;
}

/**
 * Resolve request Origin for broker CORS/authz.
 * SF-1 partial: POST authorization requires the Origin *header*.
 * Body origin alone must not mint credentials (spoofable by non-browser clients).
 * Body origin may still be used to detect header/body mismatches when both are present.
 */
export function resolveRequestOrigin(request: Request, bodyOrigin?: string): string | null {
  const headerOrigin = request.headers.get("Origin")?.trim() || null;
  const trimmedBody = bodyOrigin?.trim() || null;
  if (headerOrigin && trimmedBody && headerOrigin !== trimmedBody) return null;
  // Require header for authorization — never fall back to body-only.
  return headerOrigin;
}

function assertNoSecretLeak(text: string, apiKey: string | undefined): void {
  if (apiKey && text.includes(apiKey)) {
    throw new Error("Broker attempted to leak OPENAI_API_KEY");
  }
  if (/\bsk-[A-Za-z0-9_-]{3,}\b/.test(text)) {
    throw new Error("Broker attempted to leak sk-* credential");
  }
  if (/\bek_[A-Za-z0-9_-]{8,}\b/.test(text)) {
    throw new Error("Broker attempted to leak ek_* credential");
  }
}

function sanitizeErrorText(text: string, apiKey: string | undefined): string {
  const sanitized = redactUpstreamMessage(text, apiKey);
  assertNoSecretLeak(sanitized, apiKey);
  return sanitized;
}

function sanitizeCredentialResponse(text: string, apiKey: string | undefined): string {
  let sanitized = text;
  if (apiKey?.trim()) {
    sanitized = sanitized.split(apiKey.trim()).join("[REDACTED]");
  }
  if (apiKey && sanitized.includes(apiKey)) {
    throw new Error("Broker attempted to leak OPENAI_API_KEY");
  }
  if (/\bsk-[A-Za-z0-9_-]{3,}\b/.test(sanitized)) {
    throw new Error("Broker attempted to leak sk-* credential");
  }
  return sanitized;
}

function normalizeExpiresAt(value: number | string | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber)) return asNumber;
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return Math.floor(parsed / 1000);
  }
  return null;
}

export function buildRealtimeClientSecretPayload(language: string | undefined): string {
  return JSON.stringify({
    expires_after: {
      anchor: "created_at",
      seconds: 600,
    },
    session: {
      type: "realtime",
      model: REALTIME_MODEL,
      instructions: buildVoiceOperatorInstructions(language ?? "en"),
      tools: buildPlatformRealtimeTools(),
      tool_choice: "auto",
      audio: {
        output: {
          voice: REALTIME_OUTPUT_VOICE,
        },
        input: {
          turn_detection: {
            type: "server_vad",
            silence_duration_ms: VOICE_VAD_CONFIG.silenceDurationMs,
            interrupt_response: VOICE_VAD_CONFIG.bargeInEnabled,
          },
        },
      },
    },
  });
}

function mapUpstreamResponse(
  upstream: OpenAiClientSecretCreateResponse,
  sessionHint?: string,
): VoiceSessionBrokerSuccess | null {
  const clientSecret = (upstream.value ?? upstream.client_secret?.value)?.trim();
  const expiresAtEpoch = normalizeExpiresAt(upstream.expires_at ?? upstream.client_secret?.expires_at);
  if (!clientSecret || !clientSecret.startsWith("ek_") || expiresAtEpoch === null) {
    return null;
  }
  if (clientSecret.startsWith("sk-")) return null;

  return {
    clientSecret,
    expiresAt: new Date(expiresAtEpoch * 1000).toISOString(),
    sessionId: upstream.session?.id ?? sessionHint ?? "realtime-session",
    model: upstream.session?.model ?? REALTIME_MODEL,
  };
}

export type CreateOpenAiClientSecretResult =
  | { ok: true; data: OpenAiClientSecretCreateResponse }
  | { ok: false; diagnostics: UpstreamDiagnostics };

export async function createOpenAiClientSecret(
  apiKey: string,
  language: string | undefined,
  fetchFn: FetchLike,
): Promise<CreateOpenAiClientSecretResult> {
  let response: Response;
  try {
    response = await fetchFn(OPENAI_REALTIME_CLIENT_SECRETS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: buildRealtimeClientSecretPayload(language),
    });
  } catch {
    return {
      ok: false,
      diagnostics: classifyUpstreamFailure({ status: 0, cause: "network" }),
    };
  }

  const requestId = response.headers.get("x-request-id");
  const rawBody = await response.text();

  if (!response.ok) {
    return {
      ok: false,
      diagnostics: classifyUpstreamFailure({
        status: response.status,
        errorBody: parseOpenAiErrorBody(rawBody),
        requestId,
        apiKey,
      }),
    };
  }

  try {
    const data = JSON.parse(rawBody) as OpenAiClientSecretCreateResponse;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      diagnostics: classifyUpstreamFailure({
        status: response.status,
        cause: "invalid_shape",
        requestId,
      }),
    };
  }
}

async function readJsonBody(request: Request): Promise<
  | { ok: true; body: VoiceSessionBrokerRequestBody }
  | { ok: false; status: 400; error: string }
> {
  const raw = await request.text();
  if (raw.length > MAX_VOICE_SESSION_BODY_BYTES) {
    return { ok: false, status: 400, error: "payload_too_large" };
  }
  if (!raw.trim()) {
    return { ok: true, body: {} };
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, status: 400, error: "invalid_json" };
    }
    const body = parsed as VoiceSessionBrokerRequestBody;
    if (body.language !== undefined && typeof body.language !== "string") {
      return { ok: false, status: 400, error: "invalid_json" };
    }
    if (body.origin !== undefined && typeof body.origin !== "string") {
      return { ok: false, status: 400, error: "invalid_json" };
    }
    if (body.sessionHint !== undefined && typeof body.sessionHint !== "string") {
      return { ok: false, status: 400, error: "invalid_json" };
    }
    return { ok: true, body };
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }
}

function upstreamFailureResponse(
  diagnostics: UpstreamDiagnostics,
  origin: string,
  allowedOrigins: readonly string[],
  apiKey: string | undefined,
  exposeDiagnostics: boolean,
): Response {
  const body = buildUpstreamErrorResponseBody(diagnostics, exposeDiagnostics);
  const payload = sanitizeErrorText(JSON.stringify(body), apiKey);
  const headers = new Headers(JSON_HEADERS);
  headers.set("Cache-Control", "no-store");
  applyCors(headers, origin, allowedOrigins);
  return new Response(payload, { status: 502, headers });
}

export async function handleVoiceSessionBrokerRequest(
  request: Request,
  env: VoiceSessionBrokerEnv,
  options?: VoiceSessionBrokerOptions,
): Promise<Response> {
  const fetchFn = options?.fetchFn ?? fetch;
  const exposeDiagnostics = options?.exposeUpstreamDiagnostics === true;
  const allowedOrigins = parseAllowedOrigins(env.VOICE_ALLOWED_ORIGINS);

  if (allowedOrigins.length === 0) {
    return jsonResponse({ error: "backend_required" }, 503, null, allowedOrigins);
  }

  const method = request.method.toUpperCase();

  if (method === "OPTIONS") {
    const origin = request.headers.get("Origin")?.trim() ?? null;
    if (!origin || !isOriginAllowed(origin, allowedOrigins)) {
      return jsonResponse({ error: "origin_blocked" }, 403, origin, allowedOrigins);
    }
    const headers = new Headers();
    headers.set("Cache-Control", "no-store");
    applyCors(headers, origin, allowedOrigins);
    return new Response(null, { status: 204, headers });
  }

  if (method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405, request.headers.get("Origin"), allowedOrigins);
  }

  const parsedBody = await readJsonBody(request);
  if (!parsedBody.ok) {
    return jsonResponse({ error: parsedBody.error }, parsedBody.status, request.headers.get("Origin"), allowedOrigins);
  }

  const origin = resolveRequestOrigin(request, parsedBody.body.origin);
  if (!origin || !isOriginAllowed(origin, allowedOrigins)) {
    return jsonResponse({ error: "origin_blocked" }, 403, origin, allowedOrigins);
  }

  const rateKey = `${origin}|${request.headers.get("CF-Connecting-IP")?.trim() || "unknown"}`;
  if (!checkRateLimit(rateKey)) {
    return jsonResponse({ error: "rate_limited" }, 429, origin, allowedOrigins);
  }

  const apiKey = env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return jsonResponse({ error: "backend_required" }, 503, origin, allowedOrigins);
  }

  const upstream = await createOpenAiClientSecret(apiKey, parsedBody.body.language, fetchFn);
  if (!upstream.ok) {
    return upstreamFailureResponse(upstream.diagnostics, origin, allowedOrigins, apiKey, exposeDiagnostics);
  }

  const mapped = mapUpstreamResponse(upstream.data, parsedBody.body.sessionHint);
  if (!mapped) {
    const diagnostics = classifyUpstreamFailure({
      status: 200,
      cause: "invalid_shape",
    });
    return upstreamFailureResponse(diagnostics, origin, allowedOrigins, apiKey, exposeDiagnostics);
  }

  const successBody = sanitizeCredentialResponse(JSON.stringify(mapped), apiKey);
  const headers = new Headers(JSON_HEADERS);
  headers.set("Cache-Control", "no-store");
  applyCors(headers, origin, allowedOrigins);
  return new Response(successBody, { status: 200, headers });
}
