// Universal Evidence vocabulary. EvidenceSourceType and VerificationStatus are promoted from
// existing, real, domain modules (lib/research/evidence/evidence-types.ts and
// lib/evidence-infrastructure/types.ts respectively) rather than redefined — both modules now
// re-export these as type aliases, so existing imports keep working unchanged. EvidenceReliability
// is new; no existing module defined an equivalent concept.

export const EVIDENCE_SOURCE_TYPES = [
  "publication",
  "dataset",
  "experiment",
  "patent",
  "laboratory",
  "researcher",
  "institution",
  "company",
  "government",
  "other",
] as const;

/** Promoted from lib/research/evidence/evidence-types.ts — same 10 values, one definition. */
export type EvidenceSourceType = (typeof EVIDENCE_SOURCE_TYPES)[number];

export const EVIDENCE_SOURCE_TYPE_LABELS: Record<EvidenceSourceType, string> = {
  publication: "Publication",
  dataset: "Dataset",
  experiment: "Experiment",
  patent: "Patent",
  laboratory: "Laboratory",
  researcher: "Researcher",
  institution: "Institution",
  company: "Company",
  government: "Government",
  other: "Other",
};

export const VERIFICATION_STATUSES = [
  "not_started",
  "verification_pending",
  "verified",
  "failed",
  "not_applicable",
] as const;

/** Promoted from lib/evidence-infrastructure/types.ts — same 5 values, one definition. */
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  not_started: "Not started",
  verification_pending: "Verification pending",
  verified: "Verified",
  failed: "Failed",
  not_applicable: "Not applicable",
};

// Categorical, never numeric — matches the platform-wide rule that nothing gets a fabricated
// magnitude. "unknown" is the honest default until real methodology justifies otherwise.
export type EvidenceReliability = "unknown" | "low" | "moderate" | "high";

export const EVIDENCE_RELIABILITY_LABELS: Record<EvidenceReliability, string> = {
  unknown: "Unknown",
  low: "Low",
  moderate: "Moderate",
  high: "High",
};
