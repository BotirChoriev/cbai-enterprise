export {
  COUNTRY_INTELLIGENCE_DOMAINS,
  COUNTRY_INTELLIGENCE_SCHEMA_VERSION,
  type CountryIntelligenceDomainId,
  type CountryProfile,
  type IndicatorObservation,
  type IndicatorSeries,
  type CauseExplanation,
  type ThenNowNextPanel,
  type SourceRegistryEntry,
} from "@/lib/country-intelligence/types";

export { DOMAIN_DEFINITIONS, getDomainDefinition, isCountryIntelligenceDomainId } from "@/lib/country-intelligence/domains";
export { buildFlagMetadata, flagEmojiFromIsoAlpha2, resolveEmblemMetadata, flagAltText } from "@/lib/country-intelligence/flags";
export { COUNTRY_SOURCE_REGISTRY, listSourcesForDomain, summarizeSourceCapability } from "@/lib/country-intelligence/source-registry";
export { buildCountryProfile, listCountryProfiles, getCountryProfileById } from "@/lib/country-intelligence/profile";
export { migrateCountryProfile, assertIdempotentMigration } from "@/lib/country-intelligence/migrate";
export {
  buildHistoryChartSegments,
  filterHistoryWindow,
  historyTableRows,
  emptyIndicatorSeriesPlaceholder,
} from "@/lib/country-intelligence/history";
export {
  validateComparisonSelection,
  assessDomainComparability,
  buildCountryComparison,
} from "@/lib/country-intelligence/comparison";
export {
  buildUzbekistanReferenceProfile,
  UZBEKISTAN_REFERENCE_DOMAINS,
} from "@/lib/country-intelligence/uzbekistan-reference";
export { resolveCountryIntelligenceVoiceCommand } from "@/lib/country-intelligence/voice-commands";
