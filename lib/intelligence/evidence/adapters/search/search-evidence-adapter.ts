import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { EvidenceSourceAdapter } from "@/lib/intelligence/evidence/sources";
import {
  defaultSearchEvidenceMapper,
  type SearchEvidenceMapper,
} from "@/lib/intelligence/evidence/adapters/search/search-evidence-mapper";
import {
  defaultSearchResolver,
  type SearchResolver,
} from "@/lib/intelligence/evidence/adapters/search/search-resolver";
import {
  SEARCH_EVIDENCE_ADAPTER_ID,
  SEARCH_EVIDENCE_ADAPTER_VERSION,
  SEARCH_EVIDENCE_SOURCE_CLASS,
} from "@/lib/intelligence/evidence/adapters/search/types";

/**
 * Search evidence source adapter (BUILD-032).
 *
 * Converts local global search matches into deterministic evidence items —
 * no external search, AI search, or fabricated results.
 */
export class SearchEvidenceAdapter implements EvidenceSourceAdapter {
  readonly id = SEARCH_EVIDENCE_ADAPTER_ID;
  readonly sourceClass = SEARCH_EVIDENCE_SOURCE_CLASS;
  readonly label = "Global Search";
  readonly description =
    "Unified local entity index search matches with relevance scoring from existing utilities.";
  readonly enabled = true;
  readonly version = SEARCH_EVIDENCE_ADAPTER_VERSION;

  private readonly resolver: SearchResolver;
  private readonly mapper: SearchEvidenceMapper;

  constructor(
    resolver: SearchResolver = defaultSearchResolver,
    mapper: SearchEvidenceMapper = defaultSearchEvidenceMapper,
  ) {
    this.resolver = resolver;
    this.mapper = mapper;
  }

  /**
   * Collect search evidence from request question and/or subject entities.
   */
  collect(request: IntelligenceRequest) {
    const query = request.question.trim();
    const hasSubjectEntities =
      request.subjectEntities !== undefined && request.subjectEntities.length > 0;

    if (!query && !hasSubjectEntities) {
      return {
        items: [],
        warnings: ["search:no-query-or-subject-entities"],
      };
    }

    const retrievedAt = new Date().toISOString();
    const resolution = this.resolver.resolve(request);
    const items = this.mapper.mapMatches(resolution, {
      retrievedAt,
      query: resolution.query,
    });

    return {
      items,
      warnings: resolution.warnings.length > 0 ? resolution.warnings : undefined,
    };
  }
}

/** Factory for registry bootstrap. */
export function createSearchEvidenceAdapter(): SearchEvidenceAdapter {
  return new SearchEvidenceAdapter();
}
