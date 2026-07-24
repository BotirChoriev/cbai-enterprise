/**
 * Voice command parser — locale-aware normalize + conversational vs actionable detection.
 */

import { normalizePlatformText } from "@/lib/platform-actions/normalize-text";
import { resolvePlatformDomain } from "@/lib/platform-actions/domain-resolver";
import type { VoiceCommandClarifyOption, VoiceCommandParseInput } from "@/lib/voice-operator/commands/voice-command-types";

const CHEMISTRY_OPEN_AMBIGUOUS =
  /^(kimyoni\s+och|kimyo\s+och|open\s+chemistry|химия\s+открой|kimyayi\s+aç)[.!?]*$/i;

const ROLE_STATEMENT =
  /(men\s+\w+man|i\s+am\s+a?\s*\w+|я\s+\w+|ben\s+\w+|kimyogar|chemist|biolog|biologist|muhandis|engineer)/i;

export function isFinalTranscriptEvent(input: VoiceCommandParseInput): boolean {
  return input.final === true && input.text.trim().length > 0;
}

export function normalizeVoiceCommandText(text: string): string {
  return normalizePlatformText(text);
}

export function isConversationalRoleStatement(text: string): boolean {
  const domain = resolvePlatformDomain(text);
  if (!domain) return false;
  return domain.userContextOnly || ROLE_STATEMENT.test(text);
}

/** Ambiguous short chemistry open → compact clarification choices. */
export function chemistryClarifyOptions(text: string): readonly VoiceCommandClarifyOption[] | null {
  if (!CHEMISTRY_OPEN_AMBIGUOUS.test(text.trim())) return null;
  return [
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
  ];
}

export function parseVoiceCommandInput(input: VoiceCommandParseInput): {
  readonly accepted: boolean;
  readonly normalizedText: string;
  readonly conversationalRole: boolean;
  readonly clarifyOptions: readonly VoiceCommandClarifyOption[] | null;
} {
  if (!isFinalTranscriptEvent(input)) {
    return { accepted: false, normalizedText: "", conversationalRole: false, clarifyOptions: null };
  }
  const normalizedText = normalizeVoiceCommandText(input.text);
  return {
    accepted: true,
    normalizedText,
    conversationalRole: isConversationalRoleStatement(input.text),
    clarifyOptions: chemistryClarifyOptions(input.text),
  };
}
