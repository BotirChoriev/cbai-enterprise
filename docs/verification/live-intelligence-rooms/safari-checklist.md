# Safari Manual Checklist — Live Intelligence Rooms + Voice

**Do not mark Safari live audio as verified from Playwright/headless results.**

## Preflight
- [ ] Open Safari on macOS or iOS.
- [ ] Run `npm run dev:voice` (or Preview with broker).
- [ ] Confirm `.dev.vars` has a real `OPENAI_API_KEY` locally (never commit).
- [ ] Allow microphone for the app origin in Safari → Settings → Websites → Microphone.

## Rooms flow
- [ ] `/rooms` creates Meeting Hall with speak/read/hear locales.
- [ ] Consent checkbox required before Start session.
- [ ] Simulated listener shows translated subtitle separately from original.
- [ ] Glossary do-not-translate marks clarification (e.g. CRISPR).
- [ ] End session stops capture intent and leaves transcript intact.
- [ ] “Review in composer” opens Draft Work Card; confirm does not auto-create without confirmation.

## Voice Operator privacy (P0)
- [ ] Open Voice Operator → Start live listening → mic indicator reflects live track.
- [ ] Navigate to another SPA route while live → mic tracks tear down; transcript memory preserved.
- [ ] Stop / Close / End release tracks (indicator off).
- [ ] Failed broker / invalid key / origin blocked show honest notices (no silent fake listening).

## Honesty
- [ ] Multiparty remains labeled EXTERNAL_BLOCKED.
- [ ] Laboratory safety banner visible.
- [ ] Practice AI participants labeled.
- [ ] No claim of perfect translation.

## Sign-off
- Human: __________________ Date: __________
- Safari version: __________ Device: __________
- Live audio result: PASS / FAIL / EXTERNAL_BLOCKED
