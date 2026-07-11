import type { Evidence } from "@/lib/foundation/foundation-model";
import type {
  EvidenceReliability,
  EvidenceSourceType,
  VerificationStatus,
} from "@/lib/foundation/evidence-types";
import type { Confidence } from "@/lib/foundation/confidence";

export interface BuildEvidenceInput {
  evidenceId: string;
  label: string;
  status: string;
  note?: string;
  originalSource?: string;
  sourceType?: EvidenceSourceType;
  originOrganization?: string;
  authors?: readonly string[];
  publicationDate?: string;
  version?: string;
  language?: string;
  originalLanguage?: string;
  verificationStatus?: VerificationStatus;
  reliability?: EvidenceReliability;
  confidence?: Confidence;
  limitations?: readonly string[];
  supportingEvidenceIds?: readonly string[];
  conflictingEvidenceIds?: readonly string[];
  relatedSubjectIds?: readonly string[];
  relatedMissionIds?: readonly string[];
  relatedQuestionIds?: readonly string[];
  relatedRelationshipIds?: readonly string[];
}

/**
 * Construct a fully-honest Evidence record. Only evidenceId, label, and status are required;
 * every other field is left undefined unless the caller supplies a real, known value — never
 * defaulted to a guess. Use lib/evidence/evidence-history.ts to append history entries and
 * lib/evidence/evidence-linking.ts to link supporting/conflicting evidence after construction.
 */
export function buildEvidence(input: BuildEvidenceInput): Evidence {
  return {
    evidenceId: input.evidenceId,
    label: input.label,
    status: input.status,
    note: input.note,
    originalSource: input.originalSource,
    sourceType: input.sourceType,
    originOrganization: input.originOrganization,
    authors: input.authors,
    publicationDate: input.publicationDate,
    version: input.version,
    language: input.language,
    originalLanguage: input.originalLanguage,
    verificationStatus: input.verificationStatus,
    reliability: input.reliability,
    confidence: input.confidence,
    limitations: input.limitations,
    supportingEvidenceIds: input.supportingEvidenceIds,
    conflictingEvidenceIds: input.conflictingEvidenceIds,
    relatedSubjectIds: input.relatedSubjectIds,
    relatedMissionIds: input.relatedMissionIds,
    relatedQuestionIds: input.relatedQuestionIds,
    relatedRelationshipIds: input.relatedRelationshipIds,
  };
}
