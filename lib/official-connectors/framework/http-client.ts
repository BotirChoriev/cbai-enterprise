/**
 * HTTP client with timeout, retry, rate-limit detection, and failure classification.
 */

import type { ConnectorFailureClass } from "@/lib/official-connectors/types";

export type HttpClientOptions = {
  readonly timeoutMs?: number;
  readonly retries?: number;
  readonly retryDelayMs?: number;
  readonly headers?: Record<string, string>;
};

export type HttpClientSuccess = {
  readonly ok: true;
  readonly status: number;
  readonly bodyText: string;
  readonly durationMs: number;
};

export type HttpClientFailure = {
  readonly ok: false;
  readonly failureClass: ConnectorFailureClass;
  readonly message: string;
  readonly status?: number;
  readonly durationMs: number;
};

export type HttpClientResult = HttpClientSuccess | HttpClientFailure;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function officialFetch(
  url: string,
  options: HttpClientOptions = {},
): Promise<HttpClientResult> {
  const timeoutMs = options.timeoutMs ?? 12_000;
  const retries = options.retries ?? 2;
  const retryDelayMs = options.retryDelayMs ?? 400;
  const headers = {
    Accept: "application/json",
    "User-Agent": "CBAI-Enterprise-OfficialConnector/1.0 (Preview; provenance-preserving)",
    ...options.headers,
  };

  let lastFailure: HttpClientFailure | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { headers, signal: controller.signal });
      const durationMs = Date.now() - started;
      const bodyText = await response.text();

      if (response.status === 429) {
        lastFailure = {
          ok: false,
          failureClass: "rate_limit",
          message: "Rate limited by official source",
          status: 429,
          durationMs,
        };
        if (attempt < retries) {
          await sleep(retryDelayMs * (attempt + 1) * 2);
          continue;
        }
        return lastFailure;
      }

      if (!response.ok) {
        lastFailure = {
          ok: false,
          failureClass: "http_error",
          message: `HTTP ${response.status}`,
          status: response.status,
          durationMs,
        };
        if (attempt < retries && response.status >= 500) {
          await sleep(retryDelayMs * (attempt + 1));
          continue;
        }
        return lastFailure;
      }

      return { ok: true, status: response.status, bodyText, durationMs };
    } catch (error) {
      const durationMs = Date.now() - started;
      const name = error instanceof Error ? error.name : "Error";
      const message = error instanceof Error ? error.message : String(error);
      const failureClass: ConnectorFailureClass =
        name === "AbortError" || /aborted|timeout/i.test(message) ? "timeout" : "network_error";
      lastFailure = { ok: false, failureClass, message, durationMs };
      if (attempt < retries) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }
      return lastFailure;
    } finally {
      clearTimeout(timer);
    }
  }

  return (
    lastFailure ?? {
      ok: false,
      failureClass: "network_error",
      message: "Unknown fetch failure",
      durationMs: 0,
    }
  );
}

export function parseJsonBody(bodyText: string):
  | { ok: true; value: unknown }
  | { ok: false; failureClass: "malformed_response"; message: string } {
  try {
    return { ok: true, value: JSON.parse(bodyText) as unknown };
  } catch {
    return { ok: false, failureClass: "malformed_response", message: "Response is not valid JSON" };
  }
}
