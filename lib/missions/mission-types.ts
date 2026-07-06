/**
 * CBAI Mission Catalog — core type system.
 * Mission definitions only — no execution, scoring, or external API integration.
 */

export const MISSION_RECORD_VERSION = "1.0.0" as const;

/** Canonical mission personas aligned with CBAI governance standard. */
export type MissionPersonaId =
  | "citizen"
  | "investor"
  | "government"
  | "student"
  | "researcher"
  | "academic"
  | "enterprise";

export type MissionStatus = "defined" | "planned" | "active" | "deprecated";

/** Branded permanent mission identifier — format `mission-{persona}-{slug}`. */
export type MissionId = string & { readonly __brand: "MissionId" };

/** Entity types a mission can scope — from Global Registry active types. */
export type MissionSupportedEntityType = "country" | "company" | "university";

export type MissionDefinition = {
  missionId: MissionId;
  missionName: string;
  persona: MissionPersonaId;
  description: string;
  supportedEntities: readonly MissionSupportedEntityType[];
  requiredIndicators: readonly string[];
  requiredEvidence: readonly string[];
  requiredSources: readonly string[];
  requiredWorkspaces: readonly string[];
  requiredReports: readonly string[];
  status: MissionStatus;
  version: typeof MISSION_RECORD_VERSION;
};

export type MissionCatalog = {
  version: string;
  missionRecordVersion: typeof MISSION_RECORD_VERSION;
  builtAt: string;
  missions: readonly MissionDefinition[];
  missionCount: number;
  byPersona: Readonly<Partial<Record<MissionPersonaId, number>>>;
};

export type MissionCatalogIndex = {
  byId: ReadonlyMap<MissionId, MissionDefinition>;
  byPersona: ReadonlyMap<MissionPersonaId, readonly MissionDefinition[]>;
  byEntityType: ReadonlyMap<MissionSupportedEntityType, readonly MissionDefinition[]>;
  byWorkspace: ReadonlyMap<string, readonly MissionDefinition[]>;
};

export type MissionValidationIssue = {
  code:
    | "duplicate_mission_id"
    | "unknown_entity_type"
    | "unknown_indicator"
    | "unknown_evidence"
    | "unknown_source"
    | "broken_workspace_reference"
    | "unknown_report"
    | "invalid_mission_id_format";
  severity: "error" | "warning";
  message: string;
  missionId?: MissionId;
  reference?: string;
};

export type MissionValidationReport = {
  valid: boolean;
  issueCount: number;
  errors: readonly MissionValidationIssue[];
  warnings: readonly MissionValidationIssue[];
};

/** Declarative catalog entry before requirement resolution. */
export type MissionCatalogEntry = {
  slug: string;
  missionName: string;
  persona: MissionPersonaId;
  description: string;
  supportedEntities: readonly MissionSupportedEntityType[];
  requiredIndicatorIds: readonly string[];
  requiredWorkspaceIds: readonly string[];
  requiredReportIds: readonly string[];
  status?: MissionStatus;
};

export const MISSION_PERSONA_IDS: readonly MissionPersonaId[] = [
  "citizen",
  "investor",
  "government",
  "student",
  "researcher",
  "academic",
  "enterprise",
] as const;

export const MISSION_SUPPORTED_ENTITY_TYPES: readonly MissionSupportedEntityType[] = [
  "country",
  "company",
  "university",
] as const;
