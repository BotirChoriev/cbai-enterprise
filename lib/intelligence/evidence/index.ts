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
  deduplicateEvidenceItems,
  defaultEvidenceCollector,
  sortEvidenceByRelevance,
  type EvidenceCollector,
} from "@/lib/intelligence/evidence/collector";

export {
  createDefaultEvidenceSourceRegistry,
  defaultEvidenceSourceRegistry,
  EvidenceSourceRegistry,
  type EvidenceSourceAdapter,
  type EvidenceSourceAdapterCollectResult,
} from "@/lib/intelligence/evidence/sources";

export {
  countCoveredSubjectEntities,
  evaluateEvidenceSufficiency,
  isComparativeClaimType,
} from "@/lib/intelligence/evidence/sufficiency";

export {
  createEntityProfileEvidenceAdapter,
  defaultEntityEvidenceMapper,
  defaultEntityResolver,
  EntityEvidenceMapper,
  EntityProfileEvidenceAdapter,
  EntityResolver,
  ENTITY_PROFILE_ADAPTER_ID,
  ENTITY_PROFILE_ADAPTER_VERSION,
  entityRefKey,
  isSupportedEntityType,
  MAX_EVIDENCE_ITEMS_PER_ENTITY,
  SUPPORTED_ENTITY_TYPES,
} from "@/lib/intelligence/evidence/adapters/entity";

export {
  computeGraphDistance,
  createGraphEvidenceAdapter,
  defaultGraphContextResolver,
  defaultGraphEvidenceMapper,
  GraphContextResolver,
  GraphEvidenceAdapter,
  GraphEvidenceMapper,
  GRAPH_EDGE_CATEGORY_MAP,
  GRAPH_EVIDENCE_ADAPTER_ID,
  GRAPH_EVIDENCE_ADAPTER_VERSION,
  GRAPH_EVIDENCE_CATEGORY_LABELS,
  GRAPH_EVIDENCE_SOURCE_CLASS,
} from "@/lib/intelligence/evidence/adapters/graph";

export {
  createSearchEvidenceAdapter,
  defaultSearchEvidenceMapper,
  defaultSearchResolver,
  MAX_SEARCH_QUERY_MATCHES,
  SearchEvidenceAdapter,
  SearchEvidenceMapper,
  SearchResolver,
  SEARCH_EVIDENCE_ADAPTER_ID,
  SEARCH_EVIDENCE_ADAPTER_VERSION,
  SEARCH_EVIDENCE_SOURCE_CLASS,
} from "@/lib/intelligence/evidence/adapters/search";

export {
  createDocumentEvidenceAdapter,
  defaultDocumentEvidenceMapper,
  defaultDocumentResolver,
  DocumentEvidenceAdapter,
  DocumentEvidenceMapper,
  DocumentResolver,
  DOCUMENT_EVIDENCE_ADAPTER_ID,
  DOCUMENT_EVIDENCE_ADAPTER_VERSION,
  DOCUMENT_EVIDENCE_SOURCE_CLASS,
  DOCUMENT_INGESTION_NOT_CONNECTED_MESSAGE,
  DOCUMENT_INGESTION_NOT_CONNECTED_WARNING,
  FUTURE_SUPPORTED_DOCUMENT_FORMATS,
} from "@/lib/intelligence/evidence/adapters/document";

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
