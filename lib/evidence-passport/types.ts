/**
 * Evidence Passport — canonical versioned evidence identity for CBAI.
 * Additive over foundation Evidence; never invents sources, scores, or translations.
 */

export const EVIDENCE_PASSPORT_SCHEMA_VERSION = 1 as const;

export type EvidenceStance = "supports" | "challenges" | "contextualizes";

export type EvidencePassportType =
  | "observation"
  | "measurement"
  | "publication"
  | "official_statistic"
  | "method_note"
  | "negative_result"
  | "replication"
  | "dataset"
  | "other";

export type KnowledgeState = "known" | "disputed" | "unknown";

export type HumanVerificationStatus =
  | "unverified"
  | "pending_review"
  | "human_confirmed"
  | "rejected";

export type EvidencePassport = {
  readonly schemaVersion: typeof EVIDENCE_PASSPORT_SCHEMA_VERSION;
  readonly passportId: string;
  readonly evidenceId: string;
  readonly claimId: string | null;
  readonly claimText: string;
  readonly stance: EvidenceStance;
  readonly evidenceType: EvidencePassportType;
  readonly author: string | null;
  readonly institution: string | null;
  readonly directSourceUrl: string | null;
  readonly publicationDate: string | null;
  readonly updateDate: string | null;
  readonly methodology: string | null;
  readonly sampleSize: string | null;
  readonly units: string | null;
  readonly geographyCoverage: string | null;
  readonly timeCoverage: string | null;
  readonly statisticalUncertainty: string | null;
  readonly limitations: readonly string[];
  readonly conflictsOfInterest: string | null;
  readonly replicationStatus: "not_attempted" | "replicated" | "failed_replication" | "unknown";
  readonly counterEvidenceIds: readonly string[];
  readonly freshness: "fresh" | "aging" | "outdated" | "unknown";
  readonly license: string | null;
  /** Official / source material — never silently rewritten. */
  readonly originalSourceContent: string;
  readonly localizedSummary: string | null;
  /** CBAI synthesis stored separately from source material. */
  readonly cbaiSynthesis: string | null;
  readonly knowledgeState: KnowledgeState;
  readonly humanVerificationStatus: HumanVerificationStatus;
  readonly verifierDisplayName: string | null;
  readonly fingerprint: string;
  readonly version: string;
  readonly contentLocale: string;
  readonly createdLocale: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly auditHistory: readonly {
    readonly at: string;
    readonly actor: string;
    readonly action: string;
    readonly detail: string | null;
  }[];
  readonly [key: string]: unknown;
};

export type CreateEvidencePassportInput = {
  readonly evidenceId?: string;
  readonly claimText: string;
  readonly stance: EvidenceStance;
  readonly evidenceType?: EvidencePassportType;
  readonly originalSourceContent: string;
  readonly directSourceUrl?: string | null;
  readonly author?: string | null;
  readonly institution?: string | null;
  readonly publicationDate?: string | null;
  readonly methodology?: string | null;
  readonly limitations?: readonly string[];
  readonly localizedSummary?: string | null;
  readonly cbaiSynthesis?: string | null;
  readonly contentLocale?: string;
  readonly createdLocale?: string;
  readonly confirmCreate: true;
};
