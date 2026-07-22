# Accessibility and inclusive input (audit)

**Standard:** WCAG 2.2 principles. Status is PARTIAL static review + known product rules — not a certified audit.

## Checks

| Criterion | Observed posture | Evidence / notes |
|-----------|------------------|------------------|
| Full keyboard operation | PARTIAL | Forms/nav generally focusable; globe/Three.js interaction risk (`InteractiveIntelligenceGlobe.tsx`) |
| Visible focus | PARTIAL | Design system dependent; UNVERIFIED globally |
| Logical focus order | PARTIAL | Complex shells (My Work, Evidence, Voice dock) need focused audit |
| Screen-reader names | PARTIAL | Voice dock + engine panels have labels in places; coverage UNVERIFIED |
| Semantic headings / landmarks | PARTIAL | `OperatingPageShell` patterns; inconsistency risk across legacy routes |
| Form labels / error identification | PARTIAL | Account/auth forms exist; collab empties minimal |
| Target size | PARTIAL | UNVERIFIED at 44×44 everywhere |
| Color contrast | PARTIAL | Light/dark verification screenshots exist under `docs/verification/final-intelligence-os/`; automated contrast UNVERIFIED |
| Reduced motion | PARTIAL | Prefer check `prefers-reduced-motion` usage — UNVERIFIED completeness |
| High contrast / zoom 200–400% / reflow | PARTIAL | Static export CSS; horizontal overflow risk on dense panels UNVERIFIED |
| Captions/transcripts | PARTIAL | Voice has transcript surfaces; not a caption system for arbitrary media |
| Text alternative to voice | PROVEN intent | Platform actions + UI; Operating Navigator must not be sole path |
| Voice alternative to pointer | PARTIAL | Voice Level 1 nav; not all controls exposed as commands |
| Switch-device compatibility | UNVERIFIED | |
| Timeout handling / error recovery | PARTIAL | Voice session errors surfaced; auth errors PARTIAL |

## Hard product rules (must hold)

1. **Voice cannot be the only way** to perform any critical action.
2. Destructive, external, or public actions require **accessible confirmation** (not voice-only). See action levels in `lib/voice-operator/identity/action-levels.ts` and confirmation panels in FDE.
3. Mic: never autoplay on load; teardown on Stop/Close/unmount/fatal (session may survive intentional client navigation — document privacy state in UI).

## Voice Operator boundaries (Phase M) — classification

| Level | Meaning | Examples |
|-------|---------|----------|
| 0 | Answer/explain only | Identity FAQ, what CBAI is |
| 1 | Safe navigation/filtering | Open `/countries`, apply allowlisted filters |
| 2 | Draft creation + user confirmation | Draft project/OO/report |
| 3 | Publication, deletion, invitation, external share, permission change, forensic export | Requires explicit confirmation **and** authorization |

Additional requirements (audit targets):

- No arbitrary model-generated URL navigation — validate against `lib/platform-actions` registry.
- Announce intended navigation before/after execution.
- Do not auto-create projects from identity statements.
- Do not treat spoken content as profile data without permission.
- Clear privacy state; text + keyboard equivalents.
- No public publication via a single ambiguous voice command.

Live Realtime E2E with valid credentials: often **EXTERNAL_BLOCKED** in verification reports.

## Recommended Stage 9 work

Keyboard pass on Home globe, Evidence, My Work, Voice dock; contrast automation; 200%/400% zoom; reduced-motion; SR name sweep; confirm Level 2/3 dialogs meet accessible modal patterns.
