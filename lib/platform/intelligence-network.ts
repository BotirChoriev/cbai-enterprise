import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { ALL_GOVERNANCE_RULES } from "@/lib/governance/registry";

export type IntelligenceHub = {
  id: string;
  label: string;
  count: number;
  unit: string;
  href: string;
};

/**
 * The six real domains CBAI actually connects today, each with its own real registered count —
 * not six countries pretending to be "the network." Previously the homepage's "Living
 * Intelligence Network" only ever drew Countries, which quietly told every visitor CBAI is a
 * country database. It is not: Research, Governance, Countries, Companies, Universities, and
 * Evidence are all real, separately countable registries elsewhere in this same product (Research
 * topic catalog, Governance rule registry, Evidence source catalog). This is the one place that
 * shows all six as one system, at the size CBAI actually is today — never rounded up, never
 * padded with a placeholder domain that has no real registry behind it yet.
 */
export function buildIntelligenceHubs(): readonly IntelligenceHub[] {
  return [
    { id: "research", label: "Research", count: RESEARCH_TOPICS.length, unit: "topics", href: "/research" },
    { id: "governance", label: "Governance", count: ALL_GOVERNANCE_RULES.length, unit: "rules", href: "/ai-control" },
    { id: "countries", label: "Countries", count: countries.length, unit: "countries", href: "/countries" },
    { id: "companies", label: "Companies", count: companies.length, unit: "companies", href: "/companies" },
    { id: "universities", label: "Universities", count: universities.length, unit: "universities", href: "/universities" },
    { id: "evidence", label: "Evidence", count: OFFICIAL_EVIDENCE_SOURCES.length, unit: "sources", href: "/knowledge" },
  ];
}

export function totalIntelligenceItems(hubs: readonly IntelligenceHub[]): number {
  return hubs.reduce((sum, hub) => sum + hub.count, 0);
}
