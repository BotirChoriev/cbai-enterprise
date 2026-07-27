export { GRI_SCHEMA_VERSION, RESEARCH_LIFECYCLE_STATES, type ResearchIntelligenceProfile, type ResearchLifecycleState } from "@/lib/global-research-intelligence/types";
export {
  buildResearchIntelligenceProfileFromTopic,
  listResearchIntelligenceProfiles,
  getResearchIntelligenceProfile,
  isTerminalLifecycle,
  requiresStoppedReason,
} from "@/lib/global-research-intelligence/profile";
export { migrateResearchIntelligenceProfile, assertIdempotentGriMigration } from "@/lib/global-research-intelligence/migrate";
export { runResearchMatch } from "@/lib/global-research-intelligence/match";
export { listResearchOpportunityRadar, isOpportunityActive } from "@/lib/global-research-intelligence/opportunity-radar";
export { buildControlCabinetDraft } from "@/lib/global-research-intelligence/control-cabinet";
export { listLibraryBridge, LIBRARY_ADAPTERS } from "@/lib/global-research-intelligence/library-bridge";
export { buildGriGraphProjection } from "@/lib/global-research-intelligence/graph-projection";
export { resolveGlobalResearchIntelligenceVoiceCommand } from "@/lib/global-research-intelligence/voice-commands";
export { buildResearchMeetingDraft } from "@/lib/global-research-intelligence/meetings";
