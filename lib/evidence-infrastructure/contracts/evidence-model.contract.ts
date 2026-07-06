import type {
  CbaiEvidenceItem,
  ConnectorContract,
  EvidenceProvenance,
  EvidenceSchemaVersion,
  EvidenceValue,
} from "@/lib/evidence-infrastructure/types";

/**
 * CBAI Evidence Model contract — canonical internal representation.
 * Adapters transform external structures into this shape (future implementation).
 */
export type CbaiEvidenceModelContract = {
  schemaVersion: EvidenceSchemaVersion;
  item: CbaiEvidenceItem;
};

export const CBAI_EVIDENCE_MODEL_V1_FIELDS = [
  "id",
  "schemaVersion",
  "sourceId",
  "sourceSlug",
  "indicatorSlug",
  "entityType",
  "entityId",
  "fieldKey",
  "value",
  "provenance",
  "normalizedBy",
  "infrastructureVersion",
] as const;

/** Required provenance fields on every evidence item. */
export const REQUIRED_PROVENANCE_FIELDS: (keyof EvidenceProvenance)[] = [
  "sourceId",
  "sourceSlug",
  "license",
  "verificationStatus",
];

/** Allowed evidence value types — no scores or rankings. */
export const ALLOWED_EVIDENCE_VALUE_TYPES: EvidenceValue["type"][] = [
  "text",
  "number",
  "boolean",
  "date",
  "code",
  "reference",
  "unavailable",
];

/** Declarative adapter output obligation. */
export type AdapterOutputObligation = {
  outputSchema: EvidenceSchemaVersion;
  mustIncludeProvenance: true;
  mustReferenceSourceSlug: true;
  mustReferenceIndicatorSlug: true;
  forbiddenOutputs: readonly string[];
};

export const DEFAULT_ADAPTER_OUTPUT_OBLIGATION: AdapterOutputObligation = {
  outputSchema: "v1",
  mustIncludeProvenance: true,
  mustReferenceSourceSlug: true,
  mustReferenceIndicatorSlug: true,
  forbiddenOutputs: [
    "scores",
    "rankings",
    "percentages",
    "confidence",
    "ai-summary",
    "sentiment",
  ],
};

/** Declarative connector obligation — future connectors must expose. */
export type ConnectorSurfaceContract = {
  requiredFields: (keyof ConnectorContract)[];
  healthRequired: true;
  versionRequired: true;
};

export const CONNECTOR_SURFACE_CONTRACT: ConnectorSurfaceContract = {
  requiredFields: [
    "metadata",
    "health",
    "version",
    "supportedEntities",
    "supportedIndicators",
    "schemaVersion",
  ],
  healthRequired: true,
  versionRequired: true,
};
