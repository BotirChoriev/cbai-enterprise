import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";

/**
 * Resolves a real catalog display name back to a real profile link. Used to make the
 * cross-entity relationship lists (Country/Company/University "linked" sections) actually
 * clickable — the names already come from these same catalogs via name-matching, so an exact
 * match against the catalog's own `.name` is safe and never guesses.
 */
export function countryHrefByName(name: string): string | null {
  const match = countries.find((country) => country.name === name);
  return match ? `/countries?country=${match.id}` : null;
}

export function companyHrefByName(name: string): string | null {
  const match = companies.find((company) => company.name === name);
  return match ? `/companies?company=${match.id}` : null;
}

export function universityHrefByName(name: string): string | null {
  const match = universities.find((university) => university.name === name);
  return match ? `/universities?university=${match.id}` : null;
}

export type LinkableEntityType = "country" | "university" | "company";

export function hrefForEntity(entityType: LinkableEntityType, name: string): string | null {
  switch (entityType) {
    case "country":
      return countryHrefByName(name);
    case "university":
      return universityHrefByName(name);
    case "company":
      return companyHrefByName(name);
  }
}
