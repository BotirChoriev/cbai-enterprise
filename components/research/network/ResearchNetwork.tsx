"use client";

import { useMemo, useState } from "react";
import { getGlobalResearchNetwork } from "@/lib/research/network/network-query";
import {
  RESEARCH_NETWORK_HONEST_NOTICE,
  RESEARCH_NETWORK_HUMAN_REVIEW_NOTICE,
  RESEARCH_NETWORK_VIEWBOX,
} from "@/lib/research/network/network-types";
import ResearchConnection from "@/components/research/network/ResearchConnection";
import ResearchNode from "@/components/research/network/ResearchNode";
import ResearchMiniMap from "@/components/research/network/ResearchMiniMap";
import ResearchNetworkLegend from "@/components/research/network/ResearchNetworkLegend";
import { cbaiGlassCard, cbaiHeroGlow, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function ResearchNetwork() {
  const network = useMemo(() => getGlobalResearchNetwork(), []);
  const [hoveredTopicId, setHoveredTopicId] = useState<string | null>(null);

  const nodeById = useMemo(
    () => new Map(network.nodes.map((node) => [node.topicId, node])),
    [network.nodes],
  );

  const connectedTopicIds = useMemo(() => {
    if (!hoveredTopicId) {
      return null;
    }
    const related = new Set<string>([hoveredTopicId]);
    for (const connection of network.connections) {
      if (connection.sourceTopicId === hoveredTopicId) {
        related.add(connection.targetTopicId);
      }
      if (connection.targetTopicId === hoveredTopicId) {
        related.add(connection.sourceTopicId);
      }
    }
    return related;
  }, [hoveredTopicId, network.connections]);

  const { width, height } = RESEARCH_NETWORK_VIEWBOX;

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

        <div
          className={`${cbaiGlassCard} relative overflow-hidden bg-gradient-to-b from-slate-950/90 to-slate-950/70 p-2 sm:p-4`}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_70%)]"
            aria-hidden="true"
          />
          <ResearchMiniMap network={network} hoveredTopicId={hoveredTopicId} />

          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="mx-auto h-auto min-h-[420px] w-full max-w-full"
              role="img"
              aria-label="Global research network of catalog topics"
            >
              <defs>
                <radialGradient id="network-bg-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(34,211,238,0.08)" />
                  <stop offset="100%" stopColor="rgba(15,23,42,0)" />
                </radialGradient>
              </defs>
              <rect width={width} height={height} fill="url(#network-bg-glow)" />

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

                return (
                  <ResearchConnection
                    key={connection.connectionId}
                    connection={connection}
                    source={source}
                    target={target}
                    highlighted={highlighted}
                    dimmed={dimmed}
                  />
                );
              })}

              {network.nodes.map((node) => {
                const highlighted = hoveredTopicId === node.topicId;
                const dimmed =
                  connectedTopicIds !== null && !connectedTopicIds.has(node.topicId);

                return (
                  <ResearchNode
                    key={node.nodeId}
                    node={node}
                    highlighted={highlighted}
                    dimmed={dimmed}
                    onHover={setHoveredTopicId}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        <div className={`${cbaiGlassCard} space-y-4 p-4`}>
          <ResearchNetworkLegend />
          <p className="rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-500">
            {RESEARCH_NETWORK_HONEST_NOTICE}
          </p>
          <p className="text-[11px] text-zinc-600">{RESEARCH_NETWORK_HUMAN_REVIEW_NOTICE}</p>
        </div>
      </div>
    </section>
  );
}
