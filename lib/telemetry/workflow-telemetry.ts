/**
 * BUILD-027 — Development telemetry adapter.
 * Stores anonymized workflow events in localStorage — no third-party tracking.
 * Never records raw typed content, note bodies, passwords, or voice audio.
 */

import type { WorkflowEventName, WorkflowEventPayload } from "@/lib/telemetry/workflow-events.types";

const STORAGE_KEY = "cbai-workflow-telemetry";
const MAX_EVENTS = 500;

const memoryEvents: WorkflowEventPayload[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readEvents(): WorkflowEventPayload[] {
  if (!isBrowser()) return [...memoryEvents];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is WorkflowEventPayload =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as WorkflowEventPayload).event === "string" &&
        typeof (item as WorkflowEventPayload).timestamp === "string",
    );
  } catch {
    return [];
  }
}

function writeEvents(events: readonly WorkflowEventPayload[]): void {
  const trimmed = events.slice(-MAX_EVENTS);
  if (!isBrowser()) {
    memoryEvents.length = 0;
    memoryEvents.push(...trimmed);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function recordWorkflowEvent(
  event: WorkflowEventName,
  fields: Omit<WorkflowEventPayload, "event" | "timestamp"> = {},
): WorkflowEventPayload {
  const payload: WorkflowEventPayload = {
    event,
    timestamp: new Date().toISOString(),
    ...fields,
  };
  writeEvents([...readEvents(), payload]);
  return payload;
}

export function loadWorkflowEvents(): readonly WorkflowEventPayload[] {
  return readEvents();
}

export function clearWorkflowEvents(): void {
  memoryEvents.length = 0;
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function exportWorkflowEventsJson(): string {
  return JSON.stringify(readEvents(), null, 2);
}

/** Confirmed mutation only — do not call on navigation intent alone. */
export function recordConfirmedMutation(
  event: Extract<
    WorkflowEventName,
    | "mission_started"
    | "mission_resumed"
    | "evidence_linked"
    | "evidence_unlinked"
    | "note_created"
    | "finding_created"
    | "report_saved"
    | "source_search_completed"
    | "source_saved"
    | "source_linked_to_mission"
    | "source_review_requested"
    | "source_review_completed"
    | "source_review_rejected"
    | "source_archived"
  >,
  fields: Omit<WorkflowEventPayload, "event" | "timestamp"> = {},
): WorkflowEventPayload {
  return recordWorkflowEvent(event, { ...fields, outcome: "success" });
}
