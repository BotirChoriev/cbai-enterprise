/**
 * Local confirmed evidence ledger — browser persistence, confirmation-gated.
 * Does not invent reliability or claim external DB connectivity.
 */

import type { OperationalObjectDraft } from "@/lib/operational-objects/operational-object.types";

export const LOCAL_EVIDENCE_STORAGE_KEY = "cbai.local-evidence.v1";

export type LocalEvidenceReviewStatus =
  | "known"
  | "unknown"
  | "conflicting"
  | "needs_review"
  | "accepted"
  | "rejected"
  | "pending_source"
  | "source_unavailable";

export type LocalEvidenceSourceType =
  | "official"
  | "literature"
  | "dataset"
  | "observation"
  | "user_upload"
  | "other";

export type LocalEvidenceRecord = {
  readonly id: string;
  readonly version: 1;
  readonly title: string;
  readonly claim: string;
  readonly observation: string;
  readonly sourceType: LocalEvidenceSourceType;
  readonly sourceLabel: string;
  readonly provenance: string;
  readonly evidenceType: string;
  readonly reviewStatus: LocalEvidenceReviewStatus;
  /** Never auto-filled as verified — user-selected classification only. */
  readonly reliabilityNote: string;
  readonly relatedEntityKind?: string;
  readonly relatedEntityId?: string;
  readonly relatedEntityName?: string;
  readonly relatedObjectId?: string;
  readonly missionId?: string;
  readonly locale: string;
  readonly routePath: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly confirmed: boolean;
};

export type LocalEvidenceDraft = Omit<LocalEvidenceRecord, "id" | "createdAt" | "updatedAt" | "version" | "confirmed"> & {
  readonly id?: string;
};

/** Stable empty snapshot for SSR / useSyncExternalStore getServerSnapshot. */
const EMPTY_RECORDS: readonly LocalEvidenceRecord[] = [];

let cachedRaw: string | null | undefined = undefined;
let cachedSnapshot: readonly LocalEvidenceRecord[] = EMPTY_RECORDS;

function parseRecords(raw: string | null): readonly LocalEvidenceRecord[] {
  if (!raw) return EMPTY_RECORDS;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY_RECORDS;
    const filtered = parsed.filter((item): item is LocalEvidenceRecord => {
      return Boolean(item && typeof item === "object" && typeof (item as LocalEvidenceRecord).id === "string");
    });
    return filtered.length === 0 ? EMPTY_RECORDS : filtered;
  } catch {
    return EMPTY_RECORDS;
  }
}

function readAll(): LocalEvidenceRecord[] {
  return [...getLocalEvidenceSnapshot()];
}

function writeAll(records: readonly LocalEvidenceRecord[]): void {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(records);
  // Idempotent write: skip notify when nothing changed (prevents storage-echo loops).
  if (serialized === window.localStorage.getItem(LOCAL_EVIDENCE_STORAGE_KEY)) {
    cachedRaw = serialized;
    cachedSnapshot = records.length === 0 ? EMPTY_RECORDS : records;
    return;
  }
  window.localStorage.setItem(LOCAL_EVIDENCE_STORAGE_KEY, serialized);
  cachedRaw = serialized;
  cachedSnapshot = records.length === 0 ? EMPTY_RECORDS : records;
  window.dispatchEvent(new Event("cbai-local-evidence-changed"));
}

/**
 * Referentially stable client snapshot for useSyncExternalStore.
 * Returns the same array reference until localStorage content actually changes.
 */
export function getLocalEvidenceSnapshot(): readonly LocalEvidenceRecord[] {
  if (typeof window === "undefined") return EMPTY_RECORDS;
  const raw = window.localStorage.getItem(LOCAL_EVIDENCE_STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  cachedSnapshot = parseRecords(raw);
  return cachedSnapshot;
}

/** Stable empty snapshot for SSR (React useSyncExternalStore). */
export function getEmptyLocalEvidenceSnapshot(): readonly LocalEvidenceRecord[] {
  return EMPTY_RECORDS;
}

/** Subscribe to same-tab + cross-tab local evidence changes. */
export function subscribeLocalEvidence(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onCustom = () => onStoreChange();
  const onStorage = (event: StorageEvent) => {
    if (event.key && event.key !== LOCAL_EVIDENCE_STORAGE_KEY) return;
    cachedRaw = undefined;
    onStoreChange();
  };
  window.addEventListener("cbai-local-evidence-changed", onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("cbai-local-evidence-changed", onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

export function loadLocalEvidenceRecords(): readonly LocalEvidenceRecord[] {
  return getLocalEvidenceSnapshot();
}

/** Test-only: clear in-memory snapshot cache after mutating storage fixtures. */
export function resetLocalEvidenceSnapshotCacheForTests(): void {
  cachedRaw = undefined;
  cachedSnapshot = EMPTY_RECORDS;
}

export function saveLocalEvidenceDraft(draft: LocalEvidenceDraft): LocalEvidenceRecord {
  const now = new Date().toISOString();
  const all = readAll();
  const existing = draft.id ? all.find((r) => r.id === draft.id) : undefined;
  const record: LocalEvidenceRecord = {
    version: 1,
    id: existing?.id ?? (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ev-${Date.now()}`),
    title: draft.title.trim(),
    claim: draft.claim.trim(),
    observation: draft.observation.trim(),
    sourceType: draft.sourceType,
    sourceLabel: draft.sourceLabel.trim(),
    provenance: draft.provenance.trim(),
    evidenceType: draft.evidenceType.trim(),
    reviewStatus: draft.reviewStatus,
    reliabilityNote: draft.reliabilityNote.trim(),
    relatedEntityKind: draft.relatedEntityKind,
    relatedEntityId: draft.relatedEntityId,
    relatedEntityName: draft.relatedEntityName,
    relatedObjectId: draft.relatedObjectId,
    missionId: draft.missionId,
    locale: draft.locale,
    routePath: draft.routePath,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    confirmed: false,
  };
  const next = existing ? all.map((r) => (r.id === record.id ? record : r)) : [...all, record];
  writeAll(next);
  return record;
}

export function confirmLocalEvidence(draft: LocalEvidenceDraft): LocalEvidenceRecord | null {
  if (!draft.title.trim() || !draft.sourceLabel.trim() || !draft.provenance.trim()) {
    return null;
  }
  const saved = saveLocalEvidenceDraft(draft);
  const confirmed: LocalEvidenceRecord = { ...saved, confirmed: true, updatedAt: new Date().toISOString() };
  const all = readAll().map((r) => (r.id === confirmed.id ? confirmed : r));
  writeAll(all);
  return confirmed;
}

/** Bridge confirmed evidence into an Operational Object draft (confirmation still required in composer). */
export function evidenceRecordToOperationalDraft(
  record: LocalEvidenceRecord,
): { draft: OperationalObjectDraft; inferredFields: readonly string[] } {
  const inferred = ["type", "domain", "title", "objective", "nextAction", "evidenceRequirements"] as const;
  const draft: OperationalObjectDraft = {
    type: "source_review",
    title: record.title,
    summary: record.claim || record.title,
    objective: record.claim || record.title,
    rationale: record.provenance,
    expectedOutcome: "",
    domain: "evidence",
    status: "draft",
    priority: "normal",
    requiredInputs: [record.sourceLabel, record.evidenceType],
    evidenceRequirements: [record.sourceLabel],
    nextAction: "Review evidence classification and confirm relationships",
    humanDecision: "",
    relatedObjectIds: record.relatedObjectId ? [record.relatedObjectId, `evidence:${record.id}`] : [`evidence:${record.id}`],
    locale: record.locale,
    knownInformation: record.reviewStatus === "known" || record.reviewStatus === "accepted" ? [record.claim || record.title] : [],
    missingInformation:
      record.reviewStatus === "unknown" || record.reviewStatus === "pending_source" || record.reviewStatus === "source_unavailable"
        ? [record.reliabilityNote || "Source verification incomplete"]
        : [],
    assumptions: ["Reliability is user-classified — not auto-verified"],
    provenance: {
      source: "manual",
      routePath: record.routePath,
      locale: record.locale,
      inferredFields: [...inferred],
      relatedEntityKind: record.relatedEntityKind,
      relatedEntityId: record.relatedEntityId,
      relatedEntityName: record.relatedEntityName,
    },
  };
  return { draft, inferredFields: [...inferred] };
}

export function emptyEvidenceDraft(input: {
  readonly locale: string;
  readonly routePath: string;
  readonly relatedEntityKind?: string;
  readonly relatedEntityId?: string;
  readonly relatedEntityName?: string;
}): LocalEvidenceDraft {
  return {
    title: "",
    claim: "",
    observation: "",
    sourceType: "other",
    sourceLabel: "",
    provenance: "",
    evidenceType: "source",
    reviewStatus: "needs_review",
    reliabilityNote: "",
    relatedEntityKind: input.relatedEntityKind,
    relatedEntityId: input.relatedEntityId,
    relatedEntityName: input.relatedEntityName,
    locale: input.locale,
    routePath: input.routePath,
  };
}
