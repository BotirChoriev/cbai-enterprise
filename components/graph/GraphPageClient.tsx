"use client";

import { useMemo, useState } from "react";
import {
  buildKnowledgeGraph,
  computeGraphStats,
  computeGraphSelection,
} from "@/lib/graph/graph.builder";
import type { GraphNodeFilter } from "@/lib/graph/graph.types";
import GraphCanvas from "@/components/graph/GraphCanvas";
import GraphEntityPanel from "@/components/graph/GraphEntityPanel";
import GraphConnectionsPanel from "@/components/graph/GraphConnectionsPanel";
import GraphLegend from "@/components/graph/GraphLegend";
import GraphPipeline from "@/components/graph/GraphPipeline";
import GraphPersonas from "@/components/graph/GraphPersonas";
import HomeSection from "@/components/platform/home/HomeSection";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { translateGraphPlatform } from "@/lib/i18n/graph-platform-translation";
import { translateGraphTrustPillars } from "@/lib/i18n/graph-extended-translation";

export default function GraphPageClient() {
  const { t, language } = useTranslation();
  const dictionary = getDictionary(language);
  const graphPlatform = translateGraphPlatform(dictionary);
  const trustPillars = translateGraphTrustPillars(dictionary);
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
    <OperatingPageShell
      title={graphPlatform.headline}
      description={graphPlatform.explanation}
      showOperator
    >
      <div className="home-page mx-auto max-w-[90rem] pb-16">
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

        <HomeSection id="graph-personas" title={t("graphPage.graphByRole")}>
          <GraphPersonas />
        </HomeSection>

        <HomeSection id="graph-pipeline" title={t("graphPage.howItWorks")}>
          <GraphPipeline />
        </HomeSection>

        <HomeSection id="graph-trust" title={t("graphPage.trust")}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {trustPillars.map((pillar) => (
              <li
                key={pillar.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4"
              >
                <h3 className="text-sm font-semibold text-zinc-100">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{pillar.description}</p>
              </li>
            ))}
          </ul>
        </HomeSection>
      </div>
    </OperatingPageShell>
  );
}
