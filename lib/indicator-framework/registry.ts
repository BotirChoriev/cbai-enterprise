import { INDICATOR_DOMAIN_CATALOG } from "@/lib/indicator-framework/domains/catalog";
import { ALL_DOMAIN_INDICATORS } from "@/lib/indicator-framework/indicators/catalog";
import { EVIDENCE_SOURCE_REGISTRY } from "@/lib/indicator-framework/sources/registry";
import { INDICATOR_PERSONA_MAPPING } from "@/lib/indicator-framework/personas/mapping";
import { FUTURE_INTEGRATION_MAP } from "@/lib/indicator-framework/integration/future";
import type {
  IndicatorDefinition,
  IndicatorDomainDefinition,
  IndicatorDomainId,
  IndicatorFrameworkRegistry,
  IndicatorStatus,
  SourceStatus,
} from "@/lib/indicator-framework/types";
import { FRAMEWORK_VERSION } from "@/lib/indicator-framework/types";

/** Assembled global indicator registry — single read-only source of truth. */
export const GLOBAL_INDICATOR_REGISTRY: IndicatorFrameworkRegistry = {
  version: FRAMEWORK_VERSION,
  domains: INDICATOR_DOMAIN_CATALOG,
  indicators: ALL_DOMAIN_INDICATORS,
  sources: EVIDENCE_SOURCE_REGISTRY,
  personas: INDICATOR_PERSONA_MAPPING,
  futureIntegration: FUTURE_INTEGRATION_MAP,
};

export function getIndicatorBySlug(
  slug: string,
): IndicatorDefinition | undefined {
  return ALL_DOMAIN_INDICATORS.find((indicator) => indicator.slug === slug);
}

export function getIndicatorById(id: string): IndicatorDefinition | undefined {
  return ALL_DOMAIN_INDICATORS.find((indicator) => indicator.id === id);
}

export function getIndicatorsByDomain(
  domainId: IndicatorDomainId,
): IndicatorDefinition[] {
  return ALL_DOMAIN_INDICATORS.filter(
    (indicator) => indicator.category === domainId,
  );
}

export function getIndicatorsByStatus(
  status: IndicatorStatus,
): IndicatorDefinition[] {
  return ALL_DOMAIN_INDICATORS.filter((indicator) => indicator.status === status);
}

export function getIndicatorsForEntity(
  entity: IndicatorDefinition["applicableEntities"][number],
): IndicatorDefinition[] {
  return ALL_DOMAIN_INDICATORS.filter((indicator) =>
    indicator.applicableEntities.includes(entity),
  );
}

export function getDomain(
  domainId: IndicatorDomainId,
): IndicatorDomainDefinition | undefined {
  return INDICATOR_DOMAIN_CATALOG.find((domain) => domain.id === domainId);
}

export function getSourcesByStatus(status: SourceStatus) {
  return EVIDENCE_SOURCE_REGISTRY.filter((source) => source.status === status);
}

export function getRegistrySummary() {
  return {
    version: FRAMEWORK_VERSION,
    domainCount: INDICATOR_DOMAIN_CATALOG.length,
    indicatorCount: ALL_DOMAIN_INDICATORS.length,
    sourceCount: EVIDENCE_SOURCE_REGISTRY.length,
    connectedIndicators: getIndicatorsByStatus("connected").length,
    notConnectedIndicators: getIndicatorsByStatus("not_connected").length,
    plannedIndicators: getIndicatorsByStatus("planned").length,
    connectedSources: getSourcesByStatus("connected").length,
    notConnectedSources: getSourcesByStatus("not_connected").length,
  };
}
