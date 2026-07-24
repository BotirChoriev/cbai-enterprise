/**
 * Engine events — browser event dispatch for workspace UI updates.
 */

export const ENGINE_RUN_STARTED = "cbai:engine-run-started";
export const ENGINE_RUN_CONFIRMED = "cbai:engine-run-confirmed";
export const ENGINE_RUN_CANCELLED = "cbai:engine-run-cancelled";
export const ENGINE_RUN_COMPLETED = "cbai:engine-run-completed";

export type EngineRunEventDetail = {
  readonly runId: string;
  readonly engineId: string;
};

export function dispatchEngineEvent(eventName: string, detail: EngineRunEventDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

export function subscribeEngineEvent(
  eventName: string,
  handler: (detail: EngineRunEventDetail) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => handler((e as CustomEvent<EngineRunEventDetail>).detail);
  window.addEventListener(eventName, listener);
  return () => window.removeEventListener(eventName, listener);
}
