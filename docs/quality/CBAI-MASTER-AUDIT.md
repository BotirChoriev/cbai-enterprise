# CBAI Master Product Audit

**Date:** July 16, 2026  
**Repository:** `/Users/botirchoriev/Documents/cbai-enterprise`  
**Scope:** Full-system review before next release — polish, consistency, usability only  
**Mode:** Strict — no features, routes, or architecture changes

---

## Executive summary

CBAI’s primary operating routes share a coherent shell (`OperatingPageShell`, `EntityExploreShell`, mission companion) and honest trust boundaries. The largest verified friction before this audit was **duplicate mission orientation on entity explore pages** and **wrong companion copy** caused by missing route keys — both fixed.

No critical trust or data-loss issues were found. Remaining debt is primarily **styling token drift** (429 raw zinc border utilities), **silent Suspense loading**, and **research topic page cognitive load**. The product reads as one system on home, search, entity explore, evidence, reasoning, graph, and reports when progressive disclosure is respected.

**Quality budget applied:** ~80% product quality (usability, consistency, polish), ~20% capability preservation.

---

## Audit scorecard

| Dimension | Score (1–5) | Notes |
|-----------|-------------|-------|
| Product philosophy alignment | 4 | Honest limitations visible; no fake AI scores on primary routes |
| Information architecture | 4 | Clear primary nav; preview routes honestly stubbed |
| User journey continuity | 3 | Entity + workflow routes strong; research topics fragmented |
| Cognitive load | 3 | Companion routes focused; expert mode still dense on research |
| Visual hierarchy | 3 | Tokens partial; report views heavy |
| Design consistency | 2 | Raw utilities dominate over `brand-classes` |
| Component consolidation | 3 | Entity shell unified; EmptyState underused |
| Copy (EN/RU/UZ/TR) | 4 | Primary copy humanized; some English metric labels on lenses |
| Empty/loading/error | 3 | Contextual loading partial; Suspense null fallbacks |
| Interaction consistency | 4 | 150ms tokens present; keyboard on graph needs pass |
| Accessibility | 3 | Landmarks present; heading duplication fixed on lenses |
| Responsive | 4 | Browser regression passes 320–1920 viewports |
| Performance | 4 | Static export + client boundaries; no blocking regressions |
| Trust & honesty | 5 | Preview pages labeled; no fake live states on primary paths |
| OS feeling | 4 | Improved on entity trio after audit fixes |

*Scores reflect verified audit evidence, not aspirational targets.*

---

## Audit records (verified)

### AUD-001 — Duplicate mission chrome
| Field | Value |
|-------|-------|
| ID | AUD-001 |
| Route | `/countries`, `/companies`, `/universities` |
| Component | `GlobalMissionContextBar` + `MissionOperatingContextBar` |
| User type | All |
| Observed | Two “In this mission” regions in browser a11y tree |
| Expected | One page-level companion only |
| Severity | Major |
| Confidence | High |
| Evidence | Browser snapshot 2026-07-16 `/countries` refs e73 + e77 |
| User impact | Hesitation, repeated orientation |
| Correction | `ENTITY_EXPLORE_ROUTES` in `hasPageMissionCompanion()` |
| Regression risk | Low |
| Verification | EPIC-21 test 23; browser re-check |
| Status | **Fixed** |

### AUD-002 — Wrong companion purpose on entities
| Field | Value |
|-------|-------|
| ID | AUD-002 |
| Route | `/countries` |
| Component | `deriveRouteCompanion` |
| Observed | Home purpose string on countries page |
| Expected | Entity-specific purpose |
| Severity | Major |
| Confidence | High |
| Evidence | Snapshot text “Your mission lives here…” on `/countries` |
| Correction | `ROUTE_KEY_MAP` + i18n purpose keys |
| Status | **Fixed** |

### AUD-003 — Ecosystem double headers
| Field | Value |
|-------|-------|
| ID | AUD-003 |
| Route | `/government`, `/investor`, `/citizen` |
| Severity | Major |
| Correction | `WorkspaceHero` embedded mode |
| Status | **Fixed** |

### AUD-004 — Orphan components
| Field | Value |
|-------|-------|
| ID | AUD-004 |
| Component | `PageHeader`, `legacy-integration/*` |
| Severity | Minor |
| Correction | Deleted (9 files) |
| Status | **Fixed** |

### AUD-007 — Silent Suspense (deferred)
| Field | Value |
|-------|-------|
| ID | AUD-007 |
| Route | Layout, research |
| Severity | Major |
| Status | **Deferred** — provider order risk |

---

## Route-by-route audit

| Route | Purpose clear in 3s | Dominant action | OS feel | Notes |
|-------|---------------------|-----------------|---------|-------|
| `/` | Yes | Start/continue mission | A→B | Canvas home; companion via gateway |
| `/search` | Yes | Open profile | B | Mission companion; expert actions deferred |
| `/my-work` | Yes | Create/open project | B | No page companion |
| `/research` | Yes | Browse topic | B | Catalog clear |
| `/research/workspace` | Moderate | Workspace entry | B | Multiple sections |
| `/research/[topicId]` | Moderate | Tab choice | A | Competing sections |
| `/knowledge` | Yes | Review evidence | B | Companion route |
| `/reasoning` | Yes | Review reasoning | B | Companion route |
| `/graph` | Yes | Explore connections | B | Companion route |
| `/reports` | Yes | Generate/report | B | Companion route |
| `/countries` | Yes | Select country | B | Fixed duplicate chrome |
| `/companies` | Yes | Select company | B | Same grammar as countries |
| `/universities` | Yes | Select university | B | Same grammar |
| `/trust` | Yes | Verify sources | B | Reference route |
| `/ai-control` | Yes | Governance review | B | Technical vocabulary OK |
| `/settings` | Yes | Adjust preferences | B | Reference route |
| `/account` | Yes | Sign in/manage | B | Local/cloud honesty |
| `/about` | Yes | Learn + begin | B | Reference route |
| `/government` etc. | Yes | Coverage explore | B | Fixed double header |
| `/core`, `/workflows`, `/agents` | Yes (preview) | None | B | Honest stub |
| 404 / error | Yes | Return home | B | `SystemPageShell` |

---

## Journey audit summary

| Journey | Result | Friction |
|---------|--------|----------|
| A First-time | Pass | Mission creation on home clear |
| B Returning | Pass | Project persists (browser test 3) |
| C Research | Partial | Topic pages require tab choice |
| D Entity | Pass | Search → country works (browser test 2) |
| E Evidence | Pass | States honest without mission |
| F Report | Pass | Readiness blockers shown |
| G Mobile | Pass | Regression viewport tests |
| H Keyboard | Partial | Command bar works; graph toggles |

---

## Philosophy audit (Level 1)

| Principle | Status |
|-----------|--------|
| Humanity First | Pass — human decision boundary on conclusions |
| Evidence First | Pass — missing/conflict states shown |
| Truth Before Popularity | Pass — no ranking on capability galaxy |
| Human Judgment Supreme | Pass — no auto-decisions on reports |
| Explainability Before Automation | Pass — gateway deterministic |
| No fake confidence | Pass — preview routes labeled |

**Flagged (minor):** Ecosystem workspace lib titles still contain “Workspace” in data layer (hidden in embedded mode).

---

## Language audit

| Check | EN | UZ | RU | TR |
|-------|----|----|----|-----|
| Primary nav | OK | OK | OK | OK |
| Entity purpose keys | OK | OK | OK | OK |
| Raw keys on primary routes | None (browser test 9) | OK | OK | OK |
| Dynamic English in lib | Partial | — | — | — |
| Ecosystem metric labels | English only | — | — | — |

---

## Components removed

| Item | Lines (approx) |
|------|----------------|
| `components/layout/PageHeader.tsx` | 27 |
| `components/legacy-integration/*` (8 files) | ~900 |
| **Total** | ~930 lines removed |

---

## Clicks / decisions removed

- **1 duplicate orientation scan** per entity page visit (global bar removed)
- **1 false purpose interpretation** removed (home copy on entity routes)
- **1 redundant h1** per ecosystem lens page

---

*Full deferral list: see `CBAI-FRICTION-LEDGER.md`.*
