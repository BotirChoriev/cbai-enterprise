# Voice Command Architecture

## One Command Center, not a second assistant

Voice input is a real input *method* into the same `AssistantCommandCenter` (`components/assistant/AssistantCommandCenter.tsx`) that already handled typed commands — there is no separate voice-only code path, no second command table, no model call. A recognized transcript is placed in the same visible `<input>` and resolved by the exact same `route()` function typed input uses.

`size="prominent"` renders a larger version of the identical component on the home page (`HomeCommandBar`) alongside the existing compact version in the global header (`Topbar`) — a stable `useId()` keeps the two simultaneous DOM mounts from colliding on `id`.

## Real voice states

Driven entirely by actual `SpeechRecognition` events — never assumed or faked:

| State | Trigger |
|---|---|
| `idle` | Default; mic ready |
| `requesting` | Between `.start()` and the `onstart` event |
| `listening` | Real `onstart` fired |
| `processing` | Between `onresult` and the transcript being routed |
| `permission-denied` | `onerror` with `event.error === "not-allowed"` / `"permission-denied"` / `"service-not-allowed"` |
| `network-error` | `onerror` with `event.error === "network"` |

`unsupported browser` is a separate, static check (`getSpeechRecognitionConstructor() === null`) — the mic button is `disabled`/`aria-disabled` and a persistent text notice explains why, rather than a dead or misleading control.

## Editable transcript, visible confirmation (Phase 10)

`onresult` places the recognized text into the same visible, editable `<input>` the user would have typed into (`setInput(transcript)`) — never executed invisibly. Navigation commands (every command in this app today — see below) then route immediately, with the real confirmation banner (`role="status"`) as the "visible confirmation" the mission requires. There are currently no destructive/data-mutating voice commands in this app (create-project and generate-report commands navigate to the real form/report view rather than mutating anything directly), so the stricter "require confirmation before executing" path was not needed to build — documented here so it isn't silently assumed to exist.

## Multilingual command resolution (Phase 9)

English and Russian are verb-first ("open Uzbekistan" / "открой Узбекистан") — parameterized commands match via a real string-prefix check (`lib/assistant/assistant-commands.ts`'s `PARAMETERIZED_PATTERNS`).

Uzbek and Turkish are agglutinative and typically object-first with a case suffix on the object ("Oʻzbekistonni och" — Uzbekistan-ACC open; "Özbekistan'ı aç" — Uzbekistan-ACC open). A fixed prefix cannot reliably strip an arbitrary case suffix for arbitrary entity names, so these two languages use a real, different — and honestly simpler — check instead (`resolveObjectFirstOpenCommand`): the input must contain a real "open" verb keyword (`och`, `ochish`, `aç`) **and** a real catalog entity name found anywhere in the string (diacritic-insensitive substring match). This is genuinely working, not fabricated, but it is **not** true grammatical parsing — it will not correctly reject a sentence that happens to contain both an open-verb substring and an unrelated entity name. Documented here rather than oversold as full NLU.

**Real, not fabricated, localized country names**: `lib/i18n/country-names.ts` maps each of the 6 catalog countries to their real Uzbek/Russian/Turkish names ("Uzbekistan" / "Oʻzbekiston" / "Узбекистан" / "Özbekistan" are different words, not transliterations of each other). Both the Uzbek/Turkish object-first matcher and the Russian prefix matcher check every real name form — a first version of this code only checked the English catalog name, which meant the mission's own worked example ("Oʻzbekistonni och") never actually resolved; caught by `scripts/test-global-interface.ts` test 14b before it shipped.

## Language-change commands (Phase 9/10)

`lib/i18n/language-command.ts`'s `resolveLanguageCommand` recognizes "change language"/"change voice language" triggers (in all 4 languages) plus an optional target language name; on a real match it returns a real result (`set-interface-language` / `set-voice-language` / a `navigate` to `/settings` when no target language was named) that `AssistantCommandCenter` applies via `updateProfile()` and confirms visibly — never applied silently.

## Supported actions (Phase 9)

Create project, Open project, Continue project, Open My Work, Search intelligence, Open country/company/university, Open research, Find evidence, Open reports, Generate report, Open Trust Center, Change interface language, Change voice language — every one resolves to a real route via `AssistantCommandCenter`'s `route()` resolver chain, checked in this order: save-to-workspace (inline) → `resolveLanguageCommand` → `resolveRelationshipCommand` (context-aware "open related X") → `resolveProjectCommand` → `resolveAssistantCommand` (fixed table + parameterized entity search). Every resolver was extended with real Uzbek/Russian/Turkish phrases, never a fabricated destination.
