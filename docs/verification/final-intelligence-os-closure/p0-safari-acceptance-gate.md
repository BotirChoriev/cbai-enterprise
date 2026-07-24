# P0 Safari Acceptance Gate — Report

**Branch:** `preview/spatial-world-intelligence`
**HEAD:** `839b59966cd76becedac1197ad14ff1f696bb692` (no commit/push performed)
**Date:** 2026-07-24
**Verdict:** Code/broker gate **PASS with residual findings**. Live Safari mic-indicator teardown **NOT CLAIMED** (pending human).

## 1. `captureActive` vs MediaStreamTrack

| Path | Finding |
|------|---------|
| Realtime WebRTC | Tracks stopped via `provider.disconnect()` → `cleanupWebRtcSessionResources` → `stopMediaStreamTracks` / `disposeAudioElement`. Unit tests assert tracks end. |
| `captureActive` flag | React UI flag coupled by call order, **not** derived from `track.readyState`. Set `true` only after successful Realtime connect or successful SpeechRecognition `start()`. Cleared in `releaseLiveAudioResources`. |
| Browser fallback gap (fixed this gate) | Previously could set `captureActive(true)` even when SR failed to start. Now sets only if `startBrowserSpeechSession` returns true; clears on start failure / idle / error. |
| SR teardown (fixed this gate) | Prefers `recognition.abort()`; intentional `aborted` does not flash permission/error dock. |

## 2. Teardown path matrix

| Path | Code-verified | Live Safari indicator |
|------|---------------|----------------------|
| Mic-off / Stop | `stopLiveAudioCapture` → `releaseLiveAudioResources` | **PENDING HUMAN** |
| Close | `closeDock` → release + closed | **PENDING HUMAN** |
| End session | `endSession` → stop + clear memory | **PENDING HUMAN** |
| Route change (SPA) | **Intentionally does NOT tear down** (preserve live voice) | Indicator **expected to remain** during nav |
| Page reload / tab close | `pagehide` + `beforeunload` → release | **PENDING HUMAN** |
| Failed / cancelled connect | Generation gate + disconnect; no `setCaptureActive(true)` on failure | **PENDING HUMAN** |
| Provider unmount | cleanup effects call release | N/A |

## 3. Stale async cannot reactivate capture

- `liveCaptureGenerationRef` bumped on every release.
- `createLiveCaptureGate` / `gate.isCurrent()` guards broker + WebRTC callbacks.
- Late connect after cancel calls `provider.disconnect()` when gate stale.
- Unit: `late broker connect cannot apply after capture cancelled` — PASS.

## 4. Safari microphone indicator

**Not manually confirmed in this session.** Chromium unit tests ≠ Safari. Do not treat Playwright or Cursor browser as Safari.

## 5. Preview Realtime vs localhost

| Surface | Result |
|---------|--------|
| Local `npm run doctor:voice` | **PASS** — both `localhost:3000` and `127.0.0.1:3000`; ephemeral credential present (`ek_*` meta only) |
| Preview `https://preview-voice-research-integ.cbai-enterprise.pages.dev/` | HTTP 200 |
| Preview `POST /api/voice/session` | HTTP 200; shape `clientSecret` + `expiresAt` + `sessionId` + `model`; `ephemeralKeyPresent: true` (secret not reprinted) |
| Broker origin resolution | Unit tests: Preview forces same-origin `/api/voice` — PASS |

## 6. Government UZ/RU/TR English UI

| Check | Result |
|-------|--------|
| Hero / section chrome via `translateGovernmentWorkspace` | No identified English UI prose (UZ/RU/TR) |
| Coverage grid status chips | Translated at render via `translateWorkspaceStatusLabel` |
| Official source names (UN, World Bank, IMF, …) | Remain English — **intentional** (official names) |
| Residual | `GovernmentGrid` decorative SVG `aria-label` still hardcoded English (“Government domain registry…”) — a11y string only |

## 7. Suites run this gate

All PASS unless noted:

- `test:voice-session-lifecycle` (13)
- `test:voice-realtime-webrtc` (20)
- `test:voice-operator` (55)
- `test:microphone-access` (7)
- `test:voice-broker-preview-origin` (7)
- `test:voice-dev-ports` (3)
- `test:locale-completeness` (17)
- `test:localization-closure` (14)
- `test:rendered-uz-leakage` (4)
- `test:platform-shell` (10)
- `test:spatial-world-intelligence` (15)
- `test:operational-objects` (9)
- `test:command-pipeline` (6)
- `test:composer` (4)
- `test:final-product-completion` (23)
- `tsc --noEmit` — PASS
- `npm run build` — PASS
- eslint on touched voice files — 0 errors; 1 pre-existing `react-hooks/exhaustive-deps` warning on `transcriptRevision` in `VoiceOperatorProvider`

## 8. Stop for approval

No commit, push, deploy, or branch switch performed.

Human Safari checklist: `docs/verification/final-intelligence-os-closure/safari-checklist.md`

## Follow-up plan (after P0 gate approval — separate work)

1. **Citizen workspace localization** — same pattern as Government/Investor translators; preserve official names / user content.
2. **Explicit SpeechRecognition fallback UX** — labeled browser-STT mode; honest Uzbek unreliable notice when SR path is active.
3. **Evidence advanced panels** — finish locale wiring for advanced explorer chrome (not entity official names).
4. **Living Graph** — localize graph chrome / empty states / controls.
5. **Research Network** — localize network surface chrome; keep scientific provider/topic official strings where required.
6. **Optional micro-fix:** localize `GovernmentGrid` motif `aria-label`.
