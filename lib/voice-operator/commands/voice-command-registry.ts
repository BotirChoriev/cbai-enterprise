/**
 * Voice command registry — maps platform action IDs to orchestrator categories.
 * Navigation allowlist remains in lib/platform-actions/registry.ts.
 */

import type { PlatformActionId } from "@/lib/platform-actions/types";
import type { VoiceCommandCategory, VoiceCommandRisk } from "@/lib/voice-operator/commands/voice-command-types";

export type VoiceCommandRegistryEntry = {
  readonly actionId: PlatformActionId;
  readonly category: VoiceCommandCategory;
  readonly risk: VoiceCommandRisk;
  readonly announcementKey: string;
};

const ENTRY = (
  actionId: PlatformActionId,
  category: VoiceCommandCategory,
  risk: VoiceCommandRisk,
  announcementKey: string,
): VoiceCommandRegistryEntry => ({ actionId, category, risk, announcementKey });

/** Canonical command map — all execution still goes through platform-actions. */
export const VOICE_COMMAND_REGISTRY: Readonly<Partial<Record<PlatformActionId, VoiceCommandRegistryEntry>>> = {
  "navigate.home": ENTRY("navigate.home", "navigate", "safe_reversible", "voiceCommand.announcedHome"),
  "navigate.my_work": ENTRY("navigate.my_work", "navigate", "safe_reversible", "voiceCommand.announcedMyWork"),
  "navigate.search": ENTRY("navigate.search", "search", "safe_reversible", "voiceCommand.announcedSearch"),
  "navigate.countries": ENTRY("navigate.countries", "navigate", "safe_reversible", "voiceCommand.announcedCountries"),
  "navigate.companies": ENTRY("navigate.companies", "navigate", "safe_reversible", "voiceCommand.announcedCompanies"),
  "navigate.universities": ENTRY("navigate.universities", "navigate", "safe_reversible", "voiceCommand.announcedUniversities"),
  "navigate.research": ENTRY("navigate.research", "navigate", "safe_reversible", "voiceCommand.announcedResearch"),
  "navigate.evidence": ENTRY("navigate.evidence", "open_evidence", "safe_reversible", "voiceCommand.announcedEvidence"),
  "navigate.graph": ENTRY("navigate.graph", "open_graph", "safe_reversible", "voiceCommand.announcedGraph"),
  "navigate.reports": ENTRY("navigate.reports", "open_reports", "safe_reversible", "voiceCommand.announcedReports"),
  "navigate.investor": ENTRY("navigate.investor", "navigate", "safe_reversible", "voiceCommand.announcedInvestor"),
  "navigate.government": ENTRY("navigate.government", "navigate", "safe_reversible", "voiceCommand.announcedGovernment"),
  "navigate.governance": ENTRY("navigate.governance", "navigate", "safe_reversible", "voiceCommand.announcedGovernance"),
  "navigate.trust": ENTRY("navigate.trust", "navigate", "safe_reversible", "voiceCommand.announcedTrust"),
  "navigate.settings": ENTRY("navigate.settings", "open_settings", "safe_reversible", "voiceCommand.announcedSettings"),
  "navigate.about": ENTRY("navigate.about", "navigate", "safe_reversible", "voiceCommand.announcedAbout"),
  "navigate.back": ENTRY("navigate.back", "local_control", "safe_reversible", "platformAction.successBack"),
  "navigate.workspace": ENTRY("navigate.workspace", "navigate", "safe_reversible", "voiceCommand.announcedWorkspace"),
  "navigate.scientific_documents": ENTRY(
    "navigate.scientific_documents",
    "navigate",
    "safe_reversible",
    "voiceCommand.announcedScientificDocuments",
  ),
  "navigate.files": ENTRY("navigate.files", "navigate", "safe_reversible", "voiceCommand.announcedFiles"),
  "navigate.teams": ENTRY("navigate.teams", "navigate", "safe_reversible", "voiceCommand.announcedTeams"),
  "navigate.messages": ENTRY("navigate.messages", "navigate", "safe_reversible", "voiceCommand.announcedMessages"),
  "navigate.notifications": ENTRY(
    "navigate.notifications",
    "navigate",
    "safe_reversible",
    "voiceCommand.announcedNotifications",
  ),
  "navigate.publications": ENTRY(
    "navigate.publications",
    "navigate",
    "safe_reversible",
    "voiceCommand.announcedPublications",
  ),
  "entity.open_country": ENTRY("entity.open_country", "open_entity", "safe_reversible", "voiceCommand.announcedEntity"),
  "entity.open_company": ENTRY("entity.open_company", "open_entity", "safe_reversible", "voiceCommand.announcedEntity"),
  "entity.open_university": ENTRY("entity.open_university", "open_entity", "safe_reversible", "voiceCommand.announcedEntity"),
  "research.open_topic": ENTRY("research.open_topic", "open_topic", "safe_reversible", "voiceCommand.announcedChemistry"),
  "mission.resume": ENTRY("mission.resume", "resume_mission", "safe_reversible", "voiceCommand.announcedMyWork"),
  "project.open": ENTRY("project.open", "open_project", "safe_reversible", "voiceCommand.announcedMyWork"),
  "operational_object.compose": ENTRY("operational_object.compose", "create_draft_work", "needs_confirmation", "voiceCommand.announcedDraft"),
  "operational_object.confirm_create": ENTRY("operational_object.confirm_create", "create_draft_work", "needs_confirmation", "platformAction.confirmationRequired"),
  "project.compose": ENTRY("project.compose", "create_draft_work", "needs_confirmation", "voiceCommand.announcedDraft"),
  "mission.compose": ENTRY("mission.compose", "create_draft_work", "needs_confirmation", "voiceCommand.announcedDraft"),
  "report.compose": ENTRY("report.compose", "create_draft_work", "needs_confirmation", "voiceCommand.announcedDraft"),
  "evidence_request.compose": ENTRY("evidence_request.compose", "create_draft_work", "needs_confirmation", "voiceCommand.announcedDraft"),
  "scientific_intake.compose": ENTRY(
    "scientific_intake.compose",
    "create_draft_work",
    "needs_confirmation",
    "voiceCommand.announcedScientificIntake",
  ),
  "team.compose": ENTRY("team.compose", "create_draft_work", "needs_confirmation", "voiceCommand.announcedTeamDraft"),
  "team.invite": ENTRY("team.invite", "create_draft_work", "needs_confirmation", "voiceCommand.announcedTeamInvite"),
  "object.share": ENTRY("object.share", "create_draft_work", "needs_confirmation", "voiceCommand.announcedShare"),
  "publication.prepare": ENTRY(
    "publication.prepare",
    "create_draft_work",
    "needs_confirmation",
    "voiceCommand.announcedPublication",
  ),
  "engine.research.start": ENTRY("engine.research.start", "engine_start", "needs_confirmation", "voiceCommand.announcedEngine"),
  "engine.evidence.start": ENTRY("engine.evidence.start", "engine_start", "needs_confirmation", "voiceCommand.announcedEngine"),
  "engine.country.start": ENTRY("engine.country.start", "engine_start", "needs_confirmation", "voiceCommand.announcedEngine"),
  "engine.organization.start": ENTRY("engine.organization.start", "engine_start", "needs_confirmation", "voiceCommand.announcedEngine"),
  "engine.mission.start": ENTRY("engine.mission.start", "engine_start", "needs_confirmation", "voiceCommand.announcedEngine"),
  "engine.governance.start": ENTRY("engine.governance.start", "engine_start", "needs_confirmation", "voiceCommand.announcedEngine"),
  "engine.meeting.start": ENTRY("engine.meeting.start", "engine_start", "needs_confirmation", "voiceCommand.announcedEngine"),
  "voice.stop": ENTRY("voice.stop", "local_control", "safe_reversible", "platformAction.successVoiceStop"),
  "voice.close": ENTRY("voice.close", "local_control", "safe_reversible", "platformAction.successVoiceClose"),
  "transcript.show": ENTRY("transcript.show", "local_control", "safe_reversible", "platformAction.successTranscriptShow"),
  "transcript.hide": ENTRY("transcript.hide", "local_control", "safe_reversible", "platformAction.successTranscriptHide"),
};

export function getVoiceCommandEntry(actionId: PlatformActionId): VoiceCommandRegistryEntry | null {
  return VOICE_COMMAND_REGISTRY[actionId] ?? null;
}
