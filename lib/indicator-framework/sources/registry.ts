import type { EvidenceSourceDefinition } from "@/lib/indicator-framework/types";

/**
 * Evidence source registry — declared only. No API connections.
 */
export const EVIDENCE_SOURCE_REGISTRY: readonly EvidenceSourceDefinition[] = [
  {
    id: "src-un",
    slug: "united-nations",
    name: "United Nations",
    description: "UN statistical and governance datasets.",
    status: "not_connected",
    examples: ["UN Data", "UNSD", "UN Treaty Collection"],
  },
  {
    id: "src-world-bank",
    slug: "world-bank",
    name: "World Bank",
    description: "Macroeconomic and development indicators.",
    status: "not_connected",
    examples: ["World Development Indicators", "Doing Business archives"],
  },
  {
    id: "src-imf",
    slug: "imf",
    name: "International Monetary Fund",
    description: "Fiscal and financial stability datasets.",
    status: "not_connected",
    examples: ["IMF Data", "World Economic Outlook"],
  },
  {
    id: "src-who",
    slug: "who",
    name: "World Health Organization",
    description: "Global health statistics and policy references.",
    status: "not_connected",
    examples: ["Global Health Observatory"],
  },
  {
    id: "src-unesco",
    slug: "unesco",
    name: "UNESCO",
    description: "Education and culture statistics.",
    status: "not_connected",
    examples: ["UIS", "World Heritage"],
  },
  {
    id: "src-ilo",
    slug: "ilo",
    name: "International Labour Organization",
    description: "Labour market and employment statistics.",
    status: "not_connected",
    examples: ["ILOSTAT"],
  },
  {
    id: "src-itu",
    slug: "itu",
    name: "International Telecommunication Union",
    description: "Digital connectivity and ICT statistics.",
    status: "not_connected",
    examples: ["ICT Development Index data"],
  },
  {
    id: "src-oecd",
    slug: "oecd",
    name: "OECD",
    description: "Policy and economic comparative datasets.",
    status: "not_connected",
    examples: ["OECD.Stat", "PISA"],
  },
  {
    id: "src-ocp",
    slug: "open-contracting-partnership",
    name: "Open Contracting Partnership",
    description: "Procurement transparency standards and OCDS.",
    status: "not_connected",
    examples: ["OCDS", "Contract registers"],
  },
  {
    id: "src-nso",
    slug: "national-statistics-offices",
    name: "National Statistics Offices",
    description: "Official national statistical publications.",
    status: "not_connected",
    examples: ["Census bureaus", "National accounts"],
  },
  {
    id: "src-procurement-portals",
    slug: "official-procurement-portals",
    name: "Official Procurement Portals",
    description: "Government tender and contract disclosure systems.",
    status: "not_connected",
    examples: ["E-procurement platforms", "Tender registries"],
  },
  {
    id: "src-open-budget",
    slug: "national-open-budget-portals",
    name: "National Open Budget Portals",
    description: "Published budget documents and execution reports.",
    status: "not_connected",
    examples: ["Open budget portals", "Audit reports"],
  },
  {
    id: "src-cbai-local-registry",
    slug: "cbai-local-registry",
    name: "CBAI Local Platform Registry",
    description: "Factual entity catalogs maintained on-platform.",
    status: "connected",
    examples: ["Country registry", "Company catalog", "University catalog"],
  },
] as const;

export function getEvidenceSourceBySlug(
  slug: string,
): EvidenceSourceDefinition | undefined {
  return EVIDENCE_SOURCE_REGISTRY.find((source) => source.slug === slug);
}

export function getSourcesByStatus(
  status: EvidenceSourceDefinition["status"],
): EvidenceSourceDefinition[] {
  return EVIDENCE_SOURCE_REGISTRY.filter((source) => source.status === status);
}
