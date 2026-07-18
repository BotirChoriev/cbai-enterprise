/**
 * Device-local speech recognition language — separate from interface locale when user overrides.
 */

import { resolveVoiceLocale } from "@/lib/i18n/languages";

const SPEECH_LANG_KEY = "cbai-speech-language-override";

let memorySpeechLanguageOverride: string | null = null;

export const SPEECH_LANGUAGE_OPTIONS = [
  { code: "uz-UZ", labelKey: "voiceControl.speechLangUz" },
  { code: "en-US", labelKey: "voiceControl.speechLangEn" },
  { code: "ru-RU", labelKey: "voiceControl.speechLangRu" },
  { code: "tr-TR", labelKey: "voiceControl.speechLangTr" },
] as const;

export function readSpeechLanguageOverride(): string | null {
  if (typeof window === "undefined") {
    return memorySpeechLanguageOverride;
  }
  try {
    const raw = window.localStorage.getItem(SPEECH_LANG_KEY);
    return raw && SPEECH_LANGUAGE_OPTIONS.some((o) => o.code === raw) ? raw : memorySpeechLanguageOverride;
  } catch {
    return memorySpeechLanguageOverride;
  }
}

export function writeSpeechLanguageOverride(code: string): void {
  memorySpeechLanguageOverride = code;
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SPEECH_LANG_KEY, code);
}

export function resolveActiveSpeechLanguage(interfaceLanguageCode: string, profileSpeechLanguage?: string): string {
  return readSpeechLanguageOverride() ?? profileSpeechLanguage ?? resolveVoiceLocale(interfaceLanguageCode);
}
