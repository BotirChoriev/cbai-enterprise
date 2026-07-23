/**
 * Fetch adapter — timeout, retry, rate-limit classification.
 * Phase 1: reusable HTTP plumbing only; no official source is wired as live.
 */

import type { FailureClass } from "@/lib/official-connector-foundation/types";

export type FetchAdapterOptions = {
  readonly timeoutMs?: number;
  readonly maxRetries?: number;
  readonly retryDelayMs?: number;
  readonly headers?: Record<string, string>;
};

export type FetchAdapterSuccess = {
  readonly ok: true;
  readonly status: number;
  readonly bodyText: string;
  readonly retrievedAt: string;
  readonly attemptCount: number;
};

export type FetchAdapterFailure = {
  readonly ok: false;
  readonly failureClass: FailureClass;
  readonly status?: number;
  readonly message: string;
  readonly retrievedAt: string;
  readonly attemptCount: number;
};

export type FetchAdapterResult = FetchAdapterSuccess | FetchAdapterFailure;

export function classifyHttpFailure(status: number, bodyText = ""): FailureClass {
  if (status === 429) return "rate_limit";
  const lower = bodyText.toLowerCase();
  if (
    status === 403 &&
    (lower.includes("rate") || lower.includes("throttle") || lower.includes("quota"))
  ) {
    return "rate_limit";
  }
  return "http_error";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type FetchLike = (
  input: string,
  init?: { headers?: Record<string, string>; signal?: AbortSignal }
) => Promise<{
  status: number;
  ok: boolean;
  text(): Promise<string>;
}>;

/**
 * Perform a GET with timeout + limited retries.
 * Retries on timeout and 5xx; never retries rate limits as success paths.
 */
export async function fetchWithFoundationAdapter(
  url: string,
  options: FetchAdapterOptions = {},
  fetchImpl: FetchLike = fetch as FetchLike
): Promise<FetchAdapterResult> {
  const timeoutMs = options.timeoutMs ?? 12_000;
  const maxRetries = options.maxRetries ?? 2;
  const retryDelayMs = options.retryDelayMs ?? 250;
  const retrievedAt = new Date().toISOString();
  let attemptCount = 0;
  let lastFailure: FetchAdapterFailure | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attemptCount = attempt + 1;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {
        headers: {
          Accept: "application/json",
          ...(options.headers ?? {}),
        },
        signal: controller.signal,
      });
      const bodyText = await response.text();
      if (response.status === 429 || classifyHttpFailure(response.status, bodyText) === "rate_limit") {
        return {
          ok: false,
          failureClass: "rate_limit",
          status: response.status,
          message: `Rate limited (${response.status})`,
          retrievedAt,
          attemptCount,
        };
      }
      if (!response.ok) {
        const failureClass = classifyHttpFailure(response.status, bodyText);
        lastFailure = {
          ok: false,
          failureClass,
          status: response.status,
          message: `HTTP ${response.status}`,
          retrievedAt,
          attemptCount,
        };
        if (response.status >= 500 && attempt < maxRetries) {
          await sleep(retryDelayMs * (attempt + 1));
          continue;
        }
        return lastFailure;
      }
      return {
        ok: true,
        status: response.status,
        bodyText,
        retrievedAt,
        attemptCount,
      };
    } catch (error) {
      const isAbort =
        error instanceof Error &&
        (error.name === "AbortError" || /aborted|timeout/i.test(error.message));
      lastFailure = {
        ok: false,
        failureClass: isAbort ? "timeout" : "network_error",
        message: error instanceof Error ? error.message : "Network failure",
        retrievedAt,
        attemptCount,
      };
      if (attempt < maxRetries) {
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
      message: "Fetch failed",
      retrievedAt,
      attemptCount,
    }
  );
}
