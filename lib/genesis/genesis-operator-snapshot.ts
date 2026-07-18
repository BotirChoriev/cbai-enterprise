/**
 * Genesis operator context — honest snapshot for Personal Operator answers.
 */

import { buildPersonalCabinetSnapshot } from "@/lib/genesis/personal-cabinet-selectors";
import { loadGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import { loadLivingResearchObjects } from "@/lib/genesis/living-research-object-store";
import { loadExecutionTasks } from "@/lib/genesis/execution-store";

export type GenesisOperatorSnapshot = {
  readonly attentionItems: readonly string[];
  readonly nextActionLabel: string | null;
  readonly blockedTaskCount: number;
  readonly overdueTaskCount: number;
  readonly researchObjectCount: number;
  readonly recentAuditCount: number;
  readonly limitation: string;
};

export function buildGenesisOperatorSnapshot(operatorName?: string): GenesisOperatorSnapshot {
  const cabinet = buildPersonalCabinetSnapshot(operatorName);
  const tasks = loadExecutionTasks();
  const now = Date.now();
  return {
    attentionItems: cabinet.attention.items,
    nextActionLabel: cabinet.attention.nextAction?.label ?? null,
    blockedTaskCount: tasks.filter((t) => t.status === "Blocked" || Boolean(t.blocker)).length,
    overdueTaskCount: tasks.filter(
      (t) =>
        t.deadline &&
        new Date(t.deadline).getTime() < now &&
        t.status !== "Completed" &&
        t.status !== "Cancelled",
    ).length,
    researchObjectCount: loadLivingResearchObjects().length,
    recentAuditCount: loadGenesisAudit().length,
    limitation:
      "Genesis operator context is derived from device-local records. Authorization and cloud isolation apply when Supabase is configured.",
  };
}

export function formatGenesisAttentionAnswer(snapshot: GenesisOperatorSnapshot): string {
  const parts: string[] = [];
  if (snapshot.nextActionLabel) parts.push(`Next honest action: ${snapshot.nextActionLabel}`);
  if (snapshot.blockedTaskCount > 0) parts.push(`${snapshot.blockedTaskCount} blocked execution task(s).`);
  if (snapshot.overdueTaskCount > 0) parts.push(`${snapshot.overdueTaskCount} overdue task(s).`);
  if (snapshot.attentionItems.length > 0) parts.push(...snapshot.attentionItems);
  if (parts.length === 0) parts.push("Nothing flagged from current local records.");
  parts.push(snapshot.limitation);
  return parts.join(" ");
}
