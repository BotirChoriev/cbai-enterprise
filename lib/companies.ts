/**
 * Factual company registry (CBAI Constitution).
 *
 * Local reference catalog only — no scores, narratives, or financial claims.
 */
export type Company = {
  /** Stable company identifier. */
  id: string;
  /** Company display name. */
  name: string;
  /** Short catalog symbol from local reference. */
  icon: string;
  /** Headquarters country label from local catalog. */
  country: string;
  /** Industry classification from local catalog. */
  industry: string;
  /** Founding year from local catalog reference. */
  founded: number;
  /** Official public website, when known — real, publicly verifiable, never fabricated. */
  website?: string;
};

export const industries = [
  "Technology",
  "Consumer Electronics",
  "Automotive",
  "E-Commerce",
  "Artificial Intelligence",
  "Semiconductors",
] as const;

export type CompanyIndustry = (typeof industries)[number];

export const companyCountries = [
  "United States",
  "South Korea",
] as const;

export type CompanyCountry = (typeof companyCountries)[number];

/** Local company catalog — reference profiles only, not external API data. */
export const companies: Company[] = [
  {
    id: "apple",
    name: "Apple",
    icon: "AAPL",
    country: "United States",
    industry: "Consumer Electronics",
    founded: 1976,
    website: "https://www.apple.com",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    icon: "MSFT",
    country: "United States",
    industry: "Technology",
    founded: 1975,
    website: "https://www.microsoft.com",
  },
  {
    id: "google",
    name: "Google",
    icon: "GOOG",
    country: "United States",
    industry: "Technology",
    founded: 1998,
    website: "https://www.google.com",
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    icon: "NVDA",
    country: "United States",
    industry: "Semiconductors",
    founded: 1993,
    website: "https://www.nvidia.com",
  },
  {
    id: "tesla",
    name: "Tesla",
    icon: "TSLA",
    country: "United States",
    industry: "Automotive",
    founded: 2003,
    website: "https://www.tesla.com",
  },
  {
    id: "amazon",
    name: "Amazon",
    icon: "AMZN",
    country: "United States",
    industry: "E-Commerce",
    founded: 1994,
    website: "https://www.amazon.com",
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: "OAI",
    country: "United States",
    industry: "Artificial Intelligence",
    founded: 2015,
    website: "https://www.openai.com",
  },
  {
    id: "samsung",
    name: "Samsung",
    icon: "SMSN",
    country: "South Korea",
    industry: "Consumer Electronics",
    founded: 1938,
    website: "https://www.samsung.com",
  },
];

export function getCompanyIndustries(): string[] {
  return [...new Set(companies.map((c) => c.industry))].sort();
}

export function getCompanyCountries(): string[] {
  return [...new Set(companies.map((c) => c.country))].sort();
}
