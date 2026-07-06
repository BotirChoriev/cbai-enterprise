import { getIndicatorById } from "@/lib/indicator-framework";
import {
  findEntityById,
  legacyIdToEntityId,
  resolveEntityFromIdString,
  type EntityId,
} from "@/lib/registry";
import { findMissionByIdString, type MissionId } from "@/lib/missions";
import {
  buildEvidenceCoverage,
  collectEvidenceIds,
  collectSourceIds,
} from "@/lib/decision-intelligence/decision-evidence";
import {
  assessDecisionReadiness,
  buildStandardLimitations,
} from "@/lib/decision-intelligence/decision-readiness";
import type {
  DecisionContextId,
  DecisionContextInput,
  DecisionContextRecord,
  MethodologyReference,
} from "@/lib/decision-intelligence/decision-types";
import { DECISION_RECORD_VERSION } from "@/lib/decision-intelligence/decision-types";

export const DECISION_CONTEXT_ID_PATTERN = /^decision-[a-z0-9-]+$/;

export function buildDecisionContextId(slug: string): DecisionContextId {
  return `decision-${slug}` as DecisionContextId;
}

export function isValidDecisionContextIdFormat(id: string): id is DecisionContextId {
  return DECISION_CONTEXT_ID_PATTERN.test(id);
}

function resolveEntityIds(input: DecisionContextInput): EntityId[] {
  const resolved = new Set<EntityId>();

  if (input.entityIds) {
    for (const rawId of input.entityIds) {
      const byId = findEntityById(rawId as EntityId);
      if (byId) {
        resolved.add(byId.entityId);
        continue;
      }
      const fromString = resolveEntityFromIdString(rawId);
      if (fromString) {
        resolved.add(fromString.entityId);
      }
    }
  }

  if (input.countryId) {
    resolved.add(legacyIdToEntityId("country", input.countryId));
  }
  if (input.companyId) {
    resolved.add(legacyIdToEntityId("company", input.companyId));
  }
  if (input.universityId) {
    resolved.add(legacyIdToEntityId("university", input.universityId));
  }

  return [...resolved];
}

function collectIndicatorIdsFromEntities(entityIds: readonly EntityId[]): string[] {
  const indicatorIds = new Set<string>();

  for (const entityId of entityIds) {
    const entity = findEntityById(entityId);
    if (!entity) continue;
    for (const indicatorId of entity.indicatorIds) {
      indicatorIds.add(indicatorId);
    }
  }

  return [...indicatorIds];
}

function collectIndicatorIdsFromMissions(missionIds: readonly string[]): string[] {
  const indicatorIds = new Set<string>();

  for (const missionId of missionIds) {
    const mission = findMissionByIdString(missionId);
    if (!mission) continue;
    for (const indicatorId of mission.requiredIndicators) {
      indicatorIds.add(indicatorId);
    }
  }

  return [...indicatorIds];
}

function resolveMissionIds(input: DecisionContextInput): MissionId[] {
  if (!input.missionIds) return [];
  return input.missionIds.filter((id): id is MissionId =>
    findMissionByIdString(id) !== undefined,
  ) as MissionId[];
}

function buildMethodologyReferences(indicatorIds: readonly string[]): MethodologyReference[] {
  return indicatorIds
    .map((indicatorId) => {
      const indicator = getIndicatorById(indicatorId);
      if (!indicator) return null;

      return {
        indicatorId: indicator.id,
        indicatorTitle: indicator.title,
        whyItExists: indicator.methodology.whyItExists,
        requiredEvidence: indicator.methodology.requiredEvidence,
        missingEvidence: indicator.methodology.missingEvidence,
        standardReference: `indicator-framework/${indicator.category}/${indicator.slug}`,
      };
    })
    .filter((ref): ref is MethodologyReference => ref !== null);
}

export type BuildDecisionContextOptions = {
  slug: string;
  input: DecisionContextInput;
  /** Override auto-collected indicator IDs. */
  indicatorIds?: readonly string[];
};

/** Build a constitutional decision context from registry, mission, and indicator layers. */
export function buildDecisionContext(
  options: BuildDecisionContextOptions,
): DecisionContextRecord {
  const entityIds = resolveEntityIds(options.input);
  const missionIds = resolveMissionIds(options.input);

  const fromEntities = collectIndicatorIdsFromEntities(entityIds);
  const fromMissions = collectIndicatorIdsFromMissions(missionIds);
  const explicit = options.indicatorIds ?? options.input.indicatorIds ?? [];

  const indicatorIds = [
    ...new Set([...fromEntities, ...fromMissions, ...explicit]),
  ];

  const evidenceIds = collectEvidenceIds(indicatorIds);
  const sourceIds = collectSourceIds(indicatorIds);
  const evidenceCoverage = buildEvidenceCoverage(indicatorIds);
  const readinessStatus = assessDecisionReadiness(evidenceCoverage);
  const methodologyReferences = buildMethodologyReferences(indicatorIds);

  return {
    decisionContextId: buildDecisionContextId(options.slug),
    entityIds,
    indicatorIds,
    evidenceIds,
    sourceIds,
    missionIds,
    readinessStatus,
    limitations: buildStandardLimitations(readinessStatus),
    evidenceCoverage,
    methodologyReferences,
    humanReviewRequired: true,
    version: DECISION_RECORD_VERSION,
  };
}
