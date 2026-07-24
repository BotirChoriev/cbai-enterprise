/**
 * Canonical Action Registry facade — maps OS-level actions onto platform-actions.
 * Typed commands, browser transcripts, and Realtime tools share the same allowlist.
 */

import type { PlatformActionId } from "@/lib/platform-actions/types";
import { getPlatformActionDefinition, isAllowedNavigationHref } from "@/lib/platform-actions/registry";
import { classifyVoiceActionLevel, type VoiceActionLevel } from "@/lib/voice-operator/identity/action-levels";

export type CanonicalOsAction =
  | "navigate"
  | "search"
  | "open_object"
  | "prepare_upload"
  | "create_draft"
  | "create_team"
  | "invite_member"
  | "share_object"
  | "prepare_publication"
  | "explain"
  | "unsupported";

const OS_TO_PLATFORM: Record<CanonicalOsAction, readonly PlatformActionId[]> = {
  navigate: [
    "navigate.home",
    "navigate.my_work",
    "navigate.search",
    "navigate.countries",
    "navigate.companies",
    "navigate.universities",
    "navigate.research",
    "navigate.evidence",
    "navigate.graph",
    "navigate.reports",
    "navigate.investor",
    "navigate.government",
    "navigate.governance",
    "navigate.trust",
    "navigate.settings",
    "navigate.about",
    "navigate.back",
    "entity.open_country",
    "entity.open_company",
    "entity.open_university",
    "research.open_topic",
    "mission.resume",
    "project.open",
    "navigate.scientific_documents",
    "navigate.files",
    "navigate.teams",
    "navigate.messages",
    "navigate.notifications",
    "navigate.publications",
    "navigate.workspace",
  ],
  search: ["navigate.search"],
  open_object: ["project.open", "research.open_topic", "entity.open_country", "entity.open_company", "entity.open_university"],
  prepare_upload: ["scientific_intake.compose"],
  create_draft: [
    "operational_object.compose",
    "project.compose",
    "mission.compose",
    "report.compose",
    "evidence_request.compose",
  ],
  create_team: ["team.compose"],
  invite_member: ["team.invite"],
  share_object: ["object.share"],
  prepare_publication: ["publication.prepare"],
  explain: [],
  unsupported: [],
};

export function canonicalOsActionForPlatformId(actionId: PlatformActionId | null): CanonicalOsAction {
  if (!actionId) return "unsupported";
  for (const [os, ids] of Object.entries(OS_TO_PLATFORM) as [CanonicalOsAction, readonly PlatformActionId[]][]) {
    if (ids.includes(actionId)) return os;
  }
  if (actionId.startsWith("navigate.") || actionId.startsWith("entity.") || actionId === "research.open_topic") {
    return "navigate";
  }
  if (actionId.includes("compose") || actionId.startsWith("engine.")) return "create_draft";
  return "unsupported";
}

export function isRegisteredPlatformAction(actionId: string): boolean {
  return getPlatformActionDefinition(actionId) !== null;
}

export function validateNavigationHref(href: string | null | undefined): href is string {
  if (!href) return false;
  return isAllowedNavigationHref(href);
}

export function actionLevelForPlatformId(actionId: PlatformActionId | null, transcript = ""): VoiceActionLevel {
  return classifyVoiceActionLevel(actionId, transcript);
}

export function requiresAuthForOsAction(os: CanonicalOsAction): boolean {
  return (
    os === "prepare_upload" ||
    os === "create_draft" ||
    os === "create_team" ||
    os === "invite_member" ||
    os === "share_object" ||
    os === "prepare_publication"
  );
}

export { OS_TO_PLATFORM };
