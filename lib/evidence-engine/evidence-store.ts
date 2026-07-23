/**
 * Device-local evidence record store (Phase 4).
 * Starts empty — no seeded or fabricated live evidence.
 */

import {
  isEvidenceLifecycleStatus,
  transitionEvidenceStatus,
} from "@/lib/evidence-engine/lifecycle";
import type {
  EvidenceLifecycleStatus,
  EvidenceProvenance,
  EvidenceRecord,
  EvidenceRecordDraft,
  EvidenceStatusTransitionResult,
} from "@/lib/evidence-engine/types";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

const EVIDENCE_ENGINE_KEY = "cbai-evidence-engine-records";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emptyProvenance(partial?: Partial<EvidenceProvenance>): EvidenceProvenance {
  return {
    publisher: partial?.publisher?.trim() || "Not specified",
    publicationDate: partial?.publicationDate ?? null,
    retrievalDate: partial?.retrievalDate ?? null,
    jurisdiction: partial?.jurisdiction ?? null,
    language: partial?.language ?? null,
    confidenceBasis: partial?.confidenceBasis?.trim() || "Not documented — planned review",
    reviewer: partial?.reviewer ?? null,
    reviewNotes: partial?.reviewNotes ?? null,
  };
}

function isEvidenceRecord(value: unknown): value is EvidenceRecord {
  if (!value || typeof value !== "object") return false;
  const row = value as EvidenceRecord;
  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    isEvidenceLifecycleStatus(row.status) &&
    typeof row.createdAt === "string" &&
    typeof row.updatedAt === "string" &&
    row.provenance !== null &&
    typeof row.provenance === "object"
  );
}

function readRecords(): EvidenceRecord[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(EVIDENCE_ENGINE_KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEvidenceRecord);
  } catch {
    return [];
  }
}

function writeRecords(records: readonly EvidenceRecord[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(resolveStorageKey(EVIDENCE_ENGINE_KEY), JSON.stringify(records));
}

function newId(): string {
  return `evidence-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadEvidenceRecords(): EvidenceRecord[] {
  return readRecords().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function loadEvidenceRecord(id: string): EvidenceRecord | null {
  return readRecords().find((row) => row.id === id) ?? null;
}

export function createEvidenceRecord(draft: EvidenceRecordDraft): EvidenceRecord {
  const now = new Date().toISOString();
  const initialStatus: EvidenceLifecycleStatus = draft.status ?? "unverified";
  // Honesty: never create as verified without going through review transitions.
  const status = initialStatus === "verified" ? "unverified" : initialStatus;
  const record: EvidenceRecord = {
    id: newId(),
    title: draft.title.trim() || "Untitled evidence",
    summary: (draft.summary ?? "").trim() || "No summary yet — planned.",
    status,
    provenance: emptyProvenance(draft.provenance),
    missionId: draft.missionId ?? null,
    reportId: draft.reportId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  writeRecords([record, ...readRecords()]);
  return record;
}

export function updateEvidenceRecord(
  id: string,
  patch: Partial<Omit<EvidenceRecord, "id" | "createdAt">>,
): EvidenceRecord | null {
  const records = readRecords();
  const index = records.findIndex((row) => row.id === id);
  if (index === -1) return null;
  const current = records[index];
  let nextStatus = patch.status ?? current.status;
  // Never silently upgrade to verified via patch — must use transitionEvidenceRecordStatus.
  if (nextStatus === "verified" && current.status !== "verified") {
    nextStatus = current.status;
  }
  const updated: EvidenceRecord = {
    ...current,
    ...patch,
    status: nextStatus,
    provenance: patch.provenance ?? current.provenance,
    updatedAt: new Date().toISOString(),
  };
  records[index] = updated;
  writeRecords(records);
  return updated;
}

export function transitionEvidenceRecordStatus(
  id: string,
  to: EvidenceLifecycleStatus,
  options?: { readonly reviewer?: string | null; readonly reviewNotes?: string | null },
): EvidenceStatusTransitionResult {
  const current = loadEvidenceRecord(id);
  if (!current) {
    return { ok: false, reason: `Evidence record ${id} not found.` };
  }
  const result = transitionEvidenceStatus(current, to, options);
  if (!result.ok) return result;
  const records = readRecords();
  const index = records.findIndex((row) => row.id === id);
  if (index === -1) return { ok: false, reason: `Evidence record ${id} not found.` };
  records[index] = result.record;
  writeRecords(records);
  return result;
}

export function linkEvidenceToMission(id: string, missionId: string | null): EvidenceRecord | null {
  return updateEvidenceRecord(id, { missionId });
}

export function linkEvidenceToReport(id: string, reportId: string | null): EvidenceRecord | null {
  return updateEvidenceRecord(id, { reportId });
}

export const EVIDENCE_ENGINE_STORAGE_KEY = EVIDENCE_ENGINE_KEY;
