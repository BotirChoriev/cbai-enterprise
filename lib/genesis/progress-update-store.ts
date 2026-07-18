/**
 * Genesis progress updates — preserved history, no inferred percentages.
 */

import {
  genesisId,
  notifyGenesisChanged,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import { recordGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import type { GenesisEvidenceRef, ProgressHumanReviewStatus } from "@/lib/genesis/genesis-types";
import { updateExecutionTask } from "@/lib/genesis/execution-store";

const PROGRESS_KEY = "cbai-genesis-progress-updates";
const memoryProgress: GenesisProgressUpdate[] = [];

export type GenesisProgressUpdate = {
  readonly id: string;
  readonly organizationId: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly directiveId?: string | null;
  readonly planId?: string | null;
  readonly taskId: string;
  readonly author: string;
  readonly reportingPeriod: string;
  readonly summary: string;
  readonly workCompleted: string;
  readonly currentWork: string;
  readonly nextPlannedWork: string;
  readonly evidenceRefs: readonly GenesisEvidenceRef[];
  readonly reportedDate: string;
  readonly limitationText: string;
  readonly humanReviewStatus: ProgressHumanReviewStatus;
  readonly createdAt: string;
};

function isProgress(v: unknown): v is GenesisProgressUpdate {
  const p = v as GenesisProgressUpdate;
  return typeof p?.id === "string" && typeof p?.taskId === "string";
}

export function loadProgressUpdates(filters?: {
  organizationId?: string;
  taskId?: string;
  missionId?: string;
}): GenesisProgressUpdate[] {
  let all = readGenesisList(PROGRESS_KEY, isProgress, memoryProgress);
  if (filters?.organizationId) all = all.filter((p) => p.organizationId === filters.organizationId);
  if (filters?.taskId) all = all.filter((p) => p.taskId === filters.taskId);
  if (filters?.missionId) all = all.filter((p) => p.missionId === filters.missionId);
  return all.sort((a, b) => b.reportedDate.localeCompare(a.reportedDate));
}

export function loadLatestProgressForTask(taskId: string): GenesisProgressUpdate | null {
  return loadProgressUpdates({ taskId })[0] ?? null;
}

export function createProgressUpdate(
  input: Omit<GenesisProgressUpdate, "id" | "createdAt">,
): GenesisProgressUpdate {
  const now = new Date().toISOString();
  const update: GenesisProgressUpdate = {
    ...input,
    id: genesisId("prog"),
    createdAt: now,
  };
  writeGenesisList(
    PROGRESS_KEY,
    [...readGenesisList(PROGRESS_KEY, isProgress, memoryProgress), update],
    memoryProgress,
  );
  updateExecutionTask(input.taskId, {
    progressNote: input.summary,
  });
  recordGenesisAudit({
    domain: "execution",
    action: "progress_created",
    recordType: "progress_update",
    recordId: update.id,
    actorId: input.author,
    organizationId: input.organizationId,
    missionId: input.missionId,
    projectId: input.projectId,
    newState: input.humanReviewStatus,
  });
  notifyGenesisChanged();
  return update;
}
