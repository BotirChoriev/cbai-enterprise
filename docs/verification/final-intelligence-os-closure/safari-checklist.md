# Safari manual checklist — Voice Operator

Stop for human Safari approval. Do **not** treat Cursor/Playwright Chromium as Safari.

## Environment

- Preview: `https://preview-voice-research-integ.cbai-enterprise.pages.dev/`
- Local (optional): `http://localhost:3000` with `npm run doctor:voice` already green

## Checklist

1. [ ] Open Preview in Safari (desktop or iOS).
2. [ ] Confirm Cloudflare Access / authentication succeeds if prompted (do not call this “mic denied”).
3. [ ] Open Voice Operator dock.
4. [ ] Inactive mic shows **slashed** microphone + enable copy.
5. [ ] Tap mic → browser permission prompt → allow.
6. [ ] Active state: normal mic icon, teal (not red pulse), “Jonli tinglash faol” / localized equivalent, **To‘xtatish** visible.
7. [ ] Safari status bar / orange mic indicator appears while live.
8. [ ] **Stop** removes Safari mic indicator promptly.
9. [ ] **Close** stops mic/audio; transcript may remain.
10. [ ] **End session** stops everything and clears session memory.
11. [ ] Double-tap mic does not create duplicate streams.
12. [ ] Text chat still works if Realtime fails for a labeled reason (broker / Access / quota / key — never false mic denial).
13. [ ] Realtime does **not** require Safari SpeechRecognition; if browser STT used, Uzbek unreliable notice is honest.
14. [ ] First identity turn (UZ): CBAI Ovoz Operator intro only when appropriate — not every turn.

## Agent status before human Safari

| Check | Status |
|-------|--------|
| Preview POST `/api/voice/session` | PASS (prior gate; ephemeral `ek_*`) |
| Local broker POST session (`doctor:voice`) | PASS |
| Chromium WebRTC / lifecycle unit tests | PASS |
| SPA route-change mic teardown wiring | PASS (code-verified — this P0) |
| Stale async gate after teardown | PASS (code-verified) |
| Live Safari mic indicator after route change / Stop / Close / End | **PENDING HUMAN — NOT CLAIMED** |
