/** Session broker client — ephemeral credentials only, never long-lived API keys. */

import type { EphemeralRealtimeCredential, VoiceBrokerStatus } from "@/lib/voice-operator/types";

export type SessionBrokerRequest = {
  readonly language: string;
  readonly origin: string;
  readonly sessionHint?: string;
};

export type SessionBrokerResponse =
  | { readonly ok: true; readonly credential: EphemeralRealtimeCredential }
  | { readonly ok: false; readonly code: "BACKEND_REQUIRED" | "ORIGIN_BLOCKED" | "RATE_LIMITED" | "ERROR"; readonly message: string };

export function resolveVoiceBrokerUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_VOICE_BROKER_URL?.trim();
  return url || null;
}

export function evaluateVoiceBrokerStatus(): VoiceBrokerStatus {
  const brokerUrl = resolveVoiceBrokerUrl();
  if (!brokerUrl) {
    return {
      kind: "backend_required",
      reason: "NEXT_PUBLIC_VOICE_BROKER_URL is not configured.",
    };
  }
  return { kind: "available", brokerUrl };
}

/** Test-only mock broker — never used in production UI unless explicitly injected. */
let mockBrokerHandler: ((req: SessionBrokerRequest) => SessionBrokerResponse) | null = null;

export function setMockSessionBrokerHandler(
  handler: ((req: SessionBrokerRequest) => SessionBrokerResponse) | null,
): void {
  mockBrokerHandler = handler;
}

export async function requestRealtimeSessionCredential(
  request: SessionBrokerRequest,
): Promise<SessionBrokerResponse> {
  if (mockBrokerHandler) return mockBrokerHandler(request);

  const brokerUrl = resolveVoiceBrokerUrl();
  if (!brokerUrl) {
    return { ok: false, code: "BACKEND_REQUIRED", message: "Voice broker URL is not configured." };
  }

  try {
    const response = await fetch(`${brokerUrl.replace(/\/$/, "")}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: request.language,
        origin: request.origin,
        sessionHint: request.sessionHint,
      }),
    });

    if (response.status === 403) {
      return { ok: false, code: "ORIGIN_BLOCKED", message: "Origin not allowed." };
    }
    if (response.status === 429) {
      return { ok: false, code: "RATE_LIMITED", message: "Rate limit exceeded." };
    }
    if (!response.ok) {
      return { ok: false, code: "ERROR", message: `Broker error (${response.status}).` };
    }

    const payload = (await response.json()) as EphemeralRealtimeCredential;
    if (!payload.clientSecret || !payload.expiresAt) {
      return { ok: false, code: "ERROR", message: "Invalid broker response shape." };
    }
    return { ok: true, credential: payload };
  } catch {
    return { ok: false, code: "ERROR", message: "Network error reaching voice broker." };
  }
}

/** Guard: long-lived OpenAI API keys must never appear in client bundles. */
export function assertNoLongLivedApiKeyInClient(value: string | undefined): boolean {
  if (!value) return true;
  return !value.startsWith("sk-");
}
