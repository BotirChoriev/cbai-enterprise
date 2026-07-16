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
  readonly showLivingContextRail: boolean;
  readonly showOperatingContextColumn: boolean;
  readonly showGlobalMissionBarDetail: boolean;
  readonly showMyWorkCapabilityPanels: boolean;
  readonly showReasoningStats: boolean;
  readonly showGatewayGoalChips: boolean;
  readonly showCompanionDetail: boolean;
  readonly showCompanionStoryBeat: boolean;
  readonly showInlineHumanDecisionBoundary: boolean;
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
      showLivingContextRail: false,
      showOperatingContextColumn: false,
      showGlobalMissionBarDetail: false,
      showMyWorkCapabilityPanels: false,
      showReasoningStats: false,
      showGatewayGoalChips: false,
      showCompanionDetail: false,
      showCompanionStoryBeat: false,
      showInlineHumanDecisionBoundary: false,
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
      showLivingContextRail: true,
      showOperatingContextColumn: true,
      showGlobalMissionBarDetail: true,
      showMyWorkCapabilityPanels: false,
      showReasoningStats: false,
      showGatewayGoalChips: false,
      showCompanionDetail: true,
      showCompanionStoryBeat: false,
      showInlineHumanDecisionBoundary: false,
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
    showLivingContextRail: true,
    showOperatingContextColumn: true,
    showGlobalMissionBarDetail: true,
    showMyWorkCapabilityPanels: true,
    showReasoningStats: true,
    showGatewayGoalChips: true,
    showCompanionDetail: true,
    showCompanionStoryBeat: true,
    showInlineHumanDecisionBoundary: true,
  };
}

const REFERENCE_ROUTES = new Set(["/trust", "/about", "/settings", "/account"]);
const INTENT_ROUTES = new Set(["/search"]);
const COMPANION_ROUTES = new Set(["/knowledge", "/reasoning", "/graph", "/reports"]);
const WORKFLOW_CONTINUITY_ROUTES = new Set(["/knowledge", "/reasoning", "/graph", "/reports"]);

function routeBase(pathname: string): string {
  return pathname.split("?")[0];
}

/** Reference and account pages — self-contained, minimal mission chrome. */
export function isReferenceRoute(pathname: string): boolean {
  return REFERENCE_ROUTES.has(routeBase(pathname));
}

/** Routes with page-level mission companion — hide global duplicate bar. */
export function hasPageMissionCompanion(pathname: string): boolean {
  return COMPANION_ROUTES.has(routeBase(pathname));
}

export function shouldShowGlobalMissionBar(pathname: string): boolean {
  const base = routeBase(pathname);
  if (base === "/" || isReferenceRoute(pathname) || INTENT_ROUTES.has(base) || hasPageMissionCompanion(pathname)) {
    return false;
  }
  return true;
}

export function shouldShowMentalModelStrip(pathname: string, flags: ProgressiveDisclosureFlags): boolean {
  if (!flags.showMentalModelStrip) return false;
  const base = routeBase(pathname);
  if (base === "/" || isReferenceRoute(pathname) || INTENT_ROUTES.has(base)) return false;
  return true;
}

export function shouldShowContinuityTimeline(pathname: string, flags: ProgressiveDisclosureFlags): boolean {
  if (!flags.showContinuityTimeline) return false;
  return WORKFLOW_CONTINUITY_ROUTES.has(routeBase(pathname));
}

export function shouldShowOperatingContextColumn(pathname: string, flags: ProgressiveDisclosureFlags): boolean {
  if (!flags.showOperatingContextColumn) return false;
  if (isReferenceRoute(pathname)) return false;
  return true;
}

export function shouldShowAmbientTrustStrip(pathname: string, flags: ProgressiveDisclosureFlags): boolean {
  if (!flags.showAmbientTrustStrip) return false;
  if (isReferenceRoute(pathname)) return false;
  return true;
}
