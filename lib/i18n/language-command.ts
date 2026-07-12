/**
 * Voice/text "change language" commands (Global Language Foundation + Multilingual Voice
 * Commands mission, Phase 9/10). A real, deterministic resolver — same pattern as every other
 * command resolver in lib/assistant/ — never a model call. Distinguishes interface language from
 * voice-recognition language, matching the two separate profile fields the rest of this platform
 * already uses (preferredLanguage vs speechLanguage).
 *
 * "Change language → confirm selection visibly" (Phase 10): this resolver never mutates state
 * itself — it returns a real result the caller (components/assistant/AssistantCommandCenter.tsx)
 * applies and confirms, exactly like every other command result.
 */

import { getActiveLanguages, getLanguageDefinition } from "@/lib/i18n/languages";

export type LanguageCommandResult =
  | { type: "set-interface-language"; code: string; message: string }
  | { type: "set-voice-language"; voiceLocale: string; message: string }
  | { type: "navigate"; href: string; message: string };

const INTERFACE_LANGUAGE_TRIGGERS = [
  "change language", "change interface language", "switch language", "set language",
  "interfeys tilini", "tilni o'zgartir", "tilni almashtir",
  "сменить язык", "изменить язык", "поменять язык",
  "dili değiştir", "arayüz dilini değiştir", "dil değiştir",
];

const VOICE_LANGUAGE_TRIGGERS = [
  "change voice language", "voice language", "speech language",
  "ovoz tilini", "nutq tilini",
  "голосовой язык", "язык распознавания",
  "ses dilini", "konuşma dilini",
];

function findLanguageInText(normalized: string) {
  return getActiveLanguages().find(
    (language) =>
      normalized.includes(language.name.toLowerCase()) ||
      normalized.includes(language.nativeName.toLowerCase()) ||
      normalized.includes(language.code.toLowerCase()),
  );
}

/** Returns null when the input isn't a language-change command at all — callers fall through to
 * the next resolver, exactly like every other command resolver in this app. */
export function resolveLanguageCommand(rawInput: string): LanguageCommandResult | null {
  const normalized = rawInput.trim().toLowerCase();
  if (!normalized) return null;

  const isVoiceTrigger = VOICE_LANGUAGE_TRIGGERS.some((trigger) => normalized.includes(trigger));
  const isInterfaceTrigger = !isVoiceTrigger && INTERFACE_LANGUAGE_TRIGGERS.some((trigger) => normalized.includes(trigger));
  if (!isVoiceTrigger && !isInterfaceTrigger) return null;

  const matchedLanguage = findLanguageInText(normalized);

  if (isVoiceTrigger) {
    if (matchedLanguage?.voiceLocale) {
      return {
        type: "set-voice-language",
        voiceLocale: matchedLanguage.voiceLocale,
        message: `Voice language set to ${matchedLanguage.nativeName}.`,
      };
    }
    return { type: "navigate", href: "/settings", message: "Open Settings to change your voice-recognition language." };
  }

  if (matchedLanguage) {
    return {
      type: "set-interface-language",
      code: matchedLanguage.code,
      message: `Language changed to ${matchedLanguage.nativeName}.`,
    };
  }
  return { type: "navigate", href: "/settings", message: "Open Settings to change your interface language." };
}

export { getLanguageDefinition };
