import type { ResearchNetwork } from "@/lib/research/network/network-types";
import { RESEARCH_NETWORK_VIEWBOX } from "@/lib/research/network/network-types";

type ResearchMiniMapProps = {
  network: ResearchNetwork;
  hoveredTopicId: string | null;
};

export default function ResearchMiniMap({ network, hoveredTopicId }: ResearchMiniMapProps) {
  const { width, height } = RESEARCH_NETWORK_VIEWBOX;

  return (
    <div className="absolute right-3 top-3 hidden rounded-lg border border-zinc-800/80 bg-slate-950/80 p-2 backdrop-blur-sm sm:block">
      <p className="mb-1 text-[9px] font-medium uppercase tracking-wider text-zinc-600">
        Mini map
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
          return (
            <line
              key={connection.connectionId}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="#334155"
              strokeWidth={0.5}
              opacity={0.6}
            />
          );
        })}
        {network.nodes.map((node) => (
          <circle
            key={node.nodeId}
            cx={node.x}
            cy={node.y}
            r={node.topicId === hoveredTopicId ? 3 : 2}
            fill={node.topicId === hoveredTopicId ? "#22d3ee" : "#64748b"}
          />
        ))}
      </svg>
    </div>
  );
}
