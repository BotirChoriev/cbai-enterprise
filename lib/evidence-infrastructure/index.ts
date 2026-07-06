/**
 * CBAI Evidence Infrastructure
 *
 * Permanent architecture for connecting official evidence sources.
 * No data collection, HTTP, fetch, API, credentials, keys, or scraping.
 */

export {
  INFRASTRUCTURE_VERSION,
  type EvidenceSchemaVersion,
  type ConnectionStatus,
  type VerificationStatus,
  type SupportedEntityType,
  type EvidenceSourceRecord,
  type ConnectorMetadata,
  type ConnectorHealth,
  type ConnectorContract,
  type AdapterContract,
  type NormalizerKind,
  type NormalizerDefinition,
  type EvidenceProvenance,
  type EvidenceValue,
  type CbaiEvidenceItem,
  type EvidenceInfrastructureRegistry,
  type SchemaVersionManifest,
} from "@/lib/evidence-infrastructure/types";

export {
  EVIDENCE_INFRASTRUCTURE_REGISTRY,
  getInfrastructureSummary,
  getSourceAdapterChain,
} from "@/lib/evidence-infrastructure/registry";

export {
  OFFICIAL_EVIDENCE_SOURCES,
  getSourceBySlug,
  getSourcesByConnectionStatus,
  getSourcesByVerificationStatus,
} from "@/lib/evidence-infrastructure/sources/catalog";

export {
  CONNECTOR_CATALOG,
  getConnectorById,
  getConnectorsBySourceSlug,
} from "@/lib/evidence-infrastructure/connectors/catalog";

export {
  ADAPTER_CATALOG,
  getAdapterById,
  getAdaptersBySourceSlug,
  getAdaptersByOutputSchema,
} from "@/lib/evidence-infrastructure/adapters/catalog";

export {
  NORMALIZER_CATALOG,
  getNormalizerByKind,
  getNormalizerById,
} from "@/lib/evidence-infrastructure/normalizers/catalog";

export {
  SCHEMA_VERSION_MANIFEST,
  ACTIVE_SCHEMA_VERSION,
  getSchemaManifest,
  getActiveSchemaVersions,
  isCompatibleSchema,
} from "@/lib/evidence-infrastructure/versioning/manifest";

export {
  CBAI_EVIDENCE_MODEL_V1_FIELDS,
  REQUIRED_PROVENANCE_FIELDS,
  ALLOWED_EVIDENCE_VALUE_TYPES,
  DEFAULT_ADAPTER_OUTPUT_OBLIGATION,
  CONNECTOR_SURFACE_CONTRACT,
  CONNECTOR_CONTRACT_REQUIRED_KEYS,
  CONNECTOR_CONTRACT_SPEC,
  ADAPTER_CONTRACT_REQUIRED_KEYS,
  ADAPTER_CONTRACT_SPEC,
  ADAPTER_PIPELINE,
  type CbaiEvidenceModelContract,
  type AdapterOutputObligation,
  type ConnectorSurfaceContract,
  type AdapterPipelineStage,
} from "@/lib/evidence-infrastructure/contracts";
