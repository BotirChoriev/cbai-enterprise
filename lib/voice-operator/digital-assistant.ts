/**
 * CBAI Digital Assistant — single session brain for Voice Operator text + voice side-effects.
 * Uses deterministic platform routing (same stack as Command Center) plus evidence conversation engine.
 * Does not create a second voice backend.
 */

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { EvidenceResultsPayload } from "@/lib/voice-operator/types";
import {
  appendConversationTurn,
  createVoiceSessionMemory,
  readVoiceSessionMemory,
} from "@/lib/voice-operator/session-memory";
import {
  processConversationInput,
  type ConversationEngineResponse,
} from "@/lib/voice-operator/conversation-engine";
import type { VoiceToolContext } from "@/lib/voice-operator/tools/voice-tools";
import {
  resolveVoiceAction,
  type VoiceResolverContext,
} from "@/lib/voice/voice-action-resolver";
import { executeVoiceAction, type ExecuteVoiceActionDeps } from "@/lib/voice/execute-voice-action";
import {
  detectMissionAssistantIntent,
  writePendingMissionProblem,
} from "@/lib/voice-operator/mission-intent";

export type DigitalAssistantResult = {
  readonly assistantText: string;
  readonly href?: string;
  readonly evidenceResults?: EvidenceResultsPayload;
  readonly openEvidencePanel?: boolean;
  readonly awaitingConsent?: boolean;
  readonly handled: boolean;
};

export type DigitalAssistantDeps = {
  readonly language: string;
  readonly router: AppRouterInstance;
  readonly voiceResolverContext: VoiceResolverContext;
  readonly executeDeps: ExecuteVoiceActionDeps;
  readonly toolContext: VoiceToolContext;
  /** When true, user turn was already written to session memory (Realtime transcript). */
  readonly userTurnAlreadyRecorded?: boolean;
  /** When true, only navigate/mission side-effects — skip assistant transcript append (Realtime speaks). */
  readonly sideEffectsOnly?: boolean;
};

function ensureSession(language: string): void {
  if (!readVoiceSessionMemory()) {
    createVoiceSessionMemory(language, "realtime");
  }
}

/**
 * Route one user utterance through Mission → platform actions → evidence engine.
 */
export async function runDigitalAssistant(
  userText: string,
  deps: DigitalAssistantDeps,
): Promise<DigitalAssistantResult> {
  const trimmed = userText.trim();
  ensureSession(deps.language);

  if (!deps.userTurnAlreadyRecorded) {
    appendConversationTurn({ role: "user", text: trimmed || userText });
  }

  if (!trimmed) {
    const assistantText =
      deps.language === "uz"
        ? "Qanday yordam kerak? Tadqiqot, dalil, missiya yoki platforma bo‘limini aytishingiz mumkin."
        : "How can I help? Ask about Research, Evidence, Missions, or any platform module.";
    if (!deps.sideEffectsOnly) {
      appendConversationTurn({ role: "assistant", text: assistantText });
    }
    return { assistantText, handled: true };
  }

  const missionAction = detectMissionAssistantIntent(trimmed, deps.language);
  if (missionAction) {
    if (missionAction.problemSeed) {
      writePendingMissionProblem(missionAction.problemSeed);
    }
    if (!deps.sideEffectsOnly) {
      appendConversationTurn({ role: "assistant", text: missionAction.assistantText });
    }
    deps.router.push(missionAction.href);
    return {
      assistantText: missionAction.assistantText,
      href: missionAction.href,
      handled: true,
    };
  }

  const proposal = resolveVoiceAction(trimmed, deps.voiceResolverContext);
  if (proposal.status === "known") {
    const message =
      executeVoiceAction(proposal, deps.executeDeps) ??
      proposal.message ??
      (deps.language === "uz" ? "Bajarildi." : "Done.");
    if (!deps.sideEffectsOnly) {
      appendConversationTurn({ role: "assistant", text: message });
    }
    return {
      assistantText: message,
      href: proposal.href,
      handled: true,
    };
  }

  if (proposal.status === "blocked") {
    const assistantText =
      deps.language === "uz"
        ? "Bu so‘rovni xavfsizlik sababli bajarolmayman. Boshqa yo‘l bilan so‘rang."
        : "I can’t run that request for safety reasons. Try a different phrasing.";
    if (!deps.sideEffectsOnly) {
      appendConversationTurn({ role: "assistant", text: assistantText });
    }
    return { assistantText, handled: true };
  }

  // Evidence / clarify path — conversation engine appends the user turn again unless skipped.
  const response = await processConversationInput(trimmed, deps.toolContext, {
    skipUserAppend: true,
  });
  return conversationToResult(response);
}

function conversationToResult(response: ConversationEngineResponse): DigitalAssistantResult {
  return {
    assistantText: response.assistantText,
    href: response.navigateHref,
    evidenceResults: response.evidenceResults,
    openEvidencePanel: response.openEvidencePanel,
    awaitingConsent: response.awaitingConsent,
    handled: true,
  };
}
