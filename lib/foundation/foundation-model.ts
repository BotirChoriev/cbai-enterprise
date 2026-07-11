// The universal Intelligence Foundation. Every future ecosystem (Research, Governance,
// Economic, Education, Engineering, Legal, ...) is expected to express its domain concepts in
// terms of these ten pillars. Nothing here is domain-specific — no medicine, no government, no
// research-only vocabulary. Domain modules own their own data; this module only defines the
// shared shape that lets different domains be understood, composed, and displayed the same way.

import type {
  RelationshipConfidence,
  RelationshipDirection,
  RelationshipStatus,
  RelationshipStrength,
  RelationshipType,
} from "@/lib/foundation/relationship-types";
import type { Confidence } from "@/lib/foundation/confidence";
import type {
  EvidenceReliability,
  EvidenceSourceType,
  VerificationStatus,
} from "@/lib/foundation/evidence-types";

/** The thing an intelligence workflow is about — a research topic, a country, an indicator. */
export interface Subject {
  subjectId: string;
  subjectLabel: string;
  subjectKind: string;
}

/** The purpose of the current investigation, in one sentence. Never a fabricated goal. */
export interface Mission {
  subjectId: string;
  statement: string;
}

/** A process- or evidence-level question — never a fabricated scientific/domain claim. */
export interface Question {
  questionId: string;
  question: string;
}

/**
 * A single dated change to an Evidence record — appended, never rewritten in place, so the
 * full history of a claim's verification/status is always inspectable.
 */
export interface EvidenceHistoryEntry {
  occurredAt: string;
  change: string;
  previousStatus?: string;
}

/**
 * A single piece of catalog or connected evidence — the universal Evidence pillar every
 * ecosystem (Research, Governance, Economic, ...) expresses its source material through. Only
 * evidenceId, label, and status are required so existing, simpler evidence records (e.g. the
 * Research evidence catalog) remain valid; every other field is optional and left undefined
 * when the real value is genuinely unknown, never guessed. See lib/evidence/ for the builder,
 * validation, linking, comparison, grouping, and traceability engine that operate on this shape.
 */
export interface Evidence {
  evidenceId: string;
  label: string;
  status: string;
  note?: string;

  /** Where this evidence originally came from — a URL, DOI, or citation, when known. */
  originalSource?: string;
  sourceType?: EvidenceSourceType;
  originOrganization?: string;
  authors?: readonly string[];
  publicationDate?: string;
  version?: string;
  /** Language the evidence is currently held/displayed in. */
  language?: string;
  /** Language of the original source material, when it differs from `language`. */
  originalLanguage?: string;
  verificationStatus?: VerificationStatus;
  reliability?: EvidenceReliability;
  confidence?: Confidence;
  /** Honest caveats about what is not known or verified — never hidden. */
  limitations?: readonly string[];
  supportingEvidenceIds?: readonly string[];
  conflictingEvidenceIds?: readonly string[];
  relatedSubjectIds?: readonly string[];
  relatedMissionIds?: readonly string[];
  relatedQuestionIds?: readonly string[];
  relatedRelationshipIds?: readonly string[];
  timeline?: readonly TimelineEvent[];
  history?: readonly EvidenceHistoryEntry[];
}

/** When a relationship was observed or held — omitted fields mean genuinely unknown, never guessed. */
export interface RelationshipTime {
  observedAt?: string;
  validFrom?: string;
  validTo?: string;
}

/**
 * A connection between two subjects, entities, or evidence records — the universal
 * Relationship pillar. Only relationshipType, sourceId, targetId, and explanation are
 * required; every other field is optional so existing, simpler relationship records remain
 * valid. See lib/relationships/ for the builder and query engine that construct and traverse
 * these honestly (deterministic confidence from evidence count, never a fabricated score).
 */
export interface Relationship {
  relationshipId: string;
  sourceId: string;
  targetId: string;
  relationshipType: RelationshipType;
  /** One-sentence explanation of why this relationship exists — required, never omitted. */
  explanation: string;
  direction?: RelationshipDirection;
  strength?: RelationshipStrength;
  evidence?: readonly Evidence[];
  confidence?: RelationshipConfidence;
  time?: RelationshipTime;
  status?: RelationshipStatus;
  source?: string;
  /** Honest caveats about what is not known or verified — never hidden. */
  limitations?: readonly string[];
}

/** A deterministic assessment of a subject's current state, with reasons — never a score. */
export interface Analysis {
  subjectId: string;
  summary: string;
  reasons: readonly string[];
}

/** One evidence-supported option — never a command, never the only path presented as certain. */
export interface Recommendation {
  recommendationId: string;
  label: string;
  reason: string;
}

/** A real, working path into the product for a recommendation — absent when none exists. */
export interface Execution {
  label: string;
  href: string;
}

/** A single dated activity entry — never fabricated when no real event log exists. */
export interface TimelineEvent {
  eventId: string;
  occurredAt: string;
  description: string;
}

/** A durable unit of accumulated understanding — a note or a finding, kept, not overwritten. */
export interface Knowledge {
  knowledgeId: string;
  body: string;
  createdAt: string;
}
