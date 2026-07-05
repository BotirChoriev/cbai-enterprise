/**
 * Graph evidence adapter package (BUILD-031).
 *
 * @see docs/build-031-report.md
 */

export {
  createGraphEvidenceAdapter,
  GraphEvidenceAdapter,
} from "@/lib/intelligence/evidence/adapters/graph/graph-evidence-adapter";

export {
  computeGraphDistance,
  defaultGraphContextResolver,
  GraphContextResolver,
} from "@/lib/intelligence/evidence/adapters/graph/graph-context-resolver";

export {
  defaultGraphEvidenceMapper,
  GraphEvidenceMapper,
} from "@/lib/intelligence/evidence/adapters/graph/graph-evidence-mapper";

export {
  GRAPH_EDGE_CATEGORY_MAP,
  GRAPH_EVIDENCE_ADAPTER_ID,
  GRAPH_EVIDENCE_ADAPTER_VERSION,
  GRAPH_EVIDENCE_CATEGORY_LABELS,
  GRAPH_EVIDENCE_SOURCE_CLASS,
  type GraphContextResolution,
  type GraphEntityEndpoint,
  type GraphEvidenceCategory,
  type GraphEvidenceDraft,
  type GraphEvidenceMapperOptions,
  type GraphResolvedEdge,
  type GraphResolvedNeighbor,
} from "@/lib/intelligence/evidence/adapters/graph/types";
