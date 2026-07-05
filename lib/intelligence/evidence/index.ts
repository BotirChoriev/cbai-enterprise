/**
 * CBAI Intelligence Engine — Evidence Layer foundation (BUILD-023).
 *
 * Framework-only evidence collection, source registry, and shape validation.
 * No data fetching, API calls, LLM integration, or mock business data.
 *
 * @see docs/build-023-report.md
 */

export {
  DEFAULT_EVIDENCE_COLLECTOR_ID,
  DefaultEvidenceCollector,
  EVIDENCE_COLLECTOR_VERSION,
  defaultEvidenceCollector,
  type EvidenceCollector,
} from "@/lib/intelligence/evidence/collector";

export {
  createDefaultEvidenceSourceRegistry,
  defaultEvidenceSourceRegistry,
  EvidenceSourceRegistry,
  type EvidenceSourceAdapter,
} from "@/lib/intelligence/evidence/sources";

export {
  EVIDENCE_RELEVANCE_MAX,
  EVIDENCE_RELEVANCE_MIN,
  EvidenceValidationError,
  isEvidenceEntityType,
  isEvidenceShape,
  isEvidenceSourceClass,
  isValidRelevanceScore,
  summarizeEvidenceItems,
  validateEvidenceCollectionShape,
  validateEvidenceShape,
  validateEvidenceSourceShape,
} from "@/lib/intelligence/evidence/validation";
