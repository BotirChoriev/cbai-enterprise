/**
 * CBAI Official Evidence Connector Architecture — public API.
 * Definitions only — no HTTP, fetch, credentials, or scraping.
 */

export {
  CONNECTOR_REGISTRY_VERSION,
  CONNECTOR_REGISTRY_VERSION_INFO,
  CONNECTOR_MIGRATION_MANIFEST,
  CONNECTOR_LIFECYCLE_STAGES,
  type ConnectorRegistryVersionInfo,
  type ConnectorMigrationEntry,
  type ConnectorLifecycleStage,
} from "@/lib/connectors/connector-version";

export {
  CONNECTOR_STATUSES,
  CONNECTOR_STATUS_DEFINITIONS,
  isConnectorStatus,
  isImplementableStatus,
  type ConnectorStatus,
  type ConnectorStatusDefinition,
} from "@/lib/connectors/connector-status";

export {
  CONNECTOR_CAPABILITIES,
  CONNECTOR_CAPABILITY_DEFINITIONS,
  REQUIRED_CONNECTOR_CAPABILITIES,
  isConnectorCapability,
  type ConnectorCapability,
  type ConnectorCapabilityDefinition,
} from "@/lib/connectors/connector-capabilities";

export {
  CONNECTOR_RECORD_VERSION,
  CONNECTOR_SUPPORTED_ENTITY_TYPES,
  CONNECTOR_REGISTRY_ENTITY_TYPES,
  type ConnectorId,
  type ConnectorSupportedEntityType,
  type ConnectorRegistryEntityType,
  type ConnectorAuthenticationKind,
  type ConnectorAuthentication,
  type ConnectorRateLimits,
  type ConnectorCoverageScope,
  type ConnectorDefinition,
  type ConnectorRegistry,
  type ConnectorRegistryIndex,
  type ConnectorCatalogEntry,
  type ConnectorValidationIssue,
  type ConnectorValidationReport,
} from "@/lib/connectors/connector-types";

export {
  CONNECTOR_ID_PATTERN,
  CONNECTOR_CATALOG_ENTRIES,
  buildConnectorId,
  parseConnectorId,
  isValidConnectorIdFormat,
  buildConnectorDefinition,
  buildConnectorRegistry,
} from "@/lib/connectors/connector-builder";

export {
  getConnectorRegistry,
  getConnectorRegistryIndex,
  rebuildConnectorRegistry,
  getAllConnectors,
  getConnectorCount,
} from "@/lib/connectors/connector-registry";

export {
  findConnectorById,
  findConnectorByIdString,
  findConnectorsByStatus,
  findConnectorsByEntityType,
  findConnectorsByEvidenceSourceId,
  findConnectorsByCapability,
  searchConnectorsByName,
  listActiveConnectorStatuses,
} from "@/lib/connectors/connector-query";

export {
  validateConnectorRegistry,
  assertConnectorRegistryValid,
  summarizeConnectorValidationReport,
} from "@/lib/connectors/connector-validation";
