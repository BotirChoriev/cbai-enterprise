# BUILD-018 — Architecture Standardization Audit

**Build ID:** BUILD-018  
**Date:** July 5, 2026  
**Mission:** Architecture audit for standardization opportunities  
**Constraint:** Report only — no code changes made  
**Constitution reference:** `docs/CBAI-Constitution-v1.md`

---

## Executive Summary

The CBAI Enterprise codebase is **architecturally sound** at the module level — Entity Framework, adapter pattern, and intelligence layer separation are consistently applied. Standardization debt is concentrated in **presentation-layer repetition**: duplicated UI primitives, parallel component implementations, and inline Tailwind patterns copied across modules.

This audit identifies **47 distinct duplication or debt items** grouped into six categories. None block deployment. Highest-value standardization targets are relationship panels, pipeline components, search/filter inputs, and intelligence page shells — all extractable without touching Entity Framework or route structure.

| Category | Items found | Highest priority |
|----------|-------------|------------------|
| Duplicated code | 18 | Relationship panels, pipeline UI |
| Reusable component opportunities | 12 | SearchInput, Panel, EmptyState |
| Folder improvements | 5 | `components/ui/` expansion |
| Performance improvements | 6 | Graph rebuild, client bundle |
| Technical debt | 6 | Dual card systems, deep links |
| **Total** | **47** | — |

**Lint / build at audit time:** Pass — 18 static routes, TypeScript strict enabled.

---

## 1. Duplicated Code

### 1.1 Relationship panel components (High)

Three near-identical implementations with the same grid layout, section header, icon badge, item list, and hover styles:

| File | Lines | Unique data |
|------|-------|-------------|
| `components/countries/CountryRelationships.tsx` | 166 | + Business Opportunities block |
| `components/companies/CompanyRelationships.tsx` | 123 | 4 relationship sections |
| `components/universities/UniversityRelationships.tsx` | 151 | + Research Areas tag block |

**Shared structure (repeated 3×):**
- Outer `rounded-xl border border-zinc-800 bg-zinc-950`
- Header: title + "Cross-entity intelligence graph" subtitle
- `grid gap-px bg-zinc-800 sm:grid-cols-2` section grid
- Section: icon box + title + count + `<ul>` of items with dot bullet

**Duplication estimate:** ~80% structural overlap (~200 lines recoverable via config-driven `EntityRelationshipPanel`).

---

### 1.2 Pipeline stage components (High)

| File | Purpose | Stages source |
|------|---------|---------------|
| `components/core/ThinkingPipeline.tsx` | CBAI Core cognitive pipeline | `lib/core.ts` → `pipelineStages` |
| `components/reasoning/ReasoningPipeline.tsx` | Reasoning Engine pipeline | `lib/reasoning/reasoning.types.ts` |

**Shared structure (repeated 2×):**
- Card shell with violet gradient overlay
- Vertical timeline with gradient connector line
- Stage circle: pending / active (pulse) / complete (checkmark)
- Down-arrow separators between stages
- Active ring color differs (sky vs violet) — cosmetic only

**Duplication estimate:** ~85% JSX overlap (~110 lines). Differs only in stage data shape and active-color token.

---

### 1.3 Intelligence module list/card selectors (High)

| File | Entity | Selection accent |
|------|--------|------------------|
| `components/countries/CountryCard.tsx` | Country | sky |
| `components/companies/CompanyList.tsx` | Company | sky |
| `components/universities/UniversityList.tsx` | University | violet |

**Shared patterns:**
- Selectable button with `border-sky-500/40 bg-sky-500/5 ring-1` active state
- Icon/initials box + name + subtitle row
- 3-column score grid (AI / Invest / Risk)
- Local `ScorePill` helper duplicated in CompanyList and UniversityList
- Empty state: dashed border + "No {entity} match your filters"

CountryCard differs slightly (score bars vs pills, "Active" badge) but same selection model.

**Duplication estimate:** ~70% overlap. `EntitySelectorList` + shared `ScorePill` would consolidate.

---

### 1.4 Module filter panels (Medium)

| File | Layout | Filter types |
|------|--------|--------------|
| `components/countries/CountryFilters.tsx` | Horizontal bar | Search + region pills |
| `components/companies/CompanyFilters.tsx` | Vertical stack | Search + industry pills + country pills |
| `components/universities/UniversityFilters.tsx` | Vertical stack | Search + type pills + country pills |
| `components/search/SearchFilters.tsx` | Vertical stack | Entity type + score sliders |
| `components/graph/GraphFilters.tsx` | Vertical stack | Search + node type + stats |

**Repeated within filters:**
- Search icon SVG (identical path, repeated 6× across codebase)
- Search input styling (`pl-10`, `border-zinc-800`, `bg-zinc-900/60`)
- Active pill: `bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/30`
- Inactive pill: `border border-zinc-800 text-zinc-500`
- `FilterPill` local component duplicated in `CompanyFilters.tsx` and `UniversityFilters.tsx` (identical implementation)
- `FilterOption` in SearchFilters mirrors pill behavior with count badge

---

### 1.5 Intelligence page hero headers (Medium)

Copy-pasted hero block on 7 pages with only text/color variations:

| Page file | Eyebrow color | Title |
|-----------|---------------|-------|
| `app/(dashboard)/countries/page.tsx` | cyan | Countries Intelligence |
| `app/(dashboard)/companies/page.tsx` | sky | Companies Intelligence |
| `app/(dashboard)/universities/page.tsx` | violet | Universities Intelligence |
| `app/(dashboard)/core/page.tsx` | — | CBAI Core |
| `app/(dashboard)/graph/page.tsx` | sky | CBAI Knowledge Graph |
| `components/reasoning/ReasoningInput.tsx` | violet | CBAI Reasoning Engine |
| `app/(dashboard)/search/page.tsx` | — | via GlobalSearchBox |

**Shared JSX (~15 lines each):**
```tsx
<div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
  <div aria-hidden className="... gradient overlay ..." />
  <p className="text-[10px] uppercase tracking-widest text-{accent}-400">...</p>
  <h1 className="text-2xl font-semibold">...</h1>
  <p className="text-sm text-zinc-500">...</p>
</div>
```

Graph and Reasoning use gradient variant (`bg-gradient-to-br`) — minor deviation.

---

### 1.6 Intelligence module page layout (Medium)

Identical 3-column grid on 5 pages:

```
xl:grid-cols-12 → col-span-3 (filters/list) + col-span-6 (detail) + col-span-3 (optional)
```

| Page | Grid |
|------|------|
| `countries/page.tsx` | 3 + 6 + 3 |
| `companies/page.tsx` | 3 + 6 + 3 |
| `universities/page.tsx` | 3 + 6 + 3 |
| `search/page.tsx` | 3 + 6 + 3 |
| `graph/page.tsx` | 3 + 6 + 3 |
| `reasoning/page.tsx` | 4 + 4 + 4 |

Page-level state pattern also duplicated:
```tsx
const [search, setSearch] = useState("");
const [selectedId, setSelectedId] = useState(firstItem.id);
const filtered = useMemo(() => items.filter(...), [deps]);
const selected = items.find(id) ?? filtered[0] ?? fallback;
const selectedEntity = to{Module}Entity(selected);
```

Present on countries, companies, universities pages — 3× copy.

---

### 1.7 Placeholder "coming soon" pages (Medium)

Identical structure on 3 routes:

| Page | Message |
|------|---------|
| `app/(dashboard)/workflows/page.tsx` | Workflow builder coming soon |
| `app/(dashboard)/analytics/page.tsx` | Analytics dashboard coming soon |
| `app/(dashboard)/settings/page.tsx` | Settings panel coming soon |

**Repeated block:**
- `PageHeader` + `Card` > `CardContent py-16 text-center`
- Icon box: `h-12 w-12 rounded-xl border border-zinc-800 bg-zinc-900`
- Title + description paragraph

Workflows adds action button — only deviation.

---

### 1.8 Command input surfaces (Low)

| File | Context |
|------|---------|
| `components/ai/CommandBox.tsx` | AI Control page |
| `components/core/CommandCenter.tsx` | CBAI Core page |

Both use:
- Card-wrapped textarea
- `rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 focus-within:border-sky-500/40`
- Submit button + example command chips
- Processing/loading animation state

Different copy and wiring but ~60% structural overlap.

---

### 1.9 Stats row components (Low)

| File | Pattern |
|------|---------|
| `components/agents/AgentStats.tsx` | 4× `StatCard` in grid |
| `components/knowledge/KnowledgeStats.tsx` | 4× `StatCard` in grid |
| `app/(dashboard)/dashboard/page.tsx` | Inline `StatCard` grid |

Same `sm:grid-cols-2 xl:grid-cols-4` layout. Only data and icons differ — could be data-driven.

---

### 1.10 Utility function duplication (Medium)

| Function | Locations | Identical? |
|----------|-----------|------------|
| `truncate(text, max)` | `lib/global-search.ts`, `lib/reasoning/reasoning.engine.ts` | Yes |
| `tokenize(query)` | `lib/global-search.ts` | — |
| Search token split | `lib/graph/graph.builder.ts` → `filterNodesBySearch` | Similar logic, different scoring |
| `normalizeName` / `namesMatch` | `lib/graph/graph.builder.ts` (private) | Graph-only |

Constitution Section 16 recommends shared utils — not yet implemented.

---

### 1.11 Local helper component duplication (Medium)

| Helper | Occurrences |
|--------|-------------|
| `ScorePill` | `CompanyList`, `UniversityList`, `GraphInspector`, `ReasoningSummary` |
| `FilterPill` | `CompanyFilters`, `UniversityFilters` |
| `FilterOption` | `SearchFilters` |
| `StatItem` | `GraphFilters` |

All implement small label + value display with minor styling differences.

---

### 1.12 Empty state patterns (Low)

| Location | Pattern |
|----------|---------|
| `SearchResults.tsx` | Dashed border, icon box, "No results found" |
| `CompanyList.tsx` | Dashed border, "No companies match your filters" |
| `UniversityList.tsx` | Dashed border, "No universities match your filters" |
| `EvidencePanel.tsx` | Solid border, awaiting-state message |
| `DecisionTree.tsx` | Solid border, awaiting-state message |
| `ConfidenceMeter.tsx` | Solid border, awaiting-state message |
| `ReasoningSummary.tsx` | Solid border, awaiting-state message |
| `GraphInspector.tsx` | Solid border, select-node prompt |

Two variants: **dashed no-results** (lists/search) and **solid awaiting** (reasoning/graph panels). No shared component.

---

### 1.13 Search bar duplication (Medium)

Six independent search inputs with identical icon + input classes:

| Location | Placeholder |
|----------|-------------|
| `components/layout/Topbar.tsx` | Search agents, workflows, documents... (unwired) |
| `CountryFilters.tsx` | Search countries... |
| `CompanyFilters.tsx` | Search companies... |
| `UniversityFilters.tsx` | Search universities... |
| `GlobalSearchBox.tsx` | Search countries, companies, universities... |
| `GraphFilters.tsx` | Search entities… |

Search icon SVG path duplicated 6× inline.

---

### 1.14 Card styling dual system (Medium)

**System A — `components/ui/Card.tsx`:**
- Used by: dashboard, agents, knowledge, ai-control, workflows, analytics, settings
- Classes: `rounded-xl border border-zinc-800 bg-zinc-900/50`

**System B — inline Tailwind:**
- Used by: all entity components, graph, reasoning, search, core, intelligence modules
- Classes: `rounded-xl border border-zinc-800 bg-zinc-950` (note: `bg-zinc-950` vs `bg-zinc-900/50`)

~35 components use System B inline. Visual difference is subtle but creates maintenance drift.

---

### 1.15 Badge / status pill patterns (Low)

Multiple badge implementations without shared primitive:

| Pattern | Example locations |
|---------|-------------------|
| Entity type badge | `EntityHeader.tsx` — uppercase tracking pill |
| Status badge | `EntityHeader.tsx` — dot + label |
| Entity tags | `EntityTags.tsx` — rounded-full with variant styles |
| Active selection | `CountryCard.tsx` — "Active" pill |
| Evidence source | `EvidencePanel.tsx` — colored source label |
| Relationship type | `GraphInspector.tsx` — colored edge type pills |
| Agent status | `AgentCard.tsx`, `AgentRouter.tsx` — status dot configs |
| Document status | `DocumentCard.tsx` — indexed/indexing/pending |

All use similar `rounded-full px-2 py-0.5 text-[10px]` base but different color maps.

---

### 1.16 Page header dual system (Low)

**System A — `PageHeader` component (7 pages):**
dashboard, agents, knowledge, settings, analytics, ai-control, workflows

**System B — inline hero block (7 surfaces):**
countries, companies, universities, core, graph, reasoning, search

Documented in Constitution Section 13.1 as accepted divergence — standardization optional.

---

### 1.17 Loading / processing states (Low)

No shared loading component exists. Processing indicated by:

| Pattern | Locations |
|---------|-----------|
| `animate-pulse` dot | ThinkingPipeline, ReasoningPipeline |
| `animate-pulse` SVG | CommandBox |
| Status dot pulse | AgentRouter, DocumentCard |
| Text "processing…" | ReasoningPipeline, ThinkingPipeline |
| Progress bar | ReasoningPipeline only |

No skeleton loaders, no shared `LoadingState` component, no Suspense boundaries.

---

### 1.18 Table structures

**Finding:** No HTML `<table>` elements exist in the codebase. Data is rendered via grids, lists, and cards only. **No table standardization needed** at this time.

---

## 2. Reusable Component Opportunities

Prioritized list of extractable shared components that would reduce duplication without changing UI appearance or Entity Framework.

| # | Proposed component | Location | Consolidates | Priority |
|---|-------------------|----------|--------------|----------|
| 1 | `EntityRelationshipPanel` | `components/entity/` | 3 relationship components | **High** |
| 2 | `PipelineStages` | `components/ui/` | ThinkingPipeline + ReasoningPipeline | **High** |
| 3 | `SearchInput` | `components/ui/` | 6 search bars + icon SVG | **High** |
| 4 | `FilterPill` / `FilterGroup` | `components/ui/` | 4 filter implementations | **High** |
| 5 | `EntitySelectorList` | `components/entity/` | CountryCard, CompanyList, UniversityList | **High** |
| 6 | `ScorePill` | `components/entity/` | 4 local ScorePill copies | **Medium** |
| 7 | `IntelligenceHero` | `components/layout/` | 7 hero header blocks | **Medium** |
| 8 | `Panel` | `components/ui/` | ~35 inline card shells | **Medium** |
| 9 | `EmptyState` | `components/ui/` | 8 empty/awaiting states | **Medium** |
| 10 | `ComingSoonPage` | `components/ui/` | 3 placeholder pages | **Medium** |
| 11 | `Badge` | `components/ui/` | 8 badge variants | **Low** |
| 12 | `StatItem` | `components/ui/` | GraphFilters, dashboard inline stats | **Low** |

**Important:** Extracting these components must preserve exact Tailwind classes to comply with BUILD-018 "no redesign" rule. Wrapper components pass `className` overrides only where modules already differ.

---

## 3. Folder Improvements

### 3.1 Current structure (healthy)

```
components/
├── entity/       ✅ Shared entity UI (9 files) — well-scoped
├── layout/       ✅ Shell (4 files)
├── ui/           ⚠️ Underused (2 files: Card, StatCard)
├── {module}/     ✅ Domain-specific UI
lib/
├── entity/       ✅ Types, helpers, icons
├── graph/        ✅ Subsystem isolated
├── reasoning/    ✅ Subsystem isolated
```

### 3.2 Recommended additions (no moves required yet)

| Folder | Purpose | When |
|--------|---------|------|
| `components/ui/` | Expand with SearchInput, FilterPill, Panel, EmptyState, Badge, PipelineStages | BUILD-019+ |
| `lib/utils/` | `truncate`, `tokenize`, `normalizeName`, `namesMatch` | BUILD-019+ |
| `lib/constants/` | Shared Tailwind class strings (panel, pill active/inactive) | Optional |

### 3.3 Not recommended

| Change | Reason |
|--------|--------|
| Merge `graph/` and `reasoning/` components | Different domains, different stage models |
| Move entity components into module folders | Breaks Entity Framework composition |
| Collapse `lib/{module}.ts` + adapters into single files | Violates Constitution adapter boundary |
| Create `features/` folder | Over-engineering for current scale |

### 3.4 Documentation folder (current)

```
docs/
├── CBAI-Constitution-v1.md      Governance
├── production-readiness-audit.md  BUILD-015
├── build-016-report.md            BUILD-016
└── build-018-architecture-audit.md  This document
```

Consider `docs/builds/` subfolder when build reports exceed 10 files.

---

## 4. Performance Improvements

### 4.1 Knowledge graph rebuild (Medium)

| Call site | Pattern | Cost |
|-----------|---------|------|
| `graph/page.tsx` | `useMemo(() => buildKnowledgeGraph(), [])` | Once per mount ✅ |
| `reasoning.engine.ts` | `buildKnowledgeGraph()` inside `executeReasoning()` | Every reasoning run |

At 22 entities, cost is negligible (~1ms). At 500+ entities, reasoning re-build becomes measurable.

**Recommendation:** Module-level memoized singleton `getKnowledgeGraph()` in `graph.builder.ts` when entity count exceeds 100.

---

### 4.2 Global entity index (Low)

`getAllEntities()` in `lib/global-search.ts` rebuilds the full entity array on every call by mapping all adapters. Called from:
- Search page (once via useMemo ✅)
- `searchEntities()` (every search)
- `getEntityCounts()` (module load in SearchFilters — once ✅)
- Reasoning engine (every execution)

**Recommendation:** Cache `getAllEntities()` result at module scope; invalidate when data source becomes dynamic.

---

### 4.3 Client component bundle (Medium)

7 full-page `"use client"` routes bundle all logic client-side:

countries, companies, universities, search, graph, reasoning, core

Each imports adapters, domain data, and entity components into the client JS bundle. At current mock data size this is acceptable. When domain files grow:

**Recommendation:** Keep pages as RSC shells; isolate interactive state into smaller client child components (filters, lists, canvas).

---

### 4.4 SVG icon inline duplication (Low)

Search icon, checkmark, arrow-down, and stage icons are inlined as JSX across 20+ files. No icon system beyond `EntityIcon` (entity type paths only) and `NavIcon` (sidebar).

**Recommendation:** Extend `components/ui/Icon.tsx` with named icons (Search, Check, ChevronDown) — reduces bundle slightly through reuse.

---

### 4.5 Font loading (Low)

`next/font/google` (Geist) loads at root layout — optimal. No per-page font imports. No action needed.

---

### 4.6 Static export (No issue)

All 18 routes pre-render to static HTML. No SSR runtime cost on Cloudflare Pages. `buildKnowledgeGraph()` runs at build time only for static pages that don't call it in RSC — client pages compute on mount.

---

## 5. Technical Debt

### 5.1 Dual card styling systems (Medium)

`Card` component (`bg-zinc-900/50`) vs inline panels (`bg-zinc-950`). Entity framework uses inline; platform modules use `Card`. Consolidation requires visual audit to avoid subtle regressions.

---

### 5.2 Unwired Topbar search (Medium)

`components/layout/Topbar.tsx` search input and ⌘K badge are decorative. Users expect global search behavior. Constitution Section 13.4 marks this as debt.

---

### 5.3 Broken deep-link entity selection (Medium)

`GraphInspector` and `ReasoningSummary` emit `?id=` links. Entity pages ignore `searchParams`. SearchResults links to module routes without entity ID. Users land on default selection.

**Not a duplication issue** — tracked as functional debt, out of BUILD-018 scope per Constitution.

---

### 5.4 Demo identity hardcoding (Low)

"Acme Corp", "Jane Doe", "847K tokens" in Sidebar, Topbar, SystemContext, Dashboard. Acceptable for demo; must be replaced with tenant context when auth ships.

---

### 5.5 README boilerplate (Low)

`README.md` still references create-next-app / Vercel. No CBAI deploy instructions despite static export configuration.

---

### 5.6 No tests, CI, or error boundaries (Medium)

Zero test files. No GitHub Actions. No React error boundaries in dashboard layout. Documented in BUILD-015; remains open.

---

## 6. Priority Order

### High — standardize next (BUILD-019 candidates)

| # | Item | Impact | Effort | Risk |
|---|------|--------|--------|------|
| H1 | Extract `EntityRelationshipPanel` | Removes ~200 duplicate lines | Medium | Low — data-driven config |
| H2 | Extract `PipelineStages` | Unifies core + reasoning pipelines | Medium | Low — props for color token |
| H3 | Extract `SearchInput` | 6 search bars → 1 component | Small | None |
| H4 | Extract shared `FilterPill` | 4 filter UIs → shared primitive | Small | None |
| H5 | Extract `EntitySelectorList` + `ScorePill` | 3 list components → 1 | Medium | Low — preserve accent colors |
| H6 | Create `lib/utils/text.ts` | `truncate`, `tokenize` dedup | Small | None |

---

### Medium — schedule after High

| # | Item | Impact | Effort | Risk |
|---|------|--------|--------|------|
| M1 | Extract `IntelligenceHero` | 7 hero blocks → 1 | Small | Low — text/color props |
| M2 | Extract `Panel` wrapper | ~35 inline card shells | Medium | Medium — bg-zinc-950 vs 900/50 |
| M3 | Extract `EmptyState` | 8 empty patterns → 1 | Small | None |
| M4 | Extract `ComingSoonPage` | 3 placeholder pages → 1 | Small | None |
| M5 | Memoize `getKnowledgeGraph()` | Reasoning perf at scale | Small | None |
| M6 | Cache `getAllEntities()` | Search/reasoning perf | Small | None |
| M7 | Split client pages into RSC + client islands | Bundle size at scale | Large | Medium |
| M8 | Unify card systems (Card vs inline) | Visual consistency | Medium | Medium — visual regression risk |
| M9 | Wire Topbar search to `/search` | UX debt | Small | Low — behavior change, needs own build |

---

### Low — defer

| # | Item | Impact | Effort |
|---|------|--------|--------|
| L1 | Extract `Badge` primitive | Minor DRY | Small |
| L2 | Extract `StatItem` | 2 usages | Small |
| L3 | Shared SVG icon map | Bundle hygiene | Medium |
| L4 | Unify PageHeader vs IntelligenceHero | Visual consistency | Medium |
| L5 | Shared loading/skeleton component | No current user-facing gap | Small |
| L6 | `docs/builds/` folder reorg | Housekeeping | Trivial |
| L7 | Replace README | Documentation | Small |
| L8 | Add CI pipeline | Process | Medium |

---

## 7. What Must NOT Be Standardized (Constitution-bound)

The following are **intentionally separate** and must not be merged:

| Area | Reason |
|------|--------|
| Entity Framework (`EntityLayout`, adapters) | Constitution Section 4.1 — working correctly |
| Domain data files (`lib/countries.ts`, etc.) | Single source of truth per module |
| Graph builder vs reasoning engine | Different subsystems, shared types only |
| Module-specific filter logic | Different filter dimensions per entity type |
| Route files | BUILD-018 rule — preserve all routes |
| Placeholder page content | Modules exist; content deferred intentionally |

---

## 8. Suggested BUILD Sequence

Based on this audit, recommended follow-on builds:

| Build | Mission | Items |
|-------|---------|-------|
| BUILD-019 | UI primitive extraction | H3, H4, H6, M3, M4 (low-risk utils + small components) |
| BUILD-020 | Entity UI consolidation | H1, H5, H2 (relationship panel, selector list, pipeline) |
| BUILD-021 | Page shell standardization | M1, M2, M8 (hero, panel, card unification) |
| BUILD-022 | Performance & RSC split | M5, M6, M7 (memoization, client island refactor) |

Each build must pass lint, build, and preserve all 18 routes.

---

## 9. Audit Methodology

| Step | Action |
|------|--------|
| 1 | Full file inventory — 114 repo files |
| 2 | Import graph analysis — all `@/components/` and `@/lib/` imports |
| 3 | Pattern grep — card classes, search inputs, pills, empty states |
| 4 | Side-by-side comparison — relationship, pipeline, list, filter components |
| 5 | Utility function scan — duplicate helpers in lib/ |
| 6 | Build verification — `npm run lint && npm run build` |
| 7 | Constitution cross-check — Entity Framework and route preservation rules |

**No files were modified during this audit.**

---

## 10. Conclusion

CBAI Enterprise has a **strong architectural spine** (Entity Framework, adapters, intelligence layer) with **presentation-layer duplication** typical of rapid BUILD-001–017 iteration. The highest-value standardization work is concentrated in six extractable UI primitives and one utility module — achievable across 3–4 numbered builds without redesign, feature additions, or Entity Framework changes.

The codebase is **ready for standardized extraction** starting at BUILD-019.

---

*BUILD-018 Architecture Standardization Audit — report only, no application changes made.*
