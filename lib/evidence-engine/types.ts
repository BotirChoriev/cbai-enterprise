/**
 * Phase 4 — Evidence engine lifecycle + provenance foundations.
 * Additive to existing evidence / foundation layers. No fabricated live data.
 */

export type EvidenceLifecycleStatus =
  | "unverified"
  | "under_review"
  | "verified"
  | "disputed"
  | "rejected"
  | "expired"
  | "missing_source";

export const EVIDENCE_LIFECYCLE_STATUSES: readonly EvidenceLifecycleStatus[] = [
  "unverified",
  "under_review",
  "verified",
  "disputed",
  "rejected",
  "expired",
  "missing_source",
] as const;

export type EvidenceProvenance = {
  readonly publisher: string;
  readonly publicationDate: string | null;
  readonly retrievalDate: string | null;
  readonly jurisdiction: string | null;
  readonly language: string | null;
  readonly confidenceBasis: string;
  readonly reviewer: string | null;
  readonly reviewNotes: string | null;
};

export type EvidenceRecord = {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly status: EvidenceLifecycleStatus;
  readonly provenance: EvidenceProvenance;
  readonly missionId: string | null;
  readonly reportId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type EvidenceRecordDraft = {
  readonly title: string;
  readonly summary?: string;
  readonly status?: EvidenceLifecycleStatus;
  readonly provenance?: Partial<EvidenceProvenance>;
  readonly missionId?: string | null;
  readonly reportId?: string | null;
};

export type EvidenceStatusTransitionResult =
  | { readonly ok: true; readonly record: EvidenceRecord }
  | { readonly ok: false; readonly reason: string };
