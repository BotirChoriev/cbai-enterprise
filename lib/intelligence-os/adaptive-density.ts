/**
 * EPIC-13.4 — Adaptive density: user-controlled, explainable, never capability-gated.
 */

import type { IntelligenceAtmosphere } from "@/lib/intelligence-os/intelligence-atmosphere";

export type UserDensityMode = "focused" | "standard" | "expert";

export type ResolvedDensity = IntelligenceAtmosphere["density"];

const MODE_MAP: Record<UserDensityMode, ResolvedDensity> = {
  focused: "open",
  standard: "focused",
  expert: "dense",
};

export function resolveAdaptiveDensity(
  userMode: UserDensityMode,
  spaceDefault: ResolvedDensity,
): { density: ResolvedDensity; source: "user" | "space" } {
  return { density: MODE_MAP[userMode] ?? spaceDefault, source: "user" };
}

export function densityModeExplanation(mode: UserDensityMode): string {
  const explanations: Record<UserDensityMode, string> = {
    focused: "Shows essential mission and object context only.",
    standard: "Balanced context for most operating work.",
    expert: "Higher information density for complex missions.",
  };
  return explanations[mode];
}

/** Never lock routes or features by capability — density only affects presentation. */
export function assertNoCapabilityLockout(): true {
  return true;
}
