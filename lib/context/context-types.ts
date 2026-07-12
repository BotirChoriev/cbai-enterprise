/**
 * CBAI Platform Context — shared type system.
 * Single source of truth for cross-module entity awareness.
 */

export const PLATFORM_CONTEXT_VERSION = "1.0.0" as const;

/**
 * "research_topic" and "project" participate only in the flat recent/pinned entity lists (Save
 * to workspace, My Work) — neither is ever resolved through the URL-param country/company/
 * university focus system below (research topics are routed by path segment,
 * `/research/[topicId]`; projects by `/my-work?project=id`), so both are deliberately absent from
 * PlatformContextSnapshot's country/company/university fields.
 */
export type EntityKind = "country" | "company" | "university" | "research_topic" | "project";

export type WorkspaceId = "government" | "investor" | "citizen";

export type ContextEntityRef = {
  kind: EntityKind;
  id: string;
  name: string;
  /** ISO-style or short code when available. */
  code?: string;
  /** Country name for companies/universities when resolvable. */
  countryName?: string;
};

export type EntityTimelineStatus = "unavailable";

export type PlatformContextSnapshot = {
  version: typeof PLATFORM_CONTEXT_VERSION;
  country: ContextEntityRef | null;
  company: ContextEntityRef | null;
  university: ContextEntityRef | null;
  workspace: WorkspaceId | null;
  searchQuery: string;
  activeModulePath: string;
  recentEntities: readonly ContextEntityRef[];
  pinnedEntities: readonly ContextEntityRef[];
  timelineStatus: EntityTimelineStatus;
  timelineMessage: string;
};

export type PlatformContextParams = {
  country?: string | null;
  company?: string | null;
  university?: string | null;
  workspace?: string | null;
  q?: string | null;
};

export type RelatedModuleLink = {
  id: string;
  label: string;
  href: string;
  description: string;
};

export type ContextBreadcrumbSegment = {
  label: string;
  href?: string;
};

export type PlatformContextHeaderModel = {
  primaryEntity: ContextEntityRef | null;
  primaryEntityLabel: string;
  breadcrumbs: readonly ContextBreadcrumbSegment[];
  relatedModules: readonly RelatedModuleLink[];
  quickActions: readonly RelatedModuleLink[];
  timelineStatus: EntityTimelineStatus;
  timelineMessage: string;
  recentEntities: readonly ContextEntityRef[];
  pinnedEntities: readonly ContextEntityRef[];
  workspace: WorkspaceId | null;
  searchQuery: string;
};

export const ENTITY_TIMELINE_UNAVAILABLE_MESSAGE =
  "No verified evidence timeline connected." as const;

export const CONTEXT_PARAM_KEYS = {
  country: "country",
  company: "company",
  university: "university",
  workspace: "workspace",
  search: "q",
} as const;
