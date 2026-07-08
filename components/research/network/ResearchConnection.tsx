import type { ResearchNetworkConnection } from "@/lib/research/network/network-types";
import type { ResearchNetworkNode } from "@/lib/research/network/network-types";
import { CONNECTION_COLORS } from "@/components/research/network/ResearchNetworkLegend";

type ResearchConnectionProps = {
  connection: ResearchNetworkConnection;
  source: ResearchNetworkNode;
  target: ResearchNetworkNode;
  highlighted: boolean;
  dimmed: boolean;
};

function primaryConnectionColor(connection: ResearchNetworkConnection): string {
  const type = connection.connectionTypes[0];
  return type ? CONNECTION_COLORS[type] : CONNECTION_COLORS.shared_domain;
}

export default function ResearchConnection({
  connection,
  source,
  target,
  highlighted,
  dimmed,
}: ResearchConnectionProps) {
  const color = primaryConnectionColor(connection);
  const opacity = dimmed ? 0.08 : highlighted ? 0.85 : 0.22;

  return (
    <g className="transition-opacity duration-300" style={{ opacity }}>
      <line
        x1={source.x}
        y1={source.y}
        x2={target.x}
        y2={target.y}
        stroke={color}
        strokeWidth={highlighted ? 2 : 1}
        strokeLinecap="round"
        strokeDasharray="6 6"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-24"
          dur="4s"
          repeatCount="indefinite"
        />
      </line>
    </g>
  );
}
