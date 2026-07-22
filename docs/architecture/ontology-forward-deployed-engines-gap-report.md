# CBAI Ontology + Forward-Deployed Engines — Architecture Gap Report

**Branch:** `preview/spatial-world-intelligence`
**HEAD:** `2d1558995f355a899100a6ca15c7d924e913c690`
**Date:** 2026-07-21
**Starting working tree:** 181 paths (134 modified, 47 untracked, 0 staged)

## Executive Summary

CBAI already contains substantial ontology-like primitives spread across Operational Objects, Universal Entity, Global Registry, Research Entity types, Knowledge Brain, Governance rules, and Platform Actions. What is missing is a **single canonical, versioned ontology layer** and a **forward-deployed engine contract** that unifies research, evidence, country/organization intelligence, missions, governance review, and multilingual meeting foundations under human-confirmed execution.

This report inventories what exists, identifies gaps, and defines the minimum additive foundation required without rewriting or deleting existing user records.

---

## 1. Existing Systems Inventory

### 1.1 Operational Object System ✅ (canonical for real work)

| Layer | Path | Status |
|-------|------|--------|
| Types | `lib/operational-objects/operational-object.types.ts` | 9 types, 11 domains, 10 statuses, provenance v1 |
| Store | `lib/operational-objects/operational-object-store.ts` | localStorage only |
| Command pipeline | `lib/operational-objects/command-interpreter.ts` | deterministic, confirm-before-create |
| UI | `components/operational-objects/*` | Composer, Provider, Index |
| Tests | `scripts/test-operational-objects.ts`, `test-composer.ts`, `test-command-pipeline.ts` | ✅ |

**Gap:** No unified ontology ID space; objects reference project/mission IDs ad hoc.

### 1.2 Platform Actions ✅ (allowlisted navigation + draft composition)

| Layer | Path | Status |
|-------|------|--------|
| Registry | `lib/platform-actions/registry.ts` | 38 allowlisted actions |
| Realtime | `lib/platform-actions/realtime-tool-handler.ts` | `execute_platform_action` tool |
| Apply | `lib/platform-actions/apply-platform-action.ts` | client-side only |
| i18n | `lib/i18n/platform-copy-platform-actions.ts` | EN/UZ/RU/TR |
| Tests | `scripts/test-voice-platform-operator.ts` | ✅ |

**Gap:** No engine invocation actions; no workspace open/confirm/execute lifecycle.

### 1.3 Voice Operator ✅ (WebRTC + dual tool surfaces)

| Layer | Path | Status |
|-------|------|--------|
| Provider | `components/voice-operator/VoiceOperatorProvider.tsx` | platform-action bridge |
| Tools | `lib/voice-operator/tools/voice-tools.ts` + platform-actions | 12 voice tools + platform actions |
| Broker | `lib/voice-operator/session-broker/*` | external deployment required |
| Tests | 7+ voice test scripts | ✅ |

**Gap:** No engine-specific voice guidance; no engine confirmation readback copy.

### 1.4 Spatial World ✅

| Layer | Path | Status |
|-------|------|--------|
| Globe | `components/spatial-world/InteractiveIntelligenceGlobe.tsx` | Three.js, SSR-off |
| Home | `components/spatial-world/SpatialWorldIntelligenceHome.tsx` | `/` only |
| Tests | `scripts/test-spatial-world-intelligence.ts` | ✅ |

**Gap:** No engine entry from globe country selection (future hook point only).

### 1.5 Entity Registries ✅ (static catalogs)

| Registry | Count | Adapter |
|----------|-------|---------|
| Countries | 7 | `lib/countries.adapter.ts` |
| Companies | 9 | `lib/companies.adapter.ts` |
| Universities | 9 | `lib/universities.adapter.ts` |
| Global Registry | merged | `lib/registry/entity-registry.ts` |

**Gap:** Not yet mapped to canonical ontology `country`/`company`/`university` kinds with typed relationships.

### 1.6 Research Catalog ✅

| Layer | Path | Status |
|-------|------|--------|
| Topics | `lib/research/research-topics.ts` | 64 topics |
| Entity types | `lib/research/entities/research-entity-types.ts` | 14 types |
| Workspace | `lib/research/research-workspace-store.ts` | localStorage |

**Gap:** Research entity ontology parallel to but not unified with platform ontology.

### 1.7 Evidence & Knowledge Graph ✅

| Layer | Path | Status |
|-------|------|--------|
| Evidence | `lib/evidence/*`, `lib/intelligence/evidence/*` | multi-layer |
| Knowledge Brain | `lib/intelligence-os/knowledge-brain.types.ts` | provenance contract |
| Graph | `lib/graph/graph.types.ts` | country/company/university nodes |
| Route | `/knowledge` (EvidenceExplorer) | ✅ |

**Gap:** Claims, sources, datasets not first-class ontology objects; graph limited to 3 entity types.

### 1.8 Missions / Projects / Reports ✅

| Layer | Persistence | Status |
|-------|-------------|--------|
| Missions | localStorage | runtime store |
| Mission catalog | static TS | 21 entries |
| Projects | localStorage + Supabase outbox | cloud-synced |
| Reports | localStorage index | re-render on open |

**Gap:** Mission catalog and runtime mission store are separate; no ontology migration path.

### 1.9 Government & Governance ✅

| Surface | Path | Status |
|---------|------|--------|
| Governance | `/governance`, `lib/governance/registry.ts` | declarative rules, not runtime-enforced |
| Government | `/government`, `lib/workspaces/government.ts` | evidence workspace lens |

**Gap:** No governance review engine producing structured review drafts.

### 1.10 Localization & Locale Provenance ⚠️ (partial)

| Layer | Status |
|-------|--------|
| 4-language dictionaries | ✅ compile-time completeness |
| Terminology registry | ✅ |
| Locale provenance policy doc | ✅ design only |
| `contentLocale`/`createdLocale` on stores | ❌ not implemented on project/mission |

---

## 2. Persistence & Migration Landscape

| Store | Location | Cloud |
|-------|----------|-------|
| Operational objects | localStorage `cbai-operational-objects` | ❌ |
| Projects | localStorage + Supabase outbox | ✅ |
| Missions | localStorage | ❌ |
| Research workspace | localStorage | ❌ |
| Org/collaboration | adapters in `lib/persistence/` | optional Supabase |
| Evidence bookmarks | Supabase `0004_evidence_bookmarks.sql` | ✅ |

**Supabase migrations:** `0001`–`0007` — profiles, projects, org graph, RPC functions.

**Gap:** No ontology object table; ontology runs device-local with backward-compatible adapters (matches current platform pattern).

---

## 3. Concept Overlap Map (do not duplicate)

| Existing concept | Ontology mapping | Strategy |
|------------------|------------------|----------|
| `OperationalObject` | `project`, `mission`, `task`, `work_plan`, etc. | Adapter reads/writes; OO remains canonical for work index |
| `Entity` (universal) | UI projection of registry + project | Keep; ontology adds semantic layer beneath |
| `RegistryEntityRecord` | `country`, `company`, `university` | Read-only adapter from static catalogs |
| `ResearchTopic` | `research_topic` | Read-only adapter |
| `Mission` (runtime) | `mission` | Bidirectional adapter with field preservation |
| `Project` | `project` | Bidirectional adapter with field preservation |
| `GovernanceRule` | `policy`, `standard` | Read-only reference adapter |
| `PlatformActionId` | engine invocation extension | Additive IDs only |

---

## 4. Critical Gaps to Close

### G1 — No canonical ontology module
**Impact:** Objects cannot be queried, linked, or migrated uniformly.
**Resolution:** `lib/ontology/` with typed kinds, relationships, validation, migrations.

### G2 — No forward-deployed engine contract
**Impact:** Research/evidence/country/org/mission/governance flows are page-specific, not composable.
**Resolution:** `lib/forward-deployed-engines/` with lifecycle, confirmation gates, audit.

### G3 — No unified Operational Workspace UX
**Impact:** Users see architecture fragments, not an operating system.
**Resolution:** `components/forward-deployed/` reusable workspace pattern.

### G4 — Platform actions cannot invoke engines
**Impact:** Voice/text cannot safely open engine workspaces.
**Resolution:** Extend registry with `engine.*` actions (allowlisted, confirm-gated).

### G5 — Locale provenance incomplete on user records
**Impact:** `contentLocale`/`createdLocale` policy not enforced.
**Resolution:** Ontology objects carry locale fields; adapters populate from existing records.

### G6 — No engine regression test suite
**Impact:** Confirmation gates and mutation boundaries untested at ontology layer.
**Resolution:** `scripts/test-ontology-forward-deployed-engines.ts`.

### G7 — No architecture documentation for ontology/engines
**Impact:** Future contributors will re-derive decisions.
**Resolution:** docs under `docs/architecture/`.

---

## 5. Non-Goals (explicit)

- Do **not** replace Operational Objects as the work index.
- Do **not** introduce fake server collaboration or fabricated metrics.
- Do **not** claim simultaneous interpretation is complete.
- Do **not** runtime-enforce governance rules (remain declarative + review engine).
- Do **not** delete or rename existing localStorage keys or Supabase tables.
- Do **not** commit, push, deploy, or touch `main`.

---

## 6. Recommended Implementation Order

1. `lib/ontology/` types, relationships, validation, migrations, provenance
2. Ontology service (device-local repository)
3. Legacy adapters (project, mission, operational object, registry)
4. `lib/forward-deployed-engines/` contract + 7 engine planners
5. `components/forward-deployed/` workspace UI
6. Platform action extensions + i18n
7. Route integration hooks (additive panels, not page rewrites)
8. Tests, docs, screenshots

---

## 7. Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking localStorage records | Idempotent migrations; unknown-field preservation |
| Hydration mismatch in new UI | `useHydrated()` gate for localStorage-derived state |
| Voice silent mutation | All engine mutations require `awaiting_confirmation` → explicit confirm action |
| Scope explosion | Engines produce plans only; execution via allowlisted platform actions |
| i18n gaps | Compile-time dictionary keys for all new UI copy |

---

*Generated as Phase 0 safety inventory. See `ontology-forward-deployed-engines-decisions.md` for design choices.*
