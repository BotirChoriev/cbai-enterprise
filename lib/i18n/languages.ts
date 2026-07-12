/**
 * Global Language Foundation — the real language registry (Global Language Foundation +
 * Multilingual Voice Commands mission). Builds on `lib/assistant/assistant-profile.ts`'s
 * `ASSISTANT_LANGUAGES` (the storable preference list) by adding what each language needs to be
 * genuinely usable: a real translation dictionary (`active`), and an honest voice-recognition
 * support level, since browser `SpeechRecognition` support for a BCP-47 locale is never guaranteed
 * — especially for Uzbek, where support varies by browser/OS and must never be silently assumed.
 */

export type VoiceSupportLevel = "full" | "partial" | "unverified";

export type LanguageDefinition = {
  /** Interface language code — matches lib/i18n/dictionaries/*.ts and AssistantProfile.preferredLanguage. */
  code: string;
  /** English name, for contexts where the language itself can't yet render its own name. */
  name: string;
  /** The language's own name for itself. */
  nativeName: string;
  /** Real translation dictionary exists and is wired into useTranslation() today. */
  active: boolean;
  /** BCP-47 tag passed to the Web Speech API's SpeechRecognition.lang, or null if none is defined yet. */
  voiceLocale: string | null;
  /** Honest expectation of browser voice support — never "full" without real verification. */
  voiceSupport: VoiceSupportLevel;
};

export const LANGUAGES: readonly LanguageDefinition[] = [
  { code: "en", name: "English", nativeName: "English", active: true, voiceLocale: "en-US", voiceSupport: "full" },
  { code: "uz", name: "Uzbek", nativeName: "Oʻzbek", active: true, voiceLocale: "uz-UZ", voiceSupport: "partial" },
  { code: "ru", name: "Russian", nativeName: "Русский", active: true, voiceLocale: "ru-RU", voiceSupport: "full" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", active: true, voiceLocale: "tr-TR", voiceSupport: "full" },
  { code: "uz-Cyrl", name: "Uzbek (Cyrillic)", nativeName: "Ўзбек", active: false, voiceLocale: "uz-UZ", voiceSupport: "unverified" },
  { code: "ar", name: "Arabic", nativeName: "العربية", active: false, voiceLocale: "ar-SA", voiceSupport: "unverified" },
  { code: "es", name: "Spanish", nativeName: "Español", active: false, voiceLocale: "es-ES", voiceSupport: "unverified" },
  { code: "fr", name: "French", nativeName: "Français", active: false, voiceLocale: "fr-FR", voiceSupport: "unverified" },
  { code: "de", name: "German", nativeName: "Deutsch", active: false, voiceLocale: "de-DE", voiceSupport: "unverified" },
  { code: "zh", name: "Chinese", nativeName: "中文", active: false, voiceLocale: "zh-CN", voiceSupport: "unverified" },
  { code: "ja", name: "Japanese", nativeName: "日本語", active: false, voiceLocale: "ja-JP", voiceSupport: "unverified" },
  { code: "ko", name: "Korean", nativeName: "한국어", active: false, voiceLocale: "ko-KR", voiceSupport: "unverified" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", active: false, voiceLocale: "hi-IN", voiceSupport: "unverified" },
  { code: "pt", name: "Portuguese", nativeName: "Português", active: false, voiceLocale: "pt-PT", voiceSupport: "unverified" },
];

export const DEFAULT_LANGUAGE_CODE = "en";

export function getActiveLanguages(): readonly LanguageDefinition[] {
  return LANGUAGES.filter((language) => language.active);
}

export function getAllLanguages(): readonly LanguageDefinition[] {
  return LANGUAGES;
}

export function getLanguageDefinition(code: string): LanguageDefinition {
  return LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0];
}

export function isActiveLanguageCode(code: string): boolean {
  return getActiveLanguages().some((language) => language.code === code);
}

/** The real voice locale for a given interface language, falling back to English's. Never
 * fabricates support for a locale that has none defined. */
export function resolveVoiceLocale(interfaceLanguageCode: string): string {
  const definition = getLanguageDefinition(interfaceLanguageCode);
  return definition.voiceLocale ?? "en-US";
}
