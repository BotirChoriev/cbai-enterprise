/**
 * EPIC-13.2 — Unified context memory for Living Context.
 * Remembers recent study, unfinished flow, and space continuity — real stores only.
 */

import type { ContextEntityRef } from "@/lib/context/context-types";
import { loadRecentEntities } from "@/lib/context/context-history";
import { deriveCurrentFlowStage, type IntelligenceFlowStage } from "@/lib/intelligence-os/intelligence-flow";
import { deriveLegacyTrail } from "@/lib/intelligence-os/legacy-trail";
import type { IntelligenceSpaceId } from "@/lib/intelligence-os/intelligence-spaces";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

const LAST_SPACE_KEY = "cbai-last-intelligence-space";

export type IntelligenceSpaceVisit = {
  readonly spaceId: IntelligenceSpaceId;
  readonly pathname: string;
  readonly visitedAt: string;
};

export type LivingContextMemory = {
  readonly recentStudy: readonly ContextEntityRef[];
  readonly lastVisit: IntelligenceSpaceVisit | null;
  readonly currentFlowStage: IntelligenceFlowStage | null;
  readonly legacyArtifactCount: number;
  readonly legacySummary: string | null;
  readonly hasContinuity: boolean;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function entityStudyHref(entity: ContextEntityRef): string {
  switch (entity.kind) {
    case "country":
      return `/countries?country=${encodeURIComponent(entity.id)}`;
    case "company":
      return `/companies?company=${encodeURIComponent(entity.id)}`;
    case "university":
      return `/universities?university=${encodeURIComponent(entity.id)}`;
    case "research_topic":
      return `/research/${encodeURIComponent(entity.id)}`;
    case "project":
      return `/my-work?project=${encodeURIComponent(entity.id)}`;
    case "evidence":
      return "/knowledge";
    default:
      return "/search";
  }
}

export function recordIntelligenceSpaceVisit(spaceId: IntelligenceSpaceId, pathname: string): void {
  if (!isBrowser()) return;
  const payload: IntelligenceSpaceVisit = {
    spaceId,
    pathname,
    visitedAt: new Date().toISOString(),
  };
  window.sessionStorage.setItem(resolveStorageKey(LAST_SPACE_KEY), JSON.stringify(payload));
}

export function loadLastIntelligenceSpaceVisit(): IntelligenceSpaceVisit | null {
  if (!isBrowser()) return null;
  const raw = window.sessionStorage.getItem(resolveStorageKey(LAST_SPACE_KEY));
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as IntelligenceSpaceVisit).spaceId === "string" &&
      typeof (parsed as IntelligenceSpaceVisit).pathname === "string"
    ) {
      return parsed as IntelligenceSpaceVisit;
    }
  } catch {
    return null;
  }
  return null;
}

export function deriveLivingContextMemory(mission: Mission | null): LivingContextMemory {
  const recentStudy = loadRecentEntities().slice(0, 4);
  const lastVisit = loadLastIntelligenceSpaceVisit();
  const currentFlowStage = deriveCurrentFlowStage(mission);
  const legacy = deriveLegacyTrail(mission);

  return {
    recentStudy,
    lastVisit,
    currentFlowStage,
    legacyArtifactCount: legacy.artifacts.length,
    legacySummary: legacy.summary,
    hasContinuity: recentStudy.length > 0 || legacy.artifacts.length > 0 || Boolean(mission),
  };
}
