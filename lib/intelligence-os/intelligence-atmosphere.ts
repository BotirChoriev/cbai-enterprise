/**
 * EPIC-13.2 — Per-space intelligence atmosphere (light, depth, focus).
 * Subtle environmental shift — no decorative animation.
 */

import type { IntelligenceSpaceId } from "@/lib/intelligence-os/intelligence-spaces";

export type IntelligenceAtmosphere = {
  readonly spaceId: IntelligenceSpaceId;
  readonly accentRgb: string;
  readonly depth: number;
  readonly density: "open" | "focused" | "dense";
  readonly focusWeight: number;
};

const ATMOSPHERE: Readonly<Record<IntelligenceSpaceId, IntelligenceAtmosphere>> = {
  mission: { spaceId: "mission", accentRgb: "45 212 191", depth: 0.94, density: "open", focusWeight: 1 },
  evidence: { spaceId: "evidence", accentRgb: "52 211 153", depth: 0.9, density: "focused", focusWeight: 0.92 },
  knowledge: { spaceId: "knowledge", accentRgb: "56 189 168", depth: 0.88, density: "focused", focusWeight: 0.9 },
  "knowledge-universe": {
    spaceId: "knowledge-universe",
    accentRgb: "94 234 212",
    depth: 0.86,
    density: "dense",
    focusWeight: 0.88,
  },
  research: { spaceId: "research", accentRgb: "16 185 129", depth: 0.91, density: "focused", focusWeight: 0.93 },
  reasoning: { spaceId: "reasoning", accentRgb: "110 231 183", depth: 0.89, density: "focused", focusWeight: 0.91 },
  impact: { spaceId: "impact", accentRgb: "251 191 36", depth: 0.9, density: "focused", focusWeight: 0.9 },
  trust: { spaceId: "trust", accentRgb: "163 230 53", depth: 0.92, density: "open", focusWeight: 0.94 },
  capability: { spaceId: "capability", accentRgb: "45 212 191", depth: 0.93, density: "open", focusWeight: 0.95 },
  report: { spaceId: "report", accentRgb: "148 163 184", depth: 0.91, density: "focused", focusWeight: 0.92 },
  entity: { spaceId: "entity", accentRgb: "71 85 105", depth: 0.94, density: "open", focusWeight: 0.96 },
  search: { spaceId: "search", accentRgb: "56 189 248", depth: 0.95, density: "open", focusWeight: 0.97 },
  settings: { spaceId: "settings", accentRgb: "100 116 139", depth: 0.96, density: "open", focusWeight: 0.98 },
  account: { spaceId: "account", accentRgb: "100 116 139", depth: 0.96, density: "open", focusWeight: 0.98 },
  governance: { spaceId: "governance", accentRgb: "180 83 9", depth: 0.9, density: "focused", focusWeight: 0.9 },
};

export function resolveIntelligenceAtmosphere(spaceId: IntelligenceSpaceId): IntelligenceAtmosphere {
  return ATMOSPHERE[spaceId];
}

export function atmosphereStyleVars(atmosphere: IntelligenceAtmosphere): Record<string, string> {
  return {
    "--cbai-atmosphere-accent": atmosphere.accentRgb,
    "--cbai-atmosphere-depth": String(atmosphere.depth),
    "--cbai-atmosphere-focus": String(atmosphere.focusWeight),
  };
}
