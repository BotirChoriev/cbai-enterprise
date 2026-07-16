import type { EvidenceLifecycleStage } from "@/lib/research/research-workspace-store";

const STAGE_KEYS: Record<EvidenceLifecycleStage, string> = {
  collected: "stageCollected",
  reviewed: "stageReviewed",
  linked: "stageLinked",
  compared: "stageCompared",
  referenced: "stageReferenced",
  included_in_report: "stageIncludedInReport",
  archived: "stageArchived",
};

export function translateEvidenceLifecycleStage(
  stage: EvidenceLifecycleStage,
  translate: (path: string) => string,
): string {
  return translate(`evidenceLifecycle.${STAGE_KEYS[stage]}`);
}
