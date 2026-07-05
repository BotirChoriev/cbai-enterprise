# CBAI Constitution v1

**Document ID:** CBAI-Constitution-v1  
**Platform:** CBAI Enterprise — Global AI Operating System  
**Status:** Ratified architecture baseline  
**Effective:** July 2026  
**Horizon:** 2026–2031  

This document is the authoritative reference for how CBAI Enterprise is designed, built, extended, and operated. All engineering decisions, build scopes, and architectural changes must align with this constitution unless explicitly superseded by a numbered revision (v2, v3, …).

---

## 1. Mission

CBAI Enterprise exists to give organizations a **single operating system for global intelligence** — one place to observe countries, institutions, companies, capital, people, and policy; to understand how they relate; to reason over evidence; and to act through AI agents under human governance.

The platform is not a dashboard. It is not a chatbot wrapper. It is an **intelligence infrastructure** that normalizes heterogeneous world data into a common entity model, connects it through a knowledge graph, reasons over it transparently, and exposes it through an enterprise-grade interface that executives, analysts, and operators can trust.

Every module must earn its place by contributing to one question: *What does the organization need to know, and what should it do next?*

---

## 2. Vision

By 2031, CBAI Enterprise will be the **default intelligence layer** for organizations operating across borders — governments evaluating investment climates, enterprises mapping competitive landscapes, universities tracking research partnerships, and investors scoring opportunity and risk.

Users will open CBAI the way they open an operating system: to see system state, query any entity, traverse relationships, run structured reasoning, delegate tasks to governed agents, and audit every conclusion back to source evidence.

The interface will feel inevitable — dark, precise, fast, and calm under complexity. The architecture beneath it will be modular enough to absorb new entity types, new data sources, and new AI capabilities without rewriting what already works.

---

## 3. Long-term Goals

### 3.1 Intelligence completeness

Expand from the current core entity set (countries, companies, universities) to full coverage of the declared entity taxonomy: **governments, investors, and people**, each with domain adapters, intelligence modules, and graph integration.

### 3.2 Relationship depth

Evolve the Knowledge Graph from a visualization of mock relationships to a **live relationship engine** backed by ingestion pipelines, provenance metadata, and temporal edges (partnerships that start, change, and end).

### 3.3 Reasoning with accountability

Replace simulated reasoning with a **governed inference pipeline** that records every stage — retrieval, evidence selection, model invocation, confidence scoring, and human override — in an auditable trace.

### 3.4 Agent orchestration at scale

Move from agent catalog UI to **production agent runtime**: defined capabilities, tool access policies, workflow integration, cost controls, and observability per agent and per tenant.

### 3.5 Enterprise readiness

Achieve authentication, authorization, multi-tenancy, data residency options, SOC 2–aligned controls, and deployment flexibility (static edge, hybrid, private cloud) without sacrificing the simplicity of the current frontend architecture.

### 3.6 Operational memory

Build persistent organizational memory — pinned knowledge, conversation history, saved commands, and entity watchlists — that compounds in value over years of use.

---

## 4. Core Principles

### 4.1 Entity-first

All intelligence flows through the **Universal Entity Framework**. Domain modules own raw data; adapters normalize to `Entity`; UI renders through shared entity components. No module renders bespoke detail layouts when `EntityLayout` suffices.

### 4.2 Single source of truth

Entity data lives in domain modules (`lib/{module}.ts`). Adapters transform; they do not duplicate. The Knowledge Graph, Global Search, and Reasoning Engine **derive** from adapters — never maintain parallel entity stores.

### 4.3 Graph as relationship authority

Relationships between entities are modeled explicitly with typed edges. Visualization, search boosting, and reasoning all consume the same graph builder — not ad hoc string matching scattered across modules.

### 4.4 Explainable by default

Every AI-facing surface must show **how** a conclusion was reached: pipeline stages, evidence cards, confidence factors, source entities, and graph paths. Black-box answers are unacceptable in v1 and beyond.

### 4.5 Frontend discipline

Ship working UI first with mock data where backends do not exist. Mock data must use the same types and adapters as production data so swapping the source is a wiring change, not a rewrite.

### 4.6 Minimal dependencies

Prefer platform primitives (React, TypeScript, Tailwind) over external UI and graph libraries unless a dependency clearly reduces long-term maintenance. Current stack: **Next.js App Router, React 19, TypeScript strict, Tailwind CSS v4**.

### 4.7 Stability over novelty

Stabilization builds (BUILD-015, BUILD-016) take precedence over feature velocity. Dead code is removed. Debug labels do not ship. Lint and build must pass before merge.

### 4.8 Constitution over convention

When code and this document disagree, either fix the code or amend the constitution with a version bump. Silent drift is not allowed.

---

## 5. Product Philosophy

CBAI Enterprise is designed for **operators who think in systems**, not consumers who think in feeds.

**Density with clarity.** Show many signals per screen — scores, tags, timelines, relationships — but never without hierarchy. Primary action and primary entity are always obvious.

**Progressive disclosure.** List → detail → relationships → graph → reasoning. Users descend into depth; they are not dumped into it.

**Simulation before integration.** Modules demonstrate full UX with mock engines (search scoring, graph layout, reasoning pipeline) so product and architecture validate together before backend cost is incurred.

**Governance is a feature.** AI Control, agent routing, system context, and settings are first-class routes — not afterthoughts bolted onto a chat window.

**No fake interactivity.** Decorative controls (unwired search bars, placeholder buttons) are technical debt marked for wiring or removal. They must not accumulate silently.

**Enterprise tone.** Dark zinc base, sky/violet/cyan accents, monospace for data, uppercase tracking for labels. The product should feel like mission control, not a marketing site.

---

## 6. Architecture Overview

CBAI Enterprise follows a **layered modular monolith** on the frontend, designed for eventual backend extraction without premature microservices.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                          │
│  app/(dashboard)/*  ·  components/{module}/*  ·  components/entity/*
├─────────────────────────────────────────────────────────────────┤
│                     Intelligence Layer                          │
│  Global Search  ·  Knowledge Graph  ·  Reasoning Engine         │
├─────────────────────────────────────────────────────────────────┤
│                     Normalization Layer                         │
│  lib/{module}.adapter.ts  →  Entity                             │
├─────────────────────────────────────────────────────────────────┤
│                     Domain Layer                                │
│  lib/{module}.ts  (countries, companies, universities, …)       │
├─────────────────────────────────────────────────────────────────┤
│                     Platform Layer                              │
│  lib/core.ts  ·  lib/agents.ts  ·  lib/knowledge.ts  ·  lib/navigation.ts
└─────────────────────────────────────────────────────────────────┘
                              │
                    (future) API / ingestion
```

### 6.1 Route map (current)

| Route | Module role |
|-------|-------------|
| `/dashboard` | System overview, activity, token usage |
| `/core` | CBAI Core — mission control, command center, thinking pipeline |
| `/countries` | Country intelligence module |
| `/companies` | Company intelligence module |
| `/universities` | University intelligence module |
| `/search` | Global Search — unified entity index |
| `/graph` | Knowledge Graph — relationship engine |
| `/reasoning` | Reasoning Engine — explainable inference demo |
| `/ai-control` | AI command surface, agent router, system context |
| `/agents` | Agent catalog and activity |
| `/knowledge` | Document collections and source health |
| `/workflows` | Workflow automation (placeholder) |
| `/analytics` | Usage analytics (placeholder) |
| `/settings` | Platform configuration (placeholder) |

### 6.2 Module pattern (mandatory for intelligence modules)

```
lib/{module}.ts              Domain types + raw data
lib/{module}.adapter.ts      to{Module}Entity() + relationship helpers
components/{module}/         Module-specific filters, lists, relationship panels
app/(dashboard)/{module}/    Page composition via EntityLayout + module components
```

Intelligence modules **must not** implement custom overview/metrics/AI summary components when entity framework components exist.

---

## 7. Intelligence Model

### 7.1 Universal Entity

Every intelligence object normalizes to `Entity`:

| Field group | Purpose |
|-------------|---------|
| Identity | `id`, `type`, `name`, `category`, `subtitle` |
| Narrative | `overview`, `aiSummary` |
| Signals | `scores` (aiScore, riskScore, investmentScore) |
| Structure | `tags`, `timeline`, `metrics`, `metadata` |
| Presentation | `icon`, `logo`, `status` |

### 7.2 Entity types

| Type | Status | Module |
|------|--------|--------|
| `country` | Production (mock data) | `/countries` |
| `company` | Production (mock data) | `/companies` |
| `university` | Production (mock data) | `/universities` |
| `government` | Type declared, module pending | — |
| `investor` | Type declared, module pending | — |
| `person` | Type declared, module pending | — |

New entity types require: domain file, adapter, route, sidebar entry, search integration, graph node type, and graph edge rules — in that order.

### 7.3 Scoring model

All entities expose three normalized scores (0–100):

- **AI Score** — readiness for AI adoption, innovation, and technology leverage  
- **Risk Score** — geopolitical, operational, and regulatory exposure (lower is better; inverted in UI)  
- **Investment Score** — attractiveness for capital deployment  

Scores are displayed via `EntityScoreCard` with shared color thresholds from `entity.helpers.ts`. Module-specific metrics supplement but do not replace these three.

### 7.4 Global Search

`lib/global-search.ts` maintains the unified index via `getAllEntities()`. Search tokenizes queries, scores against name/tags/category/overview/aiSummary, applies filters, and returns ranked `SearchResult` objects with match reasons.

Search is the **entry point** for Reasoning Engine stage 2 and must remain the canonical entity discovery mechanism.

---

## 8. AI Agent Ecosystem

### 8.1 Purpose

Agents are specialized workers that execute tasks on behalf of the organization — research, analysis, drafting, monitoring, and workflow steps — within policy boundaries defined in AI Control.

### 8.2 Current architecture

| Component | Role |
|-----------|------|
| `lib/agents.ts` | Agent definitions, stats, activity mock |
| `/agents` | Agent catalog UI |
| `/ai-control` | Command box, agent router, system context |
| CBAI Core pipeline | Input → Planner → Research → Knowledge → Reasoning → Output → Action |

### 8.3 Agent design rules (future-enforced)

1. Every agent declares **capabilities**, **tools**, and **data scope** explicitly.  
2. Agents route through AI Control — not direct model calls from arbitrary pages.  
3. Agent actions produce **entity-tagged outputs** where applicable (e.g., a research agent attaches findings to a country entity).  
4. Agent cost and token usage roll up to `/dashboard` and `/analytics`.  
5. Human approval gates exist for actions that mutate external systems.

### 8.4 Agent–entity binding

Agents operate on entities, not free text. Commands like "Analyze Uzbekistan" resolve to `country:uzbekistan` before execution. The Global Search index is the resolution layer.

---

## 9. Knowledge Graph Architecture

### 9.1 Purpose

The Knowledge Graph is the **central relationship engine**. It answers: *How are entities connected, and through what kind of relationship?*

### 9.2 Current implementation

| Layer | File | Responsibility |
|-------|------|----------------|
| Types | `lib/graph/graph.types.ts` | GraphNode, GraphEdge, KnowledgeGraph |
| Config | `lib/graph/graph.mock.ts` | Edge colors, layout radii, node accents |
| Builder | `lib/graph/graph.builder.ts` | Nodes from adapters, edges from domain relationships |

### 9.3 Node model

- Node ID format: `{type}:{entityId}` (e.g., `company:nvidia`)  
- Nodes carry full `Entity` payload for inspector rendering  
- Layout: deterministic ring placement (countries inner, companies middle, universities outer)

### 9.4 Edge types (canonical)

| Edge type | Semantics |
|-----------|-----------|
| `located-in` | Company or university domiciled in country |
| `partner` | Company ↔ company partnership |
| `competitor` | Company ↔ company competition |
| `research-partner` | University ↔ company, country ↔ university |
| `industry` | Company industry aligned with country top industries |
| `investment` | Country → company investment relationship |

New edge types require: type definition in `graph.types.ts`, visual config in `graph.mock.ts`, builder rules in `graph.builder.ts`, legend entry in `GraphLegend.tsx`.

### 9.5 Extension protocol

Adding an entity type to the graph:

1. Extend `GraphNodeType` in `graph.types.ts`  
2. Add node ring or layout strategy in `graph.builder.ts`  
3. Define edge derivation from adapter relationship fields  
4. Extend `GraphFilters` type options  
5. No changes to `GraphCanvas` orchestration unless interaction model changes

### 9.6 Future state

Graph data will move from build-time derivation to **served graph snapshots** with timestamps, confidence weights, and source provenance on each edge. The builder interface (`KnowledgeGraph`) remains stable; only the data source changes.

---

## 10. Reasoning Engine Architecture

### 10.1 Purpose

The Reasoning Engine demonstrates and will eventually execute **structured, auditable inference** over the intelligence stack — not unstructured chat.

### 10.2 Pipeline (canonical order)

```
Question → Search → Knowledge Graph → Evidence → Reasoning → Decision → Confidence → Final Answer
```

Each stage produces typed output stored on `ReasoningResult`. The UI reveals stages progressively; production will persist stage traces.

### 10.3 Current implementation

| Layer | File | Responsibility |
|-------|------|----------------|
| Types | `lib/reasoning/reasoning.types.ts` | Stages, evidence, decision tree, confidence |
| Config | `lib/reasoning/reasoning.mock.ts` | Stage defs, delays, answer templates |
| Engine | `lib/reasoning/reasoning.engine.ts` | Orchestrates search + graph + mock inference |

### 10.4 Evidence model

Evidence items bind to `Entity`, declare source (`search`, `knowledge-graph`, `entity-profile`), relevance score, and excerpt. Reasoning without evidence is invalid — the engine must always populate `evidence[]` when search returns results.

### 10.4 Confidence model

Confidence is a weighted composite:

- Evidence volume  
- Source relevance  
- Graph connectivity  
- Entity signal quality (AI scores of top matches)

Confidence reflects **evidence quality**, not predictive certainty. This distinction must remain visible in UI caveats.

### 10.5 Future state

Replace template-based answer synthesis with model-generated text constrained by evidence objects. The pipeline stages and types remain; only the Reasoning and Final Answer stages gain model backends. Human reviewers can flag stage outputs for re-run.

---

## 11. Memory Architecture

### 11.1 Definition

Memory in CBAI is **persistent context** that improves operations over time — not model weights, but organizational state the platform retains.

### 11.2 Memory categories

| Category | Current surface | Future backing |
|----------|-----------------|----------------|
| **Pinned knowledge** | CBAI Core `MemoryPanel` | User/tenant pinned documents and entities |
| **Conversation history** | CBAI Core recent conversations | Stored threads with entity links |
| **Saved commands** | CBAI Core saved commands | Command templates with usage counts |
| **Entity watchlists** | Not yet implemented | Monitored entities with alert rules |
| **Reasoning traces** | Reasoning page (session-only) | Persisted audit log per query |

### 11.3 Memory principles

1. Memory entries must link to **entities or documents**, not float as orphan text.  
2. Memory is **tenant-scoped** in production — no cross-organization leakage.  
3. Memory writes go through AI Control or explicit user action — agents cannot silently write memory.  
4. Memory reads are injected as context in the CBAI Core pipeline Knowledge stage.  
5. Users can inspect, edit, and delete memory entries from settings.

### 11.4 Relationship to Knowledge module

`/knowledge` owns **document collections** (indexed files, source health). CBAI Core memory owns **operational context** (what the user and agents are working on). The Knowledge module feeds the graph and search; memory feeds the command pipeline.

---

## 12. Data Pipeline

### 12.1 Current state (BUILD-001–017)

All data is **static mock** bundled in `lib/*.ts` files. No ingestion, ETL, or API layer exists. Adapters normalize mock domain data at build/read time.

### 12.2 Target pipeline (2027+)

```
External sources → Ingestion → Normalization → Domain store → Adapter → Entity
                                    ↓
                              Graph edge extraction
                                    ↓
                              Search index update
                                    ↓
                              Reasoning evidence cache
```

### 12.3 Source categories (planned)

| Source | Entity types fed |
|--------|------------------|
| Government statistics | Countries |
| Corporate filings | Companies |
| University rankings & research output | Universities |
| Investment databases | Investors, companies |
| News and regulatory feeds | All types (events → timeline) |
| User-uploaded documents | Knowledge module |

### 12.4 Pipeline rules

1. **Adapters are the only normalization boundary.** Ingestion writes domain shape; adapters produce Entity.  
2. Every ingested record carries **provenance** (source, retrievedAt, confidence).  
3. Graph edges are **derived artifacts**, rebuilt or incrementally updated on ingestion — not manually edited in UI.  
4. Search index updates are **eventually consistent** with domain store; stale index duration must be surfaced in UI.  
5. Mock and live data modes share types — switch via environment flag, not forked codepaths.

---

## 13. UI Philosophy

### 13.1 Layout system

- **Dashboard shell:** Sidebar (navigation) + Topbar (global actions) + scrollable main (`app/(dashboard)/layout.tsx`)  
- **Page width:** `max-w-7xl` centered content  
- **Intelligence pages:** Custom hero header (gradient border card) + multi-column grid  
- **Platform pages:** `PageHeader` component + card-based content  

Both header patterns are valid; unification is optional and must not break existing modules without a dedicated build.

### 13.2 Component hierarchy

```
EntityLayout          Master detail shell for all intelligence modules
  EntityHeader        Identity, status, scores
  EntityTags          Tag pills
  EntityOverview      Metadata grid
  EntityMetrics       Metric cards
  {module children}   Relationships, filters, lists
  EntityTimeline      Event history
  EntityAISummary     AI-generated summary block

Card / StatCard       Platform module primitives (dashboard, agents, knowledge)
```

### 13.3 Visual tokens

| Token | Value | Usage |
|-------|-------|-------|
| Background | `zinc-950` | App base |
| Border | `zinc-800` | Cards, dividers |
| Primary accent | `sky-400/500` | Active nav, links, data highlights |
| Secondary accent | `violet-400/500` | Reasoning, graph |
| Tertiary accent | `cyan-400/500` | Countries, geo |
| Label style | `text-[10px] uppercase tracking-widest` | Section labels |
| Data font | `font-mono` | Scores, counts, codes |

### 13.4 Interaction rules

- Intelligence modules with selection state are `"use client"` pages.  
- Platform catalog pages prefer React Server Components where no client state is needed.  
- Graph and reasoning use **pure React + SVG + Tailwind** — no external graph libraries.  
- Loading and empty states are required for every list and search surface.  
- Links between modules use route paths from `getEntityHref()` — never hardcoded strings scattered in components.

### 13.5 Accessibility baseline

Focus rings on interactive elements. `aria-label` on icon-only buttons. Semantic headings (one h1 per page). Full WCAG compliance is a 2027 goal; new components must not regress keyboard navigation.

---

## 14. Cloud Architecture

### 14.1 Current deployment model

CBAI Enterprise ships as a **static export** from Next.js:

```typescript
// next.config.ts
output: "export"
images: { unoptimized: true }
```

Build output directory: `out/`  
Hosting target: **Cloudflare Pages** (static asset serving)

### 14.2 Cloudflare Pages configuration

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Output directory | `out` |
| Node.js version | 20 LTS |
| Framework preset | None (static) |

Root route (`/`) uses meta-refresh to `/dashboard`. CDN-level `_redirects` are **intentionally omitted** until redirect rules are validated per-environment — blanket `/* /404.html 404` rules broke routing in prior deployment.

### 14.3 Static export constraints (permanent rules)

The following are **incompatible** with static export and require architecture review before introduction:

- API routes (`app/api/*`)  
- Server Actions that mutate server state  
- Middleware authentication gates  
- Dynamic SSR-only rendering  
- `next/image` optimization without `unoptimized: true`

When backend capabilities are required, prefer: **Cloudflare Workers** (edge API), **separate API service**, or **hybrid Next.js deployment** on a Node-compatible platform — not silent addition of server features to the static export path.

### 14.4 Future hybrid architecture

```
Cloudflare Pages (static UI)
        ↓
Cloudflare Workers / external API (auth, ingestion, reasoning, agents)
        ↓
Data stores (D1, R2, vector DB, graph DB — TBD by load profile)
```

The frontend constitution remains: **UI is a client of typed APIs**, never the owner of business logic long-term.

### 14.5 Environments

| Environment | Purpose |
|-------------|---------|
| Local | `npm run dev` — full mock data |
| Preview | Cloudflare Pages PR previews — static mock |
| Production | Cloudflare Pages — static mock until API integration build |

Environment-specific behavior uses build-time flags only (`NEXT_PUBLIC_*`), never runtime secrets in static bundles.

---

## 15. Security Principles

### 15.1 Current state

BUILD-017 ships **without authentication**. All data is public mock content. This is acceptable for demo deployment only.

### 15.2 Security roadmap (mandatory before production data)

1. **Authentication** — SSO/OIDC for enterprise tenants  
2. **Authorization** — role-based access to modules, entities, and agents  
3. **Tenant isolation** — data, memory, and graph scoped per organization  
4. **Secrets management** — API keys in Cloudflare secrets / vault — never in repo or static JS  
5. **Audit logging** — reasoning traces, agent actions, settings changes  
6. **Content Security Policy** — strict CSP headers when `_headers` is introduced  
7. **Dependency hygiene** — minimal packages, regular audit, pinned lockfile  

### 15.3 Development security rules (effective now)

- Never commit `.env*` files (gitignored)  
- Never embed API keys in `lib/*.ts` mock files  
- Never disable ESLint or TypeScript strict to pass CI  
- Never use `dangerouslySetInnerHTML` except framework-required cases  
- Sanitize user query input before future server submission  
- Static export bundles are public — assume all client code is visible  

### 15.4 AI-specific security

- Agents operate with **least-privilege tool access**  
- Reasoning evidence must be **user-visible** before actions execute  
- Model prompts include **tenant boundary instructions**  
- User-provided documents are **scanned and sandboxed** before indexing  
- Output filtering for PII exfiltration in production agent responses  

---

## 16. Coding Standards

### 16.1 Language and tooling

| Tool | Standard |
|------|----------|
| TypeScript | `strict: true` — no `any`, no `@ts-ignore` |
| React | 19 — functional components, hooks |
| Next.js | 16 App Router — read `node_modules/next/dist/docs/` before API usage |
| Styling | Tailwind CSS v4 only — no CSS modules, no styled-components |
| Lint | ESLint with `eslint-config-next` — zero errors on merge |
| Format | Prettier (when added) — not yet enforced |

### 16.2 File and folder conventions

```
lib/{module}.ts                 Domain data and types
lib/{module}.adapter.ts         Entity normalization
lib/{subsystem}/                Grouped engines (graph, reasoning, entity)
components/{module}/            Module UI
components/entity/              Shared entity UI (do not duplicate)
components/layout/              Shell UI
components/ui/                  Generic primitives
app/(dashboard)/{route}/        Page entry points
docs/                           Architecture and build reports
```

### 16.3 Naming

- Components: `PascalCase.tsx`  
- Lib functions: `camelCase` — verbs for actions (`buildKnowledgeGraph`, `executeReasoning`)  
- Types: `PascalCase` — no `I` prefix  
- Constants: `SCREAMING_SNAKE_CASE` for true constants, `camelCase` for config objects  
- Routes: lowercase kebab-case paths  

### 16.4 Import rules

- Use `@/` path alias exclusively — no relative imports crossing more than one level  
- Adapters import from domain files — never from components  
- Components import from lib — never from other app pages  
- Graph and reasoning import entity data through adapters and global-search — never duplicate entity arrays  

### 16.5 Component rules

- One default export per component file  
- Props typed with explicit `type` or `interface` — no inline `{ foo: string }` in function signature for public components  
- `"use client"` only when hooks, events, or browser APIs are required  
- No external UI libraries (MUI, Chakra, shadcn) unless constitution amended  

### 16.6 Testing (future mandatory)

When introduced: unit tests for adapters and engines, integration tests for search/graph/reasoning pipelines, smoke tests for static route generation. Tests live alongside modules as `{name}.test.ts`.

---

## 17. Repository Rules

### 17.1 Branching

- `main` — always deployable, passes lint and build  
- Feature branches: `{build-id}-{short-description}` or `{username}/{feature}`  
- No force-push to `main`  

### 17.2 Pull request requirements

1. Lint pass  
2. Build pass (static export, 18 routes)  
3. No constitution violations (entity framework bypass, duplicated entity data, new routes without nav entry)  
4. BUILD number referenced in PR description when applicable  

### 17.3 Prohibited in merge

- Commented-out code blocks left as dead weight  
- BUILD debug labels (`BUILD-013 ·`, etc.)  
- Unused files after module removal  
- Secrets or credentials  
- `console.log` debugging in production paths  
- Breaking static export compatibility without architecture review  

### 17.4 Documentation requirements

| Event | Document |
|-------|----------|
| Production readiness review | `docs/production-readiness-audit.md` or successor |
| Stabilization pass | `docs/build-{NNN}-report.md` |
| Architecture change | Amendment to this constitution (version bump) |
| New entity type | Section 7 amendment + module README (when introduced) |

### 17.5 Dependency policy

New dependencies require justification: what native alternative was rejected and why. Prefer devDependencies for tooling only. Lockfile (`package-lock.json`) is committed and updated on every dependency change.

---

## 18. Build Numbering Rules

### 18.1 Format

```
BUILD-{NNN}
```

Three-digit zero-padded sequence. BUILD-001 through BUILD-017 established as of July 2026.

### 18.2 Build scope

Each build has **one primary mission** documented at the start of the build conversation or in the build report:

| Build range | Theme (historical) |
|-------------|-------------------|
| BUILD-001–007 | Foundation, layout, core platform modules |
| BUILD-008 | Universal Entity Framework |
| BUILD-009–011 | Companies, Universities, Countries migration |
| BUILD-012 | Global Search |
| BUILD-013 | Knowledge Graph |
| BUILD-014 | Reasoning Engine |
| BUILD-015 | Production readiness audit |
| BUILD-016 | Platform stabilization / dead code removal |
| BUILD-017 | Constitution ratification |

### 18.3 Build rules

1. One build = one mission — no scope creep mid-build  
2. Audit builds (like BUILD-015) produce reports, not features  
3. Stabilization builds (like BUILD-016) fix debt, not UX redesign  
4. Constitution builds (BUILD-017) produce governance docs, not application code  
5. BUILD numbers appear in git commit messages: `CBAI Enterprise BUILD-{NNN}`  
6. BUILD debug labels **must not** appear in shipped UI  

### 18.4 Assigning new builds

Before starting BUILD-{NNN}:

1. State the mission in one sentence  
2. Confirm alignment with this constitution  
3. List files expected to change  
4. Define done criteria (lint, build, routes preserved)  

---

## 19. Future Roadmap

### Phase 1 — Foundation complete (2026 Q3) ✅

- [x] Dashboard shell and navigation  
- [x] Universal Entity Framework  
- [x] Countries, Companies, Universities modules  
- [x] Global Search  
- [x] Knowledge Graph  
- [x] Reasoning Engine (simulated)  
- [x] Static export / Cloudflare Pages compatibility  
- [x] Production audit and stabilization  
- [x] Constitution v1  

### Phase 2 — Entity expansion (2026 Q4 – 2027 Q1)

- [ ] Governments module (`government` entity type)  
- [ ] Investors module (`investor` entity type)  
- [ ] People module (`person` entity type)  
- [ ] Graph integration for all six entity types  
- [ ] Deep-link entity selection via URL params  
- [ ] Topbar search wired to Global Search  

### Phase 3 — Backend integration (2027 Q2 – Q3)

- [ ] Authentication and tenant model  
- [ ] REST/GraphQL API for entity CRUD and search  
- [ ] Live graph service with provenance  
- [ ] Reasoning Engine model backend with audit trail  
- [ ] Knowledge document upload and indexing  
- [ ] Agent runtime with tool execution  

### Phase 4 — Enterprise hardening (2027 Q4 – 2028)

- [ ] Workflows builder (replace placeholder)  
- [ ] Analytics dashboard (replace placeholder)  
- [ ] Settings and RBAC (replace placeholder)  
- [ ] CI/CD pipeline with preview deployments  
- [ ] Error monitoring and performance budgets  
- [ ] Security audit and penetration test  

### Phase 5 — Intelligence at scale (2028 – 2031)

- [ ] Real-time ingestion pipelines  
- [ ] Temporal graph (relationship history)  
- [ ] Multi-model reasoning with ensemble confidence  
- [ ] Autonomous agent workflows with human-in-the-loop  
- [ ] Cross-tenant benchmarking (anonymized)  
- [ ] Mobile and embedded intelligence surfaces  
- [ ] Federation with external intelligence providers  

---

## Appendix A — Glossary

| Term | Definition |
|------|------------|
| **CBAI** | Central/Business AI — the intelligence operating system |
| **Entity** | Normalized intelligence object consumed by all modules |
| **Adapter** | Function mapping domain model → Entity |
| **Knowledge Graph** | Typed node-edge model of entity relationships |
| **Reasoning Engine** | Multi-stage inference pipeline with evidence and confidence |
| **AI Control** | Governance surface for commands, routing, and system context |
| **Build** | Numbered engineering increment with defined scope |
| **Static export** | Next.js build mode producing deployable HTML/JS in `out/` |

---

## Appendix B — Amendment process

1. Propose change with rationale and affected sections  
2. Review against active build in progress — no amendment mid-build unless blocking  
3. Increment version: v1 → v2  
4. Record change log at top of new document  
5. Update `docs/build-{NNN}-report.md` referencing constitution version  

---

## Appendix C — Current technology baseline

| Package | Version | Role |
|---------|---------|------|
| next | 16.2.10 | Framework, static export |
| react | 19.2.4 | UI runtime |
| react-dom | 19.2.4 | DOM rendering |
| typescript | ^5 | Type system |
| tailwindcss | ^4 | Styling |
| eslint | ^9 | Linting |

---

*This document was ratified as part of BUILD-017. It supersedes informal conventions and chat-session instructions when conflicts arise. All contributors are expected to read Sections 4, 6, 7, 16, and 18 before their first merge.*

**CBAI Enterprise — Global AI Operating System**  
*Know the world. Reason with evidence. Act with governance.*
