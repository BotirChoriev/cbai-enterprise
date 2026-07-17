import type { SourceIngestionState } from "@/lib/knowledge-ingestion/source-ingestion.types";

const VALID_TRANSITIONS: Readonly<Record<SourceIngestionState, readonly SourceIngestionState[]>> = {
  search_result: ["inspected", "saved_source", "archived"],
  inspected: ["saved_source", "archived"],
  saved_source: ["linked_to_mission", "archived"],
  linked_to_mission: ["awaiting_review", "archived"],
  awaiting_review: ["reviewed_evidence", "rejected", "archived"],
  reviewed_evidence: ["superseded", "archived"],
  rejected: ["archived"],
  superseded: ["archived"],
  archived: [],
};

export function canTransitionSourceLifecycle(
  from: SourceIngestionState,
  to: SourceIngestionState,
): boolean {
  if (from === to) return true;
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertSourceLifecycleTransition(
  from: SourceIngestionState,
  to: SourceIngestionState,
): void {
  if (!canTransitionSourceLifecycle(from, to)) {
    throw new Error(`Invalid source lifecycle transition: ${from} → ${to}`);
  }
}
