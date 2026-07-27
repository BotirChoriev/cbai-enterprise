export {
  WIM_SCHEMA_VERSION,
  WIM_ENTITY_KINDS,
  WIM_RELATIONSHIP_TYPES,
  WIM_VIEW_MODES,
  LIVE_FRESHNESS_STATES,
  type WimEntityNode,
  type WimRelationship,
  type WimProjection,
  type WimViewMode,
  type LiveIntelligenceRecord,
  type MyWorldConsentProfile,
} from "@/lib/world-and-me-intelligence/types";
export {
  migrateWimEntityNode,
  migrateWimRelationship,
  migrateLiveRecord,
  assertIdempotentWimNodeMigration,
  wimSchemaVersion,
} from "@/lib/world-and-me-intelligence/migrate";
export { buildWorldAndMeProjection, forbidUnexplainedAbbreviation } from "@/lib/world-and-me-intelligence/projection";
export { listWorldChangeRadar, isFabricatedLiveForbidden } from "@/lib/world-and-me-intelligence/world-change-radar";
export { explainRelationship } from "@/lib/world-and-me-intelligence/relationship-explainer";
export {
  previewMapToActionDraft,
  consumeWimDraftIdempotency,
  resetWimDraftIdempotencyForTests,
  WIM_DRAFT_KINDS,
} from "@/lib/world-and-me-intelligence/map-to-action";
export { emptyMyWorldConsent, filterMyWorldNodes, myWorldRequiresConsent } from "@/lib/world-and-me-intelligence/my-world";
export { resolveWorldAndMeVoiceCommand } from "@/lib/world-and-me-intelligence/voice-commands";
export { relationshipLabelEn, everyRelationshipHasType, WIM_RELATIONSHIP_LABELS_EN } from "@/lib/world-and-me-intelligence/relationship-labels";
