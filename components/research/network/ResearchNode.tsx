import type { ResearchNetworkNode } from "@/lib/research/network/network-types";
import { RESEARCH_NETWORK_STATUS_LABELS } from "@/lib/research/network/network-types";

export const DOMAIN_COLORS: Record<string, string> = {
  "life-sciences": "#22d3ee",
  medicine: "#34d399",
  agriculture: "#84cc16",
  "climate-environment": "#2dd4bf",
  energy: "#fbbf24",
  "materials-science": "#a78bfa",
  engineering: "#60a5fa",
  "computer-science": "#818cf8",
  "economics-policy": "#f472b6",
  "social-sciences": "#e879f9",
};

type ResearchNodeProps = {
  node: ResearchNetworkNode;
  focused: boolean;
  connected: boolean;
  dimmed: boolean;
  onSelect: (topicId: string) => void;
};

function nodeFill(domainId: string, focused: boolean, connected: boolean): string {
  const base = DOMAIN_COLORS[domainId] ?? "#22d3ee";
  if (focused) {
    return base;
  }
  return connected ? base : `${base}99`;
}

export default function ResearchNode({
  node,
  focused,
  connected,
  dimmed,
  onSelect,
}: ResearchNodeProps) {
  const active = focused || connected;
  const radius = focused ? 12 : connected ? 8 : 7;
  const opacity = dimmed ? 0.3 : 1;

  return (
    <g className="transition-opacity duration-[250ms]" style={{ opacity }} data-network-node="">
      <circle
        cx={node.x}
        cy={node.y}
        r={radius}
        fill={nodeFill(node.domainId, focused, connected)}
        stroke={focused ? "#ffffff" : active ? "#e2e8f0" : "#0f172a"}
        strokeWidth={focused ? 2.5 : active ? 1.5 : 1}
        vectorEffect="non-scaling-stroke"
        className="cursor-pointer transition-all duration-[250ms] hover:brightness-125"
        style={{
          filter: focused
            ? "drop-shadow(0 0 16px rgba(34,211,238,0.9))"
            : connected
              ? "drop-shadow(0 0 8px rgba(34,211,238,0.45))"
              : "drop-shadow(0 0 4px rgba(34,211,238,0.2))",
        }}
        role="button"
        tabIndex={0}
        aria-label={`Focused topic: ${node.topicName}`}
        aria-pressed={focused}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(node.topicId);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(node.topicId);
          }
        }}
      />
      {active ? (
        <g pointerEvents="none">
          <rect
            x={node.x - 72}
            y={node.y - 34}
            width={144}
            height={28}
            rx={6}
            fill="rgba(15,23,42,0.92)"
            stroke={focused ? "rgba(34,211,238,0.45)" : "rgba(34,211,238,0.25)"}
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
