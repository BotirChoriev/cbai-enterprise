# CBAI Alpha 0.6 RC-3 Stability Audit

**Date:** 2026-07-06  
**Scope:** Release-stability sprint — audit, cleanup, constitution compliance  
**Constraints:** No new features, pages, APIs, frameworks, or mock data

---

## Executive Summary

Alpha 0.6 RC-3 is **ready for stable static deployment** on Cloudflare Pages. All 21 static routes build cleanly. Constitution violations on the Extended `/core` route and platform home copy were remediated. Six disconnected `lib/evidence-infrastructure` contract files and three empty legacy directories were removed. Pipeline readiness UI is integrated and honest on five evidence routes. Workspaces and entity intelligence routes comply with Zero Demo Policy.

**Release recommendation:** **Approve Alpha 0.6 for deployment** with documented technical debt below.

---

## Routes Audited

Build output confirms **21 static routes** (18 dashboard pages + `/`, `/_not-found`, and internal segments):

| Route | Status | Notes |
|-------|--------|-------|
| `/` | Pass | Platform home — demo wording corrected |
| `/search` | Pass | Local catalog search, honest partial status |
| `/knowledge` | Pass | Evidence Explorer + platform pipeline readiness |
| `/analytics` | Pass | Reports center + report pipeline readiness |
| `/reasoning` | Pass | Architecture disclosure, no fake chains |
| `/countries` | Pass | Countries 2.0 + entity pipeline readiness |
| `/companies` | Pass | Companies 2.0 + entity pipeline readiness |
| `/universities` | Pass | Universities 2.0 + entity pipeline readiness |
| `/government` | Pass | Governance workspace, no sentiment/recommendations |
| `/investor` | Pass | Investor workspace, readiness labels only |
| `/citizen` | Pass | Citizen workspace, honest unavailable states |
| `/ai-control` | Pass | Governance Control Center |
| `/dashboard` | Pass | System Monitor (intelligence harness — not modified) |
| `/settings` | Pass | Coming-soon shell |
| `/core` | **Remediated** | Fake AI metrics and animation removed |
| `/graph` | Pass | Catalog-derived graph, honest labels |
| `/agents` | Pass | Extended shell |
| `/workflows` | Pass | Extended shell — coming soon |
| `/_not-found` | Pass | Static fallback |

All routes: no broken imports, lint clean, TypeScript clean.

---

## Navigation Audit

**File:** `lib/navigation.ts`

| Check | Result |
|-------|--------|
| Labels match platform language | Pass — Evidence Explorer, Reports, Reasoning, Intelligence workspaces |
| Duplicate section titles | **Fixed** — second "Platform" renamed to "System" |
| Broken links | Pass — all hrefs map to existing static routes |
| Outdated descriptions | **Fixed** — System Monitor and CBAI Core descriptions now honest |
| Platform Context header | Pass — `lib/context/*` unchanged, header still wired |

Sections: Platform → Intelligence → System → Extended.

---

## Constitution Compliance

| Principle | Status |
|-----------|--------|
| Zero Demo Policy | **Remediated** on `/core` and `lib/platform-home.ts` |
| No Fake Data | Pass — entity catalogs use local registry; withheld scores disclosed |
| No Fake KPIs / Charts | Pass on intelligence routes; Reports center has explicit no-fake notice |
| No Social Sentiment Scoring | Pass — workspaces and entity intelligence exclude sentiment |
| No Political Recommendations | Pass — governance rules enforced in copy |
| No Fake AI Wording | **Remediated** — removed NEURAL LINK ACTIVE, Global AI Status, fake latencies |
| No Fake Interactivity | **Remediated** — `/core` command interface disabled; pipeline static |
| Facts vs Evaluations | Pass — entity blocks distinguish registry facts from withheld evaluative metrics |
| Stability Before Expansion | Pass — no new features added in this sprint |

**Remediated files:**
- `lib/core.ts` — empty memory arrays, honest mission control values
- `components/core/*` — honest labels, disabled command interface, static pipeline
- `app/(dashboard)/core/page.tsx` — removed fake processing animation; now server component
- `lib/platform-home.ts` — removed "demo" and "sentiment" wording

**Not modified (per sprint rules):** `runtime/`, `agents/`, `reasoning/`, `lib/intelligence/`

---

## Demo / Fake Data Audit

| Area | Finding | Action |
|------|---------|--------|
| `/core` | Fake latencies, conversations, NEURAL LINK, animated pipeline | **Removed** |
| `lib/platform-home.ts` | "Interactive pipeline demo", "structure demo" | **Reworded** |
| Workspaces | Already compliant — explicit no-sentiment/no-recommendation blocks | None |
| Entity intelligence | Local catalog only; withheld scores labeled | None |
| Graph | Uses `graph.mock` for **layout constants only** (positions, colors) — not intelligence data | Documented as debt |
| Dashboard | Uses intelligence harness types — skeleton mode disclosed | None (not modified) |
| Pipeline readiness | Architectural readiness labels, not fake metrics | Verified |

---

## Evidence Pipeline Readiness

Integrated on five routes via `lib/pipeline-readiness/` and `components/pipeline/`:

| Route | Component | Status |
|-------|-----------|--------|
| `/knowledge` | `PipelineReadinessPanel` | Pass — platform-wide stages |
| `/analytics` | `ReportPipelineReadinessSection` | Pass — per-report readiness |
| `/countries` | `EntityPipelineReadinessSection` | Pass — country evidence flow |
| `/companies` | `EntityPipelineReadinessSection` | Pass — company evidence flow |
| `/universities` | `EntityPipelineReadinessSection` | Pass — university evidence flow |

States use honest labels: `ready`, `partial`, `planned`, `blocked`.

---

## Workspaces Audit

| Route | Fake claims | Sentiment | Recommendations |
|-------|-------------|-----------|-----------------|
| `/government` | None | Excluded by rule copy | Excluded by rule copy |
| `/investor` | None | N/A | Explicitly excluded |
| `/citizen` | None | Explicitly excluded | N/A |

All three use `lib/workspaces/*` with constitutional guard blocks.

---

## Entity Intelligence Consistency

Countries 2.0, Companies 2.0, and Universities 2.0 share:
- Intelligence panel layout pattern
- Evidence-status blocks with honest labels
- Persona guidance sections
- `EntityPipelineReadinessSection` integration
- Constitutional guard notices (no fake data, no sentiment)

Minor copy differences reflect entity-specific governance rules — intentional.

---

## Dead Code Removed

**Deleted (100% disconnected — no imports):**

```
lib/evidence-infrastructure/index.ts
lib/evidence-infrastructure/contracts/index.ts
lib/evidence-infrastructure/contracts/adapter.contract.ts
lib/evidence-infrastructure/contracts/connector.contract.ts
lib/evidence-infrastructure/contracts/evidence-model.contract.ts
lib/evidence-infrastructure/versioning/manifest.ts
```

**Empty directories removed:**
- `components/knowledge/`
- `components/ai/`
- `lib/reasoning/`
- `lib/evidence-infrastructure/contracts/`
- `lib/evidence-infrastructure/versioning/`

**Retained (architecture layers, not app-wired yet):**
- `lib/connectors/world-bank/*`
- `lib/connectors/un-human-rights/*`
- `lib/evidence-infrastructure/{sources,normalizers,adapters,registry}/`

---

## Mobile Readiness

- Dashboard shell uses responsive grid (`sm:`, `xl:` breakpoints) throughout
- Sidebar navigation collapses on mobile via existing layout
- Entity panels stack vertically on narrow viewports
- No redesign performed; no obvious overflow issues found in component audit
- Graph canvas may require horizontal scroll on very small screens — acceptable for Alpha 0.6

---

## Accessibility Readiness

| Check | Status |
|-------|--------|
| Heading order | Pass on audited routes — h1 → h2 → h3 hierarchy |
| Button/link semantics | **Improved** — disabled `/core` controls use `aria-disabled` |
| Focus states | Pass — existing `focus-within` rings on interactive elements |
| ARIA | Pass — decorative elements use `aria-hidden`; pipeline uses semantic `<ol>` |
| Contrast | Pass — zinc palette on dark background meets readable contrast |

Full WCAG audit not performed — spot check only per sprint scope.

---

## Cloudflare Readiness

| Check | Status |
|-------|--------|
| Static export | Pass — `output: "export"` in `next.config.ts` |
| No Node-only APIs | Pass — no `getServerSideProps`, route handlers, or server actions in app |
| No server-only code in app routes | Pass |
| No environment variables required | Pass — build succeeds with zero env vars |
| Images | Pass — `images.unoptimized: true` |

Deploy target: Cloudflare Pages static hosting.

---

## Performance Notes

- `/core` converted from client component to server component — reduced client JS
- Removed fake pipeline animation timers — no unnecessary re-renders
- Pipeline readiness models built via `useMemo` on client explorer pages — acceptable
- Entity intelligence panels compute pipeline readiness per entity at render — catalog size is small; no action needed
- No duplicated heavy calculations identified beyond existing `useMemo` patterns
- Avoid over-optimization — no premature memoization added

---

## Remaining Technical Debt

1. **Graph layout mock** — `lib/graph/graph.mock.ts` provides node positions/colors; rename or split layout constants from "mock" naming in a future cleanup sprint
2. **Extended routes** — `/agents`, `/workflows` are shell pages without connected runtime
3. **Dashboard** — intelligence harness displays skeleton-mode data; full runtime connection deferred
4. **Search ranking** — score ranking under revision per platform home disclosure
5. **External evidence connectors** — World Bank and UN/Human Rights connectors are architecture-only, not wired to UI ingestion
6. **Multilingual** — English only; locale keys prepared but not activated
7. **Universities alignment** — platform home marks as in_progress for ranking removal verification
8. **Mobile graph** — may benefit from touch-friendly controls in a future UX pass (not redesign)

---

## Verification

```bash
npm run lint   # ✓ pass (0 errors)
npm run build  # ✓ pass — 21 static routes
```

---

## Release Recommendation

**Approve CBAI Alpha 0.6 for stable Cloudflare deployment.**

Constitution violations on Extended routes have been remediated. All intelligence and workspace routes present honest evidence status. Pipeline readiness architecture is visible and accurate. Build and lint are clean. Remaining debt is documented and does not block static export deployment.
