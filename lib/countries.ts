export type CountryRegion =
  | "Americas"
  | "Asia"
  | "Europe"
  | "Middle East";

/**
 * Factual country registry record (CBAI Constitution).
 *
 * Contains locally stored reference identifiers only.
 * No scores, narratives, or assessments.
 */
export type Country = {
  /** Stable country identifier. */
  id: string;
  /** Country display name. */
  name: string;
  /** ISO-style country code from local registry. */
  code: string;
  /** Geographic region classification. */
  region: CountryRegion;
  /** Capital city from local registry. */
  capital: string;
  /** Government form label from local registry reference. */
  government: string;
  /** Official government web portal, when known — real, publicly verifiable, never fabricated. */
  officialWebsite?: string;
};

/** Local country registry — reference profiles only, not external API data. */
export const countries: Country[] = [
  {
    id: "usa",
    name: "United States",
    code: "US",
    region: "Americas",
    capital: "Washington, D.C.",
    government: "Federal Presidential Constitutional Republic",
    officialWebsite: "https://www.usa.gov",
  },
  {
    id: "china",
    name: "China",
    code: "CN",
    region: "Asia",
    capital: "Beijing",
    government: "Single-Party Socialist Republic",
    officialWebsite: "https://www.gov.cn",
  },
  {
    id: "uzbekistan",
    name: "Uzbekistan",
    code: "UZ",
    region: "Asia",
    capital: "Tashkent",
    government: "Presidential Republic",
    officialWebsite: "https://www.gov.uz",
  },
  {
    id: "germany",
    name: "Germany",
    code: "DE",
    region: "Europe",
    capital: "Berlin",
    government: "Federal Parliamentary Republic",
    officialWebsite: "https://www.bundesregierung.de",
  },
  {
    id: "uae",
    name: "United Arab Emirates",
    code: "AE",
    region: "Middle East",
    capital: "Abu Dhabi",
    government: "Federal Absolute Monarchy",
    officialWebsite: "https://u.ae",
  },
  {
    id: "japan",
    name: "Japan",
    code: "JP",
    region: "Asia",
    capital: "Tokyo",
    government: "Unitary Parliamentary Constitutional Monarchy",
    officialWebsite: "https://www.japan.go.jp",
  },
];

export const regions: CountryRegion[] = [
  "Americas",
  "Asia",
  "Europe",
  "Middle East",
];
