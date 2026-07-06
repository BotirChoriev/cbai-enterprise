/**
 * CBAI World Bank Connector Readiness — CBAI Indicator Framework mapping.
 * Resolves families to mapped and unmapped indicator sets.
 */

import { getIndicatorById } from "@/lib/indicator-framework";
import { WORLD_BANK_INDICATOR_FAMILIES } from "@/lib/connectors/world-bank/world-bank.indicators";
import type {
  WorldBankIndicatorCodeRef,
  WorldBankIndicatorFamily,
  WorldBankMappedIndicator,
  WorldBankUnmappedIndicator,
} from "@/lib/connectors/world-bank/world-bank.types";

const CODE_TO_FAMILY = buildIndicatorCodeIndex(WORLD_BANK_INDICATOR_FAMILIES);

function buildIndicatorCodeIndex(
  families: readonly WorldBankIndicatorFamily[],
): ReadonlyMap<WorldBankIndicatorCodeRef, WorldBankIndicatorFamily> {
  const map = new Map<WorldBankIndicatorCodeRef, WorldBankIndicatorFamily>();

  for (const family of families) {
    for (const code of family.referenceIndicatorCodes) {
      map.set(code, family);
    }
  }

  return map;
}

/** Resolve a WDI indicator code reference to its family definition. */
export function resolveWorldBankIndicatorFamily(
  indicatorCode: string,
): WorldBankIndicatorFamily | undefined {
  return CODE_TO_FAMILY.get(indicatorCode as WorldBankIndicatorCodeRef);
}

/** Resolve a WDI code to CBAI indicator ID when mapping status is mapped. */
export function resolveCbaiIndicatorIdFromWorldBankCode(
  indicatorCode: string,
): string | null {
  const family = resolveWorldBankIndicatorFamily(indicatorCode);
  if (!family || family.mappingStatus !== "mapped") return null;
  return family.cbaiIndicatorId;
}

export function getMappedWorldBankIndicators(): readonly WorldBankMappedIndicator[] {
  return WORLD_BANK_INDICATOR_FAMILIES.filter(
    (family): family is WorldBankIndicatorFamily & {
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
  }));
}

export function getUnmappedWorldBankIndicators(): readonly WorldBankUnmappedIndicator[] {
  return WORLD_BANK_INDICATOR_FAMILIES.filter(
    (family) => family.mappingStatus !== "mapped",
  ).map((family) => ({
    familyId: family.familyId,
    area: family.area,
    mappingStatus: family.mappingStatus as WorldBankUnmappedIndicator["mappingStatus"],
    mappingNotes: family.mappingNotes,
    referenceIndicatorCodes: family.referenceIndicatorCodes,
  }));
}

/** Unique CBAI indicator IDs supported by mapped World Bank families. */
export function getSupportedCbaiIndicatorIds(): readonly string[] {
  const ids = new Set<string>();

  for (const mapped of getMappedWorldBankIndicators()) {
    if (getIndicatorById(mapped.cbaiIndicatorId)) {
      ids.add(mapped.cbaiIndicatorId);
    }
  }

  return [...ids];
}

/** Check whether a WDI code has a mapped CBAI indicator target. */
export function isWorldBankCodeMapped(indicatorCode: string): boolean {
  return resolveCbaiIndicatorIdFromWorldBankCode(indicatorCode) !== null;
}

export { CODE_TO_FAMILY as WORLD_BANK_INDICATOR_CODE_INDEX };
