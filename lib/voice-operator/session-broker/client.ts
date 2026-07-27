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
        | "MALFORMED_RESPONSE"
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

function resolvePageOrigin(pageOrigin?: string | null): string | undefined {
  if (pageOrigin === undefined) {
    return typeof window !== "undefined" ? window.location.origin : undefined;
  }
  return pageOrigin ?? undefined;
}

/** Same-origin Pages Function path used on deployed HTTPS hosts. */
export function sameOriginVoiceBrokerUrl(origin: string): string {
  return `${stripTrailingSlash(origin)}/api/voice`;
}

/**
 * Resolve the broker base URL (…/api/voice, without /session).
 *
 * Precedence:
 * 1. Valid explicit NEXT_PUBLIC_VOICE_BROKER_URL (or test override)
 * 2. On deployed HTTPS (non-loopback) page origins → `${origin}/api/voice`
 * 3. Localhost/loopback → only when explicitly configured
 * 4. Otherwise null → honest text-only fallback
 *
 * Secrets never enter the browser through this module.
 */
export function resolveVoiceBrokerUrl(
  envUrl?: string | null,
  pageOrigin?: string | null,
): string | null {
  const rawEnv = envUrl === undefined ? process.env.NEXT_PUBLIC_VOICE_BROKER_URL : envUrl;
  const configured = rawEnv?.trim() || null;
  const origin = resolvePageOrigin(pageOrigin);

  if (configured) {
    if (!origin) {
      return stripTrailingSlash(configured);
    }

    try {
      const page = new URL(origin);
      const broker = new URL(configured, origin);

      if (isLoopbackHost(broker.hostname)) {
        // A loopback broker (e.g. the `npm run dev:voice` default baked in from
        // .env.local) can only ever serve a loopback page. On any deployed,
        // non-loopback host — especially HTTPS, where fetching http://127.0.0.1
        // is blocked as mixed content and throws — honoring it guarantees a dead
        // voice pipeline. Ignore the stray loopback URL and use the colocated
        // same-origin Pages Function instead.
        if (isLoopbackHost(page.hostname)) {
          return stripTrailingSlash(broker.href);
        }
        return sameOriginVoiceBrokerUrl(page.origin);
      }

      if (broker.origin === page.origin) {
        return stripTrailingSlash(`${broker.origin}${broker.pathname}`);
      }

      // Pages Preview / production Pages: colocated Function — never cross-origin mint.
      if (isCloudflarePagesHost(page.hostname)) {
        return sameOriginVoiceBrokerUrl(page.origin);
      }

      // Other HTTPS deploys: prefer same-origin function unless override is intentional absolute.
      if (page.protocol === "https:" && !isLoopbackHost(page.hostname)) {
        return sameOriginVoiceBrokerUrl(page.origin);
      }

      return stripTrailingSlash(broker.href);
    } catch {
      return stripTrailingSlash(configured);
    }
  }

  // No build-time URL: still enable same-origin broker on deployed HTTPS hosts.
  if (origin) {
    try {
      const page = new URL(origin);
      if (page.protocol === "https:" && !isLoopbackHost(page.hostname)) {
        return sameOriginVoiceBrokerUrl(page.origin);
      }
    } catch {
      return null;
    }
  }

  return null;
}

/** Test-only override for broker env URL (undefined = use process.env). */
let brokerEnvUrlOverride: string | null | undefined = undefined;

export function setVoiceBrokerEnvUrlForTests(url: string | null | undefined): void {
  brokerEnvUrlOverride = url;
}

function activeBrokerEnvUrl(): string | null | undefined {
  return brokerEnvUrlOverride === undefined ? undefined : brokerEnvUrlOverride;
}

/**
 * Evaluate whether a Realtime broker base URL is available.
 * On the client, defaults to `window.location.origin` so deployed HTTPS Pages
 * resolve same-origin `/api/voice` even when `NEXT_PUBLIC_VOICE_BROKER_URL`
 * was not baked into the static export.
 */
export function evaluateVoiceBrokerStatus(pageOrigin?: string | null): VoiceBrokerStatus {
  const origin =
    pageOrigin === undefined
      ? typeof window !== "undefined"
        ? window.location.origin
        : null
      : pageOrigin;
  const brokerUrl = resolveVoiceBrokerUrl(activeBrokerEnvUrl(), origin);
  if (!brokerUrl) {
    return {
      kind: "backend_required",
      reason: "Voice broker is not configured for this environment.",
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

  const brokerUrl = resolveVoiceBrokerUrl(activeBrokerEnvUrl(), request.origin);
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
