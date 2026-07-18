/**
 * Evidence-backed capability records — user-controlled, no universal score.
 */

import {
  genesisId,
  notifyGenesisChanged,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import type { GenesisEvidenceRef } from "@/lib/genesis/genesis-types";

const RECORDS_KEY = "cbai-genesis-capability-records";
const memoryRecords: CapabilityRecord[] = [];

export type CapabilityRecordVisibility = "private" | "team" | "organization" | "public";
export type CapabilityVerificationState = "unverified" | "evidence_linked" | "human_reviewed";

export type CapabilityRecord = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly methodsUsed: string;
  readonly projectId?: string | null;
  readonly missionId?: string | null;
  readonly evidenceRefs: readonly GenesisEvidenceRef[];
  readonly visibility: CapabilityRecordVisibility;
  readonly verificationState: CapabilityVerificationState;
  readonly limitations: string;
  readonly unresolvedQuestions: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function isRecord(v: unknown): v is CapabilityRecord {
  const r = v as CapabilityRecord;
  return typeof r?.id === "string" && typeof r?.label === "string";
}

export function loadCapabilityRecords(): CapabilityRecord[] {
  return readGenesisList(RECORDS_KEY, isRecord, memoryRecords);
}

export function createCapabilityRecord(
  input: Omit<CapabilityRecord, "id" | "createdAt" | "updatedAt" | "verificationState"> & {
    verificationState?: CapabilityVerificationState;
  },
): CapabilityRecord {
  const now = new Date().toISOString();
  const verificationState =
    input.verificationState ??
    (input.evidenceRefs.length > 0 ? "evidence_linked" : "unverified");
  const record: CapabilityRecord = {
    ...input,
    verificationState,
    id: genesisId("caprec"),
    createdAt: now,
    updatedAt: now,
  };
  writeGenesisList(RECORDS_KEY, [...readGenesisList(RECORDS_KEY, isRecord, memoryRecords), record], memoryRecords);
  notifyGenesisChanged();
  return record;
}

/** Capability Passport must never expose a universal human score. */
export function assertNoUniversalHumanScore(metrics: Record<string, unknown>): boolean {
  const forbidden = ["overallScore", "humanRank", "popularityScore", "employeeRanking"];
  return !forbidden.some((key) => key in metrics);
}
