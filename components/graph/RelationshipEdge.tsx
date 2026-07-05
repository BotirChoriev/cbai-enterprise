"use client";

import type { GraphEdge, GraphNode } from "@/lib/graph/graph.types";
import { EDGE_TYPE_MAP } from "@/lib/graph/graph.mock";

type RelationshipEdgeProps = {
  edge: GraphEdge;
  nodes: GraphNode[];
  highlighted: boolean;
  dimmed: boolean;
};

function getNodeCenter(node: GraphNode): { x: number; y: number } {
  return { x: node.x, y: node.y };
}

export default function RelationshipEdge({
  edge,
  nodes,
  highlighted,
  dimmed,
}: RelationshipEdgeProps) {
  const source = nodes.find((n) => n.id === edge.source);
  const target = nodes.find((n) => n.id === edge.target);
  if (!source || !target) return null;

  const from = getNodeCenter(source);
  const to = getNodeCenter(target);
  const config = EDGE_TYPE_MAP[edge.type];

  const opacity = dimmed ? 0.08 : highlighted ? 0.9 : 0.35;
  const strokeWidth = highlighted ? 2.5 : 1;

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={config.color}
      strokeWidth={strokeWidth}
      strokeDasharray={config.strokeDasharray}
      opacity={opacity}
      className="transition-all duration-200"
    />
  );
}
