import type { ResearchNetworkNode } from "@/lib/research/network/network-types";
import { getResearchTopicPath } from "@/lib/research/research-topics";
import { RESEARCH_NETWORK_STATUS_LABELS } from "@/lib/research/network/network-types";

const DOMAIN_COLORS: Record<string, string> = {
  "life-sciences": "#22d3ee",
  medicine: "#34d399",
  agriculture: "#84cc16",
  "climate-environment": "#2dd4bf",
  energy: "#fbbf24",
  "materials-science": "#a78bfa",
  engineering: "#60a5fa",
  "computer-science": "#818cf8",
  "economics-policy": "#f472b6",
  "social-sciences": "#fb7185",
};

type ResearchNodeProps = {
  node: ResearchNetworkNode;
  highlighted: boolean;
  dimmed: boolean;
  onHover: (topicId: string | null) => void;
};

function nodeFill(domainId: string, highlighted: boolean): string {
  const base = DOMAIN_COLORS[domainId] ?? "#22d3ee";
  return highlighted ? base : `${base}99`;
}

export default function ResearchNode({
  node,
  highlighted,
  dimmed,
  onHover,
}: ResearchNodeProps) {
  const radius = highlighted ? 9 : 7;
  const opacity = dimmed ? 0.35 : 1;

  return (
    <g
      className="transition-opacity duration-300"
      style={{ opacity }}
      onMouseEnter={() => onHover(node.topicId)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(node.topicId)}
      onBlur={() => onHover(null)}
    >
      <a href={getResearchTopicPath(node.topicId)} aria-label={`Open ${node.topicName}`}>
        <circle
          cx={node.x}
          cy={node.y}
          r={radius}
          fill={nodeFill(node.domainId, highlighted)}
          stroke={highlighted ? "#ffffff" : "#0f172a"}
          strokeWidth={highlighted ? 2 : 1}
          className="cursor-pointer transition-all duration-300 hover:brightness-125"
          style={{
            filter: highlighted
              ? "drop-shadow(0 0 10px rgba(34,211,238,0.65))"
              : "drop-shadow(0 0 4px rgba(34,211,238,0.25))",
          }}
        />
      </a>
      {highlighted ? (
        <g pointerEvents="none">
          <rect
            x={node.x - 72}
            y={node.y - 34}
            width={144}
            height={28}
            rx={6}
            fill="rgba(15,23,42,0.92)"
            stroke="rgba(34,211,238,0.25)"
          />
          <text
            x={node.x}
            y={node.y - 22}
            textAnchor="middle"
            className="fill-zinc-100 text-[10px] font-medium"
          >
            {node.topicName.length > 22 ? `${node.topicName.slice(0, 20)}…` : node.topicName}
          </text>
          <text
            x={node.x}
            y={node.y - 12}
            textAnchor="middle"
            className="fill-zinc-500 text-[8px]"
          >
            {RESEARCH_NETWORK_STATUS_LABELS[node.status]}
          </text>
        </g>
      ) : null}
    </g>
  );
}
