# Language Architecture

## Why there's no path-based locale routing

CBAI is a Next.js static export (`output: "export"`, no server, no middleware). Standard Next.js i18n locale routing (`/en/...`, `/uz/...`) requires either middleware (locale detection/redirects) or `generateStaticParams` duplicating every one of the ~30 route files per locale — neither fits this architecture without a disproportionate rewrite. Instead, this is a **client-side i18n system**: one interface language is active per browser session, switched instantly via React state, with no page reload and no route change.

## The three separate settings (Phase 5)

Never conflated — three different real controls:

1. **Interface language** — `AssistantProfile.preferredLanguage`. Drives every translated UI string via `useTranslation()`.
2. **Voice-recognition language** — `AssistantProfile.speechLanguage`. A BCP-47 tag (`en-US`, `uz-UZ`, `ru-RU`, `tr-TR`) passed directly to the Web Speech API. Independent of the interface language — a user can read the UI in Uzbek while speaking commands in Russian.
3. **Original source language** — not a per-user setting; a policy. Source titles (research topics, evidence, catalog entity names) are never translated in place — only a translated *summary* is shown alongside, so the source is never altered from what it actually says. Stated as a one-line policy note in `LanguageSelector`, not a dropdown (there is nothing to switch).

## Reused identity model (Phase 5 persistence requirements)

No second state system was built. `useTranslation()` (`lib/i18n/use-translation.ts`) reads `AssistantProfile.preferredLanguage` from the existing `AssistantProfileProvider` — the same profile that already:
- persists to `localStorage` when signed out,
- syncs to the real cloud `profiles` table when a Cloud Account is signed in (`lib/supabase/cloud-profile.ts`),
- survives a refresh (the same `useSyncExternalStore` pattern every other real-time preference in this app uses).

## Translation lookup (`lib/i18n/translate.ts`)

- `TranslationDictionary` (`lib/i18n/dictionary-types.ts`) is the one canonical shape — every language dictionary is checked against it at **compile time**, so a missing key in any non-English dictionary is a TypeScript build error, not a silent runtime gap.
- `translate(dictionary, "namespace.key")` does a dotted-path lookup; on failure, falls back to the English dictionary at the same path; only as an absolute last resort (both English and the target language missing the key — should not happen given the compile-time check) returns the raw path string. A raw untranslated key is never shown under normal operation.
- `interpolate(template, vars)` replaces `{placeholder}` tokens (e.g. the personalized greeting's `{name}`).

## HTML lang/dir sync

`AssistantProfileProvider` sets `document.documentElement.lang` and `.dir` in a `useEffect` whenever `preferredLanguage` changes — after hydration, so it never causes a mismatch (same pattern already used for the accessibility CSS classes). `dir` is real RTL preparation (`isRtlLanguage()`, `lib/i18n/languages.ts`) — no active language is RTL today, but Arabic is pre-registered so activating it later needs no new plumbing.

## Namespaces (`TranslationDictionary`)

`common`, `navigation`, `home`, `project`, `research`, `evidence`, `countries`, `companies`, `universities`, `reports`, `trust`, `account`, `assistant`, `errors`, and `roles` (11 role/work-context cards — added beyond the mission's example list, since "such as" in Phase 6 was explicitly non-exhaustive).

## What is and isn't translated

Translated (Phase 6's "at minimum" list, fully covered): global navigation, first-screen heading/message, greeting, command input, role cards, project actions/status, empty states, save states, errors, account actions, Trust headings, voice-status copy. **Not** translated: deep content inside individual entity profile pages (Country/Company/University detail bodies), research topic descriptions, evidence text, and most report body copy — all of that remains English-only in this mission, a deliberate scope boundary matching "translate at minimum," not an oversight.
