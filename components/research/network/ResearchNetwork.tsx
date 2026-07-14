"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  findNetworkNodeByTopicId,
  getConnectedTopicIdsForTopic,
  getGlobalResearchNetwork,
  getNetworkFocusContext,
} from "@/lib/research/network/network-query";
import { RESEARCH_NETWORK_VIEWBOX } from "@/lib/research/network/network-types";
import ResearchConnection from "@/components/research/network/ResearchConnection";
import ResearchNode from "@/components/research/network/ResearchNode";
import ResearchMiniMap from "@/components/research/network/ResearchMiniMap";
import ResearchNetworkLegend from "@/components/research/network/ResearchNetworkLegend";
import ResearchNetworkFocusPanel from "@/components/research/network/ResearchNetworkFocusPanel";
import ResearchNetworkZoomControls from "@/components/research/network/ResearchNetworkZoomControls";
import { cbaiGlassCard, cbaiHeroGlow, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const NETWORK_FOCUS_NOTICE =
  "This network represents catalog relationships. It does not represent scientific proof.";

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.5;
const ZOOM_STEP = 1.2;

type NetworkView = {
  x: number;
  y: number;
  scale: number;
};

const DEFAULT_VIEW: NetworkView = { x: 0, y: 0, scale: 1 };
const { width: NETWORK_WIDTH, height: NETWORK_HEIGHT } = RESEARCH_NETWORK_VIEWBOX;

function viewBoxFromState(view: NetworkView, width: number, height: number): string {
  return `${view.x} ${view.y} ${width / view.scale} ${height / view.scale}`;
}

function zoomView(
  view: NetworkView,
  direction: "in" | "out",
  width: number,
  height: number,
): NetworkView {
  const factor = direction === "in" ? ZOOM_STEP : 1 / ZOOM_STEP;
  const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor));
  if (nextScale === view.scale) {
    return view;
  }

  const viewWidth = width / view.scale;
  const viewHeight = height / view.scale;
  const nextViewWidth = width / nextScale;
  const nextViewHeight = height / nextScale;
  const centerX = view.x + viewWidth / 2;
  const centerY = view.y + viewHeight / 2;

  return {
    scale: nextScale,
    x: centerX - nextViewWidth / 2,
    y: centerY - nextViewHeight / 2,
  };
}

type PanSession = {
  pointerId: number;
  startX: number;
  startY: number;
  viewX: number;
  viewY: number;
};

export default function ResearchNetwork() {
  const network = useMemo(() => getGlobalResearchNetwork(), []);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const panSessionRef = useRef<PanSession | null>(null);

  const [view, setView] = useState<NetworkView>(DEFAULT_VIEW);
  const [isPanning, setIsPanning] = useState(false);

  const focusedTopicId = useMemo(() => {
    const focusId = searchParams.get("focus");
    if (!focusId) {
      return null;
    }
    return findNetworkNodeByTopicId(network, focusId) ? focusId : null;
  }, [network, searchParams]);

  const nodeById = useMemo(
    () => new Map(network.nodes.map((node) => [node.topicId, node])),
    [network.nodes],
  );

  const connectedTopicIds = useMemo(() => {
    if (!focusedTopicId) {
      return null;
    }
    return getConnectedTopicIdsForTopic(network, focusedTopicId);
  }, [focusedTopicId, network]);

  const focusContext = useMemo(() => {
    if (!focusedTopicId) {
      return undefined;
    }
    return getNetworkFocusContext(network, focusedTopicId);
  }, [focusedTopicId, network]);

  const updateFocusParam = useCallback(
    (topicId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (topicId) {
        params.set("focus", topicId);
      } else {
        params.delete("focus");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const focusId = searchParams.get("focus");
    if (!focusId || findNetworkNodeByTopicId(network, focusId)) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [network, pathname, router, searchParams]);

  const handleSelectTopic = useCallback(
    (topicId: string) => {
      updateFocusParam(topicId);
    },
    [updateFocusParam],
  );

  const handleClearFocus = useCallback(() => {
    updateFocusParam(null);
  }, [updateFocusParam]);

  const handleZoomIn = useCallback(() => {
    setView((current) => zoomView(current, "in", NETWORK_WIDTH, NETWORK_HEIGHT));
  }, []);

  const handleZoomOut = useCallback(() => {
    setView((current) => zoomView(current, "out", NETWORK_WIDTH, NETWORK_HEIGHT));
  }, []);

  const handleResetView = useCallback(() => {
    setView(DEFAULT_VIEW);
  }, []);

  const handlePanPointerDown = useCallback(
    (event: React.PointerEvent<SVGRectElement>) => {
      if (event.button !== 0) {
        return;
      }
      panSessionRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        viewX: view.x,
        viewY: view.y,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsPanning(true);
    },
    [view.x, view.y],
  );

  const handlePanPointerMove = useCallback(
    (event: React.PointerEvent<SVGRectElement>) => {
      const session = panSessionRef.current;
      if (!session || session.pointerId !== event.pointerId) {
        return;
      }

      const svg = svgRef.current;
      if (!svg) {
        return;
      }

      const rect = svg.getBoundingClientRect();
      const viewWidth = NETWORK_WIDTH / view.scale;
      const viewHeight = NETWORK_HEIGHT / view.scale;
      const deltaX = ((event.clientX - session.startX) / rect.width) * viewWidth;
      const deltaY = ((event.clientY - session.startY) / rect.height) * viewHeight;

      setView((current) => ({
        ...current,
        x: session.viewX - deltaX,
        y: session.viewY - deltaY,
      }));
    },
    [view.scale],
  );

  const handlePanPointerUp = useCallback((event: React.PointerEvent<SVGRectElement>) => {
    const session = panSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) {
      return;
    }
    panSessionRef.current = null;
    setIsPanning(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  const { width, height } = RESEARCH_NETWORK_VIEWBOX;
  const canZoomIn = view.scale < MAX_SCALE - 0.001;
  const canZoomOut = view.scale > MIN_SCALE + 0.001;

  return (
    <section
      aria-labelledby="research-network-heading"
      className={`w-full px-3 py-8 sm:px-4 ${cbaiHeroGlow}`}
    >
      <div className="mx-auto max-w-[1600px] space-y-4">
        <div className={`${cbaiGlassCard} grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4`}>
          <div>
            <p className={cbaiSectionEyebrow}>Global Research Network</p>
            <h2 id="research-network-heading" className="text-xl font-semibold text-zinc-100">
              Research Network
            </h2>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Research topics
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-100">
              {network.topicCount}
            </p>
            <p className="text-xs text-zinc-500">Catalog research topics</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Catalog connections
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-cyan-300">
              {network.connectionCount}
            </p>
            <p className="text-xs text-zinc-500">Metadata relationships</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Human review
            </p>
            <p className="mt-1 text-sm font-medium text-amber-300/90">Required</p>
            <p className="text-xs text-zinc-500">Before research decisions</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_min(380px,34%)]">
          <div className={`${cbaiGlassCard} relative overflow-hidden p-2 sm:p-4`}>
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_70%)]"
              aria-hidden="true"
            />

            <div className="absolute left-3 top-3 z-10">
              <ResearchNetworkZoomControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetView={handleResetView}
                canZoomIn={canZoomIn}
                canZoomOut={canZoomOut}
              />
            </div>

            <ResearchMiniMap
              network={network}
              activeTopicId={focusedTopicId}
              focusedTopicId={focusedTopicId}
            />

            <div className="overflow-auto touch-pan-x touch-pan-y">
              <svg
                ref={svgRef}
                viewBox={viewBoxFromState(view, width, height)}
                className={`mx-auto h-auto min-h-[420px] w-full max-w-full ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
                role="img"
                aria-label="Global research network of catalog topics"
              >
                <defs>
                  <radialGradient id="network-bg-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(34,211,238,0.08)" />
                    <stop offset="100%" stopColor="rgba(15,23,42,0)" />
                  </radialGradient>
                </defs>

                <rect
                  width={width}
                  height={height}
                  fill="url(#network-bg-glow)"
                  onPointerDown={handlePanPointerDown}
                  onPointerMove={handlePanPointerMove}
                  onPointerUp={handlePanPointerUp}
                  onPointerCancel={handlePanPointerUp}
                />

                {network.connections.map((connection) => {
                  const source = nodeById.get(connection.sourceTopicId);
                  const target = nodeById.get(connection.targetTopicId);
                  if (!source || !target) {
                    return null;
                  }

                  const highlighted = connectedTopicIds
                    ? connectedTopicIds.has(connection.sourceTopicId) &&
                      connectedTopicIds.has(connection.targetTopicId)
                    : false;
                  const dimmed = connectedTopicIds !== null && !highlighted;
                  const focused =
                    focusedTopicId !== null &&
                    (connection.sourceTopicId === focusedTopicId ||
                      connection.targetTopicId === focusedTopicId);

                  return (
                    <ResearchConnection
                      key={connection.connectionId}
                      connection={connection}
                      source={source}
                      target={target}
                      focused={focused}
                      highlighted={highlighted}
                      dimmed={dimmed}
                    />
                  );
                })}

                {network.nodes.map((node) => {
                  const focused = focusedTopicId === node.topicId;
                  const connected =
                    connectedTopicIds !== null &&
                    connectedTopicIds.has(node.topicId) &&
                    !focused;
                  const dimmed =
                    connectedTopicIds !== null && !connectedTopicIds.has(node.topicId);

                  return (
                    <ResearchNode
                      key={node.nodeId}
                      node={node}
                      focused={focused}
                      connected={connected}
                      dimmed={dimmed}
                      onSelect={handleSelectTopic}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {focusContext ? (
            <ResearchNetworkFocusPanel
              node={focusContext.node}
              relatedTopics={focusContext.relatedTopics}
              onSelectTopic={handleSelectTopic}
              onClearFocus={handleClearFocus}
            />
          ) : null}
        </div>

        <div className={`${cbaiGlassCard} space-y-4 p-4`}>
          <ResearchNetworkLegend />
          <p className="rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-500">
            {NETWORK_FOCUS_NOTICE}
          </p>
        </div>
      </div>
    </section>
  );
}
