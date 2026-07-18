/**
 * Genesis Outcomes — output, outcome, and impact kept strictly separate.
 */

import {
  genesisId,
  notifyGenesisChanged,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import { recordGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import type { GenesisEvidenceRef, OutcomeVerificationStatus } from "@/lib/genesis/genesis-types";

const OUTCOMES_KEY = "cbai-genesis-outcomes";
const memoryOutcomes: GenesisOutcome[] = [];

export type GenesisOutcome = {
  readonly id: string;
  readonly organizationId: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly directiveId?: string | null;
  readonly taskIds: readonly string[];
  readonly title: string;
  readonly outputDescription: string;
  readonly outcomeDescription: string;
  readonly impactClaim: string;
  readonly baseline: string;
  readonly target: string;
  readonly currentValue: string;
  readonly unit: string;
  readonly reportingPeriod: string;
  readonly evidenceRefs: readonly GenesisEvidenceRef[];
  readonly responsibleOwner: string;
  readonly verificationStatus: OutcomeVerificationStatus;
  readonly reviewer?: string | null;
  readonly limitations: string;
  readonly humanityImpact: string;
  readonly natureImpact: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function isOutcome(v: unknown): v is GenesisOutcome {
  const o = v as GenesisOutcome;
  return typeof o?.id === "string" && typeof o?.title === "string";
}

export function loadOutcomes(filters?: {
  organizationId?: string;
  missionId?: string;
  projectId?: string;
}): GenesisOutcome[] {
  let all = readGenesisList(OUTCOMES_KEY, isOutcome, memoryOutcomes);
  if (filters?.organizationId) all = all.filter((o) => o.organizationId === filters.organizationId);
  if (filters?.missionId) all = all.filter((o) => o.missionId === filters.missionId);
  if (filters?.projectId) all = all.filter((o) => o.projectId === filters.projectId);
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function loadOutcome(id: string): GenesisOutcome | null {
  return readGenesisList(OUTCOMES_KEY, isOutcome, memoryOutcomes).find((o) => o.id === id) ?? null;
}

export function createOutcome(
  input: Omit<GenesisOutcome, "id" | "createdAt" | "updatedAt" | "verificationStatus" | "reviewer"> & {
    verificationStatus?: OutcomeVerificationStatus;
    reviewer?: string | null;
  },
): GenesisOutcome {
  const now = new Date().toISOString();
  const status =
    input.verificationStatus ??
    (input.evidenceRefs.length > 0 ? "Evidence Missing" : "Draft");
  const outcome: GenesisOutcome = {
    ...input,
    verificationStatus: status,
    reviewer: input.reviewer ?? null,
    id: genesisId("outcome"),
    createdAt: now,
    updatedAt: now,
  };
  writeGenesisList(
    OUTCOMES_KEY,
    [...readGenesisList(OUTCOMES_KEY, isOutcome, memoryOutcomes), outcome],
    memoryOutcomes,
  );
  recordGenesisAudit({
    domain: "outcome",
    action: "outcome_created",
    recordType: "outcome",
    recordId: outcome.id,
    actorId: input.responsibleOwner,
    organizationId: input.organizationId,
    missionId: input.missionId,
    projectId: input.projectId,
    newState: outcome.verificationStatus,
  });
  notifyGenesisChanged();
  return outcome;
}

export function updateOutcomeVerification(
  outcomeId: string,
  verificationStatus: OutcomeVerificationStatus,
  reviewer: string,
  limitations?: string,
): GenesisOutcome | null {
  const all = readGenesisList(OUTCOMES_KEY, isOutcome, memoryOutcomes);
  const idx = all.findIndex((o) => o.id === outcomeId);
  if (idx < 0) return null;
  const prev = all[idx]!;
  if (verificationStatus === "Supported") {
    if (prev.evidenceRefs.length === 0 || !reviewer.trim()) return null;
  }
  const updated: GenesisOutcome = {
    ...prev,
    verificationStatus,
    reviewer,
    limitations: limitations ?? prev.limitations,
    updatedAt: new Date().toISOString(),
  };
  const next = [...all];
  next[idx] = updated;
  writeGenesisList(OUTCOMES_KEY, next, memoryOutcomes);
  recordGenesisAudit({
    domain: "outcome",
    action: "outcome_reviewed",
    recordType: "outcome",
    recordId: outcomeId,
    actorId: reviewer,
    organizationId: prev.organizationId,
    missionId: prev.missionId,
    projectId: prev.projectId,
    previousState: prev.verificationStatus,
    newState: verificationStatus,
  });
  notifyGenesisChanged();
  return updated;
}

export function submitOutcomeForReview(outcomeId: string, actorId: string): GenesisOutcome | null {
  const outcome = loadOutcome(outcomeId);
  if (!outcome) return null;
  if (outcome.evidenceRefs.length === 0) return null;
  return updateOutcomeVerification(outcomeId, "Submitted for Review", actorId);
}
