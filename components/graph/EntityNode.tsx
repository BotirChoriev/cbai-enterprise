"use client";

import type { GraphNode } from "@/lib/graph/graph.types";
import { NODE_TYPE_COLORS, GRAPH_LAYOUT } from "@/lib/graph/graph.mock";
import { getEntityInitials } from "@/lib/entity/entity.helpers";
import { entityTypeIconPaths } from "@/lib/entity/entity.icons";
import EntityIcon from "@/components/entity/EntityIcon";

type EntityNodeProps = {
  node: GraphNode;
  selected: boolean;
  connected: boolean;
  dimmed: boolean;
  searchMatch: boolean;
  onSelect: (nodeId: string) => void;
};

export default function EntityNode({
  node,
  selected,
  connected,
  dimmed,
  searchMatch,
  onSelect,
}: EntityNodeProps) {
  const accent = NODE_TYPE_COLORS[node.type] ?? "#71717a";
  const half = GRAPH_LAYOUT.nodeSize / 2;
  const iconPath = node.entity.icon ?? entityTypeIconPaths[node.type];

  const opacity = dimmed ? 0.25 : 1;
  const scale = selected ? 1.12 : connected ? 1.05 : 1;
  const ringClass = selected
    ? "ring-2 ring-white shadow-lg shadow-white/20"
    : connected
      ? "ring-2 ring-sky-400/60"
      : searchMatch
        ? "ring-2 ring-amber-400/50"
        : "ring-1 ring-zinc-700/80";

  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      className={`absolute flex flex-col items-center transition-all duration-200 ${ringClass} rounded-xl bg-zinc-900/95 backdrop-blur-sm hover:z-20`}
      style={{
        left: node.x - half,
        top: node.y - half,
        width: GRAPH_LAYOUT.nodeSize,
        height: GRAPH_LAYOUT.nodeSize,
        opacity,
        transform: `scale(${scale})`,
        borderColor: accent,
        borderWidth: selected || connected ? 2 : 1,
        borderStyle: "solid",
      }}
      title={node.label}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-lg"
        style={{ color: accent, backgroundColor: `${accent}18` }}
      >
        <EntityIcon path={iconPath} className="h-4 w-4" />
      </span>
      <span className="mt-0.5 max-w-[52px] truncate text-[8px] font-medium text-zinc-300">
        {getEntityInitials(node.entity)}
      </span>
    </button>
  );
}
