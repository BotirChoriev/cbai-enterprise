/**
 * Voice command resolver — resolves final transcripts through platform-actions.
 * Architecture decision: prefer Realtime tools when present; always validate via
 * local typed resolver (this module) because model-emitted routes cannot be trusted.
 */

import { resolvePlatformDomain } from "@/lib/platform-actions/domain-resolver";
import { resolvePlatformAction, resolvePlatformActionFromIntent } from "@/lib/platform-actions/resolve-platform-action";
import { resolvePlatformIntent } from "@/lib/platform-actions/intent-matcher";
import { isAllowedNavigationHref } from "@/lib/platform-actions/registry";
import type { PlatformActionContext, PlatformActionId, PlatformActionIntent } from "@/lib/platform-actions/types";
import { getVoiceCommandEntry } from "@/lib/voice-operator/commands/voice-command-registry";
import { parseVoiceCommandInput } from "@/lib/voice-operator/commands/voice-command-parser";
import { rejectArbitraryModelUrl, riskForAction } from "@/lib/voice-operator/commands/voice-command-policy";
import { answerCbaiIdentityFaq, classifyVoiceActionLevel, matchIdentityFaqIntent } from "@/lib/voice-operator/identity";
import { matchScientificIntakeIntent } from "@/lib/scientific-intake/scientific-intake";
import type {
  VoiceCommandAction,
  VoiceCommandClarifyOption,
  VoiceCommandIntent,
  VoiceCommandParseInput,
  VoiceCommandResolution,
} from "@/lib/voice-operator/commands/voice-command-types";

function categoryFromAction(actionId: PlatformActionId | null): VoiceCommandIntent["category"] {
  if (!actionId) return "unsupported";
  return getVoiceCommandEntry(actionId)?.category ?? "unsupported";
}

function announcementFor(
  actionId: PlatformActionId | null,
  domainId?: string,
  conversationalRole?: boolean,
): string {
  if (domainId === "chemistry" && conversationalRole) {
    return "voiceCommand.chemistUnderstood";
  }
  if (domainId === "chemistry" && (actionId === "navigate.research" || actionId === "research.open_topic")) {
    return "voiceCommand.announcedChemistry";
  }
  if (!actionId) return "voiceCommand.couldNotUnderstand";
  return getVoiceCommandEntry(actionId)?.announcementKey ?? "voiceCommand.completedGeneric";
}

export function resolveVoiceCommand(
  input: VoiceCommandParseInput,
  platformContext: PlatformActionContext,
): VoiceCommandResolution {
  const parsed = parseVoiceCommandInput(input);
  if (!parsed.accepted) {
    return {
      ok: false,
      intent: {
        category: "unsupported",
        actionId: null,
        confidence: "low",
        originalText: input.text,
        normalizedText: "",
        conversationalOnly: false,
      },
      action: null,
      platformResult: null,
      messageKey: "voiceCommand.partialIgnored",
      actionLevel: 0,
    };
  }

  const faqKind = matchIdentityFaqIntent(input.text);
  if (faqKind) {
    return {
      ok: true,
      intent: {
        category: "explain_identity",
        actionId: null,
        confidence: "high",
        originalText: input.text,
        normalizedText: parsed.normalizedText,
        conversationalOnly: true,
      },
      action: null,
      platformResult: null,
      spokenMessage: answerCbaiIdentityFaq(faqKind, platformContext.locale),
      identityFaqKind: faqKind,
      messageKey: "voiceCommand.identityAnswered",
      actionLevel: 0,
    };
  }

  if (matchScientificIntakeIntent(input.text) && !CREATE_LIKE_NAV_ONLY(input.text)) {
    const intakeIntent = {
      actionId: "scientific_intake.compose" as const,
      confidence: "high" as const,
      params: { userStatement: input.text, title: "Scientific document intake", domain: "research" as const },
      originalText: input.text,
    };
    const platformResult = resolvePlatformActionFromIntent(intakeIntent, {
      ...platformContext,
      originalText: input.text,
    });
    const href = platformResult.ok ? platformResult.navigation?.href : undefined;
    return {
      ok: platformResult.ok,
      intent: {
        category: "create_draft_work",
        actionId: "scientific_intake.compose",
        confidence: "high",
        originalText: input.text,
        normalizedText: parsed.normalizedText,
        conversationalOnly: false,
      },
      action: platformResult.ok
        ? {
            category: "create_draft_work",
            actionId: "scientific_intake.compose",
            risk: "needs_confirmation",
            target: { href },
            announcementKey: "voiceCommand.announcedScientificIntake",
          }
        : null,
      platformResult,
      messageKey: "voiceCommand.announcedScientificIntake",
      actionLevel: 2,
    };
  }

  if (parsed.clarifyOptions) {
    return {
      ok: false,
      intent: {
        category: "request_clarification",
        actionId: null,
        confidence: "low",
        originalText: input.text,
        normalizedText: parsed.normalizedText,
        conversationalOnly: false,
      },
      action: null,
      platformResult: null,
      clarifyOptions: parsed.clarifyOptions,
      messageKey: "voiceCommand.clarifyChemistry",
      actionLevel: 0,
    };
  }

  const platformIntent = resolvePlatformIntent(input.text, platformContext.locale);
  if (!platformIntent) {
    return {
      ok: false,
      intent: {
        category: "unsupported",
        actionId: null,
        confidence: "low",
        originalText: input.text,
        normalizedText: parsed.normalizedText,
        conversationalOnly: false,
      },
      action: null,
      platformResult: null,
      messageKey: "voiceCommand.couldNotUnderstand",
      actionLevel: 0,
    };
  }

  const platformResult = resolvePlatformActionFromIntent(platformIntent, {
    ...platformContext,
    originalText: input.text,
  });

  const domain = resolvePlatformDomain(input.text);
  const actionId = platformResult.ok ? platformResult.actionId : platformIntent.actionId;
  const href = platformResult.ok ? platformResult.navigation?.href : undefined;
  const actionLevel = classifyVoiceActionLevel(actionId, input.text);

  if (href && (rejectArbitraryModelUrl(href) || !isAllowedNavigationHref(href))) {
    return {
      ok: false,
      intent: {
        category: "unsupported",
        actionId,
        confidence: "low",
        originalText: input.text,
        normalizedText: parsed.normalizedText,
        conversationalOnly: false,
      },
      action: null,
      platformResult: { ok: false, code: "blocked", messageKey: "voiceCommand.arbitraryUrlRejected" },
      messageKey: "voiceCommand.arbitraryUrlRejected",
      actionLevel: 3,
    };
  }

  const conversationalRole = parsed.conversationalRole && !CREATE_LIKE(input.text);
  const chemistFollowUp: readonly VoiceCommandClarifyOption[] | undefined =
    conversationalRole && domain?.domain.id === "chemistry"
      ? [
          {
            id: "chemistry_research",
            labelKey: "voiceCommand.optionChemistryTopic",
            actionId: "navigate.research",
            params: { query: "chemistry" },
          },
          {
            id: "chemistry_evidence",
            labelKey: "voiceCommand.optionChemistryEvidence",
            actionId: "navigate.evidence",
          },
          {
            id: "chemistry_draft",
            labelKey: "voiceCommand.optionChemistryDraft",
            actionId: "operational_object.compose",
            params: { title: "Chemistry work", domain: "research" },
          },
        ]
      : undefined;

  const intent: VoiceCommandIntent = {
    category: categoryFromAction(actionId),
    actionId,
    confidence: platformIntent.confidence,
    originalText: input.text,
    normalizedText: parsed.normalizedText,
    conversationalOnly: conversationalRole,
  };

  const action: VoiceCommandAction | null = platformResult.ok
    ? {
        category: intent.category,
        actionId,
        risk: riskForAction(actionId),
        target: {
          href,
          topicId: platformIntent.params.topicId,
          entityId: platformIntent.params.entityId,
          entityName: platformIntent.params.entityName,
          query: platformIntent.params.query ?? domain?.domain.id,
          domainId: domain?.domain.id,
        },
        announcementKey: announcementFor(actionId, domain?.domain.id, conversationalRole),
        announcementVars: platformIntent.params.entityName
          ? { name: platformIntent.params.entityName }
          : domain
            ? { name: domain.domain.id }
            : undefined,
      }
    : null;

  const sessionContextPatch =
    domain && conversationalRole
      ? {
          roleHint: input.text.trim(),
          domainId: domain.domain.id,
          domainLabel: domain.titleSuggestion,
        }
      : undefined;

  return {
    ok: platformResult.ok,
    intent,
    action,
    platformResult,
    sessionContextPatch,
    clarifyOptions: chemistFollowUp,
    messageKey:
      action?.announcementKey ??
      (platformResult.ok ? "voiceCommand.completedGeneric" : platformResult.messageKey),
    messageVars: action?.announcementVars,
    actionLevel,
  };
}

function CREATE_LIKE(text: string): boolean {
  return /(yarat|create|tuz|reja|plan|draft|hisobot|report)/i.test(text);
}

function CREATE_LIKE_NAV_ONLY(text: string): boolean {
  return /(sahifasini\s+och|open\s+page|och)/i.test(text) && !/(phd|dissert|yukla|upload|yubor)/i.test(text);
}

/** Resolve an already-matched platform intent (e.g. from Realtime tool args). */
export function resolveVoiceCommandFromPlatformIntent(
  intent: PlatformActionIntent,
  platformContext: PlatformActionContext,
): VoiceCommandResolution {
  return resolveVoiceCommand(
    { text: intent.originalText, locale: platformContext.locale, pathname: platformContext.pathname, final: true },
    platformContext,
  );
}

export function resolveVoiceCommandFromText(
  text: string,
  locale: string,
  pathname = "/",
): VoiceCommandResolution {
  return resolveVoiceCommand(
    { text, locale, pathname, final: true },
    { locale, pathname, missionId: null, projectId: null, originalText: text },
  );
}

/** Convenience re-export used by tests for end-to-end text → platform result. */
export function resolveAndPreviewPlatformAction(text: string, locale: string, pathname = "/") {
  return resolvePlatformAction(text, {
    locale,
    pathname,
    missionId: null,
    projectId: null,
    originalText: text,
  });
}
