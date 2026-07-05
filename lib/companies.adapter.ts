import type { Company } from "@/lib/companies";
import type {
  Entity,
  EntityMetadataField,
  EntityTimelineEvent,
} from "@/lib/entity/entity.types";

/** Ordered metadata fields for company entity overview grid */
export const COMPANY_METADATA_FIELDS: EntityMetadataField[] = [
  { key: "country", label: "Country" },
  { key: "ceo", label: "CEO" },
  { key: "founded", label: "Founded" },
  { key: "employees", label: "Employees" },
  { key: "revenue", label: "Revenue" },
  { key: "marketCap", label: "Market Cap" },
  { key: "industry", label: "Industry" },
  { key: "technologyLevel", label: "Technology Level" },
];

/** Generate timeline events from company domain data */
function buildCompanyTimeline(company: Company): EntityTimelineEvent[] {
  return [
    {
      id: `${company.id}-founded`,
      title: "Company Founded",
      description: `${company.name} established in ${company.founded}`,
      date: String(company.founded),
      type: "milestone",
    },
    {
      id: `${company.id}-leadership`,
      title: "Current Leadership",
      description: `${company.ceo} serving as CEO`,
      date: "Present",
      type: "update",
    },
    {
      id: `${company.id}-ai`,
      title: "AI Strategy Active",
      description: `AI Readiness score: ${company.aiReadiness}/100`,
      date: "2026",
      type: "analysis",
    },
  ];
}

/**
 * Adapter: maps Company domain model → universal Entity interface.
 * All company presentation flows through this function.
 */
export function toCompanyEntity(company: Company): Entity {
  return {
    id: company.id,
    type: "company",
    name: company.name,
    icon: company.icon,
    category: company.industry,
    subtitle: `${company.country} · Est. ${company.founded}`,
    overview: company.overview,
    status: "active",
    scores: {
      aiScore: company.aiReadiness,
      investmentScore: company.investmentScore,
      riskScore: company.riskScore,
    },
    tags: company.products.map((product, i) => ({
      id: `${company.id}-product-${i}`,
      label: product,
      variant: i === 0 ? "accent" : "default",
    })),
    timeline: buildCompanyTimeline(company),
    aiSummary: company.aiSummary,
    metadata: {
      country: company.country,
      ceo: company.ceo,
      founded: company.founded,
      employees: company.employees.toLocaleString(),
      revenue: company.revenue,
      marketCap: company.marketCap,
      industry: company.industry,
      technologyLevel: company.technologyLevel,
      innovationScore: company.innovationScore,
    },
    metrics: [
      {
        id: "revenue",
        label: "Revenue",
        value: company.revenue,
        highlight: true,
      },
      {
        id: "marketCap",
        label: "Market Cap",
        value: company.marketCap,
        change: "↑ YoY",
        changeType: "positive",
      },
      {
        id: "employees",
        label: "Employees",
        value: company.employees.toLocaleString(),
      },
      {
        id: "innovation",
        label: "Innovation Score",
        value: company.innovationScore,
        unit: "/100",
        change: "Industry leading",
        changeType: "positive",
      },
      {
        id: "aiReadiness",
        label: "AI Readiness",
        value: company.aiReadiness,
        unit: "/100",
      },
      {
        id: "founded",
        label: "Founded",
        value: company.founded,
      },
    ],
  };
}

/** Batch adapter for list operations and cross-entity queries */
export function toCompanyEntities(companies: Company[]): Entity[] {
  return companies.map(toCompanyEntity);
}
