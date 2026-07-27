/**
 * Verified capital-city time zones for the local country registry.
 *
 * Time zone identifiers come from the IANA Time Zone Database (tzdb), which the
 * JavaScript runtime resolves through `Intl.DateTimeFormat`. Daylight saving
 * transitions are therefore applied by tzdb rules, never by a stored offset.
 *
 * Countries that span more than one zone are marked `multipleZones: true` so the
 * interface can state that the displayed clock is the capital's local time only.
 * No offset, abbreviation or clock value is stored or fabricated here.
 */

export const IANA_TZDB_SOURCE_URL = "https://www.iana.org/time-zones";

export type CountryTimeZone = {
  /** Country id from lib/countries.ts. */
  readonly countryId: string;
  /** IANA tzdb zone identifier for the capital city. */
  readonly capitalTimeZone: string;
  /** True when the country observes more than one civil time zone. */
  readonly multipleZones: boolean;
};

const REGISTRY: readonly CountryTimeZone[] = [
  { countryId: "usa", capitalTimeZone: "America/New_York", multipleZones: true },
  { countryId: "china", capitalTimeZone: "Asia/Shanghai", multipleZones: false },
  { countryId: "uzbekistan", capitalTimeZone: "Asia/Tashkent", multipleZones: false },
  { countryId: "germany", capitalTimeZone: "Europe/Berlin", multipleZones: false },
  { countryId: "uae", capitalTimeZone: "Asia/Dubai", multipleZones: false },
  { countryId: "japan", capitalTimeZone: "Asia/Tokyo", multipleZones: false },
];

/** The verified capital time zone for a country, or null when not registered. */
export function findCountryTimeZone(countryId: string): CountryTimeZone | null {
  return REGISTRY.find((entry) => entry.countryId === countryId) ?? null;
}

/** Every registered country time zone. */
export function listCountryTimeZones(): readonly CountryTimeZone[] {
  return REGISTRY;
}

/** True when the runtime can resolve the zone through tzdb. */
export function isResolvableTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}
