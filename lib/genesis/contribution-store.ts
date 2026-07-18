/**
 * Contribution claims and recognition records (device-local).
 */

import {
  genesisId,
  notifyGenesisChanged,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import { recordGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import type { ContributionState, GenesisEvidenceRef, RecognitionStatus } from "@/lib/genesis/genesis-types";

const CONTRIBUTIONS_KEY = "cbai-genesis-contributions";
const RECOGNITION_KEY = "cbai-genesis-recognition";

const memoryContributions: GenesisContributionClaim[] = [];
const memoryRecognition: GenesisRecognitionRecord[] = [];

export type GenesisContributionClaim = {
  readonly id: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly organizationId?: string | null;
  readonly directiveId?: string | null;
  readonly claimedChange: string;
  readonly claimedBy: string;
  readonly evidenceRefs: readonly GenesisEvidenceRef[];
  readonly otherFactors: string;
  readonly uncertainty: string;
  readonly state: ContributionState;
  readonly reviewer?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type GenesisRecognitionRecord = {
  readonly id: string;
  readonly recognizedChange: string;
  readonly subject: string;
  readonly period: string;
  readonly evidenceSources: readonly string[];
  readonly methodologies: readonly string[];
  readonly contributionIds: readonly string[];
  readonly reviewers: readonly string[];
  readonly limitations: string;
  readonly disputes: string;
  readonly humanityImpact: string;
  readonly natureImpact: string;
  readonly visibility: "private" | "organization" | "public";
  readonly status: RecognitionStatus;
  readonly missionId?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function isContribution(v: unknown): v is GenesisContributionClaim {
  const c = v as GenesisContributionClaim;
  return typeof c?.id === "string" && typeof c?.claimedChange === "string";
}

function isRecognition(v: unknown): v is GenesisRecognitionRecord {
  const r = v as GenesisRecognitionRecord;
  return typeof r?.id === "string" && typeof r?.recognizedChange === "string";
}

export function loadContributionClaims(filters?: { missionId?: string }): GenesisContributionClaim[] {
  let all = readGenesisList(CONTRIBUTIONS_KEY, isContribution, memoryContributions);
  if (filters?.missionId) all = all.filter((c) => c.missionId === filters.missionId);
  return all;
}

export function createContributionClaim(
  input: Omit<GenesisContributionClaim, "id" | "createdAt" | "updatedAt">,
): GenesisContributionClaim {
  const now = new Date().toISOString();
  const claim: GenesisContributionClaim = { ...input, id: genesisId("contrib"), createdAt: now, updatedAt: now };
  writeGenesisList(CONTRIBUTIONS_KEY, [...readGenesisList(CONTRIBUTIONS_KEY, isContribution, memoryContributions), claim], memoryContributions);
  recordGenesisAudit({ domain: "contribution", action: "contribution_claimed", recordType: "contribution", recordId: claim.id, actorId: input.claimedBy, organizationId: input.organizationId, missionId: input.missionId, projectId: input.projectId, newState: input.state });
  notifyGenesisChanged();
  return claim;
}

export function updateContributionState(
  claimId: string,
  state: ContributionState,
  reviewer?: string,
): GenesisContributionClaim | null {
  const all = readGenesisList(CONTRIBUTIONS_KEY, isContribution, memoryContributions);
  const idx = all.findIndex((c) => c.id === claimId);
  if (idx < 0) return null;
  const prev = all[idx]!;
  const updated: GenesisContributionClaim = {
    ...prev,
    state,
    reviewer: reviewer ?? prev.reviewer,
    updatedAt: new Date().toISOString(),
  };
  const next = [...all];
  next[idx] = updated;
  writeGenesisList(CONTRIBUTIONS_KEY, next, memoryContributions);
  recordGenesisAudit({ domain: "contribution", action: "contribution_reviewed", recordType: "contribution", recordId: claimId, actorId: reviewer ?? "reviewer", missionId: prev.missionId, previousState: prev.state, newState: state });
  notifyGenesisChanged();
  return updated;
}

export function loadRecognitionRecords(filters?: { missionId?: string }): GenesisRecognitionRecord[] {
  let all = readGenesisList(RECOGNITION_KEY, isRecognition, memoryRecognition);
  if (filters?.missionId) all = all.filter((r) => r.missionId === filters.missionId);
  return all;
}

export function createRecognitionRecord(
  input: Omit<GenesisRecognitionRecord, "id" | "createdAt" | "updatedAt">,
): GenesisRecognitionRecord | null {
  if (input.status === "Supported" && input.evidenceSources.length === 0) {
    return null;
  }
  const now = new Date().toISOString();
  const record: GenesisRecognitionRecord = { ...input, id: genesisId("recog"), createdAt: now, updatedAt: now };
  writeGenesisList(RECOGNITION_KEY, [...readGenesisList(RECOGNITION_KEY, isRecognition, memoryRecognition), record], memoryRecognition);
  recordGenesisAudit({ domain: "recognition", action: "recognition_created", recordType: "recognition", recordId: record.id, actorId: input.reviewers[0] ?? "reviewer", missionId: input.missionId, newState: input.status });
  notifyGenesisChanged();
  return record;
}
