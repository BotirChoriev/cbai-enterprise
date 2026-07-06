# CBAI Platform Transformation Master Plan

**Document:** Platform Transformation Master Plan v1.1  
**Date:** July 6, 2026  
**Status:** Repository-wide constitution audit (documentation only)  
**Scope:** Every page, module, component, and library in `cbai-enterprise`  
**Authority:** CBAI Constitution (July 2026 ratification) · Golden Rule · Platform Law

---

## 1. Executive Summary

CBAI Enterprise is transitioning from an enterprise AI dashboard to a **Global Evidence Intelligence Platform**. This audit evaluates **six independent dimensions**. The Intelligence Engine and Platform Experience are **separate systems** — engine maturity must not be penalized for UI gaps, and UI violations must not be attributed to the engine.

**Current state:** A mature evidence-first intelligence engine (`lib/intelligence/`, 200+ files) paired with a platform UI that still contains pre-constitution demo content on several routes.

**Target state:** Engine and UI aligned — no fabricated intelligence on any route; six personas served; six platform surfaces (Web, iOS, Android, Desktop, PDF, API).

### Score dashboard (independent dimensions)

| Dimension | Score | What it measures |
|-----------|-------|------------------|
| **Intelligence Engine** | **88 / 100** | `lib/intelligence/` subsystems only — no UI dependency |
| **Platform Experience** | **49 / 100** | Dashboard, entity routes, discovery, ops surfaces, navigation |
| **Brand Compliance** | **36 / 100** | Logo, identity, design system, navigation copy, consistency |
| **Mobile Readiness** | **12 / 100** | Web, iOS, Android, Desktop, PDF, API — equal weight |
| **Constitution Compliance** | **52 / 100** | Per-route average — each page scored independently |
| **Overall Platform Evolution** | **47 / 100** | Equal average of the five dimension scores above |

### Scoring principle

> **Engine ≠ Platform ≠ Mobile ≠ Brand ≠ Constitution**  
> A single violating page does not reduce the Intelligence Engine score. A strong engine does not inflate Platform or Constitution scores.

### Critical finding

Two layers coexist:

1. **Engine layer (strong)** — Evidence, confidence, trust, runtime, observability, test harness (34 scenarios).
2. **Experience layer (mixed)** — `/countries` is compliant; `/companies`, `/universities`, `/knowledge`, `/agents`, `/search` still show fabricated intelligence.

P0 work removes fake data from the experience layer without requiring engine rewrites.

---

## 2. Intelligence Engine Evaluation

**Engine Score: 88 / 100**

Evaluates **only** `lib/intelligence/` subsystems. Does **not** consider UI pages, mock domain data in `lib/companies.ts`, or missing mobile clients.

| Subsystem | Score | Assessment |
|-----------|-------|------------|
| **Evidence** | 86 | Collector, validation, source typing; entity adapter country path compliant; document adapter explicitly disabled |
| **Quality** | 90 | Conservative quality assessment; no inflated scores without inputs |
| **Confidence** | 92 | Returns 0 / insufficient when no evidence; quality-weighted caps |
| **Trust** | 90 | Independent of confidence magnitude; explicit trust levels |
| **Diagnostics** | 88 | Builder produces structured output; no fabricated diagnostics |
| **Orchestrator** | 85 | Execution plans, policies, typed placeholder outputs |
| **Runtime** | 88 | In-process lifecycle management; integration hooks |
| **Queue** | 90 | Item state, enqueue/dequeue, policy-bound |
| **Scheduler** | 88 | Schedule state, tick integration with worker |
| **Worker** | 87 | Caller-driven tick/processNext; policy enforcement |
| **Policy** | 86 | Runtime policy rules; diagnostics integration |
| **Session Registry** | 90 | Session tracking for runtime scope |
| **Agent Registry** | 88 | Capability definitions, agent contracts |
| **Task Store** | 88 | Persistent task state within runtime |
| **Dispatcher** | 85 | Dispatch policies, routing skeleton |
| **Execution** | 82 | Stub backends explicitly no SDK / no fabrication |
| **Observability** | 91 | Live runtime, agent, health metrics from real singletons |
| **Architecture** | 89 | Modular subsystems, 34-scenario test harness, trace/timeline |

**Engine gaps (engine-only, not UI):**

- Graph signals placeholder awaiting confidence integration
- Memory interfaces defined; persistence not wired
- Orchestrator → worker production wiring incomplete (BUILD-061 roadmap)
- External evidence source adapters not connected (by design — no fabrication)

**Not scored against engine:** Fake `aiSummary` in `lib/companies.ts`, hardcoded UI confidence, chat surfaces, or missing i18n.

---

## 3. Platform Experience Evaluation

**Platform Score: 49 / 100**

Evaluates user-facing routes and shell. Does **not** include intelligence engine internals.

| Surface | Score | Status | Primary issue |
|---------|-------|--------|---------------|
| **Dashboard** | 74 | ✅ Ops-honest | Live runtime metrics; limited persona value |
| **Countries** | 91 | ✅ Compliant | Golden Rule reference; local registry scope |
| **Companies** | 10 | ❌ Critical | Fabricated scores, narratives, 96.1% confidence |
| **Universities** | 10 | ❌ Critical | Fake rankings, scores, 95.4% confidence |
| **Search** | 36 | ❌ High | Score ranking, 91.3% insight confidence |
| **Graph** | 46 | ⚠️ Partial | Visual OK; inspector shows fake scores |
| **Reasoning** | 54 | ⚠️ Partial | Simulated pipeline; caveats in engine not prominent in UI |
| **Knowledge** | 16 | ❌ Critical | Fake corpus metrics, source health |
| **Agents** | 20 | ❌ Critical | Fabricated success rates, activity feed |
| **Core** | 26 | ❌ Critical | Chat UX, fake memory, "NEURAL LINK ACTIVE" |
| **Analytics** | 86 | ✅ Placeholder | Honest "coming soon" |
| **Settings** | 86 | ✅ Placeholder | Honest "coming soon" |
| **Workflows** | 86 | ✅ Placeholder | Honest "coming soon" |
| **Navigation** | 56 | ⚠️ Partial | Good structure; AI-first copy; decorative Topbar search |
| **Brand (UI application)** | 30 | ❌ Gap | Foundation doc exists; UI uses gradient placeholder mark |

**Platform average:** 727 ÷ 15 = **49 / 100**

**Also audited (not in Platform Score average):**

| Route | Score | Notes |
|-------|-------|-------|
| `/` Platform Home | 62 | Module directory; no fake intelligence |
| `/ai-control` | 22 | Chat wrapper; fake Acme Corp context |

---

## 4. Mobile Readiness Evaluation

**Mobile Score: 12 / 100**

Each platform evaluated independently. Equal weight in aggregate score.

| Platform | Score | Status |
|----------|-------|--------|
| **Web** | 58 | Static Next.js export works; fixed sidebar breaks mobile layout; no PWA |
| **iOS** | 0 | No project, no shared API contract, no App Store assets |
| **Android** | 0 | No project, no shared schema layer for native clients |
| **Desktop** | 6 | Web-only; no Electron/Tauri wrapper or desktop shell |
| **PDF** | 0 | No report generation pipeline; brand PDF rules documented only |
| **API** | 10 | Internal intelligence types exist; no public REST/GraphQL surface |

**Mobile average:** (58 + 0 + 0 + 6 + 0 + 10) ÷ 6 = **12 / 100**

**Web-specific issues:** Fixed `w-64` sidebar, no collapse/hamburger, graph lacks touch pan/zoom, no locale routing.

**Cross-platform architecture (required, not present):**

```
@cbai/schema   — shared types from lib/entity + lib/intelligence
@cbai/content  — locale-aware evidence bundles
@cbai/api      — public API (future)
apps/web       — current Next.js static export
apps/ios       — future
apps/android   — future
packages/pdf   — report renderer (future)
```

---

## 5. Constitution Compliance Evaluation

**Constitution Score: 52 / 100**

**Methodology:** Each route scored **independently** (0–100). Constitution Score = **arithmetic mean** of all route scores. One violating page does **not** reduce scores of compliant pages.

| Route | Score | Verdict |
|-------|-------|---------|
| `/` | 85 | ✅ No fake intelligence; low persona value |
| `/dashboard` | 88 | ✅ Honest runtime observability |
| `/core` | 22 | ❌ Fake state, chat UX |
| `/countries` | 96 | ✅ Golden Rule reference |
| `/companies` | 8 | ❌ Fabricated scores and narratives |
| `/universities` | 8 | ❌ Fabricated rankings and scores |
| `/search` | 28 | ❌ Fake insight confidence, score filters |
| `/graph` | 52 | ⚠️ Mock relationships; fake inspector scores |
| `/reasoning` | 58 | ⚠️ Simulated; partially disclosed |
| `/ai-control` | 20 | ❌ Chat wrapper, fake context |
| `/agents` | 18 | ❌ Fabricated operational metrics |
| `/knowledge` | 12 | ❌ Fake corpus and infrastructure |
| `/workflows` | 94 | ✅ Honest placeholder |
| `/analytics` | 94 | ✅ Honest placeholder |
| `/settings` | 94 | ✅ Honest placeholder |

**Constitution average:** 777 ÷ 15 = **52 / 100**

**Compliant routes (≥ 85):** 6 of 15 — `/`, `/dashboard`, `/countries`, `/workflows`, `/analytics`, `/settings`

**Critical routes (< 30):** 6 of 15 — `/companies`, `/universities`, `/search`, `/ai-control`, `/agents`, `/knowledge`

---

## 6. Persona Compliance Evaluation

Golden Rule: each route must deliver clear value to General Citizen, Investor, Government Leader, Student, Researcher, and Academic — or be redesigned.

**Legend:** ✅ Clear value · ⚠️ Partial / misleading · ❌ No value · 🚫 Harmful (fake data)

### Per-route persona matrix

| Route | Citizen | Investor | Government | Student | Researcher | Academic |
|-------|---------|----------|------------|---------|------------|----------|
| `/` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/dashboard` | ❌ | ❌ | ⚠️ | ❌ | ⚠️ | ❌ |
| `/core` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/countries` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| `/companies` | 🚫 | 🚫 | ❌ | 🚫 | 🚫 | 🚫 |
| `/universities` | 🚫 | 🚫 | ❌ | 🚫 | 🚫 | 🚫 |
| `/search` | ❌ | 🚫 | ❌ | ❌ | 🚫 | 🚫 |
| `/graph` | ❌ | 🚫 | ❌ | ❌ | ⚠️ | ⚠️ |
| `/reasoning` | ❌ | 🚫 | ❌ | ⚠️ | ⚠️ | ⚠️ |
| `/ai-control` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/agents` | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| `/knowledge` | ❌ | 🚫 | 🚫 | ❌ | 🚫 | 🚫 |
| `/workflows` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/analytics` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/settings` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Persona coverage summary

| Persona | Routes with clear value | Score | Primary gap |
|---------|-------------------------|-------|-------------|
| **General Citizen** | 1 (`/countries`) | 12 / 100 | No tenders, reforms, sentiment, plain-language layer |
| **Investor** | 0 | 4 / 100 | Fake investment scores harm trust |
| **Government Leader** | 0 (partial: `/dashboard` ops) | 10 / 100 | No governance evidence dashboard |
| **Student** | 0 (partial: `/countries`) | 8 / 100 | No case studies; fake timelines elsewhere |
| **Researcher** | 0 (partial: `/countries`, `/graph`, `/reasoning`) | 14 / 100 | Engine test harness not exposed in UI |
| **Academic** | 0 (partial: `/countries`) | 10 / 100 | Methodology in engine docs, not product |

Persona framework exists only on `/countries` via `lib/countries.intelligence.ts` → `CountryIntelligencePanel.tsx`.

---

## 7. Brand Compliance Evaluation

**Brand Score: 36 / 100**

Evaluates alignment with `docs/brand/cbai-brand-foundation.md`. Documentation-only brand spec; UI not yet updated.

| Criterion | Score | Assessment |
|-----------|-------|------------|
| **Logo** | 22 | No official mark deployed; sidebar uses gradient "C" placeholder — conflicts with restraint/no-gradient-overload rules |
| **Identity** | 28 | Metadata: *"AI Platform for Modern Organizations"* — contradicts Evidence Intelligence Platform positioning |
| **Design System** | 42 | Consistent zinc/dark palette; no brand color tokens, typography scale, or spacing tokens from foundation doc |
| **Navigation** | 54 | Grouped sections work; labels emphasize "AI Control", "AI Agents", "CBAI Core" over evidence |
| **Consistency** | 34 | Countries page follows brand tone; companies/universities violate evidence-first visual language with score bars and AI badges |

**Brand average:** (22 + 28 + 42 + 54 + 34) ÷ 5 = **36 / 100**

**Positive:** Brand foundation and logo concepts documented; dark calm aesthetic partially matches intended tone.

**Gaps:** No favicon/app icon per brand rules; forced dark-only (foundation defines light + dark themes); "Enterprise Alpha" badge not in brand system.

---

## 8. Transformation Priority

Priorities ordered by constitutional impact. **Engine work is not P0** — fake data removal is experience-layer work.

### P0 — Critical (remove fake data)

| # | Action |
|---|--------|
| 1 | Remove all fabricated scores, confidence %, and AI narratives from domain modules |
| 2 | Gate `EntityAISummary`, `EntityScoreCard`, `EntityLayout` on evidence status |
| 3 | Replace hardcoded confidence (96.1%, 95.4%, 94.2%, 91.3%) with "Insufficient Evidence" |
| 4 | Stop score-based search ranking and filters |
| 5 | Replace knowledge/agents fake metrics with "Evidence Source Not Connected" |
| 6 | Add CI guard: no score fields in domain modules without evidence adapter |

### P1 — Entity modules (Countries · Companies · Universities)

| # | Action |
|---|--------|
| 7 | **Countries:** Extend registry; promote tender blocks to first-class modules; add i18n keys |
| 8 | **Companies:** Apply countries pattern — `companies.intelligence.ts`, factual registry, withhold scores |
| 9 | **Universities:** Same remediation as companies |
| 10 | Extend persona framework from countries to all entity modules |
| 11 | Fix `entity-evidence-mapper.ts` default path to withhold non-country fabricated fields |

### P2 — Discovery & operations surfaces (Search · Knowledge · Agents)

| # | Action |
|---|--------|
| 12 | **Search:** Remove AI insight confidence; show evidence status per result |
| 13 | **Knowledge:** Honest source connection states; remove fake Pinecone/S3 health |
| 14 | **Agents:** Bind UI to runtime agent state from observability or show unavailable |
| 15 | **Graph / Reasoning / Core / AI Control:** Label simulations; remove fake inspector scores |
| 16 | Wire Topbar search or remove decorative input |

### P3 — Persona modules (Investor · Government · Citizen)

| # | Action |
|---|--------|
| 17 | **Investor:** Tender transparency, budget transparency, sector evidence modules |
| 18 | **Government:** Evidence dashboard, regional indicators, early warning (evidence-only) |
| 19 | **Citizen:** Plain-language layer, public sentiment schema (not official ratings) |
| 20 | **Student / Researcher / Academic:** Case studies, methodology route, harness exposure |
| 21 | PDF report pipeline for investor and academic outputs |

### P4 — Mobile & cross-platform

| # | Action |
|---|--------|
| 22 | Extract `@cbai/schema` shared types |
| 23 | Responsive shell — collapsible sidebar, mobile navigation |
| 24 | i18n architecture (EN + pilot locale) |
| 25 | Public API contract |
| 26 | iOS / Android MVP consuming shared API |
| 27 | Desktop wrapper and PWA manifest |

---

## 9. Overall Platform Evolution Score

**Overall Platform Evolution Score: 47 / 100**

```
Overall = (Engine + Platform + Brand + Mobile + Constitution) ÷ 5
        = (88 + 49 + 36 + 12 + 52) ÷ 5
        = 47.4 → 47 / 100
```

| Dimension | Current | Phase 1 target | Launch target |
|-----------|---------|----------------|---------------|
| Intelligence Engine | 88 | 90 | 95 |
| Platform Experience | 49 | 72 | 88 |
| Brand Compliance | 36 | 55 | 80 |
| Mobile Readiness | 12 | 25 | 70 |
| Constitution Compliance | 52 | 75 | 92 |
| **Overall Evolution** | **47** | **63** | **85** |

**Interpretation:** The engine is production-grade for its scope. Platform evolution is blocked primarily by **P0 fake data** on entity and discovery routes, not by engine architecture.

---

## 10. Every Page Audit

### 10.1 `/` — Platform Home

| Field | Assessment |
|-------|------------|
| Purpose | Module directory + runtime health snapshot |
| Constitution | ✅ No fake entity intelligence |
| Violations | Low persona value; "Enterprise Alpha" positioning; gradient logo in sidebar |
| Personas | ❌ Navigation only — no domain intelligence for any persona |
| Priority | P2 — reframe copy and add persona entry points |

### 10.2 `/dashboard` — Runtime Dashboard

| Field | Assessment |
|-------|------------|
| Purpose | Live in-process runtime observability (sessions, queue, scheduler, agents, worker) |
| Constitution | ✅ Real relative to local runtime singletons |
| Violations | "Live" label may overstate production telemetry; zero persona domain value |
| Personas | Government (ops admin) low; others none |
| Priority | P3 — keep; clarify "development runtime" vs production |

### 10.3 `/core` — CBAI Core

| Field | Assessment |
|-------|------------|
| Purpose | Mission control, command input, thinking pipeline, memory panel |
| Constitution | ❌ Chat-style command center; fake operational state |
| Violations | "NEURAL LINK ACTIVE"; `runningAgents: 4`; fake conversations; unwired Execute; "brain of CBAI" copy |
| Files | `lib/core.ts`, `components/core/CommandCenter.tsx`, `MissionControl.tsx`, `MemoryPanel.tsx` |
| Priority | **P1** — redesign or quarantine as labeled simulation |

### 10.4 `/countries` — Countries Intelligence ✅

| Field | Assessment |
|-------|------------|
| Purpose | Factual registry + constitution intelligence blocks + persona guidance |
| Constitution | ✅ Golden Rule reference implementation |
| Violations | Local registry only (6 countries); English-only; tender blocks are placeholders not modules |
| Personas | ✅ All six personas addressed with honest evidence-status guidance |
| Priority | P0 reference — extend pattern platform-wide |

### 10.5 `/companies` — Companies Intelligence ❌

| Field | Assessment |
|-------|------------|
| Purpose | Company profiles with AI/investment/risk scores and narratives |
| Constitution | ❌ Critical Golden Rule breach |
| Violations | Fabricated scores (`aiReadiness`, `investmentScore`, `riskScore`); `aiConfidence={96.1}`; long `aiSummary` essays; unverified financials |
| Files | `lib/companies.ts`, `lib/companies.adapter.ts`, `app/(dashboard)/companies/page.tsx`, `EntityLayout`, `EntityAISummary` |
| Priority | **P0** — apply countries remediation pattern immediately |

### 10.6 `/universities` — Universities Intelligence ❌

| Field | Assessment |
|-------|------------|
| Purpose | University profiles with rankings, research scores, AI narratives |
| Constitution | ❌ Critical Golden Rule breach |
| Violations | Fake global rankings (#1, #3); `aiConfidence={95.4}`; fabricated research strength; timeline claims "Ranked #N globally" as 2026 fact |
| Files | `lib/universities.ts`, `lib/universities.adapter.ts`, entity components |
| Priority | **P0** — same remediation as companies |

### 10.7 `/search` — Global Search ❌

| Field | Assessment |
|-------|------------|
| Purpose | Unified entity search with score filters and AI insight panel |
| Constitution | ❌ Ranks by fake scores; hardcoded insight confidence |
| Violations | `generateSearchInsight()` patterns from fabricated data; **Confidence: 91.3%** in footer; score-based filters |
| Files | `lib/global-search.ts`, `components/search/SearchInsightPanel.tsx` |
| Priority | **P1** — disable score ranking until evidence connected |

### 10.8 `/graph` — Knowledge Graph ⚠️

| Field | Assessment |
|-------|------------|
| Purpose | SVG relationship visualization with entity inspector |
| Constitution | ⚠️ Visual OK; inspector shows fake scores and narratives |
| Violations | Edges from hardcoded relationships; no provenance metadata; inspector score pills |
| Files | `lib/graph/graph.builder.ts`, `components/graph/GraphInspector.tsx` |
| Priority | **P1** — inspector must show evidence status like countries |

### 10.9 `/reasoning` — Reasoning Engine ⚠️

| Field | Assessment |
|-------|------------|
| Purpose | 8-stage animated pipeline with template answers |
| Constitution | ⚠️ Permitted simulation with partial disclosure |
| Violations | Template conclusions; confidence 42–98% from fake entity scores; chat-style Q&A UX |
| Mitigation | Engine caveats: "Simulated reasoning — no live LLM" |
| Files | `lib/reasoning/reasoning.engine.ts`, `reasoning.mock.ts` |
| Priority | **P2** — prominent simulation banner; remove fake score inputs |

### 10.10 `/ai-control` — AI Control Center ❌

| Field | Assessment |
|-------|------------|
| Purpose | Command routing, agent dispatch, system context |
| Constitution | ❌ Chatbot wrapper; fake interactivity |
| Violations | CommandBox chat UI; "Agent processing..." forever; hardcoded "Acme Corp" context |
| Files | `components/ai/CommandBox.tsx`, `AgentRouter.tsx`, `SystemContext.tsx` |
| Priority | **P1** — reframe as governance surface or remove from primary nav |

### 10.11 `/agents` — AI Agents ❌

| Field | Assessment |
|-------|------------|
| Purpose | Agent catalog with success rates and activity feed |
| Constitution | ❌ Fabricated operational metrics |
| Violations | `successRate` 91.5%–99.4%; `tasksCompleted` 445–3214; fake activity feed; unwired Create Agent |
| Files | `lib/agents.ts`, `components/agents/*` |
| Priority | **P1** — replace with runtime agent state or "Insufficient Evidence" |

### 10.12 `/knowledge` — Knowledge ❌

| Field | Assessment |
|-------|------------|
| Purpose | Document collections, source health, indexing activity |
| Constitution | ❌ Fake corpus and infrastructure |
| Violations | Confidence 88.3%–99.1%; document counts 412–3891; fake Pinecone/S3/Salesforce health; geopolitical "Country Reports" framing |
| Files | `lib/knowledge.ts`, `components/knowledge/*` |
| Priority | **P1** — show "Evidence Source Not Connected" for all collections |

### 10.13 `/workflows` — Workflows ✅

| Field | Assessment |
|-------|------------|
| Purpose | Honest "coming soon" placeholder |
| Constitution | ✅ Compliant |
| Priority | P3 — implement when constitution modules exist |

### 10.14 `/analytics` — Analytics ✅

| Field | Assessment |
|-------|------------|
| Purpose | Honest "coming soon" placeholder |
| Constitution | ✅ Compliant |
| Priority | P3 |

### 10.15 `/settings` — Settings ✅

| Field | Assessment |
|-------|------------|
| Purpose | Honest "coming soon" placeholder |
| Constitution | ✅ Compliant |
| Priority | P3 |

---

## 11. Every Module Audit

### 11.1 Domain modules

| Module | File | Status | Issue |
|--------|------|--------|-------|
| Countries | `lib/countries.ts` | ✅ | Factual registry only (6 records) |
| Countries Intelligence | `lib/countries.intelligence.ts` | ✅ | Evidence-withheld blocks + personas |
| Companies | `lib/companies.ts` | ❌ | Full fabricated intelligence profiles |
| Universities | `lib/universities.ts` | ❌ | Rankings, scores, narratives |
| Agents | `lib/agents.ts` | ❌ | Fake success rates, tasks, activity |
| Knowledge | `lib/knowledge.ts` | ❌ | Fake corpus metrics, source health |
| Core | `lib/core.ts` | ❌ | Fake mission control, memory, conversations |
| Global Search | `lib/global-search.ts` | ❌ | Mock insight synthesis, score boosting |
| Navigation | `lib/navigation.ts` | ⚠️ | English-only; "AI" framing in descriptions |

### 11.2 Adapters

| Adapter | Status | Issue |
|---------|--------|-------|
| `countries.adapter.ts` | ✅ | Scores zeroed; insufficient evidence labels |
| `companies.adapter.ts` | ❌ | Propagates all fabricated fields + fake trends |
| `universities.adapter.ts` | ❌ | Propagates rankings, scores, fake timeline |

### 11.3 Graph subsystem

| File | Status | Issue |
|------|--------|-------|
| `graph.mock.ts` | ✅ | Visual config only (colors, layout) |
| `graph.builder.ts` | ⚠️ | Edges from hardcoded domain relationships |
| `graph.types.ts` | ✅ | Type definitions only |

### 11.4 Reasoning subsystem

| File | Status | Issue |
|------|--------|-------|
| `reasoning.mock.ts` | ⚠️ | Template answers — acceptable if labeled |
| `reasoning.engine.ts` | ⚠️ | Uses fake entity scores in confidence |
| `reasoning.types.ts` | ✅ | Types only |

### 11.5 Entity framework

| File | Status | Issue |
|------|--------|-------|
| `entity.types.ts` | ⚠️ | Defines score/aiSummary fields — consumers violate |
| `entity.helpers.ts` | ✅ | Presentation helpers only |

### 11.6 Intelligence engine (`lib/intelligence/`)

| Subsystem | Status | Notes |
|-----------|--------|-------|
| Evidence collector + adapters | ⚠️ | Country path compliant; default path emits fake `aiSummary` excerpts |
| Confidence assessor | ✅ | Returns 0 when no evidence |
| Trust assessor | ✅ | Independent of confidence magnitude |
| Contradictions | ✅ | No fabricated contradictions |
| Diagnostics | ✅ | Explicit stubs documented |
| Engine / orchestrator | ✅ | Placeholder execution, no fake conclusions |
| Agents runtime | ✅ | Stub backends explicitly no fabrication |
| Runtime / queue / scheduler / worker | ✅ | Real in-process state |
| Observability / dashboard data | ✅ | Live runtime metrics |
| Memory | ✅ | Interfaces only |
| Testing harness | ✅ | 34 scenarios against real entity IDs |
| Graph signals | ⚠️ | Placeholder for future integration |

### 11.7 Missing constitution modules (Tender Law)

| Required module | Status | Location |
|-----------------|--------|----------|
| Tender Transparency | ❌ Not implemented | Placeholder block in `countries.intelligence.ts` only |
| Budget Transparency | ❌ Not implemented | Placeholder block only |
| Procurement Openness | ❌ Not implemented | Placeholder block only |
| Administrative Transparency | ❌ Not implemented | Not referenced |
| Regulatory Predictability | ❌ Not implemented | Not referenced |

These must become **first-class intelligence modules** with dedicated routes, adapters, and evidence sources — not sidebar footnotes inside country detail panels.

---

## 12. Every Fake/Demo Element

### 12.1 Fabricated scores (presented as intelligence)

| Location | Values |
|----------|--------|
| `lib/companies.ts` | `aiReadiness`, `investmentScore`, `riskScore`, `innovationScore` per company |
| `lib/universities.ts` | `ranking`, `researchStrength`, `aiReadiness`, `investmentScore`, `riskScore` |
| `app/(dashboard)/companies/page.tsx` | `aiConfidence={96.1}` |
| `app/(dashboard)/universities/page.tsx` | `aiConfidence={95.4}` |
| `components/entity/EntityAISummary.tsx` | Default `confidence = 94.2` |
| `components/search/SearchInsightPanel.tsx` | Hardcoded **91.3%** |
| `lib/knowledge.ts` | Per-collection `confidenceScore` 88.3%–99.1% |
| `lib/agents.ts` | Per-agent `successRate` 91.5%–99.4% |
| `lib/reasoning/reasoning.engine.ts` | Composite confidence clamped 42–98% |

### 12.2 Fabricated narratives (AI summaries)

| Location | Content type |
|----------|--------------|
| `lib/companies.ts` | Geopolitical/market `aiSummary` and `overview` essays (Apple, Microsoft, Google, etc.) |
| `lib/universities.ts` | Academic ranking claims, research leadership narratives |
| `lib/companies.adapter.ts` | Timeline "AI Strategy Active" with readiness score |
| `lib/universities.adapter.ts` | "Ranked #N globally" timeline events dated 2026 |

### 12.3 Fabricated operational data

| Location | Content |
|----------|---------|
| `lib/core.ts` | `runningAgents: 4`, fake conversations, pinned knowledge, saved command usage counts |
| `lib/agents.ts` | `tasksCompleted`, `lastRun`, `agentActivity` feed |
| `lib/knowledge.ts` | Document counts, indexing activity, `storageUsed: "24.7 GB"`, `searchAccuracy` |
| `lib/knowledge.ts` | Fake Pinecone, S3, Salesforce, market data API latencies |
| `components/core/MissionControl.tsx` | "All systems nominal", "NEURAL LINK ACTIVE" |
| `components/agents/AgentStats.tsx` | "↑ 342 this week", "Above 90% target" |
| `components/knowledge/KnowledgeStats.tsx` | "↑ 183 added this week" |

### 12.4 Fabricated trends and deltas

| Location | Examples |
|----------|----------|
| `lib/companies.adapter.ts` | `change: "↑ YoY"`, `"Industry leading"` on metrics |
| `lib/universities.adapter.ts` | `change: "Peer reviewed"` on research strength |
| `lib/global-search.ts` | "High AI readiness cluster", "Low risk profile" patterns |

### 12.5 Simulated but insufficiently disclosed

| Location | Issue |
|----------|-------|
| `/reasoning` | Caveats exist in engine but not prominent in UI |
| `/graph` | Mock relationships acknowledged in constitution v1 §9.6 but inspector lacks disclosure |
| `/search` | Footer says "Mock" but header says "AI-powered result analysis" |

---

## 13. Every Placeholder

### 13.1 Compliant placeholders (honest "not available")

| Location | Message |
|----------|---------|
| `/workflows` | "Workflow builder coming soon" |
| `/analytics` | "Analytics dashboard coming soon" |
| `/settings` | "Settings panel coming soon" |
| `lib/countries.intelligence.ts` | "Insufficient Evidence" / "Evidence Source Not Connected" on all score blocks |
| `components/ai/CommandBox.tsx` | "Awaiting backend integration" (partial) |

### 13.2 Non-compliant placeholders (look functional but are not)

| Location | Issue |
|----------|-------|
| `components/layout/Topbar.tsx` | Search bar — decorative, not wired to `/search` |
| `components/layout/Topbar.tsx` | Notifications bell — non-functional |
| `components/layout/Topbar.tsx` | User menu "Jane Doe / Admin" — fake persona |
| `components/core/CommandCenter.tsx` | Execute button — animates only, discards input |
| `/agents` | "Create Agent" button — unwired |
| `/knowledge` | "Upload Documents" button — unwired |
| `/ai-control` | Submit — infinite "Agent processing..." |

---

## 14. Every Hardcoded Value

### 14.1 Entity registry limits

| Domain | Count | Scope |
|--------|-------|-------|
| Countries | 6 | USA, China, Germany, Japan, Brazil, Uzbekistan |
| Companies | 8–9 | Major US tech (Apple, Microsoft, Google, etc.) |
| Universities | 9–10 | Global elite (MIT, Stanford, Oxford, etc.) |
| Agents | 6 | Catalog entries with fixed stats |
| Knowledge collections | 4 | Fixed document counts |

### 14.2 Hardcoded confidence and thresholds

| Value | Location |
|-------|----------|
| 96.1% | Companies page |
| 95.4% | Universities page |
| 94.2% | EntityAISummary default |
| 91.3% | SearchInsightPanel |
| 42–98% | Reasoning confidence clamp |
| 90% | AgentStats "target" |
| Scoring weights 100/80/60/40/25/20/15/10 | global-search.ts |

### 14.3 Hardcoded platform identity

| Value | Location |
|-------|----------|
| "CBAI Enterprise" | Sidebar, metadata |
| "Enterprise Alpha" | Sidebar badge |
| "cbai-enterprise-v2" | lib/core.ts activeModel |
| "Acme Corp" | AI Control system context |
| "Jane Doe / Admin" | Topbar user |
| `lang="en"` | app/layout.tsx |
| Geist `subsets: ["latin"]` only | app/layout.tsx |

### 14.4 Hardcoded English strings

All UI copy, navigation labels, persona guidance, intelligence block titles, error messages, and mock narratives are English-only with no i18n keys, no locale routing, and no RTL layout support.

---

## 15. Every UX Issue

| ID | Issue | Severity | Affected routes |
|----|-------|----------|-----------------|
| UX-01 | Platform positioned as "AI dashboard" not evidence platform | Critical | Global (metadata, nav) |
| UX-02 | Chat-style command inputs on Core, AI Control, Reasoning | Critical | `/core`, `/ai-control`, `/reasoning` |
| UX-03 | Fake interactivity (buttons that do nothing or loop forever) | High | Topbar, Core, Agents, Knowledge, AI Control |
| UX-04 | Scores displayed without evidence disclosure | Critical | Companies, Universities, Search, Graph |
| UX-05 | Inconsistent Golden Rule (countries vs companies/universities) | Critical | Entity modules |
| UX-06 | No persona guidance on 14/15 routes | High | All except countries |
| UX-07 | Decorative global search in Topbar | Medium | All dashboard pages |
| UX-08 | Graph canvas poor on small viewports (limited pan/zoom) | Medium | `/graph` |
| UX-09 | Dense metric grids without progressive disclosure | Low | Dashboard, Agents, Knowledge |
| UX-10 | Gradient logo treatment conflicts with brand foundation (restraint) | Low | Sidebar |
| UX-11 | Dark-only theme forced (`dark` class on html) | Medium | Global — no light theme toggle |
| UX-12 | "Enterprise Alpha" badge implies production readiness | Medium | Sidebar |

---

## 16. Every Architecture Issue

| ID | Issue | Impact | Recommendation |
|----|-------|--------|----------------|
| ARCH-01 | Two-tier compliance split (countries vs rest) | User trust erosion | Unified evidence-status pattern for all entities |
| ARCH-02 | Entity components assume scores exist | Propagates fake data | Gate `EntityScoreCard` / `EntityAISummary` on evidence status |
| ARCH-03 | `entity-evidence-mapper.ts` default path uses fake aiSummary | Intelligence pipeline contaminated | Extend country-compliant withholding to all entity types |
| ARCH-04 | Static export only (`output: "export"`) | No SSR API routes for future mobile/API | Plan shared `@cbai/content` + REST/GraphQL layer |
| ARCH-05 | No i18n architecture | Violates Multilingual Law | Introduce locale keys before content expansion |
| ARCH-06 | Web-only component library | Violates Supported Platforms Law | Extract platform-agnostic types and content schemas |
| ARCH-07 | Graph relationships from string arrays in domain files | No provenance, no temporal edges | Relationship engine with source metadata |
| ARCH-08 | Reasoning engine consumes UI mock scores | Simulated conclusions appear evidence-based | Decouple reasoning demo from entity score fields |
| ARCH-09 | Navigation describes "AI" modules prominently | Violates Platform Law | Reorder nav: Evidence → Entities → Transparency → Operations |
| ARCH-10 | Metadata/SEO still "enterprise AI infrastructure" | Vision misalignment | Update to Evidence Intelligence Platform positioning |
| ARCH-11 | No PDF report generation pipeline | Investor/Academic personas blocked | Add report builder consuming intelligence blocks |
| ARCH-12 | Tender Law modules not in domain model | Constitution gap | Add `lib/tenders/`, `lib/transparency/` first-class modules |
| ARCH-13 | No public sentiment data model | Citizen persona incomplete | Design sentiment schema (Satisfied/Unsatisfied/No Opinion) with "not official ratings" disclosure |
| ARCH-14 | Intelligence test harness not exposed to UI | Researcher/Academic value hidden | Optional developer/research mode surfacing trace output |

---

## 17. Every Mobile Issue (Web detail)

| ID | Issue | Detail |
|----|-------|--------|
| MOB-01 | Fixed 256px sidebar always visible | `Sidebar.tsx`: `w-64 shrink-0` — no collapse, no hamburger |
| MOB-02 | Content area compressed on phones | ~320px viewport leaves ~64px for content on small devices |
| MOB-03 | No touch-optimized graph interaction | Graph canvas lacks pinch-zoom, pan gestures |
| MOB-04 | Three-column layouts stack but remain dense | Reasoning, Search, Graph use `xl:grid-cols-12` |
| MOB-05 | No responsive navigation pattern | No bottom tab bar alternative for mobile |
| MOB-06 | Topbar search too narrow on mobile | Hidden or truncated on small breakpoints |
| MOB-07 | No PWA manifest or offline strategy | Static export deployable but no installable app shell |
| MOB-08 | Touch targets generally adequate | Buttons meet ~44px in most components — partial OK |

**Web detail (contributes to Mobile Score Web component):** See Section 4. Desktop-first layout; fixed sidebar is primary blocker.

---

## 18. Every iOS/Android Issue

| ID | Issue | Status |
|----|-------|--------|
| NATIVE-01 | No iOS project (Swift/SwiftUI or React Native) | Not started |
| NATIVE-02 | No Android project (Kotlin or React Native) | Not started |
| NATIVE-03 | No shared mobile design system | Not started |
| NATIVE-04 | No mobile API contract | Not started |
| NATIVE-05 | No push notification architecture | Not started |
| NATIVE-06 | No offline evidence cache strategy | Not started |
| NATIVE-07 | No App Store / Play Store asset pipeline | Not started |
| NATIVE-08 | Content schemas not platform-agnostic | Web React components embed all logic |
| NATIVE-09 | Authentication/SSO not implemented | Blocks mobile account sync |
| NATIVE-10 | PDF export not available for mobile share sheet | Not started |

**Native detail:** See Section 4 (Mobile Readiness Evaluation). iOS and Android score 0 — not started.

---

## 19. Every Multilingual Issue

| ID | Issue | Detail |
|----|-------|--------|
| I18N-01 | No i18n library (next-intl, react-i18next, etc.) | All strings inline |
| I18N-02 | `lang="en"` hardcoded on `<html>` | No locale detection or switching |
| I18N-03 | Fonts Latin subset only | Arabic, Japanese, Chinese, Cyrillic (Russian) not supported |
| I18N-04 | No RTL layout support | Required for Arabic |
| I18N-05 | No locale routing (`/en/`, `/uz/`, etc.) | Single-language URLs |
| I18N-06 | Domain data narratives English-only | Company/university aiSummary not translatable |
| I18N-07 | Persona guidance English-only | Even compliant countries module not localized |
| I18N-08 | Date/number formatting not locale-aware | Hardcoded US-style presentation |
| I18N-09 | Constitution target languages not planned in code | EN, UZ, RU, TR, AR, JA, ZH, FR, ES — zero infrastructure |
| I18N-10 | Search and filters English-only | Filter labels, placeholders |

**Multilingual readiness: 0 / 100**

---

## 20. Persona Need Audits (by persona)

Per-route persona matrix is in **Section 6**. Below: constitution-defined needs vs current platform state per persona.

## 21. Investor Audit

### Needs (constitution) vs current state

| Investor need | Status | Gap |
|---------------|--------|-----|
| Investment opportunities | ❌ | Not implemented |
| Open tenders | ❌ | Placeholder block only |
| Economic sectors | ❌ | Not implemented |
| Exports / imports | ❌ | Not implemented |
| Major industries | ⚠️ | Company `industries` tags — unverified static |
| Infrastructure | ❌ | Not implemented |
| Natural resources | ❌ | Not implemented |
| Regional opportunities | ❌ | Not implemented |
| Investment risks | ❌ | **Fake** `riskScore` on companies/universities |
| Evidence-based comparison | ❌ | Search ranks by fake `aiScore` |

### Violations harmful to investors

- Companies page presents `investmentScore` and market cap as factual
- Universities page presents `investmentScore` on institutions
- Search filters by min investment score treat fabrication as real
- No tender or budget transparency modules

**Investor persona score: 5 / 100**

---

## 22. Citizen Audit

### Needs vs current state

| Citizen need | Status | Gap |
|--------------|--------|-----|
| Reforms | ❌ | Not implemented |
| Local changes | ❌ | Not implemented |
| Economy (understandable) | ❌ | Countries withhold scores (correct) but no citizen-friendly economic evidence |
| Social changes | ❌ | Not implemented |
| Tenders | ❌ | Tender module missing |
| Infrastructure | ❌ | Not implemented |
| Disasters | ❌ | Not implemented |
| Public services | ❌ | Not implemented |
| Understandable language | ⚠️ | Countries personas exist but technical; no plain-language layer |
| Public sentiment (optional feedback) | ❌ | No Satisfied/Unsatisfied/No Opinion mechanism |

### Positive

- Countries module explains how to read evidence status honestly
- Political neutrality notice present

**Citizen persona score: 8 / 100**

---

## 23. Government Audit

### Needs vs current state

| Government need | Status | Gap |
|-----------------|--------|-----|
| Evidence dashboard | ❌ | Runtime dashboard is platform ops, not governance |
| Regional dissatisfaction | ❌ | Not implemented |
| Infrastructure problems | ❌ | Not implemented |
| Water / energy / healthcare / education / employment | ❌ | Not implemented |
| Public service quality | ❌ | Not implemented |
| Court workload | ❌ | Not implemented |
| Early warning indicators | ❌ | Not implemented |
| Trend analysis | ❌ | Fake trends on company metrics |
| NO political recommendations | ⚠️ | Company aiSummary contains geopolitical recommendations |

### Positive

- Countries intelligence blocks reference governance/procurement with honest withholding
- State Reputation Law not violated (no country reputation scoring)

**Government persona score: 10 / 100**

---

## 24. Student Audit

### Needs vs current state

| Student need | Status | Gap |
|--------------|--------|-----|
| Learn from real situations | ❌ | No case studies |
| History / timeline | ⚠️ | Entity timelines contain fabricated events (companies/universities) |
| Case studies | ❌ | Not implemented |
| Disaster response | ❌ | Not implemented |
| Economic reforms | ❌ | Not implemented |
| Infrastructure projects | ❌ | Not implemented |
| Educational explanations | ❌ | Not implemented |

### Risk

- Fake university rankings and company AI narratives could mislead students treating platform as educational source

**Student persona score: 5 / 100**

---

## 25. Researcher Audit

### Needs vs current state

| Researcher need | Status | Gap |
|-----------------|--------|-----|
| Evidence | ⚠️ | Engine collects evidence; UI shows fake data |
| Correlation | ❌ | Not implemented |
| Trend | ❌ | Fake trend strings on metrics |
| Scenario | ❌ | Not implemented |
| Datasets | ❌ | Knowledge module fakes dataset presence |
| Methodology | ⚠️ | Intelligence engine has methodology; not exposed in UI |
| Cross-domain analysis | ⚠️ | Graph provides structure; data integrity broken |

### Positive

- `lib/intelligence/testing/` harness with 34 reproducible scenarios
- Confidence assessor returns 0 without evidence
- Trace/timeline infrastructure exists

**Researcher persona score: 12 / 100**

---

## 26. Academic Audit

### Needs vs current state

| Academic need | Status | Gap |
|---------------|--------|-----|
| Complete methodology | ⚠️ | Partial in intelligence engine docs; not in product |
| Indicators | ❌ | Fake scores presented as indicators |
| Evidence quality | ⚠️ | Quality subsystem exists; UI ignores it |
| Historical comparison | ❌ | Not implemented |
| Scientific analysis | ❌ | Not implemented |
| Research collaboration | ❌ | Not implemented |

### Risk

- University `aiSummary` ranking claims are **not citable** and violate Respect Law if treated as authoritative

**Academic persona score: 8 / 100**

---

## 27. Estimated Implementation Phases

### Phase 0 — Audit complete (current)

**Duration:** Complete  
**Deliverable:** This document  
**Outcome:** Baseline scores established; violation inventory complete

### Phase 1 — P0 fake data removal

**Duration:** 3–4 weeks  
**Scope:** Section 8 P0 items  
**Target scores:** Platform 49 → 65; Constitution 52 → 72; Overall 47 → 58  
**Exit criteria:** Zero fabricated scores/narratives on user-facing routes

### Phase 2 — P1 entity modules

**Duration:** 3–4 weeks  
**Scope:** Section 8 P1 items (Countries extend, Companies, Universities remediation)  
**Target scores:** Platform 65 → 78; Constitution 72 → 82; Overall 58 → 68  
**Exit criteria:** All entity routes match countries Golden Rule pattern

### Phase 3 — P2 discovery & operations

**Duration:** 4–6 weeks  
**Scope:** Section 8 P2 items (Search, Knowledge, Agents, Graph, Reasoning, Core)  
**Target scores:** Platform 78 → 85; Constitution 82 → 88; Overall 68 → 74  
**Exit criteria:** No score-based discovery; simulations explicitly labeled

### Phase 4 — P3 persona modules

**Duration:** 8–12 weeks  
**Scope:** Section 8 P3 items (Investor, Government, Citizen, Student, Researcher, Academic)  
**Target scores:** Persona coverage materially improved; Constitution 88 → 92  
**Exit criteria:** Tender Law modules as first-class routes; persona framework on all entities

### Phase 5 — P4 mobile & cross-platform

**Duration:** 12–20 weeks  
**Scope:** Section 8 P4 items  
**Target scores:** Mobile 12 → 45; Brand 36 → 60; Overall 74 → 82  
**Exit criteria:** `@cbai/schema` extracted; responsive shell; API contract; PDF prototype

### Phase 6 — Evidence connection & global platform

**Duration:** Ongoing (2026–2031)  
**Scope:** External evidence sources, native clients, full i18n, governed reasoning  
**Target scores:** Engine 95; Platform 88; Mobile 70; Constitution 92; Overall 85+  
**Exit criteria:** Trusted Evidence Intelligence Platform across all personas and platforms

---

## 28. Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R-01 | Users already treat fake scores as real | High | Critical | Immediate P0 remediation; add site-wide evidence disclosure banner during transition |
| R-02 | Remediation makes platform feel "empty" | Medium | High | Persona guidance + rich constitution blocks (countries pattern) maintain value without fabrication |
| R-03 | Team reverts to demo data for demos/sales | Medium | Critical | CI lint rule banning score fields in domain modules without evidence adapter |
| R-04 | Constitution v1 "mock allowed" conflicts with new Golden Rule | Medium | Medium | Supersede v1 §4.5/§12.1 for user-facing intelligence; keep mock for visual/layout only |
| R-05 | Cross-platform delay blocks non-English markets | High | High | Phase 4 i18n runs parallel to Phase 3 modules |
| R-06 | Static export limits API development | Medium | Medium | Plan hybrid deployment before Phase 5 |
| R-07 | Graph/reasoning depend on remediated entity data | High | Medium | Phase 1 must complete before Phase 5 graph/reasoning upgrades |
| R-08 | Tender modules built without real data sources | Medium | High | Ship with "Not Connected" — never repeat companies mistake |
| R-09 | Mobile apps built on current fake UI | Low | Critical | Block native development until Phase 1 complete |
| R-10 | Brand foundation (docs/brand/) not reflected in UI | Medium | Low | Apply brand tokens during Phase 2 repositioning |

---

## 29. Recommendations

### Immediate (this week)

1. **Freeze fake data expansion** — no new scores, narratives, or confidence values in any module.
2. **Begin companies/universities remediation** using `countries.intelligence.ts` as the sole approved pattern.
3. **Add constitution compliance checklist** to PR template referencing this document.
4. **Update `app/layout.tsx` metadata** in next code change to Evidence Intelligence Platform positioning.

### Short-term (Phase 1–2)

5. **Quarantine chat surfaces** — move `/core` and `/ai-control` under "Developer Preview" section with simulation labels, or remove from primary navigation until governed.
6. **Implement evidence gate component** — shared `EvidenceStatusBadge` used everywhere scores might appear.
7. **Extend persona framework** — extract `buildPersonaSections()` into shared `lib/personas/` consumed by all entity intelligence modules.
8. **Reorder navigation** — Evidence & Entities first; Operations/AI tooling last.

### Medium-term (Phase 3–4)

9. **Create transparency module family** — `lib/transparency/` with submodules for each Tender Law requirement.
10. **Introduce i18n with Uzbek as pilot second language** — aligns with platform origin and constitution target list.
11. **Extract platform-agnostic schemas** before any mobile work begins.
12. **Build PDF report template** using brand foundation doc (`docs/brand/cbai-brand-foundation.md`).

### Long-term (Phase 5–6)

13. **Replace simulated reasoning** with governed inference pipeline recording full trace.
14. **Connect first external evidence sources** — procurement portals, fiscal transparency indices, official statistics APIs.
15. **Launch iOS/Android MVPs** consuming shared API — never duplicate business logic in native code.
16. **Publish methodology documentation** for Academic and Researcher personas as first-class `/methodology` route.

### Governance

17. **Supersede CBAI Constitution v1 §12.1** (static mock data permitted) for all user-facing intelligence surfaces — mock permitted for layout/visual config only.
18. **Establish constitution review gate** — no route ships without Golden Rule persona checklist sign-off.
19. **Track dimension scores quarterly** using methodology in Sections 2–9 of this document.

---

## Appendix A — Component Violation Index

| Component | Severity | Issue |
|-----------|----------|-------|
| `EntityAISummary.tsx` | Critical | Fake AI analysis display; default 94.2% confidence |
| `EntityScoreCard.tsx` | High | Renders any 0–100 score without evidence caveat |
| `EntityLayout.tsx` | High | Always renders AI summary + optional score cards |
| `CompanyList.tsx` | High | AI readiness score pills |
| `UniversityList.tsx` | High | AI readiness score pills |
| `SearchInsightPanel.tsx` | Critical | Hardcoded 91.3% confidence; "AI-powered" header |
| `AgentStats.tsx` | High | Fake weekly deltas and success rate targets |
| `AgentCard.tsx` | High | Displays fabricated successRate |
| `AgentActivity.tsx` | High | Fake activity feed |
| `KnowledgeStats.tsx` | High | Fake storage and accuracy metrics |
| `DocumentCard.tsx` | High | Per-collection confidence % |
| `SourceHealth.tsx` | High | Fake infrastructure health |
| `MissionControl.tsx` | Medium | Fake operational status |
| `MemoryPanel.tsx` | Medium | Fake conversations and pinned knowledge |
| `CommandCenter.tsx` | Medium | Unwired chat-style input |
| `CommandBox.tsx` | Low | Honest "awaiting backend" but chat UX |
| `Topbar.tsx` | Medium | Decorative search; fake user |
| `Sidebar.tsx` | Low | Fixed width; gradient logo |
| `CountryIntelligencePanel.tsx` | ✅ Compliant | Reference implementation |
| `PlatformRuntimeStatus.tsx` | ✅ Compliant | Live runtime data |
| `RuntimeMetricsGrid.tsx` | ✅ Compliant | Live observability |

## Appendix B — Compliant vs Non-Compliant Route Summary

```
✅ COMPLIANT (5)          ⚠️ PARTIAL (2)           ❌ NON-COMPLIANT (8)
/workflows                /graph                   /core
/analytics                /reasoning               /companies
/settings                                          /universities
/countries                                         /search
/dashboard (ops scope)                             /ai-control
/ (nav only)                                       /agents
                                                   /knowledge
```

## Appendix C — Scoring Methodology (v1.1)

Six **independent** dimensions. Never blend engine and UI into a single pillar score.

| Score | Formula | Scope |
|-------|---------|-------|
| **Intelligence Engine** | Mean of 18 subsystem scores (Section 2) | `lib/intelligence/` only |
| **Platform Experience** | Mean of 15 surface scores (Section 3) | UI routes and shell |
| **Brand Compliance** | Mean of 5 criteria (Section 7) | Logo, identity, design system, nav, consistency |
| **Mobile Readiness** | Mean of 6 platform scores (Section 4) | Web, iOS, Android, Desktop, PDF, API |
| **Constitution Compliance** | Mean of 15 independent route scores (Section 5) | Each page scored 0–100 separately |
| **Overall Platform Evolution** | `(Engine + Platform + Brand + Mobile + Constitution) ÷ 5` | Section 9 |

**Rules:**

1. Engine score **must not** decrease because UI routes violate the Constitution.
2. Constitution score **must not** use weighted pillars that conflate unrelated gaps (e.g. i18n does not reduce engine score).
3. One failing page affects only that page's constitution score and the overall mean — not the engine dimension.
4. Persona evaluation uses per-route matrix (Section 6) plus persona-need audits (Sections 20–26).

Re-audit after each implementation phase. **Launch target:** Overall Evolution ≥ 85 (Section 9 table).

---

*This document is documentation only. No application code was modified. v1.1 corrects scoring methodology — Engine, Platform, Brand, Mobile, and Constitution are independent dimensions.*
