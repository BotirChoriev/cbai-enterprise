/**
 * Voice command executor — applies allowlisted actions and deduplicates final events.
 */

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { OperationalObjectDraft } from "@/lib/operational-objects/operational-object.types";
import { applyPlatformActionResult } from "@/lib/platform-actions/apply-platform-action";
import type { PlatformActionContext, PlatformGuidance } from "@/lib/platform-actions/types";
import type { OntologyLocale } from "@/lib/ontology/types";
import { applyTemporaryRoleContext, patchVoiceSessionContext } from "@/lib/voice-operator/commands/voice-command-context";
import { resolveVoiceCommand } from "@/lib/voice-operator/commands/voice-command-resolver";
import { canonicalOsActionForPlatformId } from "@/lib/platform-actions/action-registry";
import {
  guestGateMessageKey,
  createPendingAuthIntent,
  guestMayExecute,
  savePendingAuthIntent,
} from "@/lib/voice-operator/auth-action-policy";
import type {
  VoiceCommandClarifyOption,
  VoiceCommandExecutionResult,
  VoiceCommandParseInput,
  VoiceOperatorActionStatus,
} from "@/lib/voice-operator/commands/voice-command-types";

export type VoiceCommandExecutorDeps = {
  readonly router: AppRouterInstance;
  readonly openComposer: (
    draft: OperationalObjectDraft,
    inferredFields: readonly string[],
    source: "voice_command" | "typed_command",
  ) => void;
  readonly onLocalControl?: (
    control: "voice.stop" | "voice.close" | "transcript.show" | "transcript.hide" | "navigate.back",
  ) => void;
  readonly setGuidance?: (guidance: PlatformGuidance | null) => void;
  readonly setTranscriptVisible?: (visible: boolean) => void;
  readonly t: (path: string, vars?: Record<string, string>) => string;
  readonly onStatus?: (status: VoiceOperatorActionStatus, detail?: string) => void;
  readonly onClarify?: (options: readonly VoiceCommandClarifyOption[], question: string) => void;
  /** When false, protected actions are gated (guest). Defaults to true for back-compat in tests. */
  readonly isSignedIn?: boolean;
  readonly onRequireSignIn?: (message: string, href: string) => void;
};

const recentFingerprints = new Map<string, number>();
const DEDUPE_MS = 2500;

function fingerprint(text: string): string {
  return text.trim().toLowerCase();
}

export function clearVoiceCommandDedupe(): void {
  recentFingerprints.clear();
}

export function wasVoiceCommandRecentlyExecuted(text: string, eventId?: string): boolean {
  void eventId;
  const key = fingerprint(text);
  const at = recentFingerprints.get(key);
  if (at == null) return false;
  return Date.now() - at < DEDUPE_MS;
}

function markExecuted(text: string, eventId?: string): void {
  void eventId;
  recentFingerprints.set(fingerprint(text), Date.now());
}

export function executeVoiceCommand(
  input: VoiceCommandParseInput,
  platformContext: PlatformActionContext,
  deps: VoiceCommandExecutorDeps,
): VoiceCommandExecutionResult {
  deps.onStatus?.("understanding");

  if (!input.final) {
    deps.onStatus?.("idle");
    return {
      executed: false,
      duplicate: false,
      awaitingConfirmation: false,
      message: null,
      status: "idle",
    };
  }

  if (wasVoiceCommandRecentlyExecuted(input.text, input.eventId)) {
    deps.onStatus?.("completed");
    return {
      executed: false,
      duplicate: true,
      awaitingConfirmation: false,
      message: null,
      status: "completed",
    };
  }

  const resolution = resolveVoiceCommand(input, platformContext);

  // Identity FAQ / conversational answers with no navigation payload.
  if (resolution.spokenMessage && !resolution.platformResult) {
    markExecuted(input.text, input.eventId);
    deps.onStatus?.("completed", resolution.spokenMessage);
    return {
      executed: true,
      duplicate: false,
      awaitingConfirmation: false,
      message: resolution.spokenMessage,
      status: "completed",
    };
  }

  const signedIn = deps.isSignedIn !== false;
  const actionId = resolution.action?.actionId ?? null;
  if (!signedIn && !guestMayExecute(actionId)) {
    const os = canonicalOsActionForPlatformId(actionId);
    const message = deps.t(guestGateMessageKey(os));
    const pending = createPendingAuthIntent({
      osAction: os,
      platformActionId: actionId,
      href: resolution.action?.target.href ?? null,
      titleHint: resolution.action?.announcementVars?.name ?? null,
      originalText: input.text,
      locale: platformContext.locale,
      metadata: {},
    });
    savePendingAuthIntent(pending);
    deps.onRequireSignIn?.(message, "/account?resume=pending");
    deps.onStatus?.("waiting_confirmation", message);
    markExecuted(input.text, input.eventId);
    return {
      executed: false,
      duplicate: false,
      awaitingConfirmation: true,
      message,
      status: "waiting_confirmation",
    };
  }

  // Clarification-only (no safe action to run yet).
  if (resolution.clarifyOptions?.length && !resolution.platformResult?.ok) {
    const question = deps.t(resolution.messageKey);
    deps.onClarify?.(resolution.clarifyOptions, question);
    deps.onStatus?.("clarifying", question);
    markExecuted(input.text, input.eventId);
    return {
      executed: false,
      duplicate: false,
      awaitingConfirmation: false,
      message: question,
      status: "clarifying",
      clarifyOptions: resolution.clarifyOptions,
    };
  }

  if (resolution.sessionContextPatch?.roleHint && resolution.sessionContextPatch.domainId) {
    applyTemporaryRoleContext({
      roleHint: resolution.sessionContextPatch.roleHint,
      domainId: resolution.sessionContextPatch.domainId,
      domainLabel: resolution.sessionContextPatch.domainLabel ?? resolution.sessionContextPatch.domainId,
    });
  }

  if (!resolution.ok || !resolution.platformResult) {
    const message = resolution.spokenMessage ?? deps.t(resolution.messageKey);
    deps.onStatus?.("could_not_understand", message);
    return {
      executed: false,
      duplicate: false,
      awaitingConfirmation: false,
      message,
      status: "could_not_understand",
    };
  }

  const href = resolution.action?.target.href;
  deps.onStatus?.(resolution.action?.risk === "needs_confirmation" ? "waiting_confirmation" : "opening");

  const outcome = applyPlatformActionResult(resolution.platformResult, {
    router: deps.router,
    pathname: platformContext.pathname,
    locale: platformContext.locale as OntologyLocale,
    openComposer: deps.openComposer,
    onLocalControl: deps.onLocalControl,
    setGuidance: deps.setGuidance,
    setTranscriptVisible: deps.setTranscriptVisible,
    t: deps.t,
  });

  markExecuted(input.text, input.eventId);

  const announcement =
    resolution.spokenMessage ??
    (resolution.messageKey ? deps.t(resolution.messageKey, resolution.messageVars) : null) ??
    outcome.message;

  if (outcome.handled && resolution.action?.actionId) {
    patchVoiceSessionContext({
      lastActionId: resolution.action.actionId,
      lastHref: href ?? null,
    });
  }

  // After chemist navigation, offer next-step choices without blocking the route change.
  if (resolution.clarifyOptions?.length && outcome.handled) {
    deps.onClarify?.(resolution.clarifyOptions, announcement ?? deps.t("voiceCommand.chemistFollowUp"));
  }

  const status: VoiceOperatorActionStatus = !outcome.handled
    ? "could_not_understand"
    : outcome.awaitingConfirmation
      ? "waiting_confirmation"
      : resolution.clarifyOptions?.length
        ? "clarifying"
        : href
          ? "selected"
          : "completed";

  deps.onStatus?.(status, announcement ?? undefined);

  return {
    executed: outcome.handled,
    duplicate: false,
    awaitingConfirmation: outcome.awaitingConfirmation,
    message: announcement,
    href,
    status,
    clarifyOptions: resolution.clarifyOptions,
  };
}
