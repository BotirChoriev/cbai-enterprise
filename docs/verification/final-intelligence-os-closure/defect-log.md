# Defect log — Final Intelligence OS Closure

Branch: `preview/spatial-world-intelligence`
Updated as defects are confirmed and repaired.

| ID | Sev | Defect | Evidence | Status |
|----|-----|--------|----------|--------|
| D-001 | P0 | Home sidebar used abbreviated `operatingNavigationItems`, hiding My Work / Graph / Investor / Government / Governance / About | Live sidebar before fix | Fixed — canonical `primaryNavSections` always |
| D-002 | P0 | Settings/About buried only in progressive disclosure | IA contract | Fixed — primary System section |
| D-003 | P0 | Interactive globe always fell back: `three` missing from `node_modules` despite package.json | Playwright `Cannot find module 'three'` | Fixed — install `three@0.185` |
| D-004 | P1 | Globe effect recreated every render (`getGlobeCountryPoints()` new array) | Code review | Fixed — `useMemo` + ref for callback |
| D-005 | P1 | Environment fallback sticky / overly aggressive `<768` | Cursor browser + init | Fixed — reduced-motion OR (narrow∧coarse) + resize |
| D-006 | P1 | Ecosystem “Governance Intelligence” linked to `/governance` (Control Center) | Home strip | Fixed → `/government` + copy |
| D-007 | P1 | Voice mic icon showed open mic when disabled | Dock SVG condition | Fixed — slash when inactive |
| D-008 | P0 | `dev:voice` busy-port / dual-origin doctor gaps | Phase 0 audit | Fixed earlier this closure |
| D-009 | P0 | Evidence nav target vs `/evidence` route | IA | Fixed earlier — `/evidence` + alias |
| D-010 | P2 | Cursor IDE browser WebGL may still differ from Chromium | Agent browser | Document — verify via Playwright |
| D-011 | P1 | Light theme mixed cream sidebar on Spatial home | after light capture before token remap | Fixed — CSS variable remap under `.cbai-spatial-home-chrome` |
| D-012 | P1 | About UZ title was `Haqida` | locale-uz-about before | Fixed → `CBAI haqida` |
| D-013 | P1 | Duplicate Mission Engine strip on home | home screenshots | Fixed — suppress strip on `/` |
| D-014 | P1 | Mic icon showed open mic when disabled | dock SVG | Fixed — slash when inactive |
| D-015 | P2 | Voice operator tests polluted by live `NEXT_PUBLIC_VOICE_BROKER_URL` | test failures with broker running | Fixed — `setVoiceBrokerEnvUrlForTests` |
| D-016 | P0 | Dock micLive false while WebRTC capture continues during orchestration | Voice audit | Fixed — `captureActive` + pagehide/beforeunload |
| D-017 | P1 | ORIGIN_BLOCKED / RATE_LIMITED / connection_failed mislabeled | Voice audit | Fixed — distinct broker issues + notices |
| D-018 | P1 | Government workspace full English under UZ/RU/TR | i18n audit | Fixed — `governmentWorkspace` dict + translator |
| D-019 | P2 | Workspace grid forced English plural `"s"` | i18n audit | Fixed — EN-only plural |

## External blockers

| Item | Status |
|------|--------|
| Live Safari Realtime mic indicator | **PENDING HUMAN** — `safari-checklist.md` |
| Preview broker mint | PASS (HTTP 200, ephemeral credential) — not blocked |
