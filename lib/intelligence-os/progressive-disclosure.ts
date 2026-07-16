/**
 * EPIC-21 — Progressive disclosure tied to user density preference.
 * Beginner (focused) → one next action. Expert → full workspace depth.
 */

import type { UserDensityMode } from "@/lib/intelligence-os/adaptive-density";

export type DisclosureLevel = "beginner" | "professional" | "expert";

export type ProgressiveDisclosureFlags = {
  readonly level: DisclosureLevel;
  readonly showMentalModelStrip: boolean;
  readonly showFloatingIntelligence: boolean;
  readonly showAmbientTrustStrip: boolean;
  readonly showContinuityTimeline: boolean;
  readonly showCanvasExpertPanels: boolean;
  readonly showGraphAnalysis: boolean;
  readonly showGraphLegend: boolean;
  readonly showEvidenceAdvanced: boolean;
  readonly showReportsReadinessDetail: boolean;
  readonly showAwakeningSequence: boolean;
  readonly primaryActionOnly: boolean;
};

const LEVEL_MAP: Record<UserDensityMode, DisclosureLevel> = {
  focused: "beginner",
  standard: "professional",
  expert: "expert",
};

export function resolveDisclosureLevel(mode: UserDensityMode): DisclosureLevel {
  return LEVEL_MAP[mode] ?? "professional";
}

export function resolveProgressiveDisclosure(mode: UserDensityMode): ProgressiveDisclosureFlags {
  const level = resolveDisclosureLevel(mode);

  if (level === "beginner") {
    return {
      level,
      showMentalModelStrip: false,
      showFloatingIntelligence: false,
      showAmbientTrustStrip: false,
      showContinuityTimeline: false,
      showCanvasExpertPanels: false,
      showGraphAnalysis: false,
      showGraphLegend: false,
      showEvidenceAdvanced: false,
      showReportsReadinessDetail: false,
      showAwakeningSequence: false,
      primaryActionOnly: true,
    };
  }

  if (level === "professional") {
    return {
      level,
      showMentalModelStrip: true,
      showFloatingIntelligence: true,
      showAmbientTrustStrip: true,
      showContinuityTimeline: true,
      showCanvasExpertPanels: false,
      showGraphAnalysis: false,
      showGraphLegend: true,
      showEvidenceAdvanced: false,
      showReportsReadinessDetail: true,
      showAwakeningSequence: true,
      primaryActionOnly: true,
    };
  }

  return {
    level: "expert",
    showMentalModelStrip: true,
    showFloatingIntelligence: true,
    showAmbientTrustStrip: true,
    showContinuityTimeline: true,
    showCanvasExpertPanels: true,
    showGraphAnalysis: true,
    showGraphLegend: true,
    showEvidenceAdvanced: true,
    showReportsReadinessDetail: true,
    showAwakeningSequence: true,
    primaryActionOnly: false,
  };
}
