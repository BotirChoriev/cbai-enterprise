/**
 * Voice Command Orchestrator — typed concepts.
 * Wraps the existing platform-actions registry; does not invent a second command architecture.
 */

import type { PlatformActionId, PlatformActionResult } from "@/lib/platform-actions/types";

export type VoiceCommandCategory =
  | "navigate"
  | "open_topic"
  | "open_entity"
  | "search"
  | "apply_filter"
  | "open_project"
  | "resume_mission"
  | "open_evidence"
  | "open_reports"
  | "open_graph"
  | "open_settings"
  | "create_draft_work"
  | "request_clarification"
  | "local_control"
  | "engine_start"
  | "explain_identity"
  | "unsupported";

export type VoiceCommandRisk = "safe_reversible" | "needs_confirmation" | "blocked";

export type VoiceCommandIntent = {
  readonly category: VoiceCommandCategory;
  readonly actionId: PlatformActionId | null;
  readonly confidence: "high" | "medium" | "low";
  readonly originalText: string;
  readonly normalizedText: string;
  readonly conversationalOnly: boolean;
};

export type VoiceCommandTarget = {
  readonly href?: string;
  readonly topicId?: string;
  readonly entityId?: string;
  readonly entityName?: string;
  readonly query?: string;
  readonly domainId?: string;
};

export type VoiceCommandAction = {
  readonly category: VoiceCommandCategory;
  readonly actionId: PlatformActionId | null;
  readonly risk: VoiceCommandRisk;
  readonly target: VoiceCommandTarget;
  readonly announcementKey: string;
  readonly announcementVars?: Record<string, string>;
};

export type VoiceCommandClarifyOption = {
  readonly id: string;
  readonly labelKey: string;
  readonly actionId: PlatformActionId;
  readonly params?: Record<string, string>;
};

export type VoiceCommandResolution = {
  readonly ok: boolean;
  readonly intent: VoiceCommandIntent;
  readonly action: VoiceCommandAction | null;
  readonly platformResult: PlatformActionResult | null;
  readonly clarifyOptions?: readonly VoiceCommandClarifyOption[];
  readonly sessionContextPatch?: Partial<VoiceSessionContext>;
  readonly messageKey: string;
  readonly messageVars?: Record<string, string>;
  /** When set, executor speaks this exact localized text (FAQ / identity). */
  readonly spokenMessage?: string;
  readonly identityFaqKind?: string;
  /** Safe action level 0–3 (Voice Operating Navigator). */
  readonly actionLevel?: 0 | 1 | 2 | 3;
};

export type VoiceCommandExecutionResult = {
  readonly executed: boolean;
  readonly duplicate: boolean;
  readonly awaitingConfirmation: boolean;
  readonly message: string | null;
  readonly href?: string;
  readonly status: VoiceOperatorActionStatus;
  readonly clarifyOptions?: readonly VoiceCommandClarifyOption[];
};

export type VoiceSessionContext = {
  readonly roleHint: string | null;
  readonly domainId: string | null;
  readonly domainLabel: string | null;
  readonly lastActionId: string | null;
  readonly lastHref: string | null;
  readonly introduced: boolean;
  readonly updatedAt: string;
};

export type VoiceOperatorActionStatus =
  | "idle"
  | "understanding"
  | "opening"
  | "selected"
  | "waiting_confirmation"
  | "completed"
  | "could_not_understand"
  | "clarifying";

export type VoiceCommandParseInput = {
  readonly text: string;
  readonly locale: string;
  readonly pathname: string;
  readonly final: boolean;
  readonly eventId?: string;
};
