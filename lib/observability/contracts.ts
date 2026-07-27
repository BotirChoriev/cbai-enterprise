/**
 * Provider-neutral observability — no secrets, file bytes, transcripts, or signed URLs.
 * External vendor wiring is EXTERNAL_BLOCKED until authorized.
 */

export type ObservabilityEnvironment = "development" | "preview" | "production" | "test";

export type SafeLogCategory =
  | "frontend_exception"
  | "route_failure"
  | "broker_error"
  | "upload_failure"
  | "storage_failure"
  | "permission_denial"
  | "authorization_denial"
  | "background_processing"
  | "webrtc_transition"
  | "message_delivery"
  | "publication_workflow";

export type ObservabilityEvent = {
  readonly correlationId: string;
  readonly environment: ObservabilityEnvironment;
  readonly category: SafeLogCategory;
  readonly routeOrActionId: string | null;
  /** Anonymous category or hashed actor id — never email/password/token. */
  readonly actorCategory: "guest" | "device_local" | "cloud" | "unknown";
  readonly code: string;
  readonly message: string;
  readonly at: string;
};

export interface ObservabilityAdapter {
  record(event: ObservabilityEvent): void;
}

const recent = new Map<string, number>();
const RATE_MS = 2_000;

function rateAllow(key: string): boolean {
  const now = Date.now();
  const last = recent.get(key) ?? 0;
  if (now - last < RATE_MS) return false;
  recent.set(key, now);
  return true;
}

export function createConsoleObservabilityAdapter(): ObservabilityAdapter {
  return {
    record(event) {
      const key = `${event.category}|${event.code}|${event.routeOrActionId ?? ""}`;
      if (!rateAllow(key)) return;
      // Local console adapter — no secrets in payload by contract.
      console.info("[cbai-obs]", {
        correlationId: event.correlationId,
        environment: event.environment,
        category: event.category,
        routeOrActionId: event.routeOrActionId,
        actorCategory: event.actorCategory,
        code: event.code,
        message: event.message,
        at: event.at,
      });
    },
  };
}

let adapter: ObservabilityAdapter = createConsoleObservabilityAdapter();

export function setObservabilityAdapter(next: ObservabilityAdapter): void {
  adapter = next;
}

export function recordObservability(event: ObservabilityEvent): void {
  adapter.record(event);
}

export function newCorrelationId(): string {
  return `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
