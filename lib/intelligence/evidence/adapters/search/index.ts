/**
 * Search evidence adapter package (BUILD-032).
 *
 * @see docs/build-032-report.md
 */

export {
  createSearchEvidenceAdapter,
  SearchEvidenceAdapter,
} from "@/lib/intelligence/evidence/adapters/search/search-evidence-adapter";

export {
  defaultSearchEvidenceMapper,
  SearchEvidenceMapper,
} from "@/lib/intelligence/evidence/adapters/search/search-evidence-mapper";

export {
  defaultSearchResolver,
  SearchResolver,
} from "@/lib/intelligence/evidence/adapters/search/search-resolver";

export {
  MAX_SEARCH_QUERY_MATCHES,
  SEARCH_EVIDENCE_ADAPTER_ID,
  SEARCH_EVIDENCE_ADAPTER_VERSION,
  SEARCH_EVIDENCE_SOURCE_CLASS,
  toSearchResolvedMatch,
  type SearchEvidenceDraft,
  type SearchEvidenceMapperOptions,
  type SearchMatchSource,
  type SearchResolution,
  type SearchResolvedMatch,
} from "@/lib/intelligence/evidence/adapters/search/types";
