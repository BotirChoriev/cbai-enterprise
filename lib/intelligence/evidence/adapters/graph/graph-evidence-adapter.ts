import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { EvidenceSourceAdapter } from "@/lib/intelligence/evidence/sources";
import {
  defaultGraphContextResolver,
  type GraphContextResolver,
} from "@/lib/intelligence/evidence/adapters/graph/graph-context-resolver";
import {
  defaultGraphEvidenceMapper,
  type GraphEvidenceMapper,
} from "@/lib/intelligence/evidence/adapters/graph/graph-evidence-mapper";
import {
  GRAPH_EVIDENCE_ADAPTER_ID,
  GRAPH_EVIDENCE_ADAPTER_VERSION,
  GRAPH_EVIDENCE_SOURCE_CLASS,
} from "@/lib/intelligence/evidence/adapters/graph/types";

/**
 * Graph evidence source adapter (BUILD-031).
 *
 * Reads connected nodes and edges from the knowledge graph for scoped
 * subject entities — no fabricated relationships or external fetching.
 */
export class GraphEvidenceAdapter implements EvidenceSourceAdapter {
  readonly id = GRAPH_EVIDENCE_ADAPTER_ID;
  readonly sourceClass = GRAPH_EVIDENCE_SOURCE_CLASS;
  readonly label = "Knowledge Graph";
  readonly description =
    "Connected nodes, edges, relationship types, and hop distances from the CBAI knowledge graph.";
  readonly enabled = true;
  readonly version = GRAPH_EVIDENCE_ADAPTER_VERSION;

  private readonly resolver: GraphContextResolver;
  private readonly mapper: GraphEvidenceMapper;

  constructor(
    resolver: GraphContextResolver = defaultGraphContextResolver,
    mapper: GraphEvidenceMapper = defaultGraphEvidenceMapper,
  ) {
    this.resolver = resolver;
    this.mapper = mapper;
  }

  /**
   * Collect graph evidence for explicitly scoped subject entities only.
   */
  collect(request: IntelligenceRequest) {
    const subjectEntities = request.subjectEntities;

    if (!subjectEntities || subjectEntities.length === 0) {
      return {
        items: [],
        warnings: ["graph:no-subject-entities"],
      };
    }

    const retrievedAt = new Date().toISOString();
    const context = this.resolver.resolve(subjectEntities);
    const items = this.mapper.mapContext(context, { retrievedAt });

    return {
      items,
      warnings: context.warnings.length > 0 ? context.warnings : undefined,
    };
  }
}

/** Factory for registry bootstrap. */
export function createGraphEvidenceAdapter(): GraphEvidenceAdapter {
  return new GraphEvidenceAdapter();
}
