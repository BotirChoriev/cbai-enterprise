"use client";

import type { GraphNode, GraphEdge, KnowledgeGraph } from "@/lib/graph/graph.types";
import { getEntityTypeLabel, getScoreColor } from "@/lib/entity/entity.helpers";
import { entityTypeIconPaths } from "@/lib/entity/entity.icons";
import { EDGE_TYPE_MAP } from "@/lib/graph/graph.mock";
import EntityIcon from "@/components/entity/EntityIcon";
import Link from "next/link";

type GraphInspectorProps = {
  graph: KnowledgeGraph;
  selectedNode: GraphNode | null;
  connectedEdges: GraphEdge[];
  connectedNodes: GraphNode[];
};

const MODULE_ROUTES: Record<string, string> = {
  country: "/countries",
  company: "/companies",
  university: "/universities",
};

export default function GraphInspector({
  graph,
  selectedNode,
  connectedEdges,
  connectedNodes,
}: GraphInspectorProps) {
  if (!selectedNode) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="text-sm font-semibold text-zinc-50">Inspector</h3>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">
          Select a node on the graph to inspect entity details, scores, and
          connected relationships.
        </p>
        <div className="mt-4 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
            Graph Overview
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {graph.nodes.length} entities · {graph.edges.length} relationships
          </p>
        </div>
      </div>
    );
  }

  const entity = selectedNode.entity;
  const route = MODULE_ROUTES[selectedNode.type];
  const iconPath = entity.icon ?? entityTypeIconPaths[selectedNode.type];

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
          <EntityIcon path={iconPath} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
            {getEntityTypeLabel(selectedNode.type)}
          </p>
          <h3 className="truncate text-sm font-semibold text-zinc-50">
            {entity.name}
          </h3>
          {entity.subtitle && (
            <p className="truncate text-xs text-zinc-500">{entity.subtitle}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <ScorePill label="AI" score={entity.scores.aiScore} />
        <ScorePill label="Risk" score={entity.scores.riskScore} inverted />
        <ScorePill label="Invest" score={entity.scores.investmentScore} />
      </div>

      <p className="text-xs leading-relaxed text-zinc-400">{entity.overview}</p>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Connections ({connectedNodes.length - 1})
        </p>
        <div className="max-h-32 space-y-1 overflow-y-auto">
          {connectedNodes
            .filter((n) => n.id !== selectedNode.id)
            .slice(0, 8)
            .map((n) => (
              <div
                key={n.id}
                className="flex items-center gap-2 rounded-lg bg-zinc-900/60 px-2 py-1.5"
              >
                <EntityIcon
                  path={n.entity.icon ?? entityTypeIconPaths[n.type]}
                  className="h-3.5 w-3.5 text-zinc-500"
                />
                <span className="truncate text-xs text-zinc-300">{n.label}</span>
                <span className="ml-auto text-[9px] text-zinc-600">
                  {getEntityTypeLabel(n.type)}
                </span>
              </div>
            ))}
          {connectedNodes.length > 9 && (
            <p className="text-[10px] text-zinc-600">
              +{connectedNodes.length - 9} more
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Relationship Types
        </p>
        <div className="flex flex-wrap gap-1">
          {[...new Set(connectedEdges.map((e) => e.type))].map((type) => (
            <span
              key={type}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                color: EDGE_TYPE_MAP[type].color,
                backgroundColor: `${EDGE_TYPE_MAP[type].color}18`,
              }}
            >
              {EDGE_TYPE_MAP[type].label}
            </span>
          ))}
        </div>
      </div>

      {route && (
        <Link
          href={`${route}?id=${selectedNode.entityId}`}
          className="block w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 text-center text-xs font-medium text-zinc-300 transition-colors hover:border-sky-500/40 hover:text-sky-300"
        >
          Open in {getEntityTypeLabel(selectedNode.type)} Module →
        </Link>
      )}
    </div>
  );
}

function ScorePill({
  label,
  score,
  inverted = false,
}: {
  label: string;
  score: number;
  inverted?: boolean;
}) {
  return (
    <div className="rounded-lg bg-zinc-900/60 px-2 py-2 text-center">
      <p className="text-[9px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p
        className="font-mono text-sm font-semibold"
        style={{ color: getScoreColor(score, inverted) }}
      >
        {score}
      </p>
    </div>
  );
}
