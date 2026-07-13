# Known Limitations — Premium Interface, Language, and Voice

Real, current gaps from the Premium Interface + Global Language Foundation + Multilingual Voice Commands mission. See `docs/product-activation-audit.md` for the full cross-mission history.

## Language

- Only 4 interface languages are genuinely active (English, Uzbek, Russian, Turkish). 10 more are registered for future expansion but display no translated text — see `docs/supported-languages.md`.
- Translation coverage is "at minimum" (Phase 6's explicit scope): global navigation, first-screen copy, greeting, command bar, role cards, project actions, empty/save states, errors, account actions, Trust headings. Deep content — individual Country/Company/University profile bodies, research topic descriptions, evidence text, most report content — remains English-only.
- No path-based locale routing (`/en/...`) exists or was attempted — this is a client-side-only i18n system, a deliberate fit for the static-export architecture, not an oversight (see `docs/language-architecture.md`).
- "Original source language" is a policy statement, not an interactive control — there is nothing to switch, since source titles are never altered.

## Voice

- Multilingual "open &lt;entity&gt;" resolution for Uzbek/Turkish uses a real keyword-plus-substring check, not true grammatical parsing of case suffixes — documented in `docs/voice-command-architecture.md`. It can be fooled by a sentence containing both an unrelated "open" verb token and an unrelated real entity name; this is a real, bounded simplification, not a hidden bug.
- Localized country-name matching (`lib/i18n/country-names.ts`) covers only the 6 countries already in the local catalog — real, not fabricated, but not comprehensive.
- Companies and universities are matched only by their catalog (English) name in every language — proper nouns are not localized the way country names are.
- Live voice recognition accuracy, permission-prompt behavior, and per-browser `onerror` payloads still cannot be verified in this environment — real hardware microphone input is out of reach for headless automation regardless of tooling. What *was* previously blocked purely by "no browser automation tool available here" is now resolved: the Full Real-User Experience Audit mission added Playwright (real Chromium, dev-only) and `scripts/test-browser-regression.ts`, which drives the actual text-command fallback, real navigation, and real persistence end-to-end. See `docs/voice-browser-compatibility.md` for what remains specifically hardware-blocked.
- No true grammatical NLU anywhere — every command resolver in this app is a deterministic phrase/keyword match, by design (Human Sovereignty / no fabricated confidence).

## Interface / Visual

- The "global intelligence visual" is a real, accessible link grid (`WorldIntelligenceMap`), not a 3D/canvas globe — a deliberate choice to avoid a fabricated live-motion visual and its performance cost, not a missing feature.
- No Apple touch icon (`apple-icon`) was added — only `app/icon.svg` (modern favicon/app-icon). iOS home-screen icon quality was not addressed.
- Deep accessibility audit (exhaustive contrast measurement across every new component, screen-reader testing in an actual assistive-technology tool) was not performed — targeted checks only. The Full Real-User Experience Audit mission's second issuance added a real keyboard-only pass (real Tab-order sweep, focus-visible verification, accessible-name verification via computed DOM properties) that found and fixed one real bug: the homepage's icon-only collapsed sidebar relied solely on a `title` attribute for its 12 primary nav links, which screen readers do not reliably announce — fixed with real `aria-label`s. Live AT output (VoiceOver/NVDA/JAWS) still has not been observed directly.
- Static HTML output for `/` (and other client-heavy pages) renders an effectively empty `<body>` in the raw `out/*.html` file — this is a pre-existing characteristic of this app's client-boundary architecture (a `<Suspense fallback={null}>` around the dashboard chrome), not something this mission introduced or fixed; real content renders correctly once client JS hydrates, verified via `next dev`.

## Reuse boundaries respected (not limitations — deliberate constraints)

No second Assistant, Command Center, Project Engine, Search, My Work, Reports, or profile system was created. No live news feed, fabricated statistics, evidence counts, uptime, active-project counts, source counts, country coverage numbers, or AI confidence values were added anywhere.
