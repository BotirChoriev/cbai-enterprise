/**
 * Extended Genesis operating context — preserves mission/project plus execution artifacts in URLs.
 * Extends mission-operating-context without replacing it.
 */

import type { OperatingUrlParams } from "@/lib/intelligence-os/mission-operating-context";
import {
  OPERATING_PARAM_KEYS,
  appendOperatingParamsToHref as appendMissionParams,
  mergeQueryParams,
  parseOperatingParams as parseMissionParams,
  serializeOperatingParams as serializeMissionParams,
} from "@/lib/intelligence-os/mission-operating-context";

export const GENESIS_OPERATING_PARAM_KEYS = {
  organization: "org",
  team: "team",
  directive: "directive",
  task: "task",
  outcome: "outcome",
  researchObject: "researchObject",
  opportunity: "opportunity",
  entityKind: "entityKind",
  entityId: "entityId",
} as const;

export type GenesisOperatingParams = OperatingUrlParams & {
  organizationId?: string | null;
  teamId?: string | null;
  directiveId?: string | null;
  taskId?: string | null;
  outcomeId?: string | null;
  researchObjectId?: string | null;
  opportunityId?: string | null;
  entityKind?: string | null;
  entityId?: string | null;
};

export function parseGenesisOperatingParams(searchParams: URLSearchParams): GenesisOperatingParams {
  return {
    ...parseMissionParams(searchParams),
    organizationId: searchParams.get(GENESIS_OPERATING_PARAM_KEYS.organization),
    teamId: searchParams.get(GENESIS_OPERATING_PARAM_KEYS.team),
    directiveId: searchParams.get(GENESIS_OPERATING_PARAM_KEYS.directive),
    taskId: searchParams.get(GENESIS_OPERATING_PARAM_KEYS.task),
    outcomeId: searchParams.get(GENESIS_OPERATING_PARAM_KEYS.outcome),
    researchObjectId: searchParams.get(GENESIS_OPERATING_PARAM_KEYS.researchObject),
    opportunityId: searchParams.get(GENESIS_OPERATING_PARAM_KEYS.opportunity),
    entityKind: searchParams.get(GENESIS_OPERATING_PARAM_KEYS.entityKind),
    entityId: searchParams.get(GENESIS_OPERATING_PARAM_KEYS.entityId),
  };
}

export function serializeGenesisOperatingParams(params: GenesisOperatingParams): Record<string, string> {
  const out = serializeMissionParams(params);
  if (params.organizationId) out[GENESIS_OPERATING_PARAM_KEYS.organization] = params.organizationId;
  if (params.teamId) out[GENESIS_OPERATING_PARAM_KEYS.team] = params.teamId;
  if (params.directiveId) out[GENESIS_OPERATING_PARAM_KEYS.directive] = params.directiveId;
  if (params.taskId) out[GENESIS_OPERATING_PARAM_KEYS.task] = params.taskId;
  if (params.outcomeId) out[GENESIS_OPERATING_PARAM_KEYS.outcome] = params.outcomeId;
  if (params.researchObjectId) out[GENESIS_OPERATING_PARAM_KEYS.researchObject] = params.researchObjectId;
  if (params.opportunityId) out[GENESIS_OPERATING_PARAM_KEYS.opportunity] = params.opportunityId;
  if (params.entityKind) out[GENESIS_OPERATING_PARAM_KEYS.entityKind] = params.entityKind;
  if (params.entityId) out[GENESIS_OPERATING_PARAM_KEYS.entityId] = params.entityId;
  return out;
}

export function buildGenesisOperatingHref(path: string, params: GenesisOperatingParams): string {
  return `${path}${mergeQueryParams(serializeGenesisOperatingParams(params))}`;
}

/** Append mission/project and optional Genesis params without dropping existing query keys. */
export function appendGenesisOperatingParamsToHref(
  href: string,
  params: GenesisOperatingParams,
): string {
  const withMission = appendMissionParams(href, params);
  const hashIndex = withMission.indexOf("#");
  const hash = hashIndex >= 0 ? withMission.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? withMission.slice(0, hashIndex) : withMission;
  const [path, query = ""] = withoutHash.split("?");
  const urlParams = new URLSearchParams(query);

  for (const [key, value] of Object.entries(serializeGenesisOperatingParams(params))) {
    if (key === OPERATING_PARAM_KEYS.mission || key === OPERATING_PARAM_KEYS.project) continue;
    if (value) urlParams.set(key, value);
  }

  const q = urlParams.toString();
  return `${q ? `${path}?${q}` : path}${hash}`;
}

export function genesisParamsFromContext(input: {
  missionId?: string | null;
  projectId?: string | null;
  organizationId?: string | null;
  teamId?: string | null;
  directiveId?: string | null;
  taskId?: string | null;
  outcomeId?: string | null;
  researchObjectId?: string | null;
  opportunityId?: string | null;
}): GenesisOperatingParams {
  return {
    missionId: input.missionId ?? null,
    projectId: input.projectId ?? null,
    organizationId: input.organizationId ?? null,
    teamId: input.teamId ?? null,
    directiveId: input.directiveId ?? null,
    taskId: input.taskId ?? null,
    outcomeId: input.outcomeId ?? null,
    researchObjectId: input.researchObjectId ?? null,
    opportunityId: input.opportunityId ?? null,
  };
}
