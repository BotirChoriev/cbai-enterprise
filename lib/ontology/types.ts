/**
 * CBAI Canonical Ontology — core type system.
 * Versioned, typed, device-local semantic layer connecting all platform objects.
 */

export const ONTOLOGY_SCHEMA_VERSION = 1 as const;

/** Supported content locales — matches platform i18n. */
export type OntologyLocale = "en" | "uz" | "ru" | "tr";

/** Lifecycle states for ontology objects. Mutations require explicit confirmation. */
export type OntologyObjectStatus =
  | "draft"
  | "awaiting_confirmation"
  | "active"
  | "blocked"
  | "completed"
  | "archived";

/** How an object entered the ontology. */
export type OntologyProvenanceSource =
  | "user_created"
  | "engine_inferred"
  | "legacy_adapter"
  | "registry_projection"
  | "imported";

/** Provenance record — distinct from localized UI copy. */
export type OntologyProvenance = {
  readonly source: OntologyProvenanceSource;
  readonly createdBy?: string;
  readonly engineId?: string;
  readonly engineVersion?: string;
  readonly originalText?: string;
  readonly inferredFields?: readonly string[];
  readonly userProvidedFields?: readonly string[];
  readonly legacyStoreKey?: string;
  readonly legacyRecordId?: string;
  readonly confirmationEventId?: string;
};

/** Reference to an official source — never conflated with UI translation. */
export type OntologySourceReference = {
  readonly sourceId: string;
  readonly title: string;
  readonly url?: string;
  readonly accessDate?: string;
  readonly excerptLocale?: OntologyLocale;
};

/** Branded ontology object identifier — format `{kind}-{uuid}`. */
export type OntologyObjectId = string & { readonly __brand: "OntologyObjectId" };

/** Base fields every ontology object must support. */
export type OntologyObjectBase = {
  readonly id: OntologyObjectId;
  readonly kind: import("./object-kinds").OntologyObjectKind;
  readonly title: string;
  readonly description: string;
  readonly status: OntologyObjectStatus;
  readonly contentLocale: OntologyLocale;
  readonly createdLocale: OntologyLocale;
  readonly provenance: OntologyProvenance;
  readonly sourceReferences: readonly OntologySourceReference[];
  readonly relationshipIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly schemaVersion: typeof ONTOLOGY_SCHEMA_VERSION;
  readonly metadata: Readonly<Record<string, unknown>>;
};

/** Unknown fields from future schema versions — preserved on read/write. */
export type OntologyObjectRecord = OntologyObjectBase & Record<string, unknown>;

/** Input for creating a draft ontology object. */
export type OntologyObjectDraft = {
  kind: import("./object-kinds").OntologyObjectKind;
  title: string;
  description?: string;
  status?: OntologyObjectStatus;
  contentLocale: OntologyLocale;
  createdLocale: OntologyLocale;
  provenance: OntologyProvenance;
  sourceReferences?: readonly OntologySourceReference[];
  relationshipIds?: readonly string[];
  metadata?: Readonly<Record<string, unknown>>;
};

/** Filter for listing ontology objects. */
export type OntologyObjectFilter = {
  kind?: import("./object-kinds").OntologyObjectKind | readonly import("./object-kinds").OntologyObjectKind[];
  status?: OntologyObjectStatus | readonly OntologyObjectStatus[];
  contentLocale?: OntologyLocale;
  legacyRecordId?: string;
  legacyStoreKey?: string;
};

/** Audit event for ontology mutations. */
export type OntologyAuditEvent = {
  readonly id: string;
  readonly objectId: OntologyObjectId;
  readonly action: "create_draft" | "confirm" | "update" | "link" | "unlink" | "archive";
  readonly actorId?: string;
  readonly timestamp: string;
  readonly details: Readonly<Record<string, unknown>>;
};

/** Validation issue from schema check. */
export type OntologyValidationIssue = {
  readonly code: string;
  readonly severity: "error" | "warning";
  readonly message: string;
  readonly field?: string;
};

export type OntologyValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly OntologyValidationIssue[];
};
