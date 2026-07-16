/**
 * EPIC-21 — Primary evidence states for zero learning curve surfaces.
 */

import { deriveEvidenceRuntime } from "@/lib/evidence-runtime/evidence-runtime";
import type { Mission } from "@/lib/intelligence-os/mission.types";

export type PrimaryEvidenceState = "known" | "unknown" | "conflict" | "needs_review";

export type PrimaryEvidenceStateRow = {
  readonly state: PrimaryEvidenceState;
  readonly count: number;
  readonly detail: string;
};

export function derivePrimaryEvidenceStates(mission: Mission | null): readonly PrimaryEvidenceStateRow[] {
  const runtime = deriveEvidenceRuntime(mission);
  const known = runtime.records.filter((r) => r.freshness === "fresh" || r.freshness === "aging").length;
  const unknown = runtime.missingKnowledge.length + runtime.records.filter((r) => !r.evidence.originalSource?.trim()).length;
  const conflict = runtime.conflicts.length;
  const needsReview =
    runtime.humanValidationPending +
    runtime.humanValidationPartial +
    runtime.freshnessCounts.outdated;

  return [
    {
      state: "known",
      count: known,
      detail: "References linked with traceable source metadata.",
    },
    {
      state: "unknown",
      count: unknown,
      detail: "Missing sources or documented knowledge gaps.",
    },
    {
      state: "conflict",
      count: conflict,
      detail: "Detected disagreement between references.",
    },
    {
      state: "needs_review",
      count: needsReview,
      detail: "Human review recommended for freshness or validation.",
    },
  ];
}
