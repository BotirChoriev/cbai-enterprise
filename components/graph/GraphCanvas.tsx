"use client";

import { useMemo, useState } from "react";
import type {
  KnowledgeGraph,
  GraphNodeFilter,
  GraphSelection,
} from "@/lib/graph/graph.types";
import { filterNodesBySearch } from "@/lib/graph/graph.builder";
import { GRAPH_LAYOUT, GRAPH_ZOOM } from "@/lib/graph/graph.mock";
import EntityNode from "@/components/graph/EntityNode";
import RelationshipEdge from "@/components/graph/RelationshipEdge";

type GraphCanvasProps = {
  graph: KnowledgeGraph;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  searchQuery: string;
  typeFilter: GraphNodeFilter;
  selection: GraphSelection;
};

export default function GraphCanvas({
  graph,
  selectedNodeId,
  onSelectNode,
  searchQuery,
  typeFilter,
  selection,
}: GraphCanvasProps) {
  const [zoom, setZoom] = useState<number>(GRAPH_ZOOM.default);

  const searchMatches = useMemo(
    () => filterNodesBySearch(graph.nodes, searchQuery),
    [graph.nodes, searchQuery],
  );

  const hasSelection = selectedNodeId !== null;
  const hasSearch = searchQuery.trim().length > 0;

  function isNodeDimmed(nodeId: string, type: string): boolean {
    if (typeFilter !== "all" && type !== typeFilter) return true;
    if (hasSearch && !searchMatches.has(nodeId)) return true;
    if (hasSelection && !selection.connectedNodeIds.has(nodeId)) return true;
    return false;
  }

  function isEdgeDimmed(edgeId: string, source: string, target: string): boolean {
    const sourceNode = graph.nodes.find((node) => node.id === source);
    const targetNode = graph.nodes.find((node) => node.id === target);
    if (!sourceNode || !targetNode) return true;
    if (isNodeDimmed(source, sourceNode.type)) return true;
    if (isNodeDimmed(target, targetNode.type)) return true;
    if (hasSelection && !selection.connectedEdgeIds.has(edgeId)) return true;
    return false;
  }

  function handleSelect(nodeId: string) {
    onSelectNode(selectedNodeId === nodeId ? null : nodeId);
  }

  function adjustZoom(delta: number) {
    setZoom((current) =>
      Math.min(GRAPH_ZOOM.max, Math.max(GRAPH_ZOOM.min, current + delta)),
    );
  }

  const canvasWidth = GRAPH_LAYOUT.centerX * 2;
  const canvasHeight = GRAPH_LAYOUT.centerY * 2 + 80;

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-50">Evidence Relationships</h3>
          <p className="text-[10px] text-zinc-600">
            Select a node to focus · Pan via scroll · {graph.nodes.length} registry
            nodes · {graph.edges.length} verified edges
          </p>
        </div>
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label="Graph zoom controls"
        >
          <button
            type="button"
            onClick={() => adjustZoom(-GRAPH_ZOOM.step)}
            disabled={zoom <= GRAPH_ZOOM.min}
            className="min-h-9 min-w-9 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-300 transition-colors hover:border-zinc-600 disabled:opacity-40"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="min-w-[3rem] text-center font-mono text-xs text-zinc-500">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => adjustZoom(GRAPH_ZOOM.step)}
            disabled={zoom >= GRAPH_ZOOM.max}
            className="min-h-9 min-w-9 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-300 transition-colors hover:border-zinc-600 disabled:opacity-40"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom(GRAPH_ZOOM.default)}
            className="min-h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-2 text-[10px] font-medium uppercase tracking-wider text-zinc-400 transition-colors hover:border-zinc-600"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="relative overflow-auto" style={{ maxHeight: "560px" }}>
        <div
          className="relative transition-transform duration-200"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            minWidth: "100%",
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #27272a 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <svg
              className="pointer-events-none absolute inset-0"
              width={canvasWidth}
              height={canvasHeight}
              aria-hidden="true"
            >
              <circle
                cx={GRAPH_LAYOUT.centerX}
                cy={GRAPH_LAYOUT.centerY}
                r={GRAPH_LAYOUT.countryRadius}
                fill="none"
                stroke="#27272a"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <circle
                cx={GRAPH_LAYOUT.centerX}
                cy={GRAPH_LAYOUT.centerY}
                r={GRAPH_LAYOUT.companyRadius}
                fill="none"
                stroke="#27272a"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <circle
                cx={GRAPH_LAYOUT.centerX}
                cy={GRAPH_LAYOUT.centerY}
                r={GRAPH_LAYOUT.universityRadius}
                fill="none"
                stroke="#27272a"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </svg>

            <svg
              className="pointer-events-none absolute inset-0"
              width={canvasWidth}
              height={canvasHeight}
              aria-hidden="true"
            >
              {graph.edges.map((edge) => (
                <RelationshipEdge
                  key={edge.id}
                  edge={edge}
                  nodes={graph.nodes}
                  highlighted={
                    hasSelection && selection.connectedEdgeIds.has(edge.id)
                  }
                  dimmed={isEdgeDimmed(edge.id, edge.source, edge.target)}
                />
              ))}
            </svg>

            {graph.nodes.map((node) => (
              <EntityNode
                key={node.id}
                node={node}
                selected={selectedNodeId === node.id}
                connected={
                  hasSelection &&
                  selectedNodeId !== node.id &&
                  selection.connectedNodeIds.has(node.id)
                }
                dimmed={isNodeDimmed(node.id, node.type)}
                searchMatch={hasSearch && searchMatches.has(node.id)}
                onSelect={handleSelect}
              />
            ))}

            {graph.nodes.map((node) => {
              const dimmed = isNodeDimmed(node.id, node.type);
              const half = GRAPH_LAYOUT.nodeSize / 2;
              return (
                <div
                  key={`label-${node.id}`}
                  className="pointer-events-none absolute max-w-[80px] truncate text-center text-[9px] text-zinc-500 transition-opacity"
                  style={{
                    left: node.x - 40,
                    top: node.y + half + 4,
                    opacity: dimmed ? 0.2 : 0.8,
                  }}
                >
                  {node.label}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
