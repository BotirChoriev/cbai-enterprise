import type { Country } from "@/lib/countries";
import type {
  Entity,
  EntityMetadataField,
  EntityTimelineEvent,
} from "@/lib/entity/entity.types";

/** Cross-entity relationship graph for a country */
export type CountryRelationships = {
  relatedCompanies: string[];
  universities: string[];
  government: string[];
  industries: string[];
};

/** Ordered metadata fields for country entity overview grid */
export const COUNTRY_METADATA_FIELDS: EntityMetadataField[] = [
  { key: "region", label: "Region" },
  { key: "capital", label: "Capital" },
  { key: "gdp", label: "GDP" },
  { key: "population", label: "Population" },
  { key: "government", label: "Government" },
  { key: "technologyLevel", label: "Technology Level" },
];

/** Related companies keyed by country id — aligns with Companies module */
const relatedCompaniesByCountry: Record<string, string[]> = {
  usa: ["Apple", "Microsoft", "Google", "NVIDIA", "Amazon", "OpenAI"],
  china: ["Google", "Samsung", "Tesla", "Amazon", "Microsoft"],
  uzbekistan: ["Samsung", "Microsoft", "Google"],
  germany: ["Tesla", "Amazon", "Microsoft", "Apple", "NVIDIA"],
  uae: ["Amazon", "Google", "Microsoft", "OpenAI", "Apple"],
  japan: ["Tesla", "Samsung", "NVIDIA", "Amazon", "Apple"],
};

/** Build relationship graph from existing country domain fields */
export function getCountryRelationships(country: Country): CountryRelationships {
  return {
    relatedCompanies: relatedCompaniesByCountry[country.id] ?? [],
    universities: country.universities,
    government: [country.government],
    industries: country.topIndustries,
  };
}

function buildCountryTimeline(country: Country): EntityTimelineEvent[] {
  return [
    {
      id: `${country.id}-economy`,
      title: "Economic Profile",
      description: `GDP ${country.gdp} · Population ${country.population}`,
      date: "2026",
      type: "update",
    },
    {
      id: `${country.id}-ai`,
      title: "AI Readiness Assessment",
      description: `Score: ${country.aiReadiness}/100 · ${country.technologyLevel}`,
      date: "2026",
      type: "analysis",
    },
    {
      id: `${country.id}-region`,
      title: "Regional Classification",
      description: `${country.region} · Capital: ${country.capital}`,
      date: "Active",
      type: "milestone",
    },
  ];
}

/**
 * Adapter: maps Country domain model → universal Entity interface.
 * All country presentation flows through this function.
 */
export function toCountryEntity(country: Country): Entity {
  return {
    id: country.id,
    type: "country",
    name: country.name,
    icon: country.code,
    category: country.region,
    subtitle: `${country.capital} · ${country.region}`,
    overview: country.economy,
    status: "active",
    scores: {
      aiScore: country.aiReadiness,
      investmentScore: country.investmentScore,
      riskScore: country.riskScore,
    },
    tags: country.topIndustries.map((industry, i) => ({
      id: `${country.id}-industry-${i}`,
      label: industry,
      variant: i === 0 ? "accent" : "default",
    })),
    timeline: buildCountryTimeline(country),
    aiSummary: country.aiSummary,
    metadata: {
      region: country.region,
      capital: country.capital,
      gdp: country.gdp,
      population: country.population,
      government: country.government,
      technologyLevel: country.technologyLevel,
    },
    metrics: [
      {
        id: "gdp",
        label: "GDP",
        value: country.gdp,
        highlight: true,
      },
      {
        id: "population",
        label: "Population",
        value: country.population,
      },
      {
        id: "aiReadiness",
        label: "AI Readiness",
        value: country.aiReadiness,
        unit: "/100",
        change: "CBAI assessed",
        changeType: "positive",
      },
      {
        id: "investmentScore",
        label: "Investment Score",
        value: country.investmentScore,
        unit: "/100",
      },
      {
        id: "opportunities",
        label: "Business Opportunities",
        value: country.businessOpportunities.length,
        unit: "identified",
      },
      {
        id: "universities",
        label: "Leading Universities",
        value: country.universities.length,
        unit: "tracked",
      },
    ],
  };
}

/** Batch adapter for list operations and cross-entity queries */
export function toCountryEntities(countries: Country[]): Entity[] {
  return countries.map(toCountryEntity);
}
