/**
 * CBAI Platform Context — module registry and intelligence route constants.
 */

export {
  PLATFORM_CONTEXT_VERSION,
  CONTEXT_PARAM_KEYS,
  ENTITY_TIMELINE_UNAVAILABLE_MESSAGE,
  type EntityKind,
  type WorkspaceId,
  type ContextEntityRef,
  type PlatformContextSnapshot,
  type PlatformContextParams,
  type PlatformContextHeaderModel,
  type RelatedModuleLink,
  type ContextBreadcrumbSegment,
  type EntityTimelineStatus,
} from "@/lib/context/context-types";

export {
  buildPlatformContext,
  getPrimaryEntity,
  parseContextParams,
  resolveEntityRef,
  serializeContextToParams,
  type PrimaryEntityRef,
} from "@/lib/context/context-builder";

export {
  loadRecentEntities,
  loadPinnedEntities,
  recordRecentEntity,
  pinEntity,
  unpinEntity,
  RECENT_ENTITIES_ARCHITECTURE_NOTE,
  PINNED_ENTITIES_ARCHITECTURE_NOTE,
} from "@/lib/context/context-history";

export {
  PLATFORM_MODULES,
  CONTEXT_HEADER_ROUTES,
  shouldShowContextHeader,
  workspaceIdFromPath,
  moduleIdFromPath,
  buildContextualHref,
  buildRelatedModules,
  buildQuickActions,
  buildContextBreadcrumbs,
  buildContextHeaderModel,
  snapshotWithEntityFocus,
  type PlatformModuleId,
  type PlatformModuleDefinition,
} from "@/lib/context/context-navigation";
