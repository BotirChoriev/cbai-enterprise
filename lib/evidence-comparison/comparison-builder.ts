import {
  buildCountryEvidenceGapProfile,
  buildCompanyEvidenceGapProfile,
  buildUniversityEvidenceGapProfile,
} from "@/lib/evidence-gap";
import type { EntityEvidenceGapProfile, EvidenceGapRecord } from "@/lib/evidence-gap";
import {
  entityIdToLegacyRegistryId,
  findEntityById,
  findEntitiesByType,
  type EntityId,
} from "@/lib/registry";
import type { Country } from "@/lib/countries";
import { countries } from "@/lib/countries";
import type { Company } from "@/lib/companies";
import { companies } from "@/lib/companies";
import type { University } from "@/lib/universities";
import { universities } from "@/lib/universities";
import {
  buildCountryEntityId,
  buildCompanyEntityId,
  buildUniversityEntityId,
} from "@/lib/registry";
import {
  COMPARISON_RECORD_VERSION,
  COMPARISON_UNAVAILABLE_FEWER_THAN_TWO,
  COMPARISON_UNSUPPORTED_TYPE_MIX,
  type ComparisonCandidate,
  type ComparisonContext,
  type ComparisonEntityType,
  type ComparisonId,
  type ComparisonIndicatorRow,
  type ComparisonMethodologyReference,
  type ComparisonNote,
  type ComparisonReadinessStatus,
  type EvidenceComparisonModel,
  type EvidenceComparisonRecord,
} from "@/lib/evidence-comparison/comparison-types";

export const COMPARISON_ID_PATTERN =
  /^comparison-(country|company|university)-[a-z0-9-]+-vs-[a-z0-9-]+$/;

function buildComparisonId(
  entityType: ComparisonEntityType,
  leftSlug: string,
  rightSlug: string,
): ComparisonId {
  return `comparison-${entityType}-${leftSlug}-vs-${rightSlug}` as ComparisonId;
}

function entitySlug(entityId: EntityId): string {
  return entityId.replace(/^(country|company|university)-/, "");
}

function gapProfileForEntity(
  entityType: ComparisonEntityType,
  legacyId: string,
): EntityEvidenceGapProfile | null {
  switch (entityType) {
    case "country": {
      const country = countries.find((c) => c.id === legacyId);
      return country ? buildCountryEvidenceGapProfile(country) : null;
    }
    case "company": {
      const company = companies.find((c) => c.id === legacyId);
      return company ? buildCompanyEvidenceGapProfile(company) : null;
    }
    case "university": {
      const university = universities.find((u) => u.id === legacyId);
      return university ? buildUniversityEvidenceGapProfile(university) : null;
    }
  }
}

function resolveComparisonNote(
  leftGap: EvidenceGapRecord,
  rightGap: EvidenceGapRecord,
): ComparisonNote {
  const leftAvailable = leftGap.currentStatus === "available";
  const rightAvailable = rightGap.currentStatus === "available";

  if (leftAvailable && !rightAvailable) return "more evidence connected on left";
  if (!leftAvailable && rightAvailable) return "more evidence connected on right";
  if (leftGap.currentStatus === rightGap.currentStatus) return "same evidence status";
  if (
    leftGap.missingReason === "Methodology pending" ||
    rightGap.missingReason === "Methodology pending"
  ) {
    return "methodology required";
  }
  if (
    leftGap.verificationBlocker?.includes("not connected") ||
    rightGap.verificationBlocker?.includes("not connected")
  ) {
    return "source not connected";
  }
  return "evidence gap differs";
}

function buildIndicatorRows(
  leftProfile: EntityEvidenceGapProfile,
  rightProfile: EntityEvidenceGapProfile,
): ComparisonIndicatorRow[] {
  const rightByIndicator = new Map(
    rightProfile.gaps.map((gap) => [gap.indicatorId, gap]),
  );

  return leftProfile.gaps.map((leftGap) => {
    const rightGap = rightByIndicator.get(leftGap.indicatorId);
    const rightStatus = rightGap?.currentStatus ?? "missing";
    const note = rightGap
      ? resolveComparisonNote(leftGap, rightGap)
      : "evidence gap differs";

    return {
      indicatorId: leftGap.indicatorId,
      indicatorTitle: leftGap.indicatorTitle,
      domainTitle: leftGap.domainTitle,
      leftStatus: leftGap.currentStatus,
      rightStatus,
      note,
      leftAvailable: leftGap.currentStatus === "available",
      rightAvailable: rightGap?.currentStatus === "available",
    };
  });
}

function collectSources(profile: EntityEvidenceGapProfile): Set<string> {
  const ids = new Set<string>();
  for (const gap of profile.gaps) {
    if (gap.expectedSourceId) ids.add(gap.expectedSourceId);
  }
  return ids;
}

function assessReadiness(
  leftProfile: EntityEvidenceGapProfile,
  rightProfile: EntityEvidenceGapProfile,
  sharedIndicators: readonly string[],
): ComparisonReadinessStatus {
  if (sharedIndicators.length === 0) return "insufficient_evidence";

  const leftAvailable = leftProfile.availableCount;
  const rightAvailable = rightProfile.availableCount;

  if (leftAvailable === 0 && rightAvailable === 0) return "insufficient_evidence";

  if (leftAvailable === rightAvailable && leftProfile.missingCount === rightProfile.missingCount) {
    return "comparable";
  }

  return "partial";
}

function buildMethodologyReferences(
  leftProfile: EntityEvidenceGapProfile,
): ComparisonMethodologyReference[] {
  return leftProfile.gaps.slice(0, 6).map((gap) => ({
    indicatorId: gap.indicatorId,
    indicatorTitle: gap.indicatorTitle,
    whyItExists: gap.requiredMethodology,
    requiredEvidence: gap.requiredEvidence,
    standardReference: `indicator-framework/${gap.domainTitle}/${gap.indicatorId}`,
  }));
}

function buildStandardLimitations(): string[] {
  return [
    "Evidence Comparison shows readiness differences only — not ordinals, evaluative metrics, or investment advice.",
    "Comparison notes describe connection posture — never superiority, inferiority, or policy judgment.",
    "Shared indicators derive from the Global Indicator Framework for this entity type.",
    "Human review is required before using comparison output in any decision context.",
    "Static export — per-entity evidence binding may expand in future releases.",
  ];
}

/** Build comparison record from two entity IDs of the same type. */
export function buildEvidenceComparison(
  leftEntityId: EntityId,
  rightEntityId: EntityId,
): EvidenceComparisonRecord | null {
  const leftEntity = findEntityById(leftEntityId);
  const rightEntity = findEntityById(rightEntityId);

  if (!leftEntity || !rightEntity) return null;
  if (leftEntity.entityType !== rightEntity.entityType) return null;

  const entityType = leftEntity.entityType as ComparisonEntityType;
  const leftLegacy = entityIdToLegacyRegistryId(leftEntityId);
  const rightLegacy = entityIdToLegacyRegistryId(rightEntityId);
  if (!leftLegacy || !rightLegacy) return null;

  const leftProfile = gapProfileForEntity(entityType, leftLegacy);
  const rightProfile = gapProfileForEntity(entityType, rightLegacy);
  if (!leftProfile || !rightProfile) return null;

  const sharedIndicators = leftProfile.gaps.map((g) => g.indicatorId);
  const leftAvailableEvidence = leftProfile.gaps
    .filter((g) => g.currentStatus === "available")
    .map((g) => g.indicatorId);
  const rightAvailableEvidence = rightProfile.gaps
    .filter((g) => g.currentStatus === "available")
    .map((g) => g.indicatorId);
  const leftEvidenceGaps = leftProfile.gaps
    .filter((g) => g.currentStatus !== "available")
    .map((g) => g.indicatorId);
  const rightEvidenceGaps = rightProfile.gaps
    .filter((g) => g.currentStatus !== "available")
    .map((g) => g.indicatorId);

  const leftSources = collectSources(leftProfile);
  const rightSources = collectSources(rightProfile);
  const sharedSources = [...leftSources].filter((id) => rightSources.has(id));
  const allSources = new Set([...leftSources, ...rightSources]);
  const missingSources = [...allSources].filter(
    (id) =>
      !leftProfile.gaps.some(
        (g) => g.expectedSourceId === id && g.currentStatus === "available",
      ) ||
      !rightProfile.gaps.some(
        (g) => g.expectedSourceId === id && g.currentStatus === "available",
      ),
  );

  const readinessStatus = assessReadiness(leftProfile, rightProfile, sharedIndicators);

  return {
    comparisonId: buildComparisonId(
      entityType,
      entitySlug(leftEntityId),
      entitySlug(rightEntityId),
    ),
    leftEntityId,
    rightEntityId,
    leftEntityLabel: leftProfile.entityLabel,
    rightEntityLabel: rightProfile.entityLabel,
    entityType,
    readinessStatus,
    sharedIndicators,
    leftAvailableEvidence,
    rightAvailableEvidence,
    leftEvidenceGaps,
    rightEvidenceGaps,
    sharedSources,
    missingSources,
    indicatorRows: buildIndicatorRows(leftProfile, rightProfile),
    methodologyReferences: buildMethodologyReferences(leftProfile),
    limitations: buildStandardLimitations(),
    humanReviewRequired: true,
    version: COMPARISON_RECORD_VERSION,
  };
}

export function buildComparisonCandidates(
  entityType: ComparisonEntityType,
  excludeEntityId?: EntityId,
): ComparisonCandidate[] {
  return findEntitiesByType(entityType)
    .filter((entity) => entity.entityId !== excludeEntityId)
    .map((entity) => ({
      entityId: entity.entityId,
      legacyId: entityIdToLegacyRegistryId(entity.entityId) ?? entity.slug,
      displayName: entity.displayName,
      entityType,
    }));
}

export function buildComparisonContext(
  entityType: ComparisonEntityType,
  leftLegacyId: string,
): ComparisonContext {
  const leftEntityId =
    entityType === "country"
      ? buildCountryEntityId(leftLegacyId)
      : entityType === "company"
        ? buildCompanyEntityId(leftLegacyId)
        : buildUniversityEntityId(leftLegacyId);

  const leftEntity = findEntityById(leftEntityId);
  const allOfType = findEntitiesByType(entityType);
  const candidates = buildComparisonCandidates(entityType, leftEntityId);

  if (allOfType.length < 2) {
    return {
      entityType,
      leftEntityId,
      leftEntityLabel: leftEntity?.displayName ?? leftLegacyId,
      leftLegacyId,
      candidates: [],
      comparisonAvailable: false,
      unavailableReason: COMPARISON_UNAVAILABLE_FEWER_THAN_TWO,
    };
  }

  return {
    entityType,
    leftEntityId,
    leftEntityLabel: leftEntity?.displayName ?? leftLegacyId,
    leftLegacyId,
    candidates,
    comparisonAvailable: candidates.length > 0,
    unavailableReason: candidates.length === 0 ? COMPARISON_UNAVAILABLE_FEWER_THAN_TWO : null,
  };
}

export function buildEvidenceComparisonModel(
  entityType: ComparisonEntityType,
  leftLegacyId: string,
  rightLegacyId: string | null,
): EvidenceComparisonModel {
  const context = buildComparisonContext(entityType, leftLegacyId);

  if (!context.comparisonAvailable || !rightLegacyId) {
    return {
      context,
      comparison: null,
      unsupportedMessage: context.unavailableReason,
    };
  }

  const rightEntityId =
    entityType === "country"
      ? buildCountryEntityId(rightLegacyId)
      : entityType === "company"
        ? buildCompanyEntityId(rightLegacyId)
        : buildUniversityEntityId(rightLegacyId);

  const leftParsed = findEntityById(context.leftEntityId);
  const rightParsed = findEntityById(rightEntityId);

  if (leftParsed && rightParsed && leftParsed.entityType !== rightParsed.entityType) {
    return {
      context,
      comparison: null,
      unsupportedMessage: COMPARISON_UNSUPPORTED_TYPE_MIX,
    };
  }

  const comparison = buildEvidenceComparison(context.leftEntityId, rightEntityId);

  return {
    context,
    comparison,
    unsupportedMessage: comparison ? null : COMPARISON_UNSUPPORTED_TYPE_MIX,
  };
}

export function isValidComparisonIdFormat(id: string): id is ComparisonId {
  return COMPARISON_ID_PATTERN.test(id);
}

export function defaultComparisonTarget(
  context: ComparisonContext,
): ComparisonCandidate | null {
  return context.candidates[0] ?? null;
}

export type { Country, Company, University };
