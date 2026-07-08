import type { ResearchNetworkConnection } from "@/lib/research/network/network-types";
import type { ResearchNetworkNode } from "@/lib/research/network/network-types";
import { CONNECTION_COLORS } from "@/components/research/network/ResearchNetworkLegend";

type ResearchConnectionProps = {
  connection: ResearchNetworkConnection;
  source: ResearchNetworkNode;
  target: ResearchNetworkNode;
  focused: boolean;
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
  focused,
  highlighted,
  dimmed,
}: ResearchConnectionProps) {
  const color = primaryConnectionColor(connection);
  const opacity = dimmed ? 0.08 : focused ? 1 : highlighted ? 0.8 : 0.2;
  const strokeWidth = focused ? 2.5 : highlighted ? 2 : 1;

  return (
    <g className="transition-opacity duration-[250ms]" style={{ opacity }}>
      <line
        x1={source.x}
        y1={source.y}
        x2={target.x}
        y2={target.y}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={focused ? undefined : "6 6"}
        className="transition-all duration-[250ms]"
        style={
          focused
            ? { filter: "drop-shadow(0 0 6px rgba(34,211,238,0.5))" }
            : undefined
        }
      >
        {!focused ? (
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-24"
            dur="4s"
            repeatCount="indefinite"
          />
        ) : null}
      </line>
    </g>
  );
}
