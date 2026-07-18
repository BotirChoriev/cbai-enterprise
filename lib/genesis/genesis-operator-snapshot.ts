/**
 * Genesis operator context — honest snapshot for Personal Operator answers.
 */

import { buildPersonalCabinetSnapshot } from "@/lib/genesis/personal-cabinet-selectors";
import { loadGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import { loadOpenBlockers } from "@/lib/genesis/blocker-store";
import { loadOutcomes } from "@/lib/genesis/outcome-store";
import { loadContributionClaims, loadRecognitionRecords } from "@/lib/genesis/contribution-store";
import { loadExecutionTasks } from "@/lib/genesis/execution-store";
import { tasksNeedingProgressCount } from "@/lib/genesis/genesis-attention-selectors";

export type GenesisOperatorSnapshot = {
  readonly attentionItems: readonly string[];
  readonly structuredAttention: ReturnType<typeof buildPersonalCabinetSnapshot>["attention"]["structured"];
  readonly nextActionLabel: string | null;
  readonly nextActionHref: string | null;
  readonly blockedTaskCount: number;
  readonly openBlockerCount: number;
  readonly overdueTaskCount: number;
  readonly progressNeededCount: number;
  readonly outcomesMissingEvidenceCount: number;
  readonly contributionsUnderReviewCount: number;
  readonly recognitionUnderReviewCount: number;
  readonly recentAuditCount: number;
  readonly limitation: string;
};

export function buildGenesisOperatorSnapshot(operatorName?: string): GenesisOperatorSnapshot {
  const cabinet = buildPersonalCabinetSnapshot(operatorName);
  const tasks = loadExecutionTasks();
  const now = Date.now();
  const openBlockers = loadOpenBlockers();
  const blockedIds = new Set(openBlockers.map((b) => b.taskId));

  return {
    attentionItems: cabinet.attention.items,
    structuredAttention: cabinet.attention.structured,
    nextActionLabel: cabinet.attention.nextAction?.label ?? null,
    nextActionHref: cabinet.attention.nextAction?.href ?? null,
    blockedTaskCount: tasks.filter((t) => t.status === "Blocked" || blockedIds.has(t.id)).length,
    openBlockerCount: openBlockers.length,
    overdueTaskCount: tasks.filter(
      (t) =>
        t.deadline &&
        new Date(t.deadline).getTime() < now &&
        t.status !== "Completed" &&
        t.status !== "Cancelled" &&
        t.status !== "Blocked" &&
        !blockedIds.has(t.id),
    ).length,
    progressNeededCount: tasksNeedingProgressCount(),
    outcomesMissingEvidenceCount: loadOutcomes().filter(
      (o) => o.verificationStatus === "Draft" || o.verificationStatus === "Evidence Missing",
    ).length,
    contributionsUnderReviewCount: loadContributionClaims().filter(
      (c) => c.state === "Under Review" || c.state === "Claimed" || c.state === "Evidence Submitted",
    ).length,
    recognitionUnderReviewCount: loadRecognitionRecords().filter(
      (r) =>
        r.status === "Draft" ||
        r.status === "Evidence Incomplete" ||
        r.status === "Under Independent Review",
    ).length,
    recentAuditCount: loadGenesisAudit().length,
    limitation:
      "Genesis operator context is derived from device-local records. Authorization and cloud isolation apply when Supabase is configured.",
  };
}

export function formatGenesisAttentionAnswer(snapshot: GenesisOperatorSnapshot): string {
  const parts: string[] = [];
  if (snapshot.nextActionLabel) parts.push(`Next honest action: ${snapshot.nextActionLabel}`);
  if (snapshot.openBlockerCount > 0) parts.push(`${snapshot.openBlockerCount} open blocker(s).`);
  if (snapshot.blockedTaskCount > 0) parts.push(`${snapshot.blockedTaskCount} blocked task(s).`);
  if (snapshot.overdueTaskCount > 0) parts.push(`${snapshot.overdueTaskCount} overdue task(s) (not blocked).`);
  if (snapshot.progressNeededCount > 0) parts.push(`${snapshot.progressNeededCount} task(s) may need progress updates.`);
  if (snapshot.outcomesMissingEvidenceCount > 0) {
    parts.push(`${snapshot.outcomesMissingEvidenceCount} outcome(s) missing evidence.`);
  }
  if (snapshot.contributionsUnderReviewCount > 0) {
    parts.push(`${snapshot.contributionsUnderReviewCount} contribution claim(s) under review.`);
  }
  if (snapshot.recognitionUnderReviewCount > 0) {
    parts.push(`${snapshot.recognitionUnderReviewCount} recognition record(s) under review.`);
  }
  if (snapshot.attentionItems.length > 0) parts.push(...snapshot.attentionItems);
  if (parts.length === 0) parts.push("Nothing flagged from current local records.");
  parts.push(snapshot.limitation);
  return parts.join(" ");
}
