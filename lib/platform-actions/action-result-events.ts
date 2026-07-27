/**
 * Platform action result events — honest outcome trail for UI + Voice + tests.
 */

export type PlatformActionResultKind =
  | "route_opened"
  | "filter_applied"
  | "entity_selected"
  | "object_opened"
  | "draft_prepared"
  | "confirmation_required"
  | "object_created"
  | "evidence_workflow_started"
  | "unavailable_capability"
  | "action_failed";

export type PlatformActionResultEvent = {
  readonly id: string;
  readonly at: string;
  readonly kind: PlatformActionResultKind;
  readonly actionId: string;
  readonly message: string;
  readonly href?: string;
};

const MAX_EVENTS = 40;
const listeners = new Set<(event: PlatformActionResultEvent) => void>();
let events: PlatformActionResultEvent[] = [];

export function emitPlatformActionResult(input: {
  readonly kind: PlatformActionResultKind;
  readonly actionId: string;
  readonly message: string;
  readonly href?: string;
}): PlatformActionResultEvent {
  const event: PlatformActionResultEvent = {
    id: `ar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    kind: input.kind,
    actionId: input.actionId,
    message: input.message,
    href: input.href,
  };
  events = [event, ...events].slice(0, MAX_EVENTS);
  for (const listener of listeners) listener(event);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cbai-platform-action-result", { detail: event }));
  }
  return event;
}

export function listPlatformActionResults(): readonly PlatformActionResultEvent[] {
  return events;
}

export function clearPlatformActionResults(): void {
  events = [];
}

export function subscribePlatformActionResults(listener: (event: PlatformActionResultEvent) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
