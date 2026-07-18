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
  readonly outcomeId?: string | null;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly organizationId?: string | null;
  readonly directiveId?: string | null;
  readonly taskIds: readonly string[];
  readonly teamId?: string | null;
  readonly claimedChange: string;
  readonly claimedBy: string;
  readonly contributorTeam?: string | null;
  readonly evidenceRefs: readonly GenesisEvidenceRef[];
  readonly otherFactors: string;
  readonly uncertainty: string;
  readonly state: ContributionState;
  readonly reviewer?: string | null;
  readonly reviewReason?: string | null;
  readonly stateHistory: readonly ContributionStateHistoryEntry[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ContributionStateHistoryEntry = {
  readonly state: ContributionState;
  readonly reason: string;
  readonly at: string;
  readonly reviewer?: string | null;
};

export type GenesisRecognitionRecord = {
  readonly id: string;
  readonly outcomeId?: string | null;
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
  readonly reviewReason?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function isContribution(v: unknown): v is GenesisContributionClaim {
  const c = v as GenesisContributionClaim;
  return typeof c?.id === "string" && typeof c?.claimedChange === "string";
}

function normalizeContribution(c: GenesisContributionClaim): GenesisContributionClaim {
  return {
    ...c,
    taskIds: c.taskIds ?? [],
    stateHistory: c.stateHistory ?? [{ state: c.state, reason: "Initial", at: c.createdAt }],
  };
}

function isRecognition(v: unknown): v is GenesisRecognitionRecord {
  const r = v as GenesisRecognitionRecord;
  return typeof r?.id === "string" && typeof r?.recognizedChange === "string";
}

export function loadContributionClaims(filters?: {
  missionId?: string;
  organizationId?: string;
  outcomeId?: string;
}): GenesisContributionClaim[] {
  let all = readGenesisList(CONTRIBUTIONS_KEY, isContribution, memoryContributions).map(normalizeContribution);
  if (filters?.missionId) all = all.filter((c) => c.missionId === filters.missionId);
  if (filters?.organizationId) all = all.filter((c) => c.organizationId === filters.organizationId);
  if (filters?.outcomeId) all = all.filter((c) => c.outcomeId === filters.outcomeId);
  return all;
}

export function createContributionClaim(
  input: Omit<
    GenesisContributionClaim,
    "id" | "createdAt" | "updatedAt" | "stateHistory"
  > & { state?: ContributionState },
): GenesisContributionClaim {
  const now = new Date().toISOString();
  const state = input.state ?? "Claimed";
  const claim: GenesisContributionClaim = {
    ...input,
    taskIds: input.taskIds ?? [],
    state,
    stateHistory: [{ state, reason: "Claim created", at: now, reviewer: null }],
    id: genesisId("contrib"),
    createdAt: now,
    updatedAt: now,
  };
  writeGenesisList(CONTRIBUTIONS_KEY, [...readGenesisList(CONTRIBUTIONS_KEY, isContribution, memoryContributions), claim], memoryContributions);
  recordGenesisAudit({ domain: "contribution", action: "contribution_claimed", recordType: "contribution", recordId: claim.id, actorId: input.claimedBy, organizationId: input.organizationId, missionId: input.missionId, projectId: input.projectId, newState: state });
  notifyGenesisChanged();
  return claim;
}

export function submitContributionEvidence(
  claimId: string,
  evidenceRefs: readonly GenesisEvidenceRef[],
): GenesisContributionClaim | null {
  const all = readGenesisList(CONTRIBUTIONS_KEY, isContribution, memoryContributions).map(normalizeContribution);
  const idx = all.findIndex((c) => c.id === claimId);
  if (idx < 0) return null;
  const prev = all[idx]!;
  const now = new Date().toISOString();
  const updated: GenesisContributionClaim = {
    ...prev,
    evidenceRefs: [...prev.evidenceRefs, ...evidenceRefs],
    state: "Evidence Submitted",
    stateHistory: [
      ...prev.stateHistory,
      { state: "Evidence Submitted", reason: "Evidence submitted", at: now },
    ],
    updatedAt: now,
  };
  const next = [...all];
  next[idx] = updated;
  writeGenesisList(CONTRIBUTIONS_KEY, next, memoryContributions);
  recordGenesisAudit({ domain: "contribution", action: "contribution_evidence_submitted", recordType: "contribution", recordId: claimId, actorId: prev.claimedBy, missionId: prev.missionId, previousState: prev.state, newState: "Evidence Submitted" });
  notifyGenesisChanged();
  return updated;
}

export function submitContributionForReview(claimId: string, actorId: string): GenesisContributionClaim | null {
  return updateContributionState(claimId, "Under Review", actorId, "Submitted for human review");
}

export function updateContributionState(
  claimId: string,
  state: ContributionState,
  reviewer?: string,
  reviewReason?: string,
): GenesisContributionClaim | null {
  const all = readGenesisList(CONTRIBUTIONS_KEY, isContribution, memoryContributions).map(normalizeContribution);
  const idx = all.findIndex((c) => c.id === claimId);
  if (idx < 0) return null;
  const prev = all[idx]!;
  const now = new Date().toISOString();
  const updated: GenesisContributionClaim = {
    ...prev,
    state,
    reviewer: reviewer ?? prev.reviewer,
    reviewReason: reviewReason ?? prev.reviewReason,
    stateHistory: [
      ...prev.stateHistory,
      { state, reason: reviewReason ?? "State updated", at: now, reviewer: reviewer ?? null },
    ],
    updatedAt: now,
  };
  const next = [...all];
  next[idx] = updated;
  writeGenesisList(CONTRIBUTIONS_KEY, next, memoryContributions);
  recordGenesisAudit({ domain: "contribution", action: "contribution_reviewed", recordType: "contribution", recordId: claimId, actorId: reviewer ?? "reviewer", missionId: prev.missionId, previousState: prev.state, newState: state });
  notifyGenesisChanged();
  return updated;
}

export function loadRecognitionRecords(filters?: { missionId?: string; outcomeId?: string }): GenesisRecognitionRecord[] {
  let all = readGenesisList(RECOGNITION_KEY, isRecognition, memoryRecognition);
  if (filters?.missionId) all = all.filter((r) => r.missionId === filters.missionId);
  if (filters?.outcomeId) all = all.filter((r) => r.outcomeId === filters.outcomeId);
  return all;
}

export type RecognitionReadiness = {
  readonly ready: boolean;
  readonly missing: readonly string[];
};

export function deriveRecognitionReadiness(input: {
  outcomeId?: string | null;
  evidenceSources: readonly string[];
  contributionIds: readonly string[];
  methodologies: readonly string[];
  limitations: string;
  reviewers: readonly string[];
  outcomeVerificationStatus?: string | null;
  contributionStates?: readonly ContributionState[];
}): RecognitionReadiness {
  const missing: string[] = [];
  if (!input.outcomeId) missing.push("Linked reviewed outcome required.");
  if (input.outcomeVerificationStatus && !["Supported", "Partially Supported"].includes(input.outcomeVerificationStatus)) {
    missing.push("Outcome must be Supported or Partially Supported.");
  }
  if (input.evidenceSources.length === 0) missing.push("At least one evidence source required.");
  if (input.contributionIds.length === 0) missing.push("At least one contribution claim required.");
  const reviewed = (input.contributionStates ?? []).filter(
    (s) => s === "Supported" || s === "Partially Supported" || s === "Under Review",
  );
  if (input.contributionIds.length > 0 && reviewed.length === 0) {
    missing.push("At least one contribution must be reviewed.");
  }
  if (input.methodologies.length === 0) missing.push("Methodology or explanation required.");
  if (!input.limitations.trim()) missing.push("Explicit limitations required.");
  if (input.reviewers.length === 0) missing.push("Human reviewer required.");
  return { ready: missing.length === 0, missing };
}

export function createRecognitionRecord(
  input: Omit<GenesisRecognitionRecord, "id" | "createdAt" | "updatedAt">,
): GenesisRecognitionRecord | null {
  if (input.status === "Supported") {
    return null;
  }
  const now = new Date().toISOString();
  const record: GenesisRecognitionRecord = { ...input, id: genesisId("recog"), createdAt: now, updatedAt: now };
  writeGenesisList(RECOGNITION_KEY, [...readGenesisList(RECOGNITION_KEY, isRecognition, memoryRecognition), record], memoryRecognition);
  recordGenesisAudit({ domain: "recognition", action: "recognition_created", recordType: "recognition", recordId: record.id, actorId: input.reviewers[0] ?? "reviewer", missionId: input.missionId, newState: input.status });
  notifyGenesisChanged();
  return record;
}

export function updateRecognitionStatus(
  recordId: string,
  status: RecognitionStatus,
  reviewer: string,
  reviewReason?: string,
  input?: {
    outcomeVerificationStatus?: string | null;
    contributionStates?: readonly ContributionState[];
  },
): GenesisRecognitionRecord | null {
  const all = readGenesisList(RECOGNITION_KEY, isRecognition, memoryRecognition);
  const idx = all.findIndex((r) => r.id === recordId);
  if (idx < 0) return null;
  const prev = all[idx]!;
  if (status === "Supported") {
    const readiness = deriveRecognitionReadiness({
      outcomeId: prev.outcomeId,
      evidenceSources: prev.evidenceSources,
      contributionIds: prev.contributionIds,
      methodologies: prev.methodologies,
      limitations: prev.limitations,
      reviewers: prev.reviewers.length > 0 ? prev.reviewers : [reviewer],
      outcomeVerificationStatus: input?.outcomeVerificationStatus,
      contributionStates: input?.contributionStates,
    });
    if (!readiness.ready) return null;
  }
  const updated: GenesisRecognitionRecord = {
    ...prev,
    status,
    reviewReason: reviewReason ?? prev.reviewReason,
    updatedAt: new Date().toISOString(),
  };
  const next = [...all];
  next[idx] = updated;
  writeGenesisList(RECOGNITION_KEY, next, memoryRecognition);
  recordGenesisAudit({
    domain: "recognition",
    action: "recognition_status_changed",
    recordType: "recognition",
    recordId,
    actorId: reviewer,
    missionId: prev.missionId,
    previousState: prev.status,
    newState: status,
  });
  notifyGenesisChanged();
  return updated;
}
