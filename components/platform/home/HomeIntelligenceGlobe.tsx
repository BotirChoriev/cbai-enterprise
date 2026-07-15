"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buildIntelligenceHubs, totalIntelligenceItems } from "@/lib/platform/intelligence-network";

const HUB_MIN_RADIUS = 15;
const HUB_SCALE = 3.1;

function hubRadius(count: number): number {
  return HUB_MIN_RADIUS + Math.sqrt(count) * HUB_SCALE;
}

/**
 * The Living Intelligence Network — not a Countries diagram wearing the platform's name. Six real
 * domains (Research, Governance, Countries, Companies, Universities, Evidence), one real evidence
 * core, each hub sized by its own real registered count (never invented, never rounded up — a
 * PlatformHome bug this replaces: the previous version drew only Countries, which quietly told
 * every visitor CBAI is a country database). Meant to be rendered as an ambient field behind the
 * console (see PlatformHome.tsx), not a boxed widget beside it — this is the room the console
 * sits inside, so it fills whatever container it's given rather than centering itself in one.
 * Breathes on the same shared 4.5s rhythm as the Operator orb and CBAI mark (Design Bible Part
 * VI.6.1) — one motion language, not a second one invented for this visual.
 */
export default function HomeIntelligenceGlobe() {
  const hubs = useMemo(() => buildIntelligenceHubs(), []);
  const total = useMemo(() => totalIntelligenceItems(hubs), [hubs]);
  const [active, setActive] = useState<string | null>(null);

  const size = 640;
  const center = size / 2;
  const radius = size * 0.34;
  const nodes = hubs.map((hub, index) => {
    const angle = (index / hubs.length) * Math.PI * 2 - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { ...hub, x, y, r: hubRadius(hub.count) };
  });

  const activeNode = nodes.find((n) => n.id === active) ?? null;

  return (
    <div className="relative h-full w-full">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(47,191,113,0.14),transparent_65%)]"
      />

      <svg
        aria-hidden="true"
        className="cbai-globe-breathe pointer-events-none absolute inset-0 h-full w-full text-[#2fbf71]"
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth="1" opacity="0.1" />
        {nodes.map((node) => (
          <line
            key={`line-${node.id}`}
            x1={center}
            y1={center}
            x2={node.x}
            y2={node.y}
            stroke="currentColor"
            strokeWidth="1"
            opacity={active === node.id ? 0.6 : 0.18}
          />
        ))}
        <circle cx={center} cy={center} r="16" fill="currentColor" opacity="0.95" />
        <circle cx={center} cy={center} r="26" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <circle cx={center} cy={center} r="36" stroke="currentColor" strokeWidth="1" opacity="0.2" />
        {nodes.map((node) => (
          <circle
            key={`dot-${node.id}`}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill="currentColor"
            opacity={active === node.id ? 1 : 0.22}
            stroke="currentColor"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Real, focusable, keyboard-reachable hub links — never SVG-only click targets. Positioned
          to match the decorative line art above via the same angle math, but semantically
          independent of it (the graphic could be removed entirely and every destination would
          still be reachable). */}
      <nav aria-label="Intelligence domains" className="absolute inset-0">
        {nodes.map((node) => (
          <Link
            key={node.id}
            href={node.href}
            onMouseEnter={() => setActive(node.id)}
            onMouseLeave={() => setActive((current) => (current === node.id ? null : current))}
            onFocus={() => setActive(node.id)}
            onBlur={() => setActive((current) => (current === node.id ? null : current))}
            className="group absolute flex -translate-x-1/2 flex-col items-center rounded-full text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
            style={{ left: `${(node.x / size) * 100}%`, top: `${(node.y / size) * 100}%` }}
          >
            {/* Label is always legible at rest — "what surrounds me" must not require a hover to
                answer — and simply brightens on hover/focus rather than appearing from nothing. */}
            <span
              className="whitespace-nowrap rounded-full bg-[#050810]/0 px-2 py-0.5 text-[11px] font-medium text-zinc-400 transition-colors group-hover:bg-[#050810]/80 group-hover:text-emerald-300 group-focus-visible:bg-[#050810]/80 group-focus-visible:text-emerald-300"
              style={{ marginTop: `${(node.r / size) * 100 + 3}%` }}
            >
              {node.label}
              <span className="ml-1 text-zinc-600 group-hover:text-emerald-400/80 group-focus-visible:text-emerald-400/80">
                {node.count}
              </span>
            </span>
            <span className="sr-only"> — {node.count} real {node.unit}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-1/2 w-full -translate-x-1/2 px-2 text-center lg:bottom-4">
        {activeNode ? (
          <p className="text-xs font-medium text-emerald-300">
            {activeNode.label} · {activeNode.count} real {activeNode.unit} →
          </p>
        ) : (
          <p className="text-xs font-medium text-zinc-500">
            {total} real items connected across {hubs.length} intelligence domains →
          </p>
        )}
      </div>
    </div>
  );
}
