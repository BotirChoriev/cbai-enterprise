import type { ResearchNetwork } from "@/lib/research/network/network-types";
import { RESEARCH_NETWORK_VIEWBOX } from "@/lib/research/network/network-types";

type ResearchMiniMapProps = {
  network: ResearchNetwork;
  activeTopicId: string | null;
  focusedTopicId: string | null;
};

export default function ResearchMiniMap({
  network,
  activeTopicId,
  focusedTopicId,
}: ResearchMiniMapProps) {
  const { width, height } = RESEARCH_NETWORK_VIEWBOX;

  return (
    <div className="absolute right-3 top-3 hidden rounded-lg border border-zinc-800/80 bg-slate-950/80 p-2 backdrop-blur-sm sm:block">
      <p className="mb-1 text-[9px] font-medium uppercase tracking-wider text-zinc-600">
        {focusedTopicId ? "Focus map" : "Mini map"}
      </p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-24 w-36"
        aria-hidden="true"
      >
        {network.connections.map((connection) => {
          const source = network.nodes.find((node) => node.topicId === connection.sourceTopicId);
          const target = network.nodes.find((node) => node.topicId === connection.targetTopicId);
          if (!source || !target) {
            return null;
          }
          const isFocusedEdge =
            focusedTopicId !== null &&
            (connection.sourceTopicId === focusedTopicId ||
              connection.targetTopicId === focusedTopicId);
          return (
            <line
              key={connection.connectionId}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={isFocusedEdge ? "#22d3ee" : "#334155"}
              strokeWidth={isFocusedEdge ? 1 : 0.5}
              opacity={isFocusedEdge ? 0.9 : 0.45}
            />
          );
        })}
        {network.nodes.map((node) => {
          const isFocused = node.topicId === focusedTopicId;
          const isActive = node.topicId === activeTopicId;
          return (
            <circle
              key={node.nodeId}
              cx={node.x}
              cy={node.y}
              r={isFocused ? 3.5 : isActive ? 3 : 2}
              fill={isFocused ? "#22d3ee" : isActive ? "#67e8f9" : "#64748b"}
              opacity={focusedTopicId && !isFocused && !isActive ? 0.35 : 1}
            />
          );
        })}
      </svg>
    </div>
  );
}
