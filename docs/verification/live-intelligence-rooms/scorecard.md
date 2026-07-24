# Live Intelligence Rooms — Visual Scorecard

Captured against static export on `http://127.0.0.1:3010` (Playwright Chromium).  
Evidence: `docs/verification/live-intelligence-rooms/*.png`

Scoring: 1–10. Critical surfaces must reach ≥9.

| Surface | Hierarchy | Contrast | Clarity | Localization | Responsiveness | A11y | OS identity | Action clarity | Truthfulness | Overflow | Avg |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Rooms list / create (`desktop-1920-rooms-list-en-dark`) | 9 | 9 | 10 | 9 | 9 | 9 | 9 | 10 | 10 | 10 | **9.4** |
| Consent + ready Meeting (`desktop-1920-meeting-created-via-ui`) | 9 | 9 | 10 | 9 | 9 | 9 | 9 | 10 | 10 | 10 | **9.4** |
| Live translated Meeting (`desktop-1920-meeting-live-translated-en-dark`) | 10 | 9 | 10 | 9 | 9 | 9 | 10 | 10 | 10 | 9 | **9.5** |
| Laboratory (`desktop-1920-laboratory-en-dark`) | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 10 | 9 | **9.1** |
| Practice / Collaboration (same shell + banners) | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 10 | 9 | **9.1** |
| UZ meeting (`desktop-1440-meeting-uz-dark`) | 9 | 9 | 9 | 10 | 9 | 9 | 9 | 9 | 10 | 9 | **9.2** |
| Mobile meeting (`mobile-390-meeting-en-dark`) | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 10 | 9 | **9.1** |
| Light theme rooms list (`desktop-1440-rooms-list-en-light`) | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 10 | 10 | **9.2** |

**Verdict:** Critical surfaces ≥9/10 after hydration fix (`useSyncExternalStore` + stable snapshots).

## Inspected truths
- Original Uzbek and translated English remain distinct.
- EXTERNAL_BLOCKED multiparty notice is visible.
- AI simulated listeners labeled.
- Consent gate before Start session.
- OO proposals shown as review-gated drafts.
- Voice Operator CTA global; room End/Stop uses existing VO teardown path.

## Residual visual notes (non-blocking)
- Live Rooms sits under Collaboration progressive disclosure (not always visible in primary nav rail).
- Country panel requires scroll on long country profiles.
- Headless Chromium ≠ Safari microphone proof.
