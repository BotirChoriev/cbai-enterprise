/**
 * Official Connector Foundation — Phase 1 public API.
 * No live external source connections. No invented evidence.
 */

export { OFFICIAL_CONNECTOR_FOUNDATION_VERSION } from "@/lib/official-connector-foundation/types";
export type {
  ProvenanceMetadata,
  OfficialSourceRecord,
  ConnectorContract,
  NormalizedObservationDraft,
  ValidatedObservation,
  MissingSourceFallback,
  FailureClass,
  FreshnessState,
  ConnectorHealthState,
  VerificationState,
  AuditLogEntry,
} from "@/lib/official-connector-foundation/types";

export {
  FOUNDATION_SOURCE_REGISTRY,
  getFoundationSourceRegistry,
  getFoundationSourceBySlug,
  listPlannedFoundationSources,
  countLiveFoundationSources,
  countConnectedFoundationSources,
} from "@/lib/official-connector-foundation/source-registry";

export {
  FOUNDATION_CONNECTOR_CONTRACTS,
  getFoundationConnectorContracts,
  getFoundationConnectorById,
  assertNoLiveConnectors,
  assertUnrelatedConnectorsRemainPlanned,
} from "@/lib/official-connector-foundation/connector-contracts";

export {
  getWorldBankRuntimeStatus,
  markWorldBankConnected,
  markWorldBankFailure,
  resetWorldBankRuntimeForTests,
  isWorldBankConnected,
} from "@/lib/official-connector-foundation/runtime-status";

export {
  fetchWorldBankWdiForCountry,
  validateWdiPayload,
  buildWdiEndpoint,
  isSupportedWdiIndicator,
  WORLD_BANK_WDI_INDICATORS,
  WORLD_BANK_WDI_CONNECTOR_ID,
  WORLD_BANK_WDI_API_BASE,
  WDI_FRESHNESS_MAX_AGE_MS,
  foundationWdiStore,
} from "@/lib/official-connector-foundation/adapters/world-bank-wdi";
export type {
  WdiFetchResult,
  WorldBankWdiIndicatorCode,
} from "@/lib/official-connector-foundation/adapters/world-bank-wdi";

export {
  fetchWithFoundationAdapter,
  classifyHttpFailure,
} from "@/lib/official-connector-foundation/fetch-adapter";
export type {
  FetchAdapterOptions,
  FetchAdapterResult,
  FetchLike,
} from "@/lib/official-connector-foundation/fetch-adapter";

export {
  parseJsonResponse,
  validateObservationPayload,
  assertObject,
  requireStringField,
  requireFiniteNumberField,
} from "@/lib/official-connector-foundation/validate";

export {
  buildProvenance,
  normalizeValidatedObservation,
  deriveFreshnessState,
} from "@/lib/official-connector-foundation/normalize";

export {
  InMemoryConnectorCache,
  buildCacheKey,
} from "@/lib/official-connector-foundation/cache";
export type { ConnectorCache, CacheEntry } from "@/lib/official-connector-foundation/cache";

export {
  FoundationAuditLog,
  foundationAuditLog,
} from "@/lib/official-connector-foundation/audit";

export {
  FoundationObservationStore,
  observationIdentityKey,
} from "@/lib/official-connector-foundation/store";

export {
  missingSourceFallback,
  isSafeEmptyCoverage,
} from "@/lib/official-connector-foundation/missing-source";

export {
  plannedHealthSnapshot,
  evaluateHealthAfterCheck,
} from "@/lib/official-connector-foundation/health";
