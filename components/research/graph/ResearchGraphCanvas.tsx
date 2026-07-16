import type { ResearchGraph } from "@/lib/research/graph/research-graph-types";
import { RESEARCH_GRAPH_HONEST_NOTICE } from "@/lib/research/graph/research-graph-types";
import {
  findGraphNode,
  groupGraphNodesByType,
} from "@/lib/research/graph/research-graph-query";
import ResearchGraphNodeCard from "@/components/research/graph/ResearchGraphNodeCard";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type GraphTierProps = {
  title: string;
  nodes: readonly { nodeId: string }[];
  graph: ResearchGraph;
  compact?: boolean;
  limit?: number;
};

function GraphTier({ title, graph, nodes, compact, limit }: GraphTierProps) {
  const displayNodes = limit ? nodes.slice(0, limit) : nodes;
  if (displayNodes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-center text-[10px] font-medium uppercase tracking-wider text-zinc-600">
        {title}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {displayNodes.map((entry) => {
          const node = findGraphNode(graph, entry.nodeId);
          if (!node) {
            return null;
          }
          return (
            <div key={node.nodeId} className="max-w-[11rem] flex-1 sm:max-w-[12rem]">
              <ResearchGraphNodeCard
                node={node}
                focused={node.nodeId === graph.focusNodeId}
                compact={compact}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-1" aria-hidden="true">
      <div className="h-4 w-px bg-gradient-to-b from-teal-500/40 to-teal-500/10" />
    </div>
  );
}

type ResearchGraphCanvasProps = {
  graph: ResearchGraph;
  compact?: boolean;
};

export default function ResearchGraphCanvas({ graph, compact = false }: ResearchGraphCanvasProps) {
  const grouped = groupGraphNodesByType(graph);
  const focusNode = graph.focusNodeId ? findGraphNode(graph, graph.focusNodeId) : undefined;
  const relatedTopics = grouped.topics.filter((node) => node.nodeId !== graph.focusNodeId);

  return (
    <div className={`${cbaiGlassCard} space-y-1 p-4`}>
      {focusNode ? (
        <>
          <GraphTier title="Topic" graph={graph} nodes={[focusNode]} compact={compact} />
          <Connector />
        </>
      ) : null}

      <GraphTier
        title="Domain & methods"
        graph={graph}
        nodes={[...grouped.domains, ...grouped.methods]}
        compact={compact}
        limit={compact ? 4 : undefined}
      />
      <Connector />

      <GraphTier
        title="Evidence types"
        graph={graph}
        nodes={grouped.evidenceTypes}
        compact={compact}
        limit={compact ? 3 : undefined}
      />
      <Connector />

      <GraphTier
        title="Related research topics"
        graph={graph}
        nodes={relatedTopics}
        compact={compact}
        limit={compact ? 2 : undefined}
      />
      <Connector />

      <GraphTier
        title="Future research objects"
        graph={graph}
        nodes={grouped.futureObjects}
        compact={compact}
        limit={compact ? 4 : undefined}
      />

      <p className="border-t border-zinc-800/80 pt-3 text-center text-[11px] text-zinc-600">
        {graph.honestNotice || RESEARCH_GRAPH_HONEST_NOTICE}
      </p>
    </div>
  );
}
