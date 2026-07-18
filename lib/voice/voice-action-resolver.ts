/**
 * Pure voice/operator action resolver — proposes actions without navigation or mutation.
 */

import { resolveUniversalIntent, intentCategoryTranslationKey } from "@/lib/intelligence-os/universal-intent";
import { resolveRelationshipCommand, type RelationshipFocus } from "@/lib/assistant/assistant-relationship-commands";
import { resolveProjectCommand } from "@/lib/project/project-commands";
import { resolveGenesisCommand } from "@/lib/genesis/genesis-operator-commands";
import { resolveResearchCanvasCommand } from "@/lib/research-canvas/research-canvas-operator-commands";
import { resolveFlagshipOperatorCommand } from "@/lib/product/flagship-operator-commands";
import { resolveLanguageCommand } from "@/lib/i18n/language-command";
import { isConservativelyBlockedInput } from "@/lib/voice/voice-blocklist";
import type { VoiceActionKind, VoiceActionProposal } from "@/lib/voice/voice-control-types";

export type VoiceResolverContext = {
  readonly relationshipFocus: RelationshipFocus | null;
  readonly operatorName: string;
  readonly focusedEntityName?: string;
};

const SAVE_WORKSPACE_PHRASES = ["save workspace", "save to workspace", "bookmark", "save company"] as const;

function blockedProposal(input: string): VoiceActionProposal {
  return {
    status: "blocked",
    understoodText: input,
    actionLabel: "voiceControl.actionBlocked",
    actionDescription: "voiceControl.actionBlockedDescription",
    kind: "unknown",
    blockedReasonKey: "voiceControl.blockedTranscript",
  };
}

function unknownProposal(input: string): VoiceActionProposal {
  return {
    status: "unknown",
    understoodText: input,
    actionLabel: "voiceControl.actionUnknown",
    actionDescription: "voiceControl.actionUnknownDescription",
    kind: "unknown",
  };
}

function knownProposal(params: {
  input: string;
  kind: VoiceActionKind;
  actionLabel: string;
  actionDescription: string;
  href?: string;
  message?: string;
  profilePatch?: Readonly<{ preferredLanguage?: string; speechLanguage?: string }>;
  pinEntity?: boolean;
  requiresExternalConsent?: boolean;
  actionVars?: Record<string, string>;
}): VoiceActionProposal {
  return {
    status: "known",
    understoodText: params.input,
    actionLabel: params.actionLabel,
    actionDescription: params.actionDescription,
    actionVars: params.actionVars,
    kind: params.kind,
    href: params.href,
    message: params.message,
    profilePatch: params.profilePatch,
    pinEntity: params.pinEntity,
    requiresExternalConsent: params.requiresExternalConsent,
  };
}

export function resolveVoiceAction(rawInput: string, context: VoiceResolverContext): VoiceActionProposal {
  const trimmed = rawInput.trim();
  if (!trimmed) return unknownProposal(trimmed);
  if (isConservativelyBlockedInput(trimmed)) return blockedProposal(trimmed);

  const normalized = trimmed.toLowerCase();

  if (SAVE_WORKSPACE_PHRASES.some((phrase) => normalized.includes(phrase))) {
    return knownProposal({
      input: trimmed,
      kind: "workspace_pin",
      actionLabel: "voiceControl.actionSaveWorkspace",
      actionDescription: context.focusedEntityName
        ? "voiceControl.actionSaveWorkspaceNamed"
        : "voiceControl.actionSaveWorkspaceEmpty",
      actionVars: context.focusedEntityName ? { name: context.focusedEntityName } : undefined,
      pinEntity: Boolean(context.focusedEntityName),
    });
  }

  const languageMatch = resolveLanguageCommand(trimmed);
  if (languageMatch) {
    if (languageMatch.type === "set-interface-language") {
      return knownProposal({
        input: trimmed,
        kind: "profile_update",
        actionLabel: "voiceControl.actionSetInterfaceLanguage",
        actionDescription: "voiceControl.actionSetInterfaceLanguageDescription",
        profilePatch: { preferredLanguage: languageMatch.code },
        message: languageMatch.message,
      });
    }
    if (languageMatch.type === "set-voice-language") {
      return knownProposal({
        input: trimmed,
        kind: "profile_update",
        actionLabel: "voiceControl.actionSetVoiceLanguage",
        actionDescription: "voiceControl.actionSetVoiceLanguageDescription",
        profilePatch: { speechLanguage: languageMatch.voiceLocale },
        message: languageMatch.message,
      });
    }
    return knownProposal({
      input: trimmed,
      kind: "navigate",
      actionLabel: "voiceControl.actionNavigate",
      actionDescription: "voiceControl.actionNavigateDescription",
      href: languageMatch.href,
      message: languageMatch.message,
      actionVars: { destination: languageMatch.href },
    });
  }

  const relationshipMatch = resolveRelationshipCommand(trimmed, context.relationshipFocus);
  if (relationshipMatch) {
    return knownProposal({
      input: trimmed,
      kind: relationshipMatch.type === "navigate" ? "navigate" : "message",
      actionLabel: "voiceControl.actionNavigate",
      actionDescription: "voiceControl.actionNavigateDescription",
      href: relationshipMatch.type === "navigate" ? relationshipMatch.href : undefined,
      message: relationshipMatch.message,
      actionVars: relationshipMatch.type === "navigate" ? { destination: relationshipMatch.href } : undefined,
    });
  }

  const projectMatch = resolveProjectCommand(trimmed);
  if (projectMatch) {
    return knownProposal({
      input: trimmed,
      kind: projectMatch.type === "navigate" ? "navigate" : "message",
      actionLabel: "voiceControl.actionNavigate",
      actionDescription: "voiceControl.actionNavigateDescription",
      href: projectMatch.type === "navigate" ? projectMatch.href : undefined,
      message: projectMatch.message,
      actionVars: projectMatch.type === "navigate" ? { destination: projectMatch.href } : undefined,
    });
  }

  const flagshipMatch = resolveFlagshipOperatorCommand(trimmed);
  if (flagshipMatch) {
    return knownProposal({
      input: trimmed,
      kind: flagshipMatch.href ? "navigate" : "message",
      actionLabel: "voiceControl.actionFlagship",
      actionDescription: "voiceControl.actionFlagshipDescription",
      href: flagshipMatch.href,
      message: flagshipMatch.message,
      actionVars: flagshipMatch.href ? { destination: flagshipMatch.href } : undefined,
    });
  }

  const canvasMatch = resolveResearchCanvasCommand(trimmed);
  if (canvasMatch) {
    const requiresExternalConsent =
      trimmed.toLowerCase().includes("search") ||
      trimmed.toLowerCase().includes("qidir") ||
      trimmed.toLowerCase().includes("izla");
    return knownProposal({
      input: trimmed,
      kind: canvasMatch.href ? "navigate" : "message",
      actionLabel: "voiceControl.actionResearchCanvas",
      actionDescription: "voiceControl.actionResearchCanvasDescription",
      href: canvasMatch.href,
      message: canvasMatch.message,
      actionVars: canvasMatch.href ? { destination: canvasMatch.href } : undefined,
      requiresExternalConsent,
    });
  }

  const genesisMatch = resolveGenesisCommand(trimmed, context.operatorName);
  if (genesisMatch) {
    return knownProposal({
      input: trimmed,
      kind: genesisMatch.href ? "navigate" : "message",
      actionLabel: "voiceControl.actionGenesis",
      actionDescription: "voiceControl.actionGenesisDescription",
      href: genesisMatch.href,
      message: genesisMatch.message,
      actionVars: genesisMatch.href ? { destination: genesisMatch.href } : undefined,
    });
  }

  const intent = resolveUniversalIntent(trimmed);
  if (intent.command) {
    return knownProposal({
      input: trimmed,
      kind: "navigate",
      actionLabel: intentCategoryTranslationKey(intent.category),
      actionDescription: "voiceControl.actionNavigateDescription",
      href: intent.command.href,
      actionVars: { destination: intent.command.href },
    });
  }

  return unknownProposal(trimmed);
}

export function voiceActionRequiresConfirmation(proposal: VoiceActionProposal): boolean {
  if (proposal.status !== "known") return false;
  return proposal.kind === "navigate" || proposal.kind === "workspace_pin" || proposal.kind === "profile_update";
}

export const VOICE_PENDING_ACTION_KEY = "cbai-voice-pending-action";

/** Pending actions must never survive refresh as executable commands. */
export function clearPendingVoiceActionStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(VOICE_PENDING_ACTION_KEY);
  } catch {
    /* ignore */
  }
}
