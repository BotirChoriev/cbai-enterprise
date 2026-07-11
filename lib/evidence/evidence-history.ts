import type { Evidence, EvidenceHistoryEntry } from "@/lib/foundation/foundation-model";

/** Append one history entry — evidence history is append-only, never rewritten in place. */
export function appendEvidenceHistory(
  evidence: Evidence,
  entry: EvidenceHistoryEntry,
): Evidence {
  return {
    ...evidence,
    history: [...(evidence.history ?? []), entry],
  };
}
