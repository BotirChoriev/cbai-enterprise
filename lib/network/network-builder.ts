import type { Relationship } from "@/lib/foundation/foundation-model";
import type {
  IntelligenceNetwork,
  IntelligenceNetworkNode,
} from "@/lib/foundation/network-types";

export interface BuildIntelligenceNetworkInput {
  nodes: readonly IntelligenceNetworkNode[];
  edges: readonly Relationship[];
}

/**
 * Compose a Global Intelligence Network from real nodes and real edges. No discovery, no
 * fabrication — this function only assembles what the caller already resolved from its own
 * domain data (see lib/foundation/adapters/ for how Research does this).
 */
export function buildIntelligenceNetwork(input: BuildIntelligenceNetworkInput): IntelligenceNetwork {
  return {
    nodes: input.nodes,
    edges: input.edges,
    extensions: {},
  };
}
