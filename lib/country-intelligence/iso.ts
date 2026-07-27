/** ISO helpers for the local country registry (6 countries). */

const ALPHA3: Readonly<Record<string, string>> = {
  usa: "USA",
  china: "CHN",
  uzbekistan: "UZB",
  germany: "DEU",
  uae: "ARE",
  japan: "JPN",
};

export function isoAlpha3ForCountryId(countryId: string): string {
  return ALPHA3[countryId] ?? "XXX";
}

export function isoAlpha2Normalize(code: string): string {
  return code.trim().toUpperCase().slice(0, 2);
}
