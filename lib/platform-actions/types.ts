/**
 * Canonical platform action types — shared by typed, voice, and Realtime paths.
 *
 * Stage 1: ActionLevel 0–3 contracts live in lib/canonical-contracts/actions.ts
 * (re-exports VoiceActionLevel). This registry remains the runtime source of truth.
 * Do not invent a second command engine.
 */

import type { OperationalObjectDraft, OperationalObjectDomain, OperationalObjectType } from "@/lib/operational-objects/operational-object.types";

export type PlatformActionId =
  | "navigate.home"
  | "navigate.my_work"
  | "navigate.search"
  | "navigate.countries"
  | "navigate.companies"
  | "navigate.universities"
  | "navigate.research"
  | "navigate.evidence"
  | "navigate.graph"
  | "navigate.reports"
  | "navigate.investor"
  | "navigate.government"
  | "navigate.governance"
  | "navigate.trust"
  | "navigate.settings"
  | "navigate.about"
  | "navigate.back"
  | "navigate.workspace"
  | "navigate.scientific_documents"
  | "navigate.files"
  | "navigate.teams"
  | "navigate.messages"
  | "navigate.notifications"
  | "navigate.publications"
  | "entity.open_country"
  | "entity.open_company"
  | "entity.open_university"
  | "research.open_topic"
  | "mission.resume"
  | "project.open"
  | "transcript.show"
  | "transcript.hide"
  | "voice.stop"
  | "voice.close"
  | "operational_object.compose"
  | "operational_object.confirm_create"
  | "project.compose"
  | "mission.compose"
  | "report.compose"
  | "evidence_request.compose"
  | "scientific_intake.compose"
  | "team.compose"
  | "team.invite"
  | "object.share"
  | "publication.prepare"
  | "engine.research.start"
  | "engine.evidence.start"
  | "engine.country.start"
  | "engine.organization.start"
  | "engine.mission.start"
  | "engine.governance.start"
  | "engine.meeting.start"
  | "engine.research.confirm"
  | "engine.evidence.confirm"
  | "engine.country.confirm"
  | "engine.organization.confirm"
  | "engine.mission.confirm"
  | "engine.governance.confirm"
  | "engine.meeting.confirm";

export type PlatformActionConfidence = "high" | "medium" | "low";

export type PlatformMutationKind = "none" | "draft" | "confirm_required";

export type PlatformActionDefinition = {
  readonly id: PlatformActionId;
  readonly readOnly: boolean;
  readonly mutationKind: PlatformMutationKind;
  readonly successMessageKey: string;
  readonly failureMessageKey: string;
  readonly analyticsClass: string;
  readonly aliases: readonly string[];
};

export type PlatformNavigationTarget = {
  readonly href: string;
  readonly labelKey?: string;
  readonly labelVars?: Record<string, string>;
};

export type PlatformActionParams = {
  readonly entityId?: string;
  readonly entityName?: string;
  readonly topicId?: string;
  readonly query?: string;
  readonly domain?: OperationalObjectDomain;
  readonly draftType?: OperationalObjectType;
  readonly title?: string;
  readonly userStatement?: string;
  readonly engineId?: string;
  readonly countryCode?: string;
};

export type PlatformActionContext = {
  readonly locale: string;
  readonly pathname: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly originalText: string;
};

export type PlatformGuidanceAction = {
  readonly id: string;
  readonly labelKey: string;
};

export type PlatformGuidance = {
  readonly sectionKey: string;
  readonly purposeKey: string;
  readonly nextActions: readonly PlatformGuidanceAction[];
};

export type PlatformActionIntent = {
  readonly actionId: PlatformActionId;
  readonly confidence: PlatformActionConfidence;
  readonly params: PlatformActionParams;
  readonly originalText: string;
  readonly clarifyQuestionKey?: string;
  readonly clarifyOptions?: readonly { readonly id: string; readonly labelKey: string }[];
};

export type PlatformMutationRequest = {
  readonly actionId: PlatformActionId;
  readonly draft: OperationalObjectDraft;
  readonly inferredFields: readonly string[];
};

export type PlatformActionResult =
  | {
      readonly ok: true;
      readonly actionId: PlatformActionId;
      readonly navigation?: PlatformNavigationTarget;
      readonly mutation?: PlatformMutationRequest;
      readonly guidance?: PlatformGuidance;
      readonly localControl?: "voice.stop" | "voice.close" | "transcript.show" | "transcript.hide" | "navigate.back";
      readonly engineStart?: {
        readonly engineId: string;
        readonly statement: string;
        readonly entityId?: string;
        readonly entityName?: string;
        readonly countryCode?: string;
        readonly domain?: string;
      };
      readonly messageKey?: string;
      readonly messageVars?: Record<string, string>;
    }
  | {
      readonly ok: false;
      readonly code:
        | "unknown_action"
        | "ambiguous_intent"
        | "entity_not_found"
        | "route_unavailable"
        | "confirmation_required"
        | "malformed_arguments"
        | "blocked";
      readonly messageKey: string;
      readonly clarifyOptions?: readonly { readonly id: string; readonly labelKey: string }[];
    };

export type RealtimeToolCallRequest = {
  readonly callId: string;
  readonly name: string;
  readonly argumentsJson: string;
};

export type RealtimeToolCallResult = {
  readonly callId: string;
  readonly output: Record<string, unknown>;
};
