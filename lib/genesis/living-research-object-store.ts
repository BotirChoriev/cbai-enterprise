/**
 * Living Research Object — user-authored research records (device-local).
 */

import {
  genesisId,
  notifyGenesisChanged,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import { recordGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import type { GenesisEvidenceRef, ResearchResultStatus } from "@/lib/genesis/genesis-types";

const OBJECTS_KEY = "cbai-genesis-living-research";
const RESULTS_KEY = "cbai-genesis-research-results";

const memoryObjects: LivingResearchObject[] = [];
const memoryResults: LivingResearchResult[] = [];

export type LivingResearchObject = {
  readonly id: string;
  readonly title: string;
  readonly authorOwner: string;
  readonly researchQuestion: string;
  readonly hypothesis: string;
  readonly domain: string;
  readonly methods: string;
  readonly limitations: string;
  readonly openQuestions: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly researchTopicId?: string | null;
  readonly visibility: "private" | "team" | "organization";
  readonly ethicalReviewStatus: string;
  readonly humanReviewStatus: "pending" | "reviewed" | "none";
  readonly collaborationNeed: string;
  readonly fundingNeed: string;
  readonly evidenceRefs: readonly GenesisEvidenceRef[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type LivingResearchResult = {
  readonly id: string;
  readonly objectId: string;
  readonly summary: string;
  readonly status: ResearchResultStatus;
  readonly method: string;
  readonly source: string;
  readonly limitation: string;
  readonly reasonForStatus: string;
  readonly humanReviewer?: string | null;
  readonly recordedAt: string;
  readonly contradictsResultId?: string | null;
};

function isObject(v: unknown): v is LivingResearchObject {
  const o = v as LivingResearchObject;
  return typeof o?.id === "string" && typeof o?.title === "string";
}

function isResult(v: unknown): v is LivingResearchResult {
  const r = v as LivingResearchResult;
  return typeof r?.id === "string" && typeof r?.objectId === "string";
}

export function loadLivingResearchObjects(filters?: {
  missionId?: string;
  projectId?: string;
}): LivingResearchObject[] {
  let all = readGenesisList(OBJECTS_KEY, isObject, memoryObjects);
  if (filters?.missionId) all = all.filter((o) => o.missionId === filters.missionId);
  if (filters?.projectId) all = all.filter((o) => o.projectId === filters.projectId);
  return all;
}

export function createLivingResearchObject(
  input: Omit<LivingResearchObject, "id" | "createdAt" | "updatedAt">,
): LivingResearchObject {
  const now = new Date().toISOString();
  const obj: LivingResearchObject = { ...input, id: genesisId("lro"), createdAt: now, updatedAt: now };
  writeGenesisList(OBJECTS_KEY, [...readGenesisList(OBJECTS_KEY, isObject, memoryObjects), obj], memoryObjects);
  recordGenesisAudit({
    domain: "research",
    action: "living_research_created",
    recordType: "living_research_object",
    recordId: obj.id,
    actorId: input.authorOwner,
    missionId: input.missionId,
    projectId: input.projectId,
    newState: "Draft",
  });
  notifyGenesisChanged();
  return obj;
}

export function loadResearchResults(objectId: string): LivingResearchResult[] {
  return readGenesisList(RESULTS_KEY, isResult, memoryResults).filter((r) => r.objectId === objectId);
}

export function addResearchResult(
  input: Omit<LivingResearchResult, "id" | "recordedAt">,
): LivingResearchResult {
  const result: LivingResearchResult = {
    ...input,
    id: genesisId("rres"),
    recordedAt: new Date().toISOString(),
  };
  writeGenesisList(RESULTS_KEY, [...readGenesisList(RESULTS_KEY, isResult, memoryResults), result], memoryResults);
  recordGenesisAudit({
    domain: "research",
    action: "research_result_recorded",
    recordType: "research_result",
    recordId: result.id,
    actorId: input.humanReviewer ?? "operator",
    newState: input.status,
  });
  notifyGenesisChanged();
  return result;
}

export function loadLivingResearchObject(id: string): LivingResearchObject | null {
  return readGenesisList(OBJECTS_KEY, isObject, memoryObjects).find((o) => o.id === id) ?? null;
}
