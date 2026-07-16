/**
 * EPIC-13.3 — Living memory: what changed, where user stopped — user-owned session memory.
 */

import type { IntelligenceFlowStage } from "@/lib/intelligence-os/intelligence-flow";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

const FLOW_SNAPSHOT_KEY = "cbai-living-memory-flow";
const MEMORY_CLEARED_KEY = "cbai-living-memory-cleared";
const COMPANION_THOUGHT_KEY = "cbai-companion-thought";

export type FlowStageSnapshot = {
  readonly id: string;
  readonly status: string;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function recordFlowSnapshot(missionId: string | null, flow: readonly IntelligenceFlowStage[]): void {
  if (!isBrowser() || !missionId) return;
  if (window.sessionStorage.getItem(resolveStorageKey(MEMORY_CLEARED_KEY)) === "1") return;

  const payload = {
    missionId,
    stages: flow.map((s) => ({ id: s.id, status: s.status })),
    recordedAt: new Date().toISOString(),
  };
  window.sessionStorage.setItem(resolveStorageKey(FLOW_SNAPSHOT_KEY), JSON.stringify(payload));
}

export function loadFlowSnapshot(): { missionId: string; stages: FlowStageSnapshot[] } | null {
  if (!isBrowser()) return null;
  const raw = window.sessionStorage.getItem(resolveStorageKey(FLOW_SNAPSHOT_KEY));
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as { missionId: string }).missionId === "string" &&
      Array.isArray((parsed as { stages: unknown }).stages)
    ) {
      return parsed as { missionId: string; stages: FlowStageSnapshot[] };
    }
  } catch {
    return null;
  }
  return null;
}

/** Returns i18n key suffix for what changed, or null if nothing meaningful changed. */
export function deriveWhatChanged(flow: readonly IntelligenceFlowStage[]): string | null {
  const previous = loadFlowSnapshot();
  if (!previous) return null;

  for (const stage of flow) {
    const prior = previous.stages.find((s) => s.id === stage.id);
    if (prior && prior.status !== stage.status && stage.status === "complete") {
      return FLOW_CHANGE_KEYS[stage.id] ?? null;
    }
  }

  const prevIncomplete = previous.stages.find((s) => s.status === "missing" || s.status === "attention");
  const nowComplete = flow.find((s) => s.id === prevIncomplete?.id && s.status === "complete");
  if (nowComplete) return FLOW_CHANGE_KEYS[nowComplete.id] ?? null;

  return null;
}

const FLOW_CHANGE_KEYS: Record<string, string> = {
  question: "flowStageCompletedQuestion",
  hypothesis: "flowStageCompletedHypothesis",
  evidence: "flowStageCompletedEvidence",
  reasoning: "flowStageCompletedReasoning",
  review: "flowStageCompletedReview",
  impact: "flowStageCompletedImpact",
  publication: "flowStageCompletedPublication",
  legacy: "flowStageCompletedLegacy",
};

export function clearLivingMemory(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(resolveStorageKey(FLOW_SNAPSHOT_KEY));
  window.sessionStorage.removeItem(resolveStorageKey(COMPANION_THOUGHT_KEY));
  window.sessionStorage.setItem(resolveStorageKey(MEMORY_CLEARED_KEY), "1");
}

export function resetLivingMemoryClearFlag(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(resolveStorageKey(MEMORY_CLEARED_KEY));
}

export type CompanionThoughtSnapshot = {
  readonly missionId: string | null;
  readonly lastRoute: string;
  readonly lastFocus: string;
  readonly recordedAt: string;
};

/** EPIC-24 — Remember what the user was pursuing, not only clicks. Architecture only. */
export function recordCompanionThought(
  missionId: string | null,
  pathname: string,
  focus: string,
): void {
  if (!isBrowser() || window.sessionStorage.getItem(resolveStorageKey(MEMORY_CLEARED_KEY)) === "1") {
    return;
  }
  const payload: CompanionThoughtSnapshot = {
    missionId,
    lastRoute: pathname.split("?")[0],
    lastFocus: focus,
    recordedAt: new Date().toISOString(),
  };
  window.sessionStorage.setItem(resolveStorageKey(COMPANION_THOUGHT_KEY), JSON.stringify(payload));
}

export function loadCompanionThought(): CompanionThoughtSnapshot | null {
  if (!isBrowser()) return null;
  const raw = window.sessionStorage.getItem(resolveStorageKey(COMPANION_THOUGHT_KEY));
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as { lastRoute: string }).lastRoute === "string" &&
      typeof (parsed as { lastFocus: string }).lastFocus === "string"
    ) {
      return parsed as CompanionThoughtSnapshot;
    }
  } catch {
    return null;
  }
  return null;
}
