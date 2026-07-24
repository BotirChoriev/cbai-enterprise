/** Session broker client — ephemeral credentials only, never long-lived API keys. */

import { classifyBrokerHttpResponse } from "@/lib/voice-operator/session-broker/broker-response";
import type { EphemeralRealtimeCredential, VoiceBrokerStatus } from "@/lib/voice-operator/types";

export type SessionBrokerRequest = {
  readonly language: string;
  readonly origin: string;
  readonly sessionHint?: string;
};

export type SessionBrokerResponse =
  | { readonly ok: true; readonly credential: EphemeralRealtimeCredential }
  | {
      readonly ok: false;
      readonly code:
        | "BACKEND_REQUIRED"
        | "ORIGIN_BLOCKED"
        | "RATE_LIMITED"
        | "AUTHENTICATION_FAILED"
        | "INVALID_API_KEY"
        | "QUOTA_OR_ACCOUNT_BLOCKED"
        | "ERROR";
      readonly message: string;
    };

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "::1";
}

function isCloudflarePagesHost(hostname: string): boolean {
  return hostname === "pages.dev" || hostname.endsWith(".pages.dev");
}

/**
 * Resolve the broker base URL (…/api/voice, without /session).
 *
 * Preview fix: when the app is served from a Cloudflare Pages host, always call the
 * **same-origin** Pages Function at `/api/voice` so Access cookies apply and hash vs
 * branch-alias host mismatches cannot break the mint. Local loopback brokers (doctor)
 * keep the configured absolute URL (different port).
 */
export function resolveVoiceBrokerUrl(
  envUrl?: string | null,
  pageOrigin?: string | null,
): string | null {
  const rawEnv = envUrl === undefined ? process.env.NEXT_PUBLIC_VOICE_BROKER_URL : envUrl;
  const configured = rawEnv?.trim() || null;
  if (!configured) return null;

  const origin =
    pageOrigin === undefined
      ? typeof window !== "undefined"
        ? window.location.origin
        : undefined
      : pageOrigin ?? undefined;

  if (!origin) {
    return stripTrailingSlash(configured);
  }

  try {
    const page = new URL(origin);
    const broker = new URL(configured, origin);

    if (isLoopbackHost(broker.hostname)) {
      return stripTrailingSlash(broker.href);
    }

    if (broker.origin === page.origin) {
      return stripTrailingSlash(`${broker.origin}${broker.pathname}`);
    }

    // Pages Preview / production Pages: colocated Function — never cross-origin mint.
    if (isCloudflarePagesHost(page.hostname)) {
      return `${page.origin}/api/voice`;
    }

    return stripTrailingSlash(broker.href);
  } catch {
    return stripTrailingSlash(configured);
  }
}

/** Test-only override for broker env URL (undefined = use process.env). */
let brokerEnvUrlOverride: string | null | undefined = undefined;

export function setVoiceBrokerEnvUrlForTests(url: string | null | undefined): void {
  brokerEnvUrlOverride = url;
}

export function evaluateVoiceBrokerStatus(): VoiceBrokerStatus {
  const envUrl =
    brokerEnvUrlOverride === undefined ? undefined : brokerEnvUrlOverride;
  // `null` means explicitly unset for tests; `undefined` reads process.env.
  const brokerUrl = resolveVoiceBrokerUrl(envUrl === undefined ? undefined : envUrl);
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
  options?: { readonly signal?: AbortSignal },
): Promise<SessionBrokerResponse> {
  if (mockBrokerHandler) {
    if (options?.signal?.aborted) {
      return { ok: false, code: "ERROR", message: "Broker request aborted." };
    }
    return mockBrokerHandler(request);
  }

  const brokerUrl = resolveVoiceBrokerUrl();
  if (!brokerUrl) {
    return { ok: false, code: "BACKEND_REQUIRED", message: "Voice broker URL is not configured." };
  }

  try {
    const response = await fetch(`${brokerUrl.replace(/\/$/, "")}/session`, {
      method: "POST",
      redirect: "manual",
      // Same-origin Access session cookies must be sent with the mint request.
      credentials: "include",
      signal: options?.signal,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        language: request.language,
        origin: request.origin,
        sessionHint: request.sessionHint,
      }),
    });

    if (options?.signal?.aborted) {
      return { ok: false, code: "ERROR", message: "Broker request aborted." };
    }

    const bodyText = await response.text();
    return classifyBrokerHttpResponse({
      status: response.status,
      contentType: response.headers.get("Content-Type"),
      bodyText,
    });
  } catch (error) {
    if (options?.signal?.aborted || (error instanceof DOMException && error.name === "AbortError")) {
      return { ok: false, code: "ERROR", message: "Broker request aborted." };
    }
    return { ok: false, code: "ERROR", message: "Network error reaching voice broker." };
  }
}

/** Guard: long-lived OpenAI API keys must never appear in client bundles. */
export function assertNoLongLivedApiKeyInClient(value: string | undefined): boolean {
  if (!value) return true;
  return !value.startsWith("sk-");
}
