# CBAI Friction Ledger

Master Product Audit — July 16, 2026. Tracks verified friction, corrections, and deferrals.

## Summary

| Status | Critical | Major | Minor |
|--------|----------|-------|-------|
| Found | 0 | 8 | 14 |
| Fixed | 0 | 4 | 2 |
| Deferred | 0 | 4 | 12 |

---

## Fixed

### AUD-001 — Duplicate mission chrome on entity explore routes
- **Route:** `/countries`, `/companies`, `/universities`
- **Severity:** Major | **Confidence:** High
- **Observed:** Global mission bar and page companion both visible; two “In this mission” regions (browser snapshot verified on `/countries`).
- **Correction:** Added entity routes to `hasPageMissionCompanion()` — hides global bar, mental model strip duplication, and context column overlap.
- **Verification:** Browser snapshot; `test:epic-21-zero-learning-curve`
- **Status:** Fixed

### AUD-002 — Wrong companion purpose on entity routes
- **Route:** `/countries`, `/companies`, `/universities`
- **Component:** `deriveRouteCompanion` / `MissionOperatingContextBar`
- **Severity:** Major | **Confidence:** High
- **Observed:** Companion showed home copy (“Your mission lives here…”) because entity routes were missing from `ROUTE_KEY_MAP`.
- **Correction:** Mapped entity routes; added `routeCountriesPurpose`, `routeCompaniesPurpose`, `routeUniversitiesPurpose` in EN/RU/UZ/TR.
- **Verification:** Browser re-check; i18n type coverage
- **Status:** Fixed

### AUD-003 — Ecosystem lens double page headers
- **Route:** `/government`, `/investor`, `/citizen`
- **Component:** `EcosystemWorkspacePage` + `WorkspaceHero`
- **Severity:** Major | **Confidence:** High
- **Observed:** `OperatingPageShell` h1 followed by second h1 in `WorkspaceHero` with “Government Workspace” software label.
- **Correction:** `WorkspaceHero` `embedded` mode — metrics and lead only; shell owns the page title.
- **Verification:** Visual browser check on `/government`
- **Status:** Fixed

### AUD-004 — Orphaned UI components
- **Component:** `PageHeader`, `components/legacy-integration/*`
- **Severity:** Minor (maintenance) | **Confidence:** High
- **Observed:** Zero route imports; duplicate header pattern superseded by `EntityPageHeader`.
- **Correction:** Removed 9 files (~1.2k lines).
- **Verification:** `tsc`, `build`, grep for imports
- **Status:** Fixed

### AUD-005 — Entity explore layout divergence (prior sprint, verified complete)
- **Route:** Entity explore trio
- **Correction:** `EntityExploreShell` shared grammar
- **Status:** Fixed (commit `4e60333`)

### AUD-006 — Generic loading on capability panels (prior sprint)
- **Correction:** Contextual `loadingKnowledge` + `cbaiLoadingLine`
- **Status:** Fixed (commit `4e60333`)

---

## Deferred

### AUD-007 — Silent Suspense fallbacks
- **Route:** Layout, `/research`, `/research/workspace`
- **Severity:** Major | **Confidence:** High
- **Observed:** `Suspense fallback={null}` causes blank flash before hydration.
- **Reason:** Provider tree wraps Suspense; contextual fallback requires provider reorder — regression risk on auth/context init.
- **Proposed:** Move Suspense inside providers or static locale-aware fallback component.
- **Status:** Deferred

### AUD-008 — Raw zinc styling drift
- **Severity:** Major (consistency) | **Confidence:** High
- **Observed:** 429× `border-zinc-800`, 153× `bg-zinc-950` outside tokens; report views and project panels worst offenders.
- **Reason:** High-traffic primary routes prioritized; full token pass exceeds single audit window with diminishing returns on hidden panels.
- **Status:** Deferred

### AUD-009 — `EmptyState` adoption stalled
- **Severity:** Major | **Confidence:** High
- **Observed:** Unified component used in 3 list files; dozens of hand-rolled empty panels remain.
- **Reason:** Each empty state needs copy/action review per route — not safe bulk replace.
- **Status:** Deferred

### AUD-010 — My Work lacks page companion
- **Route:** `/my-work`
- **Severity:** Major | **Confidence:** Medium
- **Observed:** Mission continuity weaker than workflow routes; global bar hidden on home only.
- **Reason:** Adding companion increases chrome on project-heavy page — needs journey re-test.
- **Status:** Deferred

### AUD-011 — Research topic pages: multiple competing sections
- **Route:** `/research/[topicId]`
- **Severity:** Major | **Confidence:** High
- **Reason:** Custom layout; single dominant action requires section reorder — scope beyond polish.
- **Status:** Deferred

### AUD-012 — Workspace hero lib copy still uses “Workspace” in data layer
- **File:** `lib/workspaces/*.ts`
- **Severity:** Minor
- **Reason:** Embedded mode hides title; lib strings not user-visible on ecosystem routes after fix.
- **Status:** Deferred

### AUD-013 — Contextual loading keys not wired on all routes
- **Severity:** Minor
- **Observed:** `loadingMission`, `loadingEvidence`, `loadingReport` defined but unused on primary routes.
- **Status:** Deferred

### AUD-014 — Graph keyboard shortcuts when toggles hidden
- **Route:** `/graph`
- **Severity:** Minor
- **Status:** Deferred — focused-mode behavior needs dedicated keyboard audit.

### AUD-015 — Dynamic English labels in lifecycle lib
- **Severity:** Minor
- **Status:** Deferred — requires i18n pass in lib layer.

### AUD-016–027 — Minor polish items
- Icon size variance on research panels
- `space-y-10` on ecosystem workspaces vs `cbaiPageStack`
- Preview route density (`/core`, `/workflows`, `/agents`)
- Search expert secondary actions still tool-like
- Mixed glass/mineral on high-traffic report views
- `pleaseWait` string in build007 copy (auth flows only)
- Continued `text-xs` density (700 occurrences)
- Mobile graph control reach
- Sticky sidebar collision on short viewports (entity explore)
- Untranslated metric labels on ecosystem workspaces (English hardcoded)
- RoleProjectEntry copy length
- Trust/governance route naming (`/ai-control` vs “Governance” label)

---

## Verification log

| Gate | Result |
|------|--------|
| ESLint | Pass |
| TypeScript | Pass |
| Production build | Pass |
| Browser regression (10) | Pass |
| Real-user audit (8) | Pass |
| EPIC-21 (22) | Pass |
| EPIC governance (10) | Pass |
| Mission center (10) | Pass |
| Full package.json test suite | See release readiness doc |
