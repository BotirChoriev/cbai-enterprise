/**
 * Genesis blockers — explicit records linked to tasks/directives.
 */

import {
  genesisId,
  notifyGenesisChanged,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import { recordGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import type { BlockerStatus, BlockerType, GenesisEvidenceRef } from "@/lib/genesis/genesis-types";
import { updateExecutionTask } from "@/lib/genesis/execution-store";

const BLOCKERS_KEY = "cbai-genesis-blockers";
const memoryBlockers: GenesisBlocker[] = [];

export type GenesisBlocker = {
  readonly id: string;
  readonly organizationId: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly directiveId?: string | null;
  readonly taskId: string;
  readonly blockerType: BlockerType;
  readonly description: string;
  readonly severity: "low" | "medium" | "high";
  readonly operationalImpact: string;
  readonly evidenceRefs: readonly GenesisEvidenceRef[];
  readonly responsibleOwner: string;
  readonly requiredDecision: string;
  readonly proposedOptions: string;
  readonly dueDate?: string | null;
  readonly status: BlockerStatus;
  readonly resolution?: string | null;
  readonly resolutionEvidence?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function isBlocker(v: unknown): v is GenesisBlocker {
  const b = v as GenesisBlocker;
  return typeof b?.id === "string" && typeof b?.taskId === "string";
}

export function loadBlockers(filters?: {
  organizationId?: string;
  taskId?: string;
  status?: BlockerStatus;
}): GenesisBlocker[] {
  let all = readGenesisList(BLOCKERS_KEY, isBlocker, memoryBlockers);
  if (filters?.organizationId) all = all.filter((b) => b.organizationId === filters.organizationId);
  if (filters?.taskId) all = all.filter((b) => b.taskId === filters.taskId);
  if (filters?.status) all = all.filter((b) => b.status === filters.status);
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function loadOpenBlockers(organizationId?: string): GenesisBlocker[] {
  return loadBlockers({ organizationId }).filter(
    (b) => b.status === "Open" || b.status === "Under Review" || b.status === "Action Required",
  );
}

export function isTaskBlocked(taskId: string): boolean {
  return loadOpenBlockers().some((b) => b.taskId === taskId);
}

export function createBlocker(
  input: Omit<GenesisBlocker, "id" | "createdAt" | "updatedAt" | "status" | "resolution" | "resolutionEvidence"> & {
    status?: BlockerStatus;
  },
): GenesisBlocker {
  const now = new Date().toISOString();
  const blocker: GenesisBlocker = {
    ...input,
    status: input.status ?? "Open",
    resolution: null,
    resolutionEvidence: null,
    id: genesisId("block"),
    createdAt: now,
    updatedAt: now,
  };
  writeGenesisList(
    BLOCKERS_KEY,
    [...readGenesisList(BLOCKERS_KEY, isBlocker, memoryBlockers), blocker],
    memoryBlockers,
  );
  updateExecutionTask(input.taskId, {
    status: "Blocked",
    blocker: input.description,
  });
  recordGenesisAudit({
    domain: "execution",
    action: "blocker_created",
    recordType: "blocker",
    recordId: blocker.id,
    actorId: input.responsibleOwner,
    organizationId: input.organizationId,
    missionId: input.missionId,
    projectId: input.projectId,
    newState: blocker.status,
  });
  notifyGenesisChanged();
  return blocker;
}

export function updateBlockerStatus(
  blockerId: string,
  patch: Partial<
    Pick<
      GenesisBlocker,
      "status" | "resolution" | "resolutionEvidence" | "requiredDecision" | "proposedOptions"
    >
  >,
): GenesisBlocker | null {
  const all = readGenesisList(BLOCKERS_KEY, isBlocker, memoryBlockers);
  const idx = all.findIndex((b) => b.id === blockerId);
  if (idx < 0) return null;
  const prev = all[idx]!;
  if (
    (patch.status === "Resolved" || patch.status === "Closed") &&
    !patch.resolution &&
    !prev.resolution
  ) {
    return null;
  }
  const updated: GenesisBlocker = {
    ...prev,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const next = [...all];
  next[idx] = updated;
  writeGenesisList(BLOCKERS_KEY, next, memoryBlockers);
  if (updated.status === "Resolved" || updated.status === "Closed") {
    updateExecutionTask(updated.taskId, {
      status: "Active",
      blocker: null,
    });
  }
  recordGenesisAudit({
    domain: "execution",
    action: "blocker_updated",
    recordType: "blocker",
    recordId: blockerId,
    actorId: updated.responsibleOwner,
    organizationId: updated.organizationId,
    missionId: updated.missionId,
    projectId: updated.projectId,
    previousState: prev.status,
    newState: updated.status,
  });
  notifyGenesisChanged();
  return updated;
}
