/**
 * Country Intelligence Workspace builder.
 * Composes real local registry facts + honest unavailable states for indicators,
 * plans, research landscape, and laws. Never invents statistics or researchers.
 */

import { countries, type Country } from "@/lib/countries";
import { companies, type Company } from "@/lib/companies";
import { universities, type University } from "@/lib/universities";
import { buildCountryCoverageProfile, COUNTRY_DOMAIN_DISPLAY_ORDER } from "@/lib/countries.coverage";
import type { IndicatorDomainId } from "@/lib/indicator-framework/types";
import { buildTemporalComparison, type TemporalComparison } from "@/lib/domain-intelligence/temporal-comparison";
import { buildDomainRelationship, type DomainRelationshipRecord } from "@/lib/domain-intelligence/typed-relationship";
import { namesMatch } from "@/lib/name-match";

export type CountryDataAvailability = {
  readonly registryPresent: boolean;
  readonly officialWebsiteKnown: boolean;
  readonly relatedUniversities: number;
  readonly relatedCompanies: number;
  readonly indicatorsDefined: number;
  readonly indicatorsConnected: number;
  readonly lastVerification: string | null;
  readonly honestyNotice: string;
};

export type CountryIndicatorSlot = {
  readonly domainId: IndicatorDomainId | string;
  readonly domainTitle: string;
  readonly indicatorId: string;
  readonly indicatorTitle: string;
  readonly statusLabel: string;
  readonly temporal: TemporalComparison;
  readonly requiredSources: readonly string[];
};

export type CountryInstitutionActors = {
  readonly universities: readonly University[];
  readonly companies: readonly Company[];
  readonly ministries: readonly [];
  readonly researchInstitutes: readonly [];
  readonly internationalOrganizations: readonly [];
  readonly knownLinkedProjects: readonly [];
  readonly notice: string;
};

export type CountryIntelligenceWorkspace = {
  readonly country: Country;
  readonly schemaVersion: 1;
  readonly executive: {
    readonly identity: {
      readonly name: string;
      readonly code: string;
      readonly capital: string;
      readonly region: string;
      readonly government: string;
      readonly officialWebsite: string | null;
    };
    readonly dataAvailability: CountryDataAvailability;
    readonly activeQuestions: readonly string[];
    readonly primaryNextAction: {
      readonly kind: "create_evidence_request" | "explore_universities" | "open_sources";
      readonly label: string;
    };
  };
  readonly indicators: readonly CountryIndicatorSlot[];
  readonly institutions: CountryInstitutionActors;
  readonly lawsAndPolicies: {
    readonly records: readonly [];
    readonly notice: string;
  };
  readonly researchLandscape: {
    readonly universities: readonly University[];
    readonly disciplines: readonly [];
    readonly researchers: readonly [];
    readonly projects: readonly [];
    readonly publications: readonly [];
    readonly methods: readonly [];
    readonly datasets: readonly [];
    readonly findings: readonly [];
    readonly contradictions: readonly [];
    readonly notice: string;
  };
  readonly infrastructure: {
    readonly domains: readonly string[];
    readonly notice: string;
  };
  readonly outlook: {
    readonly officialPlans: readonly [];
    readonly scenarios: readonly [];
    readonly dependencies: readonly string[];
    readonly risks: readonly string[];
    readonly notice: string;
  };
  readonly relationships: readonly DomainRelationshipRecord[];
  readonly operationalActions: readonly {
    readonly preset: "evidence_request" | "research_question" | "work_plan" | "report_draft";
    readonly label: string;
  }[];
};

function findCountry(countryIdOrCode: string): Country | undefined {
  const q = countryIdOrCode.trim().toLowerCase();
  return countries.find(
    (c) =>
      c.id.toLowerCase() === q ||
      c.code.toLowerCase() === q ||
      c.name.toLowerCase() === q,
  );
}

export function buildCountryIntelligenceWorkspace(
  countryIdOrCode: string,
): CountryIntelligenceWorkspace | null {
  const country = findCountry(countryIdOrCode);
  if (!country) return null;

  const coverage = buildCountryCoverageProfile(country);
  const linkedUniversities = universities.filter((u) => namesMatch(u.country, country.name));
  const linkedCompanies = companies.filter((c) => namesMatch(c.country, country.name));

  const indicatorSlots: CountryIndicatorSlot[] = [];
  for (const domain of coverage.indicatorsByDomain) {
    for (const indicator of domain.indicators) {
      const temporal = buildTemporalComparison({
        id: `country:${country.id}:indicator:${indicator.id}`,
        subjectLabel: indicator.title,
        geographicScope: country.name,
        fiveYearsAgo: null,
        current: null,
        knowledgeGaps: [
          `No verified time-series is connected for “${indicator.title}” in ${country.name}.`,
          `Required sources (declared, not connected): ${indicator.requiredSources.join(", ") || "none listed"}.`,
          "Do not treat planned connector status as a measured value.",
        ],
      });
      indicatorSlots.push({
        domainId: domain.domainId,
        domainTitle: domain.domainTitle,
        indicatorId: indicator.id,
        indicatorTitle: indicator.title,
        statusLabel: indicator.statusLabel,
        temporal,
        requiredSources: indicator.requiredSources,
      });
    }
  }

  // Prefer a stable domain order for the workspace UI.
  const orderIndex = new Map(COUNTRY_DOMAIN_DISPLAY_ORDER.map((id, i) => [id, i]));
  indicatorSlots.sort((a, b) => {
    const ai = orderIndex.get(a.domainId as IndicatorDomainId) ?? 999;
    const bi = orderIndex.get(b.domainId as IndicatorDomainId) ?? 999;
    if (ai !== bi) return ai - bi;
    return a.indicatorTitle.localeCompare(b.indicatorTitle);
  });

  const graphRels: DomainRelationshipRecord[] = [];
  for (const uni of linkedUniversities) {
    const rel = buildDomainRelationship({
      kind: "LOCATED_IN",
      fromKind: "university",
      fromId: uni.id,
      fromLabel: uni.name,
      toKind: "country",
      toId: country.id,
      toLabel: country.name,
      confidence: "registry_derived",
      provenance: {
        materialClass: "official_source",
        derivedFrom: "local-university-country-match",
        sourceLabel: "CBAI local university registry",
      },
    });
    if (rel) graphRels.push(rel);
  }
  for (const company of linkedCompanies) {
    const rel = buildDomainRelationship({
      kind: "LOCATED_IN",
      fromKind: "company",
      fromId: company.id,
      fromLabel: company.name,
      toKind: "country",
      toId: country.id,
      toLabel: country.name,
      confidence: "registry_derived",
      provenance: {
        materialClass: "official_source",
        derivedFrom: "local-company-country-match",
        sourceLabel: "CBAI local company registry",
      },
    });
    if (rel) graphRels.push(rel);
  }

  const activeQuestions = [
    linkedUniversities.length === 0
      ? `Which universities in ${country.name} are missing from the local registry?`
      : `What research disciplines are active at the ${linkedUniversities.length} registered universities in ${country.name}?`,
    "Which official indicator sources can be connected without fabricating values?",
    "What laws, standards, and official plans apply — and where are the source documents?",
  ];

  const primaryNextAction =
    coverage.evidenceCoverage.connected === 0
      ? {
          kind: "create_evidence_request" as const,
          label: "Create evidence request for a missing indicator source",
        }
      : linkedUniversities.length > 0
        ? {
            kind: "explore_universities" as const,
            label: "Open registered universities for this country",
          }
        : {
            kind: "open_sources" as const,
            label: "Review declared official source coverage",
          };

  return {
    country,
    schemaVersion: 1,
    executive: {
      identity: {
        name: country.name,
        code: country.code,
        capital: country.capital,
        region: country.region,
        government: country.government,
        officialWebsite: country.officialWebsite ?? null,
      },
      dataAvailability: {
        registryPresent: true,
        officialWebsiteKnown: Boolean(country.officialWebsite),
        relatedUniversities: linkedUniversities.length,
        relatedCompanies: linkedCompanies.length,
        indicatorsDefined: indicatorSlots.length,
        indicatorsConnected: coverage.evidenceCoverage.connected,
        lastVerification: null,
        honestyNotice:
          "Indicator definitions and source catalogs are declared locally. Live values, trends, causes, and official plans are not connected unless an adapter returns verified observations.",
      },
      activeQuestions,
      primaryNextAction,
    },
    indicators: indicatorSlots,
    institutions: {
      universities: linkedUniversities,
      companies: linkedCompanies,
      ministries: [],
      researchInstitutes: [],
      internationalOrganizations: [],
      knownLinkedProjects: [],
      notice:
        "Ministries, research institutes, and international organizations are not in the local registry. Only name-matched universities and companies from local catalogs appear here.",
    },
    lawsAndPolicies: {
      records: [],
      notice:
        "No laws or standards records are connected. Do not treat this empty state as a legal conclusion.",
    },
    researchLandscape: {
      universities: linkedUniversities,
      disciplines: [],
      researchers: [],
      projects: [],
      publications: [],
      methods: [],
      datasets: [],
      findings: [],
      contradictions: [],
      notice:
        "Country↔research topic links, researchers, publications, methods, and findings are not connected. University names above come only from the local registry.",
    },
    infrastructure: {
      domains: [
        "transport",
        "energy",
        "water",
        "digital",
        "education",
        "health",
        "research",
      ],
      notice:
        "Infrastructure system panels are structural placeholders. No verified asset inventories are connected.",
    },
    outlook: {
      officialPlans: [],
      scenarios: [],
      dependencies: [
        "Official source adapters for indicators",
        "Publication and academic registry connectors",
      ],
      risks: [
        "Treating planned connectors as measured values",
        "Inferring causation without documented sources",
      ],
      notice:
        "No fabricated forecasts. Official plans require issuing authority, publication date, target date, and source. CBAI scenarios are labeled separately and are never predictions.",
    },
    relationships: graphRels,
    operationalActions: [
      { preset: "evidence_request", label: "Create evidence request" },
      { preset: "research_question", label: "Create research question" },
      { preset: "work_plan", label: "Create work plan" },
      { preset: "report_draft", label: "Create report draft" },
    ],
  };
}

export function listCountryIntelligenceIds(): readonly string[] {
  return countries.map((c) => c.id);
}
