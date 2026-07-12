# Supported Languages

Source of truth: `lib/i18n/languages.ts`'s `LANGUAGES` registry. This file is a summary; do not let it drift from the code.

## Active today (real translation + real voice-locale mapping)

| Code | Language | Native name | Voice locale | Voice support |
|---|---|---|---|---|
| `en` | English | English | `en-US` | Full |
| `uz` | Uzbek (Latin) | Oʻzbek | `uz-UZ` | Partial — browser support for Uzbek speech recognition varies; always falls back to text |
| `ru` | Russian | Русский | `ru-RU` | Full |
| `tr` | Turkish | Türkçe | `tr-TR` | Full |

"Active" means: a complete `TranslationDictionary` exists (compile-time checked against every other active language), the language appears as selectable in `LanguageSelector`, and it is one of the 4 languages `scripts/test-global-interface.ts` verifies translation output for.

## Prepared, not active (registered for future expansion — Phase 4)

Uzbek (Cyrillic), Arabic, Spanish, French, German, Chinese, Japanese, Korean, Hindi, Portuguese. Each has a real entry in the language registry (name, native name, a best-guess voice locale) so activating one later is additive — but **none of these appear as selectable** in `LanguageSelector`, and none has a translation dictionary. Do not claim these are "active" anywhere in the product; `isActiveLanguageCode()` returns `false` for all of them, and the test suite verifies this directly.

## Activating a new language (real steps, not aspirational)

1. Add a `LanguageDefinition` entry with `active: true` in `lib/i18n/languages.ts` and a matching entry in `lib/assistant/assistant-profile.ts`'s `ASSISTANT_LANGUAGES` (`available: true`) — kept in sync; `scripts/test-global-interface.ts` test 22 asserts they agree.
2. Write a complete `lib/i18n/dictionaries/<code>.ts` satisfying `TranslationDictionary` — TypeScript will not compile until every key is present.
3. Register it in `lib/i18n/translate.ts`'s `DICTIONARIES` map.
4. Verify the language's real `SpeechRecognition` browser support (see `docs/voice-browser-compatibility.md`) before claiming `voiceSupport: "full"` — default to `"unverified"` or `"partial"` otherwise.
5. Add real localized country names to `lib/i18n/country-names.ts` if the language should support "open &lt;country&gt;" voice commands.
