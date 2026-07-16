/**
 * EPIC-13.4 — Universal Workspace: composed persistent state across routes.
 */

import { getPrimaryEntity, parseContextParams } from "@/lib/context/context-builder";
import { buildPlatformContext } from "@/lib/context/context-builder";
import { deriveEvidenceRuntime } from "@/lib/evidence-runtime/evidence-runtime";
import { deriveReportReadiness } from "@/lib/intelligence-os/report-readiness";
import { loadHumanImpactForMission } from "@/lib/intelligence-os/human-impact-store";
import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import {
  refFromContextEntity,
  resolveUniversalObject,
  type UniversalObjectRef,
} from "@/lib/intelligence-os/universal-object";
import { loadProject } from "@/lib/project/project-store";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import { resolveIntelligenceSpace, type IntelligenceSpaceId } from "@/lib/intelligence-os/intelligence-spaces";

const WORKSPACE_KEY = "cbai-universal-workspace";

export type UniversalWorkspaceState = {
  readonly activeMissionId: string | null;
  readonly activeMissionProblem: string | null;
  readonly activeObject: UniversalObjectRef | null;
  readonly activeProjectId: string | null;
  readonly activeScope: IntelligenceSpaceId;
  readonly evidenceCount: number;
  readonly impactComplete: boolean;
  readonly reportReady: boolean;
  readonly returnPath: string;
  readonly lastMeaningfulAction: string | null;
  readonly updatedAt: string;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function persistUniversalWorkspace(state: UniversalWorkspaceState): void {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(resolveStorageKey(WORKSPACE_KEY), JSON.stringify(state));
}

export function loadPersistedUniversalWorkspace(): UniversalWorkspaceState | null {
  if (!isBrowser()) return null;
  const raw = window.sessionStorage.getItem(resolveStorageKey(WORKSPACE_KEY));
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && "activeScope" in parsed) {
      return parsed as UniversalWorkspaceState;
    }
  } catch {
    return null;
  }
  return null;
}

export function deriveFocusedObjectFromRoute(
  pathname: string,
  searchParams: URLSearchParams,
): UniversalObjectRef | null {
  const params = parseContextParams(searchParams);
  const snapshot = buildPlatformContext(params, pathname);
  const primary = getPrimaryEntity(snapshot);
  if (primary) return refFromContextEntity(primary);

  const projectId = searchParams.get("project");
  if (projectId) return { type: "project", id: projectId };

  if (pathname.startsWith("/research/") && pathname !== "/research/workspace") {
    const topicId = pathname.split("/research/")[1]?.split("/")[0];
    if (topicId) return { type: "research_topic", id: topicId };
  }

  const mission = getCurrentMission();
  if (pathname === "/" && mission) return { type: "mission", id: mission.id };

  return null;
}

export function deriveUniversalWorkspace(
  pathname: string,
  searchParams: URLSearchParams,
  mission: Mission | null,
  focusedOverride: UniversalObjectRef | null = null,
): UniversalWorkspaceState {
  const activeObject = deriveFocusedObjectFromRoute(pathname, searchParams) ?? focusedOverride;
  const projectId = searchParams.get("project") ?? mission?.projectId ?? null;
  const runtime = deriveEvidenceRuntime(mission, projectId ?? undefined);
  const impact = mission ? loadHumanImpactForMission(mission.id) : null;
  const readiness = projectId ? deriveReportReadiness(projectId) : null;
  const project = projectId ? loadProject(projectId) : null;

  const state: UniversalWorkspaceState = {
    activeMissionId: mission?.id ?? null,
    activeMissionProblem: mission?.problem ?? null,
    activeObject,
    activeProjectId: projectId,
    activeScope: resolveIntelligenceSpace(pathname),
    evidenceCount: runtime.records.length,
    impactComplete: Boolean(impact?.isComplete),
    reportReady: Boolean(readiness?.canClaimReadiness),
    returnPath: pathname,
    lastMeaningfulAction: activeObject
      ? resolveUniversalObject(activeObject, mission)?.identity ?? null
      : project?.title ?? null,
    updatedAt: new Date().toISOString(),
  };

  persistUniversalWorkspace(state);
  return state;
}
