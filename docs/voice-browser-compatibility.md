# Voice Browser Compatibility

The Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`) is not standardized the same way across browsers — CBAI never assumes it works and always provides a text fallback.

## Detection

`AssistantCommandCenter.tsx`'s `getSpeechRecognitionConstructor()` checks for `window.SpeechRecognition ?? window.webkitSpeechRecognition`. If neither exists, the mic button is `disabled`/`aria-disabled` and a persistent, translated notice (`assistant.micUnsupportedBrowser`) explains why — the button is never shown as if it works.

## Known real-world support (general web platform knowledge, not measured in this environment)

- **Chrome / Chromium-based browsers (Edge, Brave, Opera)**: `webkitSpeechRecognition` — broadly supported, including `en-US`, `ru-RU`, `tr-TR`. Uzbek (`uz-UZ`) support is inconsistent and version-dependent.
- **Safari**: `SpeechRecognition` support has historically been limited/inconsistent, especially on older versions and on iOS. Always test directly rather than assuming.
- **Firefox**: No `SpeechRecognition` support in standard release builds as of this writing — the app's own detection correctly falls back to text-only.
- **Server-side / static export**: `typeof window === "undefined"` — voice is never even attempted; this is why `getSupabaseBrowserClient`-style guards exist throughout this codebase for every browser-only API.

**This list was not re-verified against live browser versions in this environment** (no browser automation tool is available here) — it reflects general, well-known Web Speech API support patterns, not a fresh compatibility matrix. Treat it as a starting point for manual QA, not a substitute for it.

## Required behavior regardless of support level (Phase 8)

- **microphone ready** — idle state, real mic icon, enabled.
- **requesting permission** — shown between `.start()` and the `onstart` event.
- **listening** — real `onstart` fired.
- **speech detected / processing** — shown once a result arrives, before routing.
- **command understood** — the existing confirmation banner.
- **unsupported command** — the existing "not a recognized command yet" panel with real suggested alternatives.
- **permission denied** — real `onerror` (`not-allowed` etc.) mapped to a translated, visible recovery message; text input remains fully usable.
- **unsupported browser** — persistent notice, mic disabled, text input is the only path (never a dead control pretending to work).
- **network/recognition failure** — real `onerror` (`network`) mapped to a translated, visible message.
- **text fallback** — always available; voice is additive to typed input, never a replacement path with no equivalent.

## What was not verified here

Live behavior in an actual Chrome/Safari/Firefox instance — permission prompts, real recognition accuracy for Uzbek/Russian/Turkish speech, actual `onerror` payloads per browser — requires a real browser and a microphone, neither available in this environment. See the mission's final report for exactly what remains browser-unverified.
