/**
 * Human Impact persistence — linked to missions and projects.
 */

import type { HumanImpactAssessment, HumanImpactDraft } from "@/lib/intelligence-os/human-impact.types";
import { isHumanImpactComplete } from "@/lib/intelligence-os/human-impact.types";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

const IMPACT_KEY = "cbai-human-impact";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAll(): HumanImpactAssessment[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(IMPACT_KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isImpact).map(normalizeImpact) : [];
  } catch {
    return [];
  }
}

function writeAll(items: readonly HumanImpactAssessment[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(resolveStorageKey(IMPACT_KEY), JSON.stringify(items));
}

function isImpact(value: unknown): value is HumanImpactAssessment {
  if (!value || typeof value !== "object") return false;
  const v = value as HumanImpactAssessment;
  return typeof v.humanBenefit === "string" && typeof v.updatedAt === "string";
}

function normalizeImpact(raw: HumanImpactAssessment): HumanImpactAssessment {
  return {
    ...raw,
    humanOwner: raw.humanOwner ?? "",
    reviewStatus: raw.reviewStatus ?? (raw.isComplete ? "reviewed" : "incomplete"),
  };
}

export function loadHumanImpactForMission(missionId: string): HumanImpactAssessment | null {
  return readAll().find((i) => i.missionId === missionId) ?? null;
}

export function loadHumanImpactForProject(projectId: string): HumanImpactAssessment | null {
  return readAll().find((i) => i.projectId === projectId) ?? null;
}

export function saveHumanImpact(draft: HumanImpactDraft): HumanImpactAssessment {
  const now = new Date().toISOString();
  const complete = isHumanImpactComplete(draft);
  const assessment: HumanImpactAssessment = {
    humanBenefit: draft.humanBenefit,
    possibleHarm: draft.possibleHarm,
    environmentalEffect: draft.environmentalEffect,
    ethicalConcerns: draft.ethicalConcerns,
    affectedCommunities: draft.affectedCommunities,
    longTermConsequences: draft.longTermConsequences,
    unknownRisks: draft.unknownRisks,
    mitigation: draft.mitigation,
    missingEvidence: draft.missingEvidence,
    humanOwner: draft.humanOwner,
    missionId: draft.missionId,
    projectId: draft.projectId,
    reviewStatus: complete ? "reviewed" : draft.reviewStatus ?? "incomplete",
    updatedAt: now,
    isComplete: complete,
  };
  const items = readAll().filter(
    (i) =>
      !(draft.missionId && i.missionId === draft.missionId) &&
      !(draft.projectId && i.projectId === draft.projectId),
  );
  writeAll([assessment, ...items]);
  return assessment;
}
