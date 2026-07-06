import { getIndicatorBySlug } from "@/lib/indicator-framework";
import type {
  ConnectorCatalogEntry,
  ConnectorDefinition,
  ConnectorId,
  ConnectorRegistry,
} from "@/lib/connectors/connector-types";
import { CONNECTOR_RECORD_VERSION } from "@/lib/connectors/connector-types";
import { CONNECTOR_REGISTRY_VERSION } from "@/lib/connectors/connector-version";

export const CONNECTOR_ID_PATTERN = /^connector-([a-z0-9-]+)$/;

/** Build a permanent connector ID from stable slug — never random. */
export function buildConnectorId(slug: string): ConnectorId {
  return `connector-${slug}` as ConnectorId;
}

export function parseConnectorId(
  connectorId: string,
): { slug: string } | null {
  const match = CONNECTOR_ID_PATTERN.exec(connectorId);
  if (!match) return null;
  return { slug: match[1] };
}

export function isValidConnectorIdFormat(connectorId: string): boolean {
  return CONNECTOR_ID_PATTERN.test(connectorId);
}

function resolveIndicatorIds(slugs: readonly string[]): string[] {
  return slugs
    .map((slug) => getIndicatorBySlug(slug))
    .filter((indicator): indicator is NonNullable<typeof indicator> => indicator !== undefined)
    .map((indicator) => indicator.id);
}

/** Official evidence connector catalog entries — architecture only. */
export const CONNECTOR_CATALOG_ENTRIES: readonly ConnectorCatalogEntry[] = [
  {
    slug: "world-bank",
    connectorName: "World Bank",
    organization: "World Bank Group",
    officialWebsite: "https://www.worldbank.org",
    coverageSummary: "Global — macroeconomic, development, and infrastructure indicators",
    supportedCountries: ["global"],
    supportedLanguages: ["en", "multilingual"],
    supportedEntities: ["country", "government", "institution"],
    supportedIndicatorSlugs: [
      "national-accounts",
      "budget-document-publication",
      "fdi-registration",
      "infrastructure-asset-registry",
      "energy-mix-disclosure",
    ],
    capabilities: ["indicators", "evidence", "datasets", "reports", "timeline"],
    authentication: {
      kind: "api_key_vault",
      description: "World Bank Open Data API key — stored in future credential vault only.",
      vaultKeyRef: "connectors/world-bank/api-key",
    },
    rateLimits: {
      description: "Per World Bank Open Data API fair-use policy.",
      requestsPerMinute: 60,
      requestsPerDay: 10_000,
    },
    updateFrequency: "Annual and quarterly for WDI; ad hoc for reports",
    license: "World Bank Open Data Terms of Use",
    status: "planned",
    evidenceSourceId: "src-world-bank",
    evidenceSourceSlug: "world-bank",
    registryEntityTypes: ["country"],
  },
  {
    slug: "united-nations",
    connectorName: "United Nations",
    organization: "United Nations",
    officialWebsite: "https://www.un.org",
    coverageSummary: "Global — statistical, treaty, climate, and humanitarian datasets",
    supportedCountries: ["global"],
    supportedLanguages: ["en", "fr", "es", "ar", "zh", "ru", "multilingual"],
    supportedEntities: ["country", "government", "institution"],
    supportedIndicatorSlugs: [
      "institutional-framework",
      "human-rights-treaty-reporting",
      "trade-flow-disclosure",
      "agriculture-production",
      "emissions-inventory",
      "ndc-submission",
      "sendai-framework-reporting",
      "patent-filing-disclosure",
    ],
    capabilities: ["indicators", "evidence", "datasets", "reports", "timeline"],
    authentication: {
      kind: "none",
      description: "Most UN datasets are open access; authenticated endpoints use vault in future.",
    },
    rateLimits: {
      description: "Per dataset publisher fair-use terms.",
      requestsPerMinute: 30,
    },
    updateFrequency: "Varies by dataset — annual to real-time for some registries",
    license: "UN data terms — per dataset",
    status: "planned",
    evidenceSourceId: "src-un",
    evidenceSourceSlug: "united-nations",
    registryEntityTypes: ["country"],
  },
  {
    slug: "imf",
    connectorName: "IMF",
    organization: "International Monetary Fund",
    officialWebsite: "https://www.imf.org",
    coverageSummary: "Global — fiscal, financial, and balance-of-payments statistics",
    supportedCountries: ["global"],
    supportedLanguages: ["en", "multilingual"],
    supportedEntities: ["country", "government", "institution"],
    supportedIndicatorSlugs: ["national-accounts", "fdi-registration"],
    capabilities: ["indicators", "evidence", "datasets", "reports", "timeline"],
    authentication: {
      kind: "api_key_vault",
      description: "IMF Data API credentials — vault-provisioned in future implementation.",
      vaultKeyRef: "connectors/imf/api-key",
    },
    rateLimits: {
      description: "Per IMF Data Terms and Conditions.",
      requestsPerMinute: 30,
    },
    updateFrequency: "Quarterly and annual publications",
    license: "IMF Data Terms and Conditions",
    status: "planned",
    evidenceSourceId: "src-imf",
    evidenceSourceSlug: "imf",
    registryEntityTypes: ["country"],
  },
  {
    slug: "who",
    connectorName: "WHO",
    organization: "World Health Organization",
    officialWebsite: "https://www.who.int",
    coverageSummary: "Global — health statistics and policy references",
    supportedCountries: ["global"],
    supportedLanguages: ["en", "fr", "es", "ar", "ru", "zh", "multilingual"],
    supportedEntities: ["country", "government", "institution"],
    supportedIndicatorSlugs: ["health-system-coverage"],
    capabilities: ["indicators", "evidence", "datasets", "reports", "timeline"],
    authentication: {
      kind: "none",
      description: "Global Health Observatory open data — no credentials in v1 architecture.",
    },
    rateLimits: {
      description: "Per WHO Data Policy fair-use guidance.",
      requestsPerMinute: 30,
    },
    updateFrequency: "Annual Global Health Observatory updates",
    license: "WHO Data Policy",
    status: "planned",
    evidenceSourceId: "src-who",
    evidenceSourceSlug: "who",
    registryEntityTypes: ["country"],
  },
  {
    slug: "unesco",
    connectorName: "UNESCO",
    organization: "United Nations Educational, Scientific and Cultural Organization",
    officialWebsite: "https://www.unesco.org",
    coverageSummary: "Global — education, science, and culture statistics",
    supportedCountries: ["global"],
    supportedLanguages: ["en", "fr", "multilingual"],
    supportedEntities: ["country", "university", "institution"],
    supportedIndicatorSlugs: [
      "education-enrollment-statistics",
      "research-output-disclosure",
    ],
    capabilities: ["indicators", "evidence", "datasets", "reports", "timeline"],
    authentication: {
      kind: "none",
      description: "UNESCO UIS open data — authenticated APIs vault-provisioned in future.",
    },
    rateLimits: {
      description: "Per UNESCO Open Data terms.",
      requestsPerMinute: 30,
    },
    updateFrequency: "Annual UIS releases",
    license: "UNESCO Open Data",
    status: "planned",
    evidenceSourceId: "src-unesco",
    evidenceSourceSlug: "unesco",
    registryEntityTypes: ["country", "university"],
  },
  {
    slug: "oecd",
    connectorName: "OECD",
    organization: "Organisation for Economic Co-operation and Development",
    officialWebsite: "https://www.oecd.org",
    coverageSummary: "OECD member and partner economies — policy and economic data",
    supportedCountries: ["global"],
    supportedLanguages: ["en", "fr", "multilingual"],
    supportedEntities: ["country", "company", "institution"],
    supportedIndicatorSlugs: ["industry-classification", "research-output-disclosure"],
    capabilities: ["indicators", "evidence", "datasets", "reports", "timeline"],
    authentication: {
      kind: "oauth2",
      description: "OECD.Stat OAuth2 — credentials stored in future vault only.",
      vaultKeyRef: "connectors/oecd/oauth2",
    },
    rateLimits: {
      description: "Per OECD Terms and Conditions.",
      requestsPerMinute: 20,
    },
    updateFrequency: "Varies by dataset — quarterly to annual",
    license: "OECD Terms and Conditions",
    status: "planned",
    evidenceSourceId: "src-oecd",
    evidenceSourceSlug: "oecd",
    registryEntityTypes: ["country", "company"],
  },
  {
    slug: "open-budget",
    connectorName: "Open Budget",
    organization: "Ministries of finance and audit institutions (per country)",
    officialWebsite: "https://internationalbudget.org/open-budget-survey/",
    coverageSummary: "National — budget documents and execution reports",
    supportedCountries: ["per-country"],
    supportedLanguages: ["multilingual"],
    supportedEntities: ["country", "government", "institution"],
    supportedIndicatorSlugs: ["budget-document-publication"],
    capabilities: ["indicators", "evidence", "datasets", "reports"],
    authentication: {
      kind: "custom",
      description: "Per-portal access models — no credentials in platform code.",
    },
    rateLimits: {
      description: "Per national portal publication policy.",
    },
    updateFrequency: "Annual budget cycles; mid-year reviews",
    license: "Government publication terms — per country",
    status: "planned",
    evidenceSourceId: "src-open-budget",
    evidenceSourceSlug: "national-open-budget-portals",
    registryEntityTypes: ["country"],
  },
  {
    slug: "national-statistics",
    connectorName: "National Statistics",
    organization: "National statistical authorities (per country)",
    officialWebsite: "https://unstats.un.org/home/nso-sites/",
    coverageSummary: "National — official statistics per sovereign state",
    supportedCountries: ["per-country"],
    supportedLanguages: ["multilingual"],
    supportedEntities: ["country", "government", "institution"],
    supportedIndicatorSlugs: [
      "institutional-framework",
      "national-accounts",
      "labour-market-statistics",
      "education-enrollment-statistics",
      "agriculture-production",
      "infrastructure-asset-registry",
      "emissions-inventory",
      "energy-mix-disclosure",
      "health-system-coverage",
      "digital-connectivity",
      "public-service-coverage",
      "judicial-independence-disclosure",
    ],
    capabilities: ["registry", "indicators", "evidence", "datasets", "reports", "timeline"],
    authentication: {
      kind: "custom",
      description: "Per NSO portal access — vault binding in future implementation.",
    },
    rateLimits: {
      description: "Per NSO publication and API policy.",
    },
    updateFrequency: "Per NSO publication calendar",
    license: "National open data terms — per country",
    status: "planned",
    evidenceSourceId: "src-nso",
    evidenceSourceSlug: "national-statistics-offices",
    registryEntityTypes: ["country"],
  },
  {
    slug: "national-procurement",
    connectorName: "National Procurement",
    organization: "Government procurement authorities (per country)",
    officialWebsite: "https://www.open-contracting.org/what-is-open-contracting/ocds/",
    coverageSummary: "National — tender and award disclosure systems",
    supportedCountries: ["per-country"],
    supportedLanguages: ["multilingual"],
    supportedEntities: ["country", "government", "institution"],
    supportedIndicatorSlugs: ["procurement-disclosure-coverage"],
    capabilities: ["indicators", "evidence", "datasets", "reports", "timeline"],
    authentication: {
      kind: "custom",
      description: "Per procurement portal access — no credentials in v1 architecture.",
    },
    rateLimits: {
      description: "Per portal publication cycles.",
    },
    updateFrequency: "Continuous tender publication cycles",
    license: "Government open data terms — per portal",
    status: "planned",
    evidenceSourceId: "src-procurement-portals",
    evidenceSourceSlug: "official-procurement-portals",
    registryEntityTypes: ["country"],
  },
  {
    slug: "national-open-data",
    connectorName: "National Open Data",
    organization: "National open data portals (per country)",
    officialWebsite: "https://data.gov/",
    coverageSummary: "National — sovereign open data portal catalogs",
    supportedCountries: ["per-country"],
    supportedLanguages: ["multilingual"],
    supportedEntities: ["country", "government", "institution"],
    supportedIndicatorSlugs: [
      "institutional-framework",
      "public-service-coverage",
      "digital-connectivity",
    ],
    capabilities: ["registry", "indicators", "evidence", "datasets", "reports"],
    authentication: {
      kind: "custom",
      description: "Per national open data portal — vault binding reserved for future.",
    },
    rateLimits: {
      description: "Per national open data portal policy.",
    },
    updateFrequency: "Continuous portal updates",
    license: "National open data terms — per country",
    status: "planned",
    evidenceSourceSlug: "national-open-data",
    registryEntityTypes: ["country"],
  },
  {
    slug: "cbai-local-registry",
    connectorName: "CBAI Local Registry",
    organization: "CBAI Enterprise",
    officialWebsite: "https://cbai.enterprise",
    coverageSummary: "On-platform entity catalogs — countries, companies, universities",
    supportedCountries: ["global"],
    supportedLanguages: ["en"],
    supportedEntities: ["country", "company", "university"],
    supportedIndicatorSlugs: [
      "industry-classification",
      "education-enrollment-statistics",
      "research-output-disclosure",
    ],
    capabilities: ["registry", "indicators", "evidence"],
    authentication: {
      kind: "none",
      description: "Local platform registry — no external network or credentials.",
    },
    rateLimits: {
      description: "In-process registry reads — no external rate limits.",
    },
    updateFrequency: "Platform release cycle",
    license: "CBAI Platform Terms",
    status: "connected",
    evidenceSourceId: "src-cbai-local-registry",
    evidenceSourceSlug: "cbai-local-registry",
    registryEntityTypes: ["country", "company", "university"],
  },
] as const;

/** Materialize a full connector definition from a catalog entry. */
export function buildConnectorDefinition(entry: ConnectorCatalogEntry): ConnectorDefinition {
  const connectorId = buildConnectorId(entry.slug);
  const supportedIndicators = resolveIndicatorIds(entry.supportedIndicatorSlugs);

  return {
    connectorId,
    connectorName: entry.connectorName,
    organization: entry.organization,
    officialWebsite: entry.officialWebsite,
    coverage: {
      summary: entry.coverageSummary,
      supportedCountries: [...entry.supportedCountries],
      supportedLanguages: [...entry.supportedLanguages],
    },
    supportedEntities: [...entry.supportedEntities],
    supportedIndicators,
    authentication: entry.authentication,
    rateLimits: entry.rateLimits,
    updateFrequency: entry.updateFrequency,
    license: entry.license,
    capabilities: [...entry.capabilities],
    status: entry.status ?? "planned",
    version: CONNECTOR_RECORD_VERSION,
    evidenceSourceId: entry.evidenceSourceId,
    evidenceSourceSlug: entry.evidenceSourceSlug,
    registryEntityTypes: [...(entry.registryEntityTypes ?? ["country"])],
    missionIds: [],
  };
}

/** Build the full official evidence connector registry. */
export function buildConnectorRegistry(): ConnectorRegistry {
  const connectors = CONNECTOR_CATALOG_ENTRIES.map(buildConnectorDefinition);

  const byStatus: Partial<Record<ConnectorDefinition["status"], number>> = {};
  const byCapability: Partial<Record<ConnectorDefinition["capabilities"][number], number>> = {};

  for (const connector of connectors) {
    byStatus[connector.status] = (byStatus[connector.status] ?? 0) + 1;
    for (const capability of connector.capabilities) {
      byCapability[capability] = (byCapability[capability] ?? 0) + 1;
    }
  }

  return {
    version: CONNECTOR_REGISTRY_VERSION,
    connectorRecordVersion: CONNECTOR_RECORD_VERSION,
    builtAt: new Date().toISOString(),
    connectors,
    connectorCount: connectors.length,
    byStatus,
    byCapability,
  };
}
