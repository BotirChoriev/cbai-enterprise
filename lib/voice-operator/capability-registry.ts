/**
 * Route-aware Voice Operator capability registry.
 * Documents what Voice can do on each surface and how intents resolve.
 * Execution still goes through platform-actions + operational composer.
 */

import type { PlatformActionId } from "@/lib/platform-actions/types";

export type VoiceCapabilityKind =
  | "navigate"
  | "read"
  | "search_filter"
  | "draft_create"
  | "mutate_confirm"
  | "local_control"
  | "unsupported_honest";

export type VoiceCapabilityEntry = {
  readonly id: string;
  readonly kind: VoiceCapabilityKind;
  readonly routes: readonly string[];
  readonly examples: readonly string[];
  /** Platform action when executable; null when conversational/read-only guidance. */
  readonly actionId: PlatformActionId | null;
  readonly needsConfirmation: boolean;
  readonly successKey: string;
  readonly failureKey: string;
  readonly notes?: string;
};

export const VOICE_CAPABILITY_REGISTRY: readonly VoiceCapabilityEntry[] = [
  {
    id: "nav.home",
    kind: "navigate",
    routes: ["*"],
    examples: ["Open home", "Bosh sahifani och"],
    actionId: "navigate.home",
    needsConfirmation: false,
    successKey: "voiceCommand.announcedHome",
    failureKey: "platformAction.failureGeneric",
  },
  {
    id: "nav.my_work",
    kind: "navigate",
    routes: ["*"],
    examples: ["Open My Work", "Mening ishlarimni och"],
    actionId: "navigate.my_work",
    needsConfirmation: false,
    successKey: "voiceCommand.announcedMyWork",
    failureKey: "platformAction.failureGeneric",
  },
  {
    id: "nav.research",
    kind: "navigate",
    routes: ["*"],
    examples: ["Open Research", "Tadqiqotni och"],
    actionId: "navigate.research",
    needsConfirmation: false,
    successKey: "voiceCommand.announcedResearch",
    failureKey: "platformAction.failureGeneric",
  },
  {
    id: "nav.evidence",
    kind: "navigate",
    routes: ["*"],
    examples: ["Open Evidence", "Dalillarni och"],
    actionId: "navigate.evidence",
    needsConfirmation: false,
    successKey: "voiceCommand.announcedEvidence",
    failureKey: "platformAction.failureGeneric",
  },
  {
    id: "nav.graph",
    kind: "navigate",
    routes: ["*"],
    examples: ["Open Knowledge Graph", "Bilim grafini och"],
    actionId: "navigate.graph",
    needsConfirmation: false,
    successKey: "voiceCommand.announcedGraph",
    failureKey: "platformAction.failureGeneric",
  },
  {
    id: "nav.reports",
    kind: "navigate",
    routes: ["*"],
    examples: ["Open Reports", "Hisobotlarni och"],
    actionId: "navigate.reports",
    needsConfirmation: false,
    successKey: "voiceCommand.announcedReports",
    failureKey: "platformAction.failureGeneric",
  },
  {
    id: "nav.rooms",
    kind: "navigate",
    routes: ["*"],
    examples: ["Open Live Rooms", "Jonli xonalarni och"],
    actionId: "navigate.rooms",
    needsConfirmation: false,
    successKey: "voiceCommand.announcedRooms",
    failureKey: "platformAction.failureGeneric",
  },
  {
    id: "nav.settings",
    kind: "navigate",
    routes: ["*"],
    examples: ["Open settings", "Sozlamalarni och"],
    actionId: "navigate.settings",
    needsConfirmation: false,
    successKey: "voiceCommand.announcedSettings",
    failureKey: "platformAction.failureGeneric",
  },
  {
    id: "work.unfinished",
    kind: "search_filter",
    routes: ["*", "/my-work"],
    examples: ["Show my unfinished work", "Tugallanmagan ishlarimni ko‘rsat", "What needs my review?"],
    actionId: "navigate.my_work",
    needsConfirmation: false,
    successKey: "voiceCommand.announcedMyWork",
    failureKey: "platformAction.failureGeneric",
    notes: "Resolves to /my-work?opFilter=waiting or review with cockpit queue visible.",
  },
  {
    id: "work.needs_review",
    kind: "search_filter",
    routes: ["*", "/my-work"],
    examples: ["Show projects needing review", "Ko‘rib chiqish kerak bo‘lgan ishlar"],
    actionId: "navigate.my_work",
    needsConfirmation: false,
    successKey: "voiceCommand.announcedMyWork",
    failureKey: "platformAction.failureGeneric",
  },
  {
    id: "entity.country",
    kind: "navigate",
    routes: ["*", "/countries", "/"],
    examples: ["Open Uzbekistan", "Find Germany", "O‘zbekistonni och"],
    actionId: "entity.open_country",
    needsConfirmation: false,
    successKey: "voiceCommand.announcedEntity",
    failureKey: "platformAction.failureGeneric",
  },
  {
    id: "draft.research_question",
    kind: "draft_create",
    routes: ["*", "/research", "/my-work"],
    examples: ["Create a research question", "Tadqiqot savoli yarat", "Start a research question about soil salinity"],
    actionId: "operational_object.compose",
    needsConfirmation: true,
    successKey: "voiceCommand.announcedDraft",
    failureKey: "platformAction.confirmationRequired",
  },
  {
    id: "draft.evidence_request",
    kind: "draft_create",
    routes: ["*", "/evidence", "/countries", "/companies"],
    examples: ["Prepare an evidence request", "Dalil so‘rovi yarat"],
    actionId: "evidence_request.compose",
    needsConfirmation: true,
    successKey: "voiceCommand.announcedDraft",
    failureKey: "platformAction.confirmationRequired",
  },
  {
    id: "draft.report",
    kind: "draft_create",
    routes: ["*", "/reports", "/my-work"],
    examples: ["Draft a research report", "Hisobot qoralamasini tayyorla"],
    actionId: "report.compose",
    needsConfirmation: true,
    successKey: "voiceCommand.announcedDraft",
    failureKey: "platformAction.confirmationRequired",
    notes: "Composer opens; completed reports still require real evidence links.",
  },
  {
    id: "draft.work_plan",
    kind: "draft_create",
    routes: ["*"],
    examples: ["Create a work plan", "Ish rejasi yarat"],
    actionId: "operational_object.compose",
    needsConfirmation: true,
    successKey: "voiceCommand.announcedDraft",
    failureKey: "platformAction.confirmationRequired",
  },
  {
    id: "voice.stop",
    kind: "local_control",
    routes: ["*"],
    examples: ["Stop", "To‘xtat"],
    actionId: "voice.stop",
    needsConfirmation: false,
    successKey: "platformAction.successVoiceStop",
    failureKey: "platformAction.failureGeneric",
  },
  {
    id: "multi_party_live_audio",
    kind: "unsupported_honest",
    routes: ["/rooms"],
    examples: ["Start multi-party live call"],
    actionId: null,
    needsConfirmation: false,
    successKey: "liveRooms.multipartyNotice",
    failureKey: "liveRooms.multipartyNotice",
    notes: "Host capture uses canonical Voice Operator only; multi-party live audio is not simulated.",
  },
  {
    id: "route.filter",
    kind: "search_filter",
    routes: ["*", "/countries", "/companies", "/universities", "/research", "/my-work", "/evidence"],
    examples: ["Filter by industry aerospace", "Filter evidence requests", "Show region Asia"],
    actionId: "route.apply_filter",
    needsConfirmation: false,
    successKey: "platformAction.successFilter",
    failureKey: "platformAction.failureNavigate",
  },
  {
    id: "route.summarize",
    kind: "read",
    routes: ["*"],
    examples: ["Summarize this company", "What is missing on this country?", "Summarize my active work"],
    actionId: "route.summarize",
    needsConfirmation: false,
    successKey: "platformAction.successSummarize",
    failureKey: "platformAction.failureNavigate",
  },
  {
    id: "work.open_object",
    kind: "navigate",
    routes: ["*", "/my-work"],
    examples: ["Continue my latest research question", "Open my biodiversity work"],
    actionId: "work.open_object",
    needsConfirmation: false,
    successKey: "voiceCommand.announcedMyWork",
    failureKey: "platformAction.failureNavigate",
  },
] as const;

export function capabilitiesForRoute(pathname: string): readonly VoiceCapabilityEntry[] {
  return VOICE_CAPABILITY_REGISTRY.filter(
    (entry) => entry.routes.includes("*") || entry.routes.some((route) => pathname === route || pathname.startsWith(`${route}/`)),
  );
}

export function findCapabilityById(id: string): VoiceCapabilityEntry | null {
  return VOICE_CAPABILITY_REGISTRY.find((entry) => entry.id === id) ?? null;
}

/** Detect My Work filter intents from free text — returns query suffix for /my-work. */
export function resolveMyWorkFilterQuery(text: string): string | null {
  const normalized = text.toLowerCase();
  if (
    /needs?\s+(\w+\s+)?review|ko['‘]?rib\s+chiqish|review\s+kerak|требует\s+проверк|inceleme\s+gereken|what needs my review/.test(
      normalized,
    )
  ) {
    return "/my-work?opFilter=review";
  }
  if (
    /unfinished|tugallanmagan|incomplete|waiting|blocked|needs?\s+attention|diqqat|незаверш|bekleyen/.test(
      normalized,
    )
  ) {
    return "/my-work?opFilter=waiting";
  }
  if (/draft|qoralama|черновик|taslak/.test(normalized) && /(show|list|ko['‘]?rsat|och|open)/.test(normalized)) {
    return "/my-work?opFilter=draft";
  }
  return null;
}
