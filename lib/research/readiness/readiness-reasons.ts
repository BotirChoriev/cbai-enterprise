import type { Milestone } from "@/lib/research/readiness/readiness-model";
import type { TopicEvidenceCatalogItem } from "@/lib/research/evidence/evidence-topic-builder";

/**
 * Build deterministic reasons explaining the current readiness state — one line per remaining
 * milestone and one line per blocking issue, both drawn directly from real state. Never AI,
 * never guessed, never a free-text summary.
 */
export function buildReadinessReasons(
  remainingMilestones: readonly Milestone[],
  blockingIssues: readonly TopicEvidenceCatalogItem[],
): readonly string[] {
  const reasons: string[] = [];

  for (const milestone of remainingMilestones) {
    reasons.push(`${milestone.label} — not yet completed.`);
  }

  for (const issue of blockingIssues) {
    reasons.push(`${issue.label}: ${issue.note}`);
  }

  if (reasons.length === 0) {
    reasons.push("All tracked milestones are complete.");
  }

  return reasons;
}
