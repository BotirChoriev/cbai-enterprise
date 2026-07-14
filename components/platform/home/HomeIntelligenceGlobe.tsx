"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buildWorldIntelligenceMap } from "@/lib/world-map";
import { PRODUCT_STATUS_DOT_CLASSES } from "@/lib/product-status";

const STATUS_FILL: Record<string, string> = {
  "bg-emerald-400": "#34d399",
  "bg-cyan-400": "#22d3ee",
  "bg-amber-400": "#fbbf24",
  "bg-violet-400": "#a78bfa",
  "bg-orange-400": "#fb923c",
  "bg-zinc-600": "#52525b",
  "bg-zinc-500": "#71717a",
};

// Design Bible Part IX.9.3: node weight reflects real evidence density, never a purely aesthetic
// choice. "live" (a fully connected, real-data country) reads as the most present node on the
// network; "planned"/"not_connected" read as the quietest — a real signal drawn from the same
// ProductStatus every country profile already honestly discloses, never an invented number.
const STATUS_WEIGHT: Record<string, number> = {
  live: 1,
  partial: 0.82,
  waiting_for_verified_data: 0.68,
  preview: 0.6,
  restricted: 0.55,
  not_connected: 0.42,
  planned: 0.42,
};

/**
 * The Living Intelligence Network — the emotional centerpiece of the homepage (Design Bible Part
 * IX), not a diagram tucked below a divider. A curated, radial view of the real catalog around
 * one evidence core — real country names, real connected-source status, zero fabricated
 * coordinates or geography (this repository has no map/geo-data library; a radial layout makes no
 * geographic claim, unlike a hand-approximated world shape would). Breathes via the same slow,
 * shared 4.5s rhythm already used by the Operator orb and the CBAI mark (Design Bible Part VI.6.1)
 * — one motion language across the whole product, not a fourth invented for this one visual.
 */
export default function HomeIntelligenceGlobe() {
  const allCountries = useMemo(() => buildWorldIntelligenceMap().flatMap((group) => group.countries), []);
  const regionCount = useMemo(() => new Set(allCountries.map((c) => c.country.region)).size, [allCountries]);
  const [hovered, setHovered] = useState<string | null>(null);

  const radius = 220;
  const center = 240;
  const nodes = allCountries.map((entry, index) => {
    const angle = (index / allCountries.length) * Math.PI * 2 - Math.PI / 2;
    const weight = STATUS_WEIGHT[entry.status] ?? 0.5;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const fill = STATUS_FILL[PRODUCT_STATUS_DOT_CLASSES[entry.status]] ?? "#52525b";
    return { ...entry, x, y, fill, weight };
  });

  return (
    <div className="relative mx-auto flex w-full max-w-[640px] items-center justify-center lg:mx-0 lg:max-w-none">
      {/* Ambient glow — light radiating from the core outward (Design Bible Part III.3.4), the
          same reasoning as the Operator orb's own light: it brings its own, never a borrowed
          drop-shadow. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(47,191,113,0.16),transparent_68%)] sm:h-[520px] sm:w-[520px]"
      />

      <svg
        className="cbai-globe-breathe relative h-auto w-full max-w-[420px] text-[#2fbf71] sm:max-w-[500px]"
        viewBox="0 0 480 480"
        fill="none"
        role="img"
        aria-label={`Living Intelligence Network: ${allCountries.length} countries across ${regionCount} regions, connected to one real evidence core`}
      >
        <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth="1" opacity="0.12" />
        <circle cx={center} cy={center} r={radius * 0.62} stroke="currentColor" strokeWidth="1" opacity="0.08" />
        {nodes.map((node) => (
          <line
            key={`line-${node.country.id}`}
            x1={center}
            y1={center}
            x2={node.x}
            y2={node.y}
            stroke="currentColor"
            strokeWidth="1"
            opacity={hovered === node.country.id ? 0.55 : 0.16 + node.weight * 0.14}
          />
        ))}
        <circle cx={center} cy={center} r="14" fill="currentColor" opacity="0.95" />
        <circle cx={center} cy={center} r="22" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <circle cx={center} cy={center} r="30" stroke="currentColor" strokeWidth="1" opacity="0.2" />
        {nodes.map((node) => {
          const r = 3 + node.weight * 4.5;
          const isHovered = hovered === node.country.id;
          return (
            <g
              key={node.country.id}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(node.country.id)}
              onMouseLeave={() => setHovered((current) => (current === node.country.id ? null : current))}
            >
              <circle cx={node.x} cy={node.y} r={r + 9} fill="transparent" />
              <circle cx={node.x} cy={node.y} r={isHovered ? r * 1.35 : r} fill={node.fill} opacity={isHovered ? 1 : 0.85 + node.weight * 0.15} />
              <circle cx={node.x} cy={node.y} r={r + 5} stroke={node.fill} strokeWidth="1" opacity={isHovered ? 0.6 : 0.3} />
            </g>
          );
        })}
      </svg>

      {hovered ? (
        <Link
          href={nodes.find((n) => n.country.id === hovered)?.href ?? "/countries"}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-500/30 bg-[#050810]/90 px-3.5 py-1.5 text-xs font-medium text-emerald-300 shadow-lg backdrop-blur-sm lg:bottom-6"
        >
          {nodes.find((n) => n.country.id === hovered)?.country.name} →
        </Link>
      ) : (
        <Link
          href="/countries"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-zinc-500 transition-colors hover:text-emerald-300 lg:bottom-6"
        >
          {allCountries.length} countries · {regionCount} regions · one evidence core →
        </Link>
      )}
    </div>
  );
}
