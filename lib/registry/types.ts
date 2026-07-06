/**
 * CBAI Global Registry Layer — core type system.
 * Permanent platform identities. No scores, inference, or external API data.
 */

export const ENTITY_RECORD_VERSION = "1.0.0" as const;

/** Active entity types materialized in the unified registry. */
export type ActiveEntityType = "country" | "company" | "university";

/** Reserved entity types for future registry expansion. */
export type FutureEntityType =
  | "government"
  | "organization"
  | "institution"
  | "dataset"
  | "report"
  | "mission";

export type EntityType = ActiveEntityType | FutureEntityType;

export type EntityStatus = "active" | "planned" | "deprecated";

/** Branded permanent platform identifier — format `{type}-{slug}`. */
export type EntityId = string & { readonly __brand: "EntityId" };

export type RegistryEntityRecord = {
  /** Permanent platform identifier — e.g. `country-jpn`, `company-apple`. */
  entityId: EntityId;
  entityType: ActiveEntityType;
  /** Stable slug segment without type prefix. */
  slug: string;
  displayName: string;
  /** ISO-style country code when applicable; empty for non-geographic anchors. */
  countryCode: string;
  /** Permanent IDs of related registry entities — never display names. */
  relatedEntityIds: readonly EntityId[];
  /** Global Indicator Framework indicator IDs applicable to this entity. */
  indicatorIds: readonly string[];
  /** Evidence requirement anchors — connected indicator evidence slots. */
  evidenceIds: readonly string[];
  /** Evidence Infrastructure source IDs referenced by applicable indicators. */
  sourceIds: readonly string[];
  /** Workspace IDs relevant to this entity scope. */
  workspaceIds: readonly string[];
  /** Report type IDs this entity participates in. */
  reportIds: readonly string[];
  /** Mission IDs — reserved for Mission Engine; empty until missions register. */
  missionIds: readonly string[];
  status: EntityStatus;
  version: typeof ENTITY_RECORD_VERSION;
  /** Legacy registry ID preserved for backward-compatible module lookups. */
  legacyRegistryId: string;
};

export type EntityReference = Pick<
  RegistryEntityRecord,
  "entityId" | "entityType" | "slug" | "displayName" | "countryCode"
>;

export type GlobalRegistry = {
  version: string;
  entityVersion: typeof ENTITY_RECORD_VERSION;
  builtAt: string;
  entities: readonly RegistryEntityRecord[];
  entityCount: number;
  byType: Readonly<Record<ActiveEntityType, number>>;
};

export type RegistryIndex = {
  byId: ReadonlyMap<EntityId, RegistryEntityRecord>;
  bySlug: ReadonlyMap<string, RegistryEntityRecord>;
  byType: ReadonlyMap<ActiveEntityType, readonly RegistryEntityRecord[]>;
  byCountryCode: ReadonlyMap<string, readonly RegistryEntityRecord[]>;
};

export type RegistryValidationIssue = {
  code:
    | "duplicate_entity_id"
    | "duplicate_slug"
    | "missing_reference"
    | "broken_relationship"
    | "unknown_entity_type"
    | "invalid_entity_id_format";
  severity: "error" | "warning";
  message: string;
  entityId?: EntityId;
  relatedEntityId?: string;
};

export type RegistryValidationReport = {
  valid: boolean;
  issueCount: number;
  errors: readonly RegistryValidationIssue[];
  warnings: readonly RegistryValidationIssue[];
};

export type EntityLinkGraph = {
  entityId: EntityId;
  outbound: readonly EntityId[];
  inbound: readonly EntityId[];
};

/** Stable workspace identifiers referenced by registry records. */
export const WORKSPACE_IDS = {
  government: "workspace-government",
  investor: "workspace-investor",
  citizen: "workspace-citizen",
} as const;

/** Stable report type identifiers from Reports Center. */
export const REPORT_TYPE_IDS = {
  countryIntelligence: "report-country-intelligence",
  companyIntelligence: "report-company-intelligence",
  universityIntelligence: "report-university-intelligence",
  investorBrief: "report-investor-brief",
  governmentBrief: "report-government-brief",
  researchBrief: "report-research-brief",
  academicMethodology: "report-academic-methodology",
} as const;
