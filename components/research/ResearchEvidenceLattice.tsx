"use client";

import { useMemo } from "react";
import { RESEARCH_DOMAINS, RESEARCH_TOPICS } from "@/lib/research/research-topics";
import { DOMAIN_COLORS } from "@/components/research/network/ResearchNode";

// Research's own atmosphere (OS Bible Part IX.9.4: each domain gets its own accent hue within the
// same emerald family; a real "room" inside CBAI, not a re-skin). Where Home's Living Intelligence
// Network is radial — one evidence core, the whole connected world around it — Research is a
// structured lattice: real domains laid out in an ordered grid, the way a catalog is organized,
// not the way a globe is. Same node/connection visual grammar, a deliberately different geometry,
// so the two rooms read as siblings, never as the same screen reused. Node size is weighted by
// each domain's real topic count (RESEARCH_TOPICS), never an invented number.
export default function ResearchEvidenceLattice() {
  const counts = useMemo(() => {
    const byDomain = new Map<string, number>();
    for (const topic of RESEARCH_TOPICS) {
      byDomain.set(topic.domainId, (byDomain.get(topic.domainId) ?? 0) + 1);
    }
    return byDomain;
  }, []);

  const maxCount = useMemo(() => Math.max(...Array.from(counts.values()), 1), [counts]);

  const cols = 5;
  const cellW = 92;
  const cellH = 92;
  // +cellW/2 accounts for the offset (staggered) row below shifting its last node half a cell
  // further right than the grid's own base width — without it, that node's stroke halo clips
  // against the SVG's own viewBox edge.
  const width = cellW * cols + cellW / 2;
  const nodes = RESEARCH_DOMAINS.map((domain, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const offset = row % 2 === 1 ? cellW / 2 : 0;
    const x = col * cellW + cellW / 2 + offset;
    const y = row * cellH + cellH / 2;
    const count = counts.get(domain.domainId) ?? 0;
    const weight = count / maxCount;
    return { ...domain, x, y, count, weight, fill: DOMAIN_COLORS[domain.domainId] ?? "#2fbf71" };
  });

  const height = cellH * 2;

  // Lattice edges: each node ties to its immediate row/diagonal neighbors — a mesh, not a
  // hub-and-spoke — real structure, not a fabricated relationship between domains.
  const edges: Array<[number, number]> = [];
  for (let i = 0; i < nodes.length; i++) {
    if (i % cols !== cols - 1 && i + 1 < nodes.length) edges.push([i, i + 1]);
    if (i + cols < nodes.length) edges.push([i, i + cols]);
  }

  return (
    <div className="relative mx-auto flex w-full max-w-[560px] items-center justify-center lg:mx-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(47,191,113,0.14),transparent_68%)] sm:h-[460px] sm:w-[460px]"
      />
      <svg
        className="cbai-globe-breathe relative h-auto w-full max-w-[460px] text-[#2fbf71]"
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        role="img"
        aria-label={`Research Evidence Lattice: ${RESEARCH_TOPICS.length} catalog topics across ${RESEARCH_DOMAINS.length} real domains`}
      >
        {edges.map(([a, b]) => (
          <line
            key={`edge-${a}-${b}`}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.16"
          />
        ))}
        {nodes.map((node) => {
          const r = 5 + node.weight * 8;
          return (
            <g key={node.domainId}>
              <circle cx={node.x} cy={node.y} r={r + 6} stroke={node.fill} strokeWidth="1" opacity="0.3" />
              <circle cx={node.x} cy={node.y} r={r} fill={node.fill} opacity="0.9" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
