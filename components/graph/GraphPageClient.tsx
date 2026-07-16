"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  buildKnowledgeGraph,
  computeGraphStats,
  computeGraphSelection,
} from "@/lib/graph/graph.builder";
import {
  analyzeGraphForMission,
  filterGraphByMissionFocus,
} from "@/lib/graph/graph-mission";
import type { GraphNodeFilter } from "@/lib/graph/graph.types";
import GraphCanvas from "@/components/graph/GraphCanvas";
import GraphEntityPanel from "@/components/graph/GraphEntityPanel";
import GraphConnectionsPanel from "@/components/graph/GraphConnectionsPanel";
import GraphLegend from "@/components/graph/GraphLegend";
import GraphMissionInstrument from "@/components/graph/GraphMissionInstrument";
import GraphPrimaryViews from "@/components/graph/GraphPrimaryViews";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useUniversalWorkspace } from "@/components/platform/context/UniversalWorkspaceProvider";

export default function GraphPageClient() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();
  const { setFocusedObject } = useUniversalWorkspace();
  const disclosure = useProgressiveDisclosure();
  const fullGraph = useMemo(() => buildKnowledgeGraph(), []);
  const [focusMode, setFocusMode] = useState<"mission" | "evidence" | "all">("mission");

  const analysis = useMemo(
    () => analyzeGraphForMission(fullGraph, mission, focusMode),
    [fullGraph, mission, focusMode],
  );

  const graph = useMemo(
    () => {
      const filtered = filterGraphByMissionFocus(fullGraph, analysis);
      return { ...fullGraph, nodes: filtered.nodes, edges: filtered.edges };
    },
    [fullGraph, analysis],
  );

  const stats = useMemo(() => computeGraphStats(graph), [graph]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<GraphNodeFilter>("all");
  const lastFocusKeyRef = useRef<string | null>(null);

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

  const nodeIds = useMemo(() => graph.nodes.map((n) => n.id), [graph.nodes]);

  const cycleSelection = useCallback(
    (direction: 1 | -1) => {
      if (nodeIds.length === 0) return;
      if (!selectedNodeId) {
        setSelectedNodeId(nodeIds[0]);
        return;
      }
      const idx = nodeIds.indexOf(selectedNodeId);
      const next = (idx + direction + nodeIds.length) % nodeIds.length;
      setSelectedNodeId(nodeIds[next]);
    },
    [nodeIds, selectedNodeId],
  );

  useEffect(() => {
    if (!selectedNode) return;
    const focusKey = `${selectedNode.type}:${selectedNode.entityId}`;
    if (lastFocusKeyRef.current === focusKey) return;
    lastFocusKeyRef.current = focusKey;
    setFocusedObject({ type: selectedNode.type, id: selectedNode.entityId });
  }, [selectedNode, setFocusedObject]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (event.key === "Escape") setSelectedNodeId(null);
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        cycleSelection(1);
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        cycleSelection(-1);
      }
      if (event.key === "m") setFocusMode("mission");
      if (event.key === "e") setFocusMode("evidence");
      if (event.key === "a") setFocusMode("all");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cycleSelection]);

  return (
    <OperatingPageShell
      title={t("intelligenceCanvas.knowledgeUniverse")}
      description={t("intelligenceNetwork.description")}
      showOperator={false}
      missionContextVariant="compact"
    >
      <div className="mx-auto max-w-[90rem] space-y-6 pb-16">
        <GraphPrimaryViews
          focusMode={focusMode}
          onFocusModeChange={setFocusMode}
          missionProjectId={mission?.projectId}
        />
        {disclosure.showGraphAnalysis ? (
          <GraphMissionInstrument
            analysis={analysis}
            focusMode={focusMode}
            onFocusModeChange={setFocusMode}
            hideFocusToggles
          />
        ) : null}

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
            {disclosure.showGraphLegend ? <GraphLegend /> : null}
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
      </div>
    </OperatingPageShell>
  );
}
