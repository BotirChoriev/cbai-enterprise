/**
 * CBAI Intelligence Engine — Contradiction Detection Layer (BUILD-037).
 *
 * Deterministic objective conflict detection across collected evidence.
 * No AI models, semantic reasoning, or fabricated contradictions.
 *
 * @see docs/build-037-report.md
 */

export {
  CONTRADICTION_DETECTOR_VERSION,
  DEFAULT_CONTRADICTION_DETECTOR_ID,
  DefaultContradictionDetector,
  applyContradictionDetectionToEvidence,
  defaultContradictionDetector,
  resolveContradictionState,
  type ContradictionDetector,
} from "@/lib/intelligence/contradictions/detector";

export {
  CONTRADICTION_MIN_RELEVANCE,
  KNOWN_EVIDENCE_PROPERTY_SUFFIXES,
  RULE_DUPLICATE_ID_PAYLOAD_CONFLICT,
  RULE_EXPLICIT_CONFLICT_FLAG,
  RULE_IMPOSSIBLE_STATE_COMBINATION,
  RULE_PROPERTY_VALUE_CONFLICT,
  RULE_TIMESTAMP_ORDER_CONFLICT,
  buildCanonicalEvidenceKey,
  buildContradictionSummary,
  createContradictionRecord,
  detectDuplicateIdPayloadConflicts,
  detectExplicitConflictFlags,
  detectImpossibleStateCombinations,
  detectPropertyValueConflicts,
  detectTimestampOrderConflicts,
  extractAiScore,
  extractPropertyKey,
  meetsContradictionRelevanceThreshold,
  normalizeExcerptValue,
  runContradictionRules,
} from "@/lib/intelligence/contradictions/rules";

export type {
  ContradictionDetectionMetadata,
  ContradictionDetectionResult,
  ContradictionSeverity,
  ContradictionSummary,
  EvidenceContradiction,
} from "@/lib/intelligence/contradictions/types";
