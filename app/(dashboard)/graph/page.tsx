"use client";

import { useMemo, useState } from "react";
import {
  buildKnowledgeGraph,
  computeGraphStats,
  computeGraphSelection,
} from "@/lib/graph/graph.builder";
import type { GraphNodeFilter } from "@/lib/graph/graph.types";
import GraphCanvas from "@/components/graph/GraphCanvas";
import GraphFilters from "@/components/graph/GraphFilters";
import GraphInspector from "@/components/graph/GraphInspector";
import GraphLegend from "@/components/graph/GraphLegend";

export default function GraphPage() {
  const graph = useMemo(() => buildKnowledgeGraph(), []);
  const stats = useMemo(() => computeGraphStats(graph), [graph]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<GraphNodeFilter>("all");

  const selection = useMemo(
    () => computeGraphSelection(graph, selectedNodeId),
    [graph, selectedNodeId],
  );

  const selectedNode = useMemo(
    () => graph.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [graph.nodes, selectedNodeId],
  );

  const connectedEdges = useMemo(
    () => graph.edges.filter((e) => selection.connectedEdgeIds.has(e.id)),
    [graph.edges, selection.connectedEdgeIds],
  );

  const connectedNodes = useMemo(
    () => graph.nodes.filter((n) => selection.connectedNodeIds.has(n.id)),
    [graph.nodes, selection.connectedNodeIds],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-950 to-sky-950/20 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-sky-500/80">
              BUILD-013 · Relationship Engine
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
              CBAI Knowledge Graph
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Central relationship engine connecting countries, companies, and
              universities across the platform. Select nodes to explore
              partnerships, investments, and research links.
            </p>
          </div>
          <div className="hidden shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-right sm:block">
            <p className="font-mono text-2xl font-bold text-sky-400">
              {stats.totalNodes}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-600">
              Connected Entities
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-3">
          <GraphFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            stats={stats}
            onClearSelection={() => setSelectedNodeId(null)}
            hasSelection={selectedNodeId !== null}
          />
          <GraphLegend />
        </div>

        <div className="xl:col-span-6">
          <GraphCanvas
            graph={graph}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            searchQuery={searchQuery}
            typeFilter={typeFilter}
            selection={selection}
          />
        </div>

        <div className="xl:col-span-3">
          <GraphInspector
            graph={graph}
            selectedNode={selectedNode}
            connectedEdges={connectedEdges}
            connectedNodes={connectedNodes}
          />
        </div>
      </div>
    </div>
  );
}
