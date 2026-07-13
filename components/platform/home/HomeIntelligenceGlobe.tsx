"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildWorldIntelligenceMap } from "@/lib/world-map";
import { PRODUCT_STATUS_DOT_CLASSES } from "@/lib/product-status";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const STATUS_FILL: Record<string, string> = {
  "bg-emerald-400": "#34d399",
  "bg-cyan-400": "#22d3ee",
  "bg-amber-400": "#fbbf24",
  "bg-violet-400": "#a78bfa",
  "bg-orange-400": "#fb923c",
  "bg-zinc-600": "#52525b",
  "bg-zinc-500": "#71717a",
};

/**
 * The Living Intelligence network — the homepage's own visual heart, not a copy of the full
 * World Intelligence Map's filterable browser (that stays real and unduplicated on /countries).
 * This is a curated, radial view of the same real catalog, arranged around one real evidence
 * core — real country names, real connected-source status, zero fabricated coordinates or
 * geography (this repository has no map/geo-data library; a radial layout makes no geographic
 * claim, unlike a hand-approximated world shape would). Breathes via one slow, shared animation
 * timing already used by the Operator orb and the CBAI mark — one motion language, not a fourth.
 */
export default function HomeIntelligenceGlobe() {
  const allCountries = useMemo(() => buildWorldIntelligenceMap().flatMap((group) => group.countries), []);
  const regionCount = useMemo(() => new Set(allCountries.map((c) => c.country.region)).size, [allCountries]);

  const radius = 130;
  const center = 160;
  const nodes = allCountries.map((entry, index) => {
    const angle = (index / allCountries.length) * Math.PI * 2 - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const fill = STATUS_FILL[PRODUCT_STATUS_DOT_CLASSES[entry.status]] ?? "#52525b";
    return { ...entry, x, y, fill };
  });

  return (
    <section aria-labelledby="home-globe-heading" className="mx-auto max-w-4xl px-4 text-center sm:px-8">
      <p className={cbaiSectionEyebrow} id="home-globe-heading">Living Intelligence Network</p>
      <h2 className="cbai-display mt-2 text-2xl text-zinc-50 sm:text-3xl">
        One evidence core. Every country connected to it.
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-500">
        {allCountries.length} countries across {regionCount} regions, each with a real, honestly-labeled evidence
        status — never a fabricated score.
      </p>

      <div className="mt-8 flex justify-center">
        <svg
          className="cbai-globe-breathe h-auto w-full max-w-[320px] text-[#2fbf71]"
          viewBox="0 0 320 320"
          fill="none"
          role="img"
          aria-label={`Living intelligence network: ${allCountries.length} countries connected to one evidence core`}
        >
          <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth="1" opacity="0.15" />
          {nodes.map((node) => (
            <line
              key={`line-${node.country.id}`}
              x1={center}
              y1={center}
              x2={node.x}
              y2={node.y}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.25"
            />
          ))}
          <circle cx={center} cy={center} r="10" fill="currentColor" opacity="0.9" />
          <circle cx={center} cy={center} r="16" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          {nodes.map((node) => (
            <g key={node.country.id}>
              <circle cx={node.x} cy={node.y} r="5" fill={node.fill} />
              <circle cx={node.x} cy={node.y} r="9" stroke={node.fill} strokeWidth="1" opacity="0.4" />
            </g>
          ))}
        </svg>
      </div>

      <div className="mx-auto -mt-4 flex max-w-md flex-wrap justify-center gap-x-4 gap-y-1.5">
        {nodes.map((node) => (
          <Link
            key={node.country.id}
            href={node.href}
            className="text-xs text-zinc-500 transition-colors hover:text-emerald-300"
          >
            {node.country.name}
          </Link>
        ))}
      </div>

      <Link href="/countries" className="mt-6 inline-flex text-sm font-medium text-cyan-400 hover:text-cyan-300">
        Explore the full World Intelligence Map →
      </Link>
    </section>
  );
}
