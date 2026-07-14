"use client";

import { useMemo, useState } from "react";
import {
  buildKnowledgeGraph,
  computeGraphStats,
  computeGraphSelection,
} from "@/lib/graph/graph.builder";
import type { GraphNodeFilter } from "@/lib/graph/graph.types";
import { GRAPH_PLATFORM, GRAPH_TRUST_PILLARS } from "@/lib/graph/graph-platform";
import GraphCanvas from "@/components/graph/GraphCanvas";
import GraphEntityPanel from "@/components/graph/GraphEntityPanel";
import GraphConnectionsPanel from "@/components/graph/GraphConnectionsPanel";
import GraphLegend from "@/components/graph/GraphLegend";
import GraphPipeline from "@/components/graph/GraphPipeline";
import GraphPersonas from "@/components/graph/GraphPersonas";
import HomeSection from "@/components/platform/home/HomeSection";

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
    () => graph.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [graph.nodes, selectedNodeId],
  );

  const connectedEdges = useMemo(
    () => graph.edges.filter((edge) => selection.connectedEdgeIds.has(edge.id)),
    [graph.edges, selection.connectedEdgeIds],
  );

  const connectedNodes = useMemo(
    () => graph.nodes.filter((node) => selection.connectedNodeIds.has(node.id)),
    [graph.nodes, selection.connectedNodeIds],
  );

  return (
    <div className="home-page mx-auto max-w-[90rem] pb-16">
      <header className="home-surface rounded-2xl border border-zinc-800 px-8 py-8 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400/90">
          {GRAPH_PLATFORM.eyebrow}
        </p>
        <h1 className="cbai-display mt-3 text-3xl text-zinc-50 sm:text-4xl">
          {GRAPH_PLATFORM.headline}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-400">
          {GRAPH_PLATFORM.explanation}
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-3">
          <GraphEntityPanel
            selectedNode={selectedNode}
            connectedEdges={connectedEdges}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            stats={stats}
            onClearSelection={() => setSelectedNodeId(null)}
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
          <GraphConnectionsPanel
            selectedNode={selectedNode}
            connectedEdges={connectedEdges}
            connectedNodes={connectedNodes}
          />
        </div>
      </div>

      <HomeSection id="graph-personas" title="Graph by Role">
        <GraphPersonas />
      </HomeSection>

      <HomeSection id="graph-pipeline" title="How It Works">
        <GraphPipeline />
      </HomeSection>

      <HomeSection id="graph-trust" title="Trust">
        <ul className="grid gap-3 sm:grid-cols-2">
          {GRAPH_TRUST_PILLARS.map((pillar) => (
            <li
              key={pillar.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4"
            >
              <h3 className="text-sm font-semibold text-zinc-100">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {pillar.description}
              </p>
            </li>
          ))}
        </ul>
      </HomeSection>
    </div>
  );
}
