# CBAI Alpha 0.4 RC-3 — Architecture Freeze Audit

**Sprint:** Architecture Freeze / Repository Audit  
**Date:** July 2026  
**Scope:** Cleanup only — no new features, pages, workspaces, AI, APIs, or mock data  
**Authority:** CBAI Constitution v1.0 · CBAI Standards v1.0 · CBAI Governance Framework v1.0

---

## Executive summary

Alpha 0.4 RC-3 removes **26 orphaned source files** (~95 KB) left behind by prior platform transformations (Evidence Explorer, Reasoning Explorer, Governance Control Center). Cross-registry name matching is consolidated into a single shared utility. Static export and Cloudflare compatibility are verified unchanged.

---

## Repository health

| Metric | Status |
|--------|--------|
| Static routes | 21 (unchanged) |
| ESLint | Pass |
| TypeScript build | Pass |
| Static export (`output: "export"`) | Verified in `next.config.ts` |
| Server-only / Node APIs in app layer | None detected |
| npm dependencies | Minimal (Next, React, Tailwind, TypeScript only) |
| Orphaned UI components | Removed |
| Duplicate name-match logic | Consolidated |
| Constitution violations in removed code | Legacy demo engine used fabricated confidence scores — removed |

---

## Removed legacy code

### Knowledge demo (replaced by Evidence Explorer)

| File | Reason |
|------|--------|
| `lib/knowledge.ts` | Fake collections, source health, document stats |
| `components/knowledge/DocumentCard.tsx` | Orphaned |
| `components/knowledge/KnowledgeActivity.tsx` | Orphaned |
| `components/knowledge/KnowledgeStats.tsx` | Orphaned |
| `components/knowledge/SourceHealth.tsx` | Orphaned |

Route `/knowledge` now renders `EvidenceExplorer` only.

### Interactive reasoning demo (replaced by Reasoning Explorer)

| File | Reason |
|------|--------|
| `components/reasoning/ReasoningInput.tsx` | Orphaned interactive UI |
| `components/reasoning/ReasoningPipeline.tsx` | Orphaned stage animation |
| `components/reasoning/EvidencePanel.tsx` | Orphaned |
| `components/reasoning/DecisionTree.tsx` | Orphaned |
| `components/reasoning/ConfidenceMeter.tsx` | Orphaned — fabricated confidence |
| `components/reasoning/ReasoningSummary.tsx` | Orphaned |
| `lib/reasoning/reasoning.engine.ts` | Demo engine with mock delays/scores |
| `lib/reasoning/reasoning.mock.ts` | Sample questions and stage delays |
| `lib/reasoning/reasoning.types.ts` | Types only used by removed demo |

Route `/reasoning` now renders `ReasoningExplorer` backed by `lib/reasoning-explorer.ts`.

### AI command center demo (replaced by Governance Control Center)

| File | Reason |
|------|--------|
| `components/ai/CommandBox.tsx` | Orphaned |
| `components/ai/AgentRouter.tsx` | Orphaned |
| `components/ai/SystemContext.tsx` | Orphaned |

Route `/ai-control` now renders `GovernanceControlCenter`.

### Entity 1.0 layout (replaced by per-entity intelligence panels)

| File | Reason |
|------|--------|
| `components/entity/EntityLayout.tsx` | Never wired to routes |
| `components/entity/EntityHeader.tsx` | Child of EntityLayout |
| `components/entity/EntityOverview.tsx` | Child of EntityLayout |
| `components/entity/EntityMetrics.tsx` | Child of EntityLayout |
| `components/entity/EntityTags.tsx` | Child of EntityLayout |
| `components/entity/EntityTimeline.tsx` | Child of EntityLayout |
| `components/entity/EntityAISummary.tsx` | Child — fabricated AI summary |
| `components/entity/EntityScoreCard.tsx` | Child — fabricated scores |

`components/entity/EntityIcon.tsx` retained — used by graph page.

### Platform status widget

| File | Reason |
|------|--------|
| `components/platform/PlatformRuntimeStatus.tsx` | Never imported |

---

## Merged modules

| Before | After | Consumers |
|--------|-------|-----------|
| Duplicate `normalizeName` / `namesMatch` in 5 files | `lib/name-match.ts` | `countries.adapter.ts`, `companies.adapter.ts`, `universities.adapter.ts`, `registry/entity-links.ts`, `graph/graph.builder.ts` |
| `coverageStatusClass` in countries + re-exports | Already centralized via `lib/countries.coverage.ts` | companies/universities coverage re-export — no change needed |
| Status badge wrappers (`reportStatusClass`, `reasoningStatusClass`, `workspaceStatusClass`) | Delegate to `explorerStatusClass` | Already consolidated in prior sprints |

---

## Deleted files (complete list)

```
lib/knowledge.ts
lib/reasoning/reasoning.engine.ts
lib/reasoning/reasoning.mock.ts
lib/reasoning/reasoning.types.ts
components/knowledge/DocumentCard.tsx
components/knowledge/KnowledgeActivity.tsx
components/knowledge/KnowledgeStats.tsx
components/knowledge/SourceHealth.tsx
components/ai/AgentRouter.tsx
components/ai/CommandBox.tsx
components/ai/SystemContext.tsx
components/reasoning/ReasoningInput.tsx
components/reasoning/ReasoningPipeline.tsx
components/reasoning/EvidencePanel.tsx
components/reasoning/DecisionTree.tsx
components/reasoning/ConfidenceMeter.tsx
components/reasoning/ReasoningSummary.tsx
components/entity/EntityLayout.tsx
components/entity/EntityHeader.tsx
components/entity/EntityOverview.tsx
components/entity/EntityMetrics.tsx
components/entity/EntityTags.tsx
components/entity/EntityTimeline.tsx
components/entity/EntityAISummary.tsx
components/entity/EntityScoreCard.tsx
components/platform/PlatformRuntimeStatus.tsx
```

**Total:** 26 files deleted

---

## Created files

```
lib/name-match.ts
docs/architecture-freeze-audit.md
```

---

## Modified files

```
lib/countries.adapter.ts
lib/companies.adapter.ts
lib/universities.adapter.ts
lib/registry/entity-links.ts
lib/graph/graph.builder.ts
```

---

## Architecture summary

### Active platform layers

```
app/(dashboard)/*          → 18 route pages (static export)
components/*               → Section UI per domain
lib/*                      → Data models, adapters, coverage, explorers
lib/context/*              → Platform Context (URL-synced)
lib/registry/*             → Global Registry Layer (stable entity IDs)
lib/missions/*             → Mission Catalog (defined, not executed)
lib/intelligence/*         → Frozen — not modified this sprint
lib/governance/*           → Governance rules
lib/indicator-framework/*  → Indicator definitions
lib/evidence-infrastructure/* → Source catalog
```

### Canonical documentation (current)

| Document | Purpose |
|----------|---------|
| `docs/standards/` | CBAI Standards v1.0 (01–12) |
| `docs/platform-context-engine.md` | Platform Context architecture |
| `docs/global-registry-layer.md` | Global Registry Layer |
| `docs/mission-catalog.md` | Mission definitions |
| `docs/evidence-explorer-report.md` | Evidence Explorer sprint |
| `docs/alpha-0.2-core-intelligence-sprint-report.md` | Reasoning / Reports / Governance |
| `docs/alpha-0.3-rc1-workspace-sprint-report.md` | Intelligence Workspaces |
| `docs/architecture-freeze-audit.md` | This audit |

Historical `docs/build-*-report.md` files (016–061) are retained as sprint audit history; they are not duplicated architecture specs.

### Cloudflare compatibility

- `next.config.ts`: `output: "export"`, `images.unoptimized: true`
- No `getServerSideProps`, API routes, or Node-only imports in app/components/lib (excluding `lib/intelligence/` runtime internals)
- Build produces 21 static HTML routes

### Accessibility (spot check — no UI redesign)

- Heading hierarchy preserved in explorer/workspace section components
- Interactive elements use semantic `<button>` / `<a>` where present
- `.sr-only` utility available in `globals.css`
- No accessibility regressions introduced (deletions only)

---

## Remaining technical debt

| Area | Notes | Priority |
|------|-------|----------|
| Global Registry wiring | Registry built but not yet consumed by entity pages; adapters still use legacy IDs | Medium |
| Mission Catalog wiring | 21 missions defined; `missionIds` empty on registry entities | Medium |
| `lib/core.ts` demo data | `/core` route still shows example commands, fake latencies, pinned knowledge | Low — route is Extended nav |
| Status class aliases | `reportStatusClass`, `reasoningStatusClass`, `governanceStatusClass`, `workspaceStatusClass` wrap `explorerStatusClass` — could unify call sites | Low |
| Historical build reports | 40+ `docs/build-*-report.md` files — archive or index in future sprint | Low |
| Duplicate constitution docs | `docs/CBAI-Constitution-v1.md` + `docs/standards/01-cbai-constitution.md` — README already clarifies relationship | Low |
| Empty directories | `components/knowledge/`, `components/ai/`, `lib/reasoning/` may remain as empty folders until git cleanup | Trivial |
| Platform Context ↔ Registry bridge | `legacyIdToEntityId()` exists; full migration pending | Medium |
| Intelligence runtime | `lib/intelligence/` large surface — intentionally frozen, not audited this sprint | Future |

---

## Recommended future cleanup

1. Wire entity pages to Global Registry Layer (`getGlobalRegistry()`, stable IDs).
2. Attach mission IDs to registry entities and surface in workspace headers.
3. Replace or constitution-align `/core` demo route (fake latencies, example AI commands).
4. Consolidate status badge CSS into a single `StatusBadge` component using `explorerStatusClass`.
5. Archive historical `docs/build-*` reports under `docs/archive/build/` with an index README.
6. Remove empty component directories after confirming no tooling references them.
7. Evaluate `/agents`, `/workflows`, `/graph` Extended routes for constitution alignment in Alpha 0.5.

---

## Verification

```bash
npm run lint   # ✓ pass
npm run build  # ✓ pass — 21 static routes
```

---

## Compliance statement

This sprint modified only cleanup-eligible surfaces. The following were **not** modified:

- `lib/intelligence/` (runtime, agents, evidence adapters, orchestrator)
- No new features, pages, workspaces, AI, APIs, or mock data added
- Cloudflare static export configuration unchanged
- User-facing routes retain honest evidence labels
