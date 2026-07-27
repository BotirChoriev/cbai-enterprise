/**
 * Source registry boundary — UI must not hardcode provider assumptions.
 * Statuses are capability honesty, not live connection claims.
 */

import type { CountryIntelligenceDomainId, SourceRegistryEntry } from "@/lib/country-intelligence/types";
import { COUNTRY_INTELLIGENCE_DOMAINS } from "@/lib/country-intelligence/types";

const ALL = COUNTRY_INTELLIGENCE_DOMAINS;

export const COUNTRY_SOURCE_REGISTRY: readonly SourceRegistryEntry[] = [
  {
    id: "world-bank",
    name: "World Bank Open Data",
    organization: "World Bank",
    status: "available_not_connected",
    website: "https://data.worldbank.org/",
    methodologyUrl: "https://data.worldbank.org/about",
    domains: ["economy", "social_conditions", "education_research", "health", "infrastructure", "environment", "digital_access"],
    licenseNote: "Use only after confirming World Bank API/terms for this deployment.",
  },
  {
    id: "imf",
    name: "IMF Data",
    organization: "International Monetary Fund",
    status: "available_not_connected",
    website: "https://www.imf.org/en/Data",
    methodologyUrl: null,
    domains: ["economy"],
    licenseNote: "Licensing and attribution must be verified before live use.",
  },
  {
    id: "undp",
    name: "UNDP Human Development",
    organization: "UNDP",
    status: "available_not_connected",
    website: "https://hdr.undp.org/",
    methodologyUrl: null,
    domains: ["social_conditions", "education_research", "health"],
    licenseNote: "Verify HDR reuse terms before display.",
  },
  {
    id: "unesco",
    name: "UNESCO Institute for Statistics",
    organization: "UNESCO",
    status: "available_not_connected",
    website: "https://uis.unesco.org/",
    methodologyUrl: null,
    domains: ["education_research"],
    licenseNote: "Verify UIS terms before live connection.",
  },
  {
    id: "who",
    name: "WHO Global Health Observatory",
    organization: "WHO",
    status: "available_not_connected",
    website: "https://www.who.int/data/gho",
    methodologyUrl: null,
    domains: ["health"],
    licenseNote: "Verify WHO data reuse terms.",
  },
  {
    id: "ilo",
    name: "ILOSTAT",
    organization: "ILO",
    status: "available_not_connected",
    website: "https://ilostat.ilo.org/",
    methodologyUrl: null,
    domains: ["economy", "social_conditions"],
    licenseNote: "Verify ILOSTAT terms.",
  },
  {
    id: "oecd",
    name: "OECD Data",
    organization: "OECD",
    status: "available_not_connected",
    website: "https://data.oecd.org/",
    methodologyUrl: null,
    domains: ALL,
    licenseNote: "OECD coverage varies by country; verify terms.",
  },
  {
    id: "idea",
    name: "International IDEA",
    organization: "International IDEA",
    status: "available_not_connected",
    website: "https://www.idea.int/",
    methodologyUrl: null,
    domains: ["democratic_processes", "human_rights", "public_administration"],
    licenseNote: "Democracy indicators require methodology + limitation surfaces.",
  },
  {
    id: "wjp",
    name: "World Justice Project Rule of Law Index",
    organization: "World Justice Project",
    status: "available_not_connected",
    website: "https://worldjusticeproject.org/",
    methodologyUrl: "https://worldjusticeproject.org/rule-of-law-index/methods",
    domains: ["rule_of_law", "justice"],
    licenseNote: "Do not scrape contrary to terms; connect only with verified license.",
  },
  {
    id: "vdem",
    name: "Varieties of Democracy (V-Dem)",
    organization: "V-Dem Institute",
    status: "available_not_connected",
    website: "https://www.v-dem.net/",
    methodologyUrl: null,
    domains: ["democratic_processes", "human_rights", "public_administration"],
    licenseNote: "Political measurements must show methodology, limitations, and dispute notices.",
  },
  {
    id: "national-stats",
    name: "National statistics agencies",
    organization: "National statistical offices",
    status: "available_not_connected",
    website: null,
    methodologyUrl: null,
    domains: ALL,
    licenseNote: "Per-country portals; never invent values from summaries.",
  },
  {
    id: "cbai-registry",
    name: "CBAI country registry",
    organization: "CBAI",
    status: "connected",
    website: null,
    methodologyUrl: null,
    domains: [],
    licenseNote: "Identity and coverage metadata only — not indicator values.",
  },
] as const;

export function listSourcesForDomain(domainId: CountryIntelligenceDomainId): readonly SourceRegistryEntry[] {
  return COUNTRY_SOURCE_REGISTRY.filter((s) => s.domains.includes(domainId) || s.domains.length === 0);
}

export function summarizeSourceCapability(): {
  connected: number;
  availableNotConnected: number;
  notAvailable: number;
} {
  let connected = 0;
  let availableNotConnected = 0;
  let notAvailable = 0;
  for (const s of COUNTRY_SOURCE_REGISTRY) {
    if (s.status === "connected") connected += 1;
    else if (s.status === "available_not_connected" || s.status === "authentication_required") availableNotConnected += 1;
    else if (s.status === "not_available" || s.status === "restricted") notAvailable += 1;
  }
  return { connected, availableNotConnected, notAvailable };
}
