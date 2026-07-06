/**
 * CBAI UN / Human Rights Connector Readiness — CBAI Indicator Framework mapping.
 */

import { getIndicatorById } from "@/lib/indicator-framework";
import { UN_HUMAN_RIGHTS_INDICATOR_FAMILIES } from "@/lib/connectors/un-human-rights/un-human-rights.indicators";
import type {
  UnHumanRightsIndicatorCodeRef,
  UnHumanRightsIndicatorFamily,
  UnHumanRightsMappedIndicator,
  UnHumanRightsUnmappedIndicator,
} from "@/lib/connectors/un-human-rights/un-human-rights.types";

const CODE_TO_FAMILY = buildIndicatorCodeIndex(UN_HUMAN_RIGHTS_INDICATOR_FAMILIES);

function buildIndicatorCodeIndex(
  families: readonly UnHumanRightsIndicatorFamily[],
): ReadonlyMap<UnHumanRightsIndicatorCodeRef, UnHumanRightsIndicatorFamily> {
  const map = new Map<UnHumanRightsIndicatorCodeRef, UnHumanRightsIndicatorFamily>();

  for (const family of families) {
    for (const code of family.referenceIndicatorCodes) {
      map.set(code, family);
    }
  }

  return map;
}

export function resolveUnHumanRightsIndicatorFamily(
  indicatorCode: string,
): UnHumanRightsIndicatorFamily | undefined {
  return CODE_TO_FAMILY.get(indicatorCode as UnHumanRightsIndicatorCodeRef);
}

export function resolveCbaiIndicatorIdFromUnHumanRightsCode(
  indicatorCode: string,
): string | null {
  const family = resolveUnHumanRightsIndicatorFamily(indicatorCode);
  if (!family || family.mappingStatus !== "mapped") return null;
  return family.cbaiIndicatorId;
}

export function getMappedUnHumanRightsIndicators(): readonly UnHumanRightsMappedIndicator[] {
  return UN_HUMAN_RIGHTS_INDICATOR_FAMILIES.filter(
    (family): family is UnHumanRightsIndicatorFamily & {
      mappingStatus: "mapped";
      cbaiIndicatorId: string;
      cbaiIndicatorSlug: string;
    } =>
      family.mappingStatus === "mapped" &&
      family.cbaiIndicatorId !== null &&
      family.cbaiIndicatorSlug !== null,
  ).map((family) => ({
    familyId: family.familyId,
    area: family.area,
    cbaiIndicatorId: family.cbaiIndicatorId,
    cbaiIndicatorSlug: family.cbaiIndicatorSlug,
    referenceIndicatorCodes: family.referenceIndicatorCodes,
    sourceFamilies: family.sourceFamilies,
  }));
}

export function getUnmappedUnHumanRightsIndicators(): readonly UnHumanRightsUnmappedIndicator[] {
  return UN_HUMAN_RIGHTS_INDICATOR_FAMILIES.filter(
    (family) => family.mappingStatus !== "mapped",
  ).map((family) => ({
    familyId: family.familyId,
    area: family.area,
    mappingStatus: family.mappingStatus as UnHumanRightsUnmappedIndicator["mappingStatus"],
    mappingNotes: family.mappingNotes,
    referenceIndicatorCodes: family.referenceIndicatorCodes,
    sourceFamilies: family.sourceFamilies,
  }));
}

export function getSupportedUnHumanRightsCbaiIndicatorIds(): readonly string[] {
  const ids = new Set<string>();

  for (const mapped of getMappedUnHumanRightsIndicators()) {
    if (getIndicatorById(mapped.cbaiIndicatorId)) {
      ids.add(mapped.cbaiIndicatorId);
    }
  }

  return [...ids];
}

export function isUnHumanRightsCodeMapped(indicatorCode: string): boolean {
  return resolveCbaiIndicatorIdFromUnHumanRightsCode(indicatorCode) !== null;
}

export { CODE_TO_FAMILY as UN_HUMAN_RIGHTS_INDICATOR_CODE_INDEX };
