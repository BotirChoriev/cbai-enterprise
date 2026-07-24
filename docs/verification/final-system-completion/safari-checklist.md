# Safari Manual Checklist — Final System Completion

Complete in Safari (macOS) with **Voice external key still blocked** unless a valid project key is configured locally.

## Shell and navigation

- [ ] Sidebar sections: Core, Intelligence (incl. Knowledge Graph), Operations, Oversight, Advanced, System
- [ ] Active nav row visible without white pill artifacts (light + dark)
- [ ] Mobile menu: no horizontal overflow at 390px; RU/TR longest labels readable
- [ ] Single scroll owner per route; no content hidden under topbar
- [ ] Living context ribbon only — no duplicate mission bars

## Home / Spatial World

- [ ] Globe rotates, zooms, resets; country selection opens compact rail
- [ ] WebGL-disabled / reduced-motion: honest country list fallback
- [ ] Voice CTA closed on home; open dock does not cover primary actions

## Voice Operator (internal — no live key required)

- [ ] Invalid API key → **invalid_api_key** notice (not microphone denial)
- [ ] Broker unreachable → distinct unreachable notice
- [ ] Safari STT unavailable → **speech_unavailable** (not mic denied)
- [ ] Mic permission denied → permission notice only
- [ ] Text fallback always usable
- [ ] Stop / Close / route change releases mic capture
- [ ] No contradictory “Ready” + broker error simultaneously

## Localization (UZ critical)

- [ ] `/knowledge`, `/my-work`, `/settings`, `/about` — no raw English UI leakage
- [ ] About: title, breadcrumb, metadata localized (“CBAI haqida”)
- [ ] Evidence panels: no “Complete the mission problem statement” in English

## Operational Objects

- [ ] Command/composer → draft card → confirm before create
- [ ] No duplicate records on double confirm

## Accessibility

- [ ] Keyboard focus visible; Escape closes overlays
- [ ] 200% zoom usable on Settings and My Work
- [ ] Reduced motion respected on globe

## External (separate pass)

- [ ] Valid `OPENAI_API_KEY` in `.dev.vars` → `doctor:voice` PASS → live Realtime audio proof
