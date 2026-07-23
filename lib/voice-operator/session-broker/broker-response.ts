/** Pure broker HTTP response classification — testable without fetch. */

import type { EphemeralRealtimeCredential } from "@/lib/voice-operator/types";
import type { SessionBrokerResponse } from "@/lib/voice-operator/session-broker/client";

export type BrokerResponseInput = {
  readonly status: number;
  readonly contentType: string | null;
  readonly bodyText: string;
};

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function normalizeContentType(contentType: string | null): string {
  return contentType?.split(";")[0]?.trim().toLowerCase() ?? "";
}

export function isBrokerAuthenticationRedirect(status: number): boolean {
  return REDIRECT_STATUSES.has(status);
}

export function isBrokerHtmlResponse(contentType: string | null, bodyText: string): boolean {
  const normalized = normalizeContentType(contentType);
  if (normalized.includes("text/html")) return true;
  const trimmed = bodyText.trim().toLowerCase();
  return trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html");
}

export function parseBrokerCredentialJson(bodyText: string): EphemeralRealtimeCredential | null {
  try {
    const payload = JSON.parse(bodyText) as EphemeralRealtimeCredential;
    if (!payload.clientSecret || !payload.expiresAt) return null;
    if (payload.clientSecret.startsWith("sk-")) return null;
    return payload;
  } catch {
    return null;
  }
}

export function classifyBrokerHttpResponse(input: BrokerResponseInput): SessionBrokerResponse {
  const { status, contentType, bodyText } = input;

  if (isBrokerAuthenticationRedirect(status)) {
    return {
      ok: false,
      code: "AUTHENTICATION_FAILED",
      message: "Voice broker authentication is required.",
    };
  }

  if (status === 401 || status === 407) {
    return {
      ok: false,
      code: "AUTHENTICATION_FAILED",
      message: "Voice broker authentication failed.",
    };
  }

  if (status === 403) {
    if (isBrokerHtmlResponse(contentType, bodyText)) {
      return {
        ok: false,
        code: "AUTHENTICATION_FAILED",
        message: "Voice broker authentication is required.",
      };
    }
    if (upstreamError?.error === "origin_blocked") {
      return { ok: false, code: "ORIGIN_BLOCKED", message: "Origin not allowed." };
    }
    const classified = upstreamError?.error ? classifyUpstreamBrokerError(upstreamError.error) : null;
    if (classified) return classified;
    return { ok: false, code: "ORIGIN_BLOCKED", message: "Origin not allowed." };
  }

  if (status === 429) {
    return { ok: false, code: "RATE_LIMITED", message: "Rate limit exceeded." };
  }

  if (status === 503) {
    return { ok: false, code: "BACKEND_REQUIRED", message: "Voice broker backend is not configured." };
  }

  if (!status || status < 200 || status >= 300) {
    return { ok: false, code: "ERROR", message: `Broker error (${status}).` };
  }

  if (isBrokerHtmlResponse(contentType, bodyText)) {
    return {
      ok: false,
      code: "AUTHENTICATION_FAILED",
      message: "Voice broker returned an HTML login page instead of JSON.",
    };
  }

  const credential = parseBrokerCredentialJson(bodyText);
  if (!credential) {
    return { ok: false, code: "ERROR", message: "Invalid broker response shape." };
  }

  return { ok: true, credential };
}
