export {
  UNIVERSITY_INTELLIGENCE_SCHEMA_VERSION,
  type UniversityIntelligenceProfile,
  type UniversityTabId,
  type UniversityIdentity,
  type CollaborationOpportunityRecord,
} from "@/lib/university-intelligence/types";

export { resolveUniversityLogo, neutralMonogram } from "@/lib/university-intelligence/logo";
export {
  buildUniversityNetworkProfile,
  listUniversityIntelligenceProfiles,
  countryFlagEmojiForUniversity,
} from "@/lib/university-intelligence/profile";
export {
  migrateUniversityIntelligenceProfile,
  assertIdempotentUniversityMigration,
} from "@/lib/university-intelligence/migrate";
export { runAcademicMatch, type AcademicMatchInput, type AcademicMatchResult } from "@/lib/university-intelligence/academic-match";
export {
  buildProjectPresentationCard,
  attemptPresentationCommunication,
  exportPresentationPlainText,
} from "@/lib/university-intelligence/presentation";
export { listOpportunityRadar } from "@/lib/university-intelligence/opportunity-radar";
export {
  buildEmptyFiveYearTimeline,
  classifyTimelinePoint,
  timelineTableRows,
} from "@/lib/university-intelligence/timeline";
export { resolveUniversityIntelligenceVoiceCommand } from "@/lib/university-intelligence/voice-commands";
