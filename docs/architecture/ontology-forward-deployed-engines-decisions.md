# CBAI Ontology + Forward-Deployed Engines — Design Decisions

**Branch:** `preview/spatial-world-intelligence`
**Date:** 2026-07-21

Scoring criteria (1–10 each): semantic clarity, compatibility, migration safety, testability, scalability, user comprehension, evidence integrity, implementation cost.

---

## Decision 1: Ontology Storage Model

| Option | Description | Scores (8 criteria) | Total |
|--------|-------------|---------------------|-------|
| **A. Device-local ontology store** | New localStorage namespace; adapters bridge existing stores | 9, 10, 10, 9, 7, 8, 9, 9 | **71** |
| B. Supabase-first ontology tables | New migrations; all objects in Postgres | 8, 5, 4, 8, 10, 7, 9, 4 | 55 |
| C. In-memory only (no persistence) | Ontology as runtime view over existing stores | 7, 8, 10, 7, 5, 7, 7, 10 | 61 |

**Selected: A — Device-local ontology store**

**Why:** Matches existing platform pattern (projects local + outbox, operational objects local, missions local). Zero migration risk for cloud schema. Adapters can hydrate ontology objects from existing records without moving data. Supabase expansion remains a future option without blocking this foundation.

---

## Decision 2: Relationship to Operational Objects

| Option | Description | Scores | Total |
|--------|-------------|--------|-------|
| **A. Operational Objects remain canonical; ontology links beneath** | OO is work index; ontology adds semantic graph | 10, 10, 10, 9, 9, 9, 9, 9 | **75** |
| B. Ontology replaces Operational Objects | Single unified object model | 9, 3, 2, 8, 9, 6, 8, 3 | 48 |
| C. Parallel systems with manual sync | Both stores updated independently | 5, 6, 4, 5, 6, 4, 6, 6 | 42 |

**Selected: A — Operational Objects remain canonical**

**Why:** User requirement explicitly preserves operational objects. Ontology provides semantic linking and engine context without disrupting the composer/work-card UX.

---

## Decision 3: Engine Execution Model

| Option | Description | Scores | Total |
|--------|-------------|--------|-------|
| **A. Plan-only engines + allowlisted platform actions for execution** | Engines produce drafts; confirmation triggers existing action registry | 10, 10, 10, 10, 8, 9, 10, 9 | **76** |
| B. Engines directly mutate stores after confirmation | Engine runner writes to project/mission/OO stores | 8, 7, 6, 7, 8, 8, 8, 7 | 59 |
| C. Autonomous agent loop | Engines run until completion | 4, 2, 2, 4, 7, 3, 3, 2 | 27 |

**Selected: A — Plan-only + allowlisted actions**

**Why:** Strongest evidence integrity and security boundary. Reuses tested platform-action and composer confirmation flows. Voice cannot silently mutate.

---

## Decision 4: Engine State Machine

| Option | Description | Scores | Total |
|--------|-------------|--------|-------|
| **A. Explicit 11-state lifecycle** (idle → … → cancelled) | As specified in mission brief | 10, 9, 9, 10, 9, 8, 9, 8 | **72** |
| B. Simplified 4-state (draft/active/done/error) | Minimal FSM | 7, 8, 9, 8, 7, 9, 7, 10 | 65 |
| C. Event-sourced only (no explicit states) | Derive state from event log | 6, 5, 7, 6, 9, 5, 8, 5 | 51 |

**Selected: A — Explicit 11-state lifecycle**

**Why:** User comprehension of "what is the system doing?" requires visible states like `needs_evidence`, `awaiting_confirmation`, `needs_human_review`. Testable transitions.

---

## Decision 5: Ontology Object Lifecycle

| Option | Description | Scores | Total |
|--------|-------------|--------|-------|
| **A. draft → awaiting_confirmation → active → … → archived** | As specified | 10, 9, 9, 10, 9, 9, 10, 8 | **74** |
| B. Reuse OperationalObjectStatus directly | Map 1:1 to existing statuses | 7, 10, 10, 8, 7, 7, 8, 10 | 69 |
| C. No lifecycle on ontology (status-free graph) | Relationships only | 6, 6, 8, 6, 8, 5, 7, 9 | 55 |

**Selected: A — Dedicated ontology lifecycle**

**Why:** Ontology objects include read-only registry projections and engine-generated drafts that need `awaiting_confirmation` distinct from operational object `ready`.

---

## Decision 6: Voice/Text Engine Invocation

| Option | Description | Scores | Total |
|--------|-------------|--------|-------|
| **A. Extend platform-actions with `engine.*` IDs** | Same registry, intent matcher, Realtime tool | 10, 10, 10, 10, 9, 8, 10, 9 | **76** |
| B. Separate engine command interpreter | Parallel to platform-actions | 6, 5, 6, 6, 7, 6, 7, 6 | 49 |
| C. Model-generated hrefs | LLM picks navigation target | 2, 1, 1, 2, 5, 3, 1, 8 | 23 |

**Selected: A — Extend platform-actions**

**Why:** Requirement #7: voice and text use same action registry. Forbidden arbitrary navigation.

---

## Decision 7: UI Integration Pattern

| Option | Description | Scores | Total |
|--------|-------------|--------|-------|
| **A. Reusable EngineWorkspace + route-specific entry panels** | Add engine panels to existing pages | 9, 10, 10, 9, 9, 9, 8, 8 | **72** |
| B. Replace each page with engine dashboard | Full page rewrite | 7, 2, 2, 7, 8, 5, 7, 3 | 41 |
| C. Modal-only engine UI | No route integration | 6, 8, 9, 7, 6, 6, 7, 9 | 58 |

**Selected: A — Reusable workspace + entry panels**

**Why:** Preserves existing surfaces. Avoids "every page becomes the same dashboard." Operating system feel via consistent workspace, not page homogenization.

---

## Decision 8: Migration Strategy

| Option | Description | Scores | Total |
|--------|-------------|--------|-------|
| **A. Lazy adapter hydration on read** | Ontology objects created from legacy records on first access | 9, 10, 10, 9, 8, 8, 9, 9 | **72** |
| B. One-time bulk migration script | Rewrite all localStorage on first load | 7, 7, 5, 8, 8, 7, 8, 6 | 56 |
| C. Dual-write from day one | Every store write also writes ontology | 6, 6, 4, 6, 7, 6, 7, 5 | 47 |

**Selected: A — Lazy adapter hydration**

**Why:** Idempotent, non-destructive, backward compatible. Unknown fields preserved. Legacy records untouched until explicitly bridged.

---

## Decision 9: Multilingual Meeting Engine Scope

| Option | Description | Scores | Total |
|--------|-------------|--------|-------|
| **A. Foundation only — translation policy, glossary, transcript objects** | Honest scope per mission brief | 10, 10, 10, 10, 9, 9, 10, 9 | **77** |
| B. Full simultaneous interpretation UI | Claim live interpretation | 3, 4, 3, 4, 6, 4, 4, 2 | 30 |
| C. Defer entirely | No meeting engine | 5, 10, 10, 5, 5, 5, 5, 10 | 55 |

**Selected: A — Foundation only**

**Why:** Mission explicitly forbids claiming simultaneous interpretation without real audio testing.

---

## Decision 10: Registry Entity Mapping

| Option | Description | Scores | Total |
|--------|-------------|--------|-------|
| **A. Read-only ontology projections from static catalogs** | `country-jpn` → ontology `country` with `sourceRef` | 10, 10, 10, 10, 8, 8, 10, 9 | **75** |
| B. Copy catalog into mutable ontology store | Duplicate data | 6, 5, 4, 6, 7, 7, 7, 5 | 47 |
| C. Replace catalogs with ontology store | Break existing adapters | 5, 2, 1, 5, 7, 6, 6, 3 | 35 |

**Selected: A — Read-only projections**

**Why:** Preserves 7/9/9 static entity records and all existing intelligence/coverage modules.

---

## Summary of Selected Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Voice / Text → Platform Actions (extended engine.*)        │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Forward-Deployed Engines (plan-only, 11-state lifecycle)   │
│  Research | Evidence | Country | Org | Mission | Gov | MT  │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  EngineWorkspace UI (objective → confirm → results)         │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Ontology Service (device-local, lazy migration)            │
│  28 kinds · typed relationships · provenance · audit       │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Legacy Adapters (Operational Objects, Project, Mission,    │
│  Registry, Research — records preserved, unknown fields kept) │
└─────────────────────────────────────────────────────────────┘
```

---

*Decisions recorded before implementation. See gap report for inventory baseline.*
