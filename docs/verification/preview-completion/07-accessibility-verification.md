# Accessibility verification — Preview Completion Program

**Branch:** `preview/spatial-world-intelligence`
**Recorded:** 2026-07-22
**Standard reference:** `docs/standards/09-accessibility-standard.md`

---

## Automated / local checks

| Check | Status | Evidence |
|-------|--------|----------|
| OperatingPageShell min touch targets (min-h-11) | **PROVEN_LOCAL** | Component patterns; prior scorecards |
| Settings Voice DX aria-label fixes (PC-02) | **PROVEN_LOCAL** | Prior closure defects |
| Semantic nav `aria-label` on workspace hub | **PROVEN_LOCAL** | `/workspace` |
| Scientific intake forms labeled + `aria-live` | **PROVEN_LOCAL** | `/scientific-documents` |
| Keyboard focus capture (auth-collab pass) | **PROVEN_LOCAL** | `auth-collaboration-voice-os/09-accessible-keyboard-focus.png` |
| Reasoning map table headers i18n (PC-04) | **PROVEN_LOCAL** | `/reasoning` fix noted in prior programs |
| ESLint jsx-a11y (if configured) | **PROVEN_LOCAL** | `npm run lint` 0 errors at Stage 1 |
| Full WCAG 2.2 AA audit | **MANUAL_REQUIRED** | Not completed in this program |
| Screen reader pass (VoiceOver/NVDA) | **MANUAL_REQUIRED** | Not completed |

---

## Route-level a11y notes (from matrix)

| Surface | Known gap | Status |
|---------|-----------|--------|
| `/` WebGL globe | Keyboard alternative PARTIAL | **MANUAL_REQUIRED** |
| `/search` command palette | Grouped results keyboard PARTIAL | **MANUAL_REQUIRED** |
| Entity explore shells | Keyboard entity nav PARTIAL | **MANUAL_REQUIRED** |
| `/graph` zoom/focus | Pointer-first PARTIAL | **MANUAL_REQUIRED** |
| `/trust` long document | Section nav present | **PROVEN_LOCAL** |
| Voice dock | Stop/close controls | **PROVEN_LOCAL** | Prior voice captures |

---

## Mobile / responsive

| Check | Status | Evidence |
|-------|--------|----------|
| Mobile nav + voice dock layout | **PROVEN_LOCAL** | `operational-object-system/24-mobile-navigation-voice-390.png` |
| Mobile operational cards | **PROVEN_LOCAL** | Prior captures |
| Native iOS/Android a11y | **PENDING_IMPLEMENTATION** | Web-only scope |

---

## Gaps

- No independent WCAG audit certificate
- WebGL/home globe keyboard path needs manual verification
- Safari VoiceOver + live voice: **MANUAL_REQUIRED**
