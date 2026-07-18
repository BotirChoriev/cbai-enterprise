/**
 * Evidence-backed capability records — user-controlled, no universal score.
 */

import {
  genesisId,
  notifyGenesisChanged,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import { recordGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import type {
  CapabilityRecordType,
  CapabilityVerificationStatus,
  GenesisEvidenceRef,
} from "@/lib/genesis/genesis-types";

const RECORDS_KEY = "cbai-genesis-capability-records";
const memoryRecords: CapabilityRecord[] = [];

export type CapabilityRecordVisibility = "private" | "team" | "organization" | "public";

/** Legacy states mapped to spec verification statuses on read. */
export type LegacyCapabilityVerificationState = "unverified" | "evidence_linked" | "human_reviewed";

export type CapabilityRecord = {
  readonly id: string;
  readonly recordType: CapabilityRecordType;
  readonly claim: string;
  readonly label: string;
  readonly description: string;
  readonly methodsUsed: string;
  readonly projectId?: string | null;
  readonly missionId?: string | null;
  readonly relatedWorkIds: readonly string[];
  readonly evidenceRefs: readonly GenesisEvidenceRef[];
  readonly visibility: CapabilityRecordVisibility;
  readonly verificationStatus: CapabilityVerificationStatus;
  /** @deprecated Use verificationStatus */
  readonly verificationState?: LegacyCapabilityVerificationState;
  readonly reviewer?: string | null;
  readonly limitations: string;
  readonly unresolvedQuestions: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function mapLegacyVerification(
  record: CapabilityRecord & { verificationState?: LegacyCapabilityVerificationState },
): CapabilityVerificationStatus {
  if (record.verificationStatus) return record.verificationStatus;
  switch (record.verificationState) {
    case "human_reviewed":
      return "Verified";
    case "evidence_linked":
      return "Evidence Submitted";
    default:
      return record.evidenceRefs.length > 0 ? "Evidence Submitted" : "Self-Declared";
  }
}

function normalizeRecord(raw: CapabilityRecord): CapabilityRecord {
  const verificationStatus = mapLegacyVerification(raw);
  return {
    ...raw,
    recordType: raw.recordType ?? "skill_or_method",
    claim: raw.claim ?? raw.label,
    relatedWorkIds: raw.relatedWorkIds ?? [],
    verificationStatus,
    label: raw.label ?? raw.claim,
  };
}

function isRecord(v: unknown): v is CapabilityRecord {
  const r = v as CapabilityRecord;
  return typeof r?.id === "string" && (typeof r?.label === "string" || typeof r?.claim === "string");
}

export function loadCapabilityRecords(filters?: {
  missionId?: string;
  verificationStatus?: CapabilityVerificationStatus;
}): CapabilityRecord[] {
  let all = readGenesisList(RECORDS_KEY, isRecord, memoryRecords).map(normalizeRecord);
  if (filters?.missionId) all = all.filter((r) => r.missionId === filters.missionId);
  if (filters?.verificationStatus) all = all.filter((r) => r.verificationStatus === filters.verificationStatus);
  return all;
}

export function createCapabilityRecord(
  input: Omit<
    CapabilityRecord,
    "id" | "createdAt" | "updatedAt" | "verificationStatus" | "label"
  > & {
    label?: string;
    verificationStatus?: CapabilityVerificationStatus;
    verificationState?: LegacyCapabilityVerificationState;
  },
): CapabilityRecord {
  const now = new Date().toISOString();
  const claim = input.claim.trim() || input.label?.trim() || "";
  const verificationStatus =
    input.verificationStatus ??
    (input.evidenceRefs.length > 0 ? "Evidence Submitted" : "Self-Declared");
  const record: CapabilityRecord = {
    ...input,
    claim,
    label: input.label?.trim() || claim,
    relatedWorkIds: input.relatedWorkIds ?? [],
    verificationStatus,
    id: genesisId("caprec"),
    createdAt: now,
    updatedAt: now,
  };
  writeGenesisList(RECORDS_KEY, [...readGenesisList(RECORDS_KEY, isRecord, memoryRecords), record], memoryRecords);
  recordGenesisAudit({
    domain: "capability",
    action: "capability_record_created",
    recordType: "capability_record",
    recordId: record.id,
    actorId: "operator",
    missionId: input.missionId,
    projectId: input.projectId,
    newState: verificationStatus,
  });
  notifyGenesisChanged();
  return record;
}

export function updateCapabilityVerification(
  recordId: string,
  input: {
    verificationStatus: CapabilityVerificationStatus;
    reviewer?: string | null;
    reason?: string;
  },
): CapabilityRecord | null {
  const all = readGenesisList(RECORDS_KEY, isRecord, memoryRecords).map(normalizeRecord);
  const idx = all.findIndex((r) => r.id === recordId);
  if (idx < 0) return null;
  const prev = all[idx]!;

  if (input.verificationStatus === "Verified") {
    if (prev.evidenceRefs.length === 0 || !input.reviewer?.trim()) return null;
  }

  const updated: CapabilityRecord = {
    ...prev,
    verificationStatus: input.verificationStatus,
    reviewer: input.reviewer ?? prev.reviewer,
    updatedAt: new Date().toISOString(),
  };
  const next = [...all];
  next[idx] = updated;
  writeGenesisList(RECORDS_KEY, next, memoryRecords);
  recordGenesisAudit({
    domain: "capability",
    action: "capability_verification_updated",
    recordType: "capability_record",
    recordId,
    actorId: input.reviewer ?? "operator",
    missionId: prev.missionId,
    projectId: prev.projectId,
    previousState: prev.verificationStatus,
    newState: input.verificationStatus,
  });
  notifyGenesisChanged();
  return updated;
}

/** Capability Passport must never expose a universal human score. */
export function assertNoUniversalHumanScore(metrics: Record<string, unknown>): boolean {
  const forbidden = [
    "overallScore",
    "humanRank",
    "popularityScore",
    "employeeRanking",
    "universalScore",
    "capabilityScore",
  ];
  return !forbidden.some((key) => key in metrics);
}

export function deriveCapabilityVerificationGate(record: CapabilityRecord): {
  canVerify: boolean;
  gaps: string[];
} {
  const gaps: string[] = [];
  if (record.evidenceRefs.length === 0) gaps.push("Evidence required for verification.");
  if (!record.reviewer?.trim() && record.verificationStatus === "Under Review") {
    gaps.push("Human reviewer required.");
  }
  if (!record.relatedWorkIds.length && record.recordType === "verified_outcome") {
    gaps.push("Related work link required for verified outcome claims.");
  }
  return { canVerify: gaps.length === 0, gaps };
}
