/**
 * Domain catalog for Country Intelligence (12 required domains).
 * Labels are UI keys — official source labels stay separate on observations.
 */

import type { CountryIntelligenceDomainId } from "@/lib/country-intelligence/types";
import { COUNTRY_INTELLIGENCE_DOMAINS } from "@/lib/country-intelligence/types";

export type DomainDefinition = {
  readonly id: CountryIntelligenceDomainId;
  readonly labelKey: string;
  readonly overviewKey: string;
  /** Suggested indicator ids for empty slots (definitions only — no values). */
  readonly indicatorIds: readonly string[];
};

export const DOMAIN_DEFINITIONS: readonly DomainDefinition[] = [
  {
    id: "rule_of_law",
    labelKey: "domainRuleOfLaw",
    overviewKey: "domainRuleOfLawOverview",
    indicatorIds: ["rol_overall", "rol_constraints", "rol_absence_corruption"],
  },
  {
    id: "justice",
    labelKey: "domainJustice",
    overviewKey: "domainJusticeOverview",
    indicatorIds: ["judicial_independence", "civil_justice", "criminal_justice"],
  },
  {
    id: "democratic_processes",
    labelKey: "domainDemocratic",
    overviewKey: "domainDemocraticOverview",
    indicatorIds: ["electoral_process", "civic_participation", "political_pluralism"],
  },
  {
    id: "human_rights",
    labelKey: "domainHumanRights",
    overviewKey: "domainHumanRightsOverview",
    indicatorIds: ["civil_liberties", "freedom_expression", "equality_before_law"],
  },
  {
    id: "economy",
    labelKey: "domainEconomy",
    overviewKey: "domainEconomyOverview",
    indicatorIds: ["gdp_growth", "inflation", "employment", "trade_balance", "public_finance"],
  },
  {
    id: "social_conditions",
    labelKey: "domainSocial",
    overviewKey: "domainSocialOverview",
    indicatorIds: ["poverty", "inequality", "social_protection"],
  },
  {
    id: "education_research",
    labelKey: "domainEducation",
    overviewKey: "domainEducationOverview",
    indicatorIds: ["enrollment", "research_output", "tertiary_attainment"],
  },
  {
    id: "health",
    labelKey: "domainHealth",
    overviewKey: "domainHealthOverview",
    indicatorIds: ["life_expectancy", "health_access", "maternal_health"],
  },
  {
    id: "infrastructure",
    labelKey: "domainInfrastructure",
    overviewKey: "domainInfrastructureOverview",
    indicatorIds: ["energy_access", "water_access", "transport"],
  },
  {
    id: "digital_access",
    labelKey: "domainDigital",
    overviewKey: "domainDigitalOverview",
    indicatorIds: ["internet_access", "broadband", "innovation"],
  },
  {
    id: "environment",
    labelKey: "domainEnvironment",
    overviewKey: "domainEnvironmentOverview",
    indicatorIds: ["emissions", "climate_resilience", "air_quality"],
  },
  {
    id: "public_administration",
    labelKey: "domainPublicAdmin",
    overviewKey: "domainPublicAdminOverview",
    indicatorIds: ["institutional_capacity", "public_services", "budget_transparency"],
  },
] as const;

export function isCountryIntelligenceDomainId(value: string): value is CountryIntelligenceDomainId {
  return (COUNTRY_INTELLIGENCE_DOMAINS as readonly string[]).includes(value);
}

export function getDomainDefinition(id: CountryIntelligenceDomainId): DomainDefinition {
  const found = DOMAIN_DEFINITIONS.find((d) => d.id === id);
  if (!found) throw new Error(`Unknown domain: ${id}`);
  return found;
}
