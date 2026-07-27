/**
 * Scientific Deliberation Network — canonical domain types (additive, versioned).
 * CBAI never decides winners, superiority, permanent truth, or political outcomes.
 */

export const SDN_SCHEMA_VERSION = 1 as const;

export const ROOM_LIFECYCLE_STATES = [
  "draft",
  "open",
  "methodology_review",
  "synthesis",
  "awaiting_human_decision",
  "closed",
  "archived",
] as const;
export type RoomLifecycleState = (typeof ROOM_LIFECYCLE_STATES)[number];

export const ROOM_TYPES = [
  "claim_verification",
  "theory_comparison",
  "methodology_clinic",
  "replication_room",
  "conflicting_results",
  "open_scientific_question",
  "interdisciplinary_deliberation",
  "policy_evidence_deliberation",
] as const;
export type DeliberationRoomType = (typeof ROOM_TYPES)[number];

export const CLAIM_STATUSES = [
  "proposed",
  "source_pending",
  "supported",
  "conditionally_supported",
  "disputed",
  "contradicted",
  "unknown",
  "withdrawn",
  "human_confirmed",
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const EVIDENCE_STANCES = ["support", "challenge", "context"] as const;
export type EvidenceStance = (typeof EVIDENCE_STANCES)[number];

export const PARTICIPANT_ROLES = [
  "claim_author",
  "counter_evidence_contributor",
  "methodology_reviewer",
  "statistical_reviewer",
  "replication_specialist",
  "interdisciplinary_expert",
  "institution_representative",
  "student_observer",
  "scientific_moderator",
  "final_human_approver",
] as const;
export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number];

export const REPLICATION_RELATIONS = [
  "matched",
  "partially_matched",
  "did_not_match",
  "inconclusive",
] as const;
export type ReplicationRelation = (typeof REPLICATION_RELATIONS)[number];

export const CONTRADICTION_REASON_CATEGORIES = [
  "sample_differences",
  "time_period_differences",
  "geographical_differences",
  "methodology_differences",
  "measurement_differences",
  "population_differences",
  "uncontrolled_variables",
  "incomplete_data",
] as const;
export type ContradictionReasonCategory = (typeof CONTRADICTION_REASON_CATEGORIES)[number];

export type LocaleProvenance = {
  readonly contentLocale: string;
  readonly createdLocale: string;
  readonly sourceLanguage?: string | null;
};

export type ProvenanceFields = {
  readonly sourceUrl?: string | null;
  readonly officialSourceName?: string | null;
  readonly doiOrStableId?: string | null;
  readonly publicationDate?: string | null;
  readonly updatedDate?: string | null;
  readonly lastVerifiedDate?: string | null;
  readonly freshnessStatus?: "fresh" | "stale" | "unknown" | "withdrawn" | "superseded";
};

export type DeliberationRoom = LocaleProvenance & {
  readonly id: string;
  readonly schemaVersion: typeof SDN_SCHEMA_VERSION;
  readonly title: string;
  readonly roomType: DeliberationRoomType;
  readonly scientificQuestion: string;
  readonly scope: string;
  readonly primaryClaimId: string | null;
  readonly proofStandard: string;
  readonly acceptedSourcePolicies: readonly string[];
  readonly languages: readonly string[];
  readonly visibility: "open" | "restricted" | "local_only";
  readonly status: RoomLifecycleState;
  readonly participantRoles: readonly ParticipantRole[];
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  readonly translationConsent: boolean;
  readonly transcriptConsent: boolean;
  readonly confidentiality: "none" | "participants" | "embargoed" | "unknown";
  readonly intellectualPropertyStatus: string;
  readonly conflictDisclosures: string;
  readonly finalHumanApprover: string;
  readonly sourceRoute: string;
  readonly relatedEntityIds: readonly string[];
  readonly relatedOperationalObjectIds: readonly string[];
  readonly collaborationMode: "local_only" | "infrastructure_required";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
  readonly unknownFields?: Readonly<Record<string, unknown>>;
};

export type ScientificClaim = LocaleProvenance & {
  readonly id: string;
  readonly roomId: string;
  readonly statement: string;
  readonly claimType: string;
  readonly authorRef: string | null;
  readonly institutionRef: string | null;
  readonly status: ClaimStatus;
  readonly assumptions: readonly string[];
  readonly scope: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
  readonly revisionHistory: readonly string[];
  readonly unknownFields?: Readonly<Record<string, unknown>>;
};

export type DeliberationEvidenceRecord = LocaleProvenance &
  ProvenanceFields & {
    readonly id: string;
    readonly roomId: string;
    readonly claimId: string;
    readonly stance: EvidenceStance;
    readonly evidenceType: string;
    readonly authors: readonly string[];
    readonly institutions: readonly string[];
    readonly methodology: string | null;
    readonly sampleSize: string | null;
    readonly measurementUnits: string | null;
    readonly geographicalCoverage: string | null;
    readonly temporalCoverage: string | null;
    readonly statisticalUncertainty: string | null;
    readonly limitations: string | null;
    readonly conflictsOfInterest: string | null;
    readonly replicationStatus: string | null;
    readonly linkedCounterEvidenceIds: readonly string[];
    readonly originalSourceText: string;
    readonly cbaiInterpretation: string | null;
    readonly humanConfirmationStatus: "pending" | "confirmed" | "rejected" | "unknown";
    readonly provenance: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly version: number;
    readonly unknownFields?: Readonly<Record<string, unknown>>;
  };

export type MethodReview = LocaleProvenance & {
  readonly id: string;
  readonly roomId: string;
  readonly claimId: string | null;
  readonly evidenceId: string | null;
  readonly reviewerRole: ParticipantRole;
  readonly methodExamined: string;
  readonly assumptions: readonly string[];
  readonly samplingConcerns: string | null;
  readonly measurementConcerns: string | null;
  readonly statisticalConcerns: string | null;
  readonly reproducibilityNotes: string | null;
  readonly severity: "low" | "moderate" | "high" | "unknown";
  readonly sources: readonly string[];
  readonly humanStatus: "draft" | "submitted" | "acknowledged" | "unknown";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
};

export type ReplicationRecord = LocaleProvenance & {
  readonly id: string;
  readonly roomId: string;
  readonly originalResultRef: string;
  readonly replicatingInstitution: string | null;
  readonly location: string | null;
  readonly method: string | null;
  readonly deviations: string | null;
  readonly sample: string | null;
  readonly result: string | null;
  readonly relation: ReplicationRelation;
  readonly independentStatus: boolean | null;
  readonly limitations: string | null;
  readonly sources: readonly string[];
  readonly verifiedDate: string | null;
  readonly isNegativeOrInconclusive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
};

export type ScientificContribution = LocaleProvenance & {
  readonly id: string;
  readonly roomId: string;
  readonly claimId: string | null;
  readonly contributorRole: ParticipantRole;
  readonly originalText: string;
  readonly sourceLanguage: string;
  readonly translatedText: string | null;
  readonly targetLanguage: string | null;
  readonly translationConfidence: "high" | "medium" | "low" | "unknown" | null;
  readonly humanCorrectedTranslation: string | null;
  readonly sources: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly revisionHistory: readonly string[];
};

export type SynthesisSnapshot = {
  readonly id: string;
  readonly roomId: string;
  readonly wellSupported: readonly string[];
  readonly conditional: readonly string[];
  readonly disputed: readonly string[];
  readonly unknown: readonly string[];
  readonly contradictions: readonly string[];
  readonly nextExperiments: readonly string[];
  readonly generatedAt: string;
  readonly evidenceCutoff: string;
  readonly reviewedBy: string | null;
  readonly humanApprovalStatus: "not_reviewed" | "approved" | "rejected" | "pending";
  readonly version: number;
  /** Explicitly never “final truth”. */
  readonly finalTruthForbidden: true;
};

export type GlossaryTerm = {
  readonly id: string;
  readonly roomId: string;
  readonly originalTerm: string;
  readonly approvedTranslations: Readonly<Record<string, string>>;
  readonly definition: string;
  readonly discipline: string;
  readonly source: string | null;
  readonly humanReviewer: string | null;
  readonly version: number;
};

export type ParticipantReference = {
  readonly id: string;
  readonly roomId: string;
  readonly displayLabel: string;
  readonly role: ParticipantRole;
  readonly institutionRef: string | null;
  readonly isLocalOnly: true;
  readonly cannotImpersonateInstitution: true;
};

export type DecisionCheckpoint = {
  readonly id: string;
  readonly roomId: string;
  readonly label: string;
  readonly requiredApproverRole: ParticipantRole;
  readonly status: "open" | "approved" | "rejected" | "deferred";
  readonly decidedAt: string | null;
};

export type ScientificAuditEvent = {
  readonly id: string;
  readonly roomId: string;
  readonly kind: string;
  readonly summary: string;
  readonly at: string;
  readonly actorRole: ParticipantRole | "system";
};

export type ContradictionLink = {
  readonly id: string;
  readonly roomId: string;
  readonly evidenceIdA: string;
  readonly evidenceIdB: string;
  readonly reasonCategories: readonly ContradictionReasonCategory[];
  readonly explanation: string;
  readonly causationClaimed: false;
};

export type DeliberationBundle = {
  readonly room: DeliberationRoom;
  readonly claims: readonly ScientificClaim[];
  readonly evidence: readonly DeliberationEvidenceRecord[];
  readonly methodReviews: readonly MethodReview[];
  readonly replications: readonly ReplicationRecord[];
  readonly contributions: readonly ScientificContribution[];
  readonly synthesis: SynthesisSnapshot | null;
  readonly glossary: readonly GlossaryTerm[];
  readonly participants: readonly ParticipantReference[];
  readonly checkpoints: readonly DecisionCheckpoint[];
  readonly audit: readonly ScientificAuditEvent[];
  readonly contradictions: readonly ContradictionLink[];
};
