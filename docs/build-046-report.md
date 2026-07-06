# BUILD-046 Report — Agent Registry Foundation

**Build:** BUILD-046  
**Date:** July 2026  
**Scope:** In-memory Agent Registry for Intelligence Agent metadata  
**Status:** Complete — catalog only; no agent execution or runtime integration

---

## Purpose

BUILD-046 introduces `lib/intelligence/agents/registry/` — the **Agent Registry**, a central catalog of every Intelligence Agent in the CBAI system.

The registry manages **metadata, lookup, lifecycle state, and capabilities** only. It does **not** execute agents, call AI models, connect to external APIs, or integrate with the Runtime layer.

---

## Registry Architecture

```
AgentRegisterInput (metadata only)
        ↓
AgentRegistry.register(input)
        ↓
AgentDefinition stored in-memory
        ↓
get | list | queryByCapability | queryByStatus | queryByCategory
        ↓
snapshot() → counts, categories, version
        ↓
Future: Agent Runtime dispatches to enabled agents   ← not in BUILD-046
```

### New modules

| File | Responsibility |
|------|----------------|
| `registry/types.ts` | Agent definition, status, snapshot types |
| `registry/agent-capabilities.ts` | Capability constants and normalization |
| `registry/agent-definition.ts` | Create, update, validate agent definitions |
| `registry/agent-state.ts` | Snapshot builder and filter helpers |
| `registry/agent-registry.ts` | `AgentRegistry` + `DefaultAgentRegistry` |
| `registry/index.ts` | Barrel exports |
| `agents/index.ts` | Agents layer public exports |

### Modified modules

| File | Change |
|------|--------|
| `lib/intelligence/index.ts` | Public agent registry exports |

**Not modified:** Runtime, Queue, Scheduler, Session Registry, Orchestrator, UI, EF, evidence, confidence, trust.

---

## Agent Definition

Each agent stores metadata only:

| Field | Description |
|-------|-------------|
| `id` | Unique agent identifier |
| `name` | Human-readable name |
| `version` | Semantic version string |
| `description` | Factual purpose description |
| `category` | Registry grouping label |
| `status` | Lifecycle status |
| `capabilities` | Declared capability tags |
| `supportedEntityTypes` | Declared entity type support |
| `supportedIntelligenceTypes` | Declared intelligence product support |
| `createdAt` / `updatedAt` | ISO-8601 timestamps |

---

## Lifecycle

| Status | Meaning |
|--------|---------|
| `registered` | Newly cataloged; default on register |
| `enabled` | Available for future dispatch |
| `disabled` | Temporarily unavailable |
| `deprecated` | Retained for audit; should not be selected |

Lifecycle is metadata only — no execution side effects in BUILD-046.

---

## Capabilities

Declared capability tags (metadata only):

`research`, `reasoning`, `knowledge`, `search`, `graph`, `automation`, `analysis`, `planning`, `summarization`

Capabilities describe **what an agent declares it can do** — not what it actually executes. Invalid capability strings are filtered out during normalization.

Query helpers:

- `queryByCapability(registry, capability)`
- `queryByStatus(registry, status)`
- `queryByCategory(registry, category)`

---

## AgentRegistry Interface

| Method | Behavior |
|--------|----------|
| `register(input)` | Add agent; reject duplicate ids |
| `update(agentId, input)` | Partial metadata update |
| `remove(agentId)` | Remove agent; return removed copy |
| `get(agentId)` | Retrieve agent by id |
| `list()` | All agents in deterministic id order |
| `snapshot()` | Immutable counts and categories |
| `clear()` | Remove all agents |

---

## Registry Snapshot

| Field | Description |
|-------|-------------|
| `total` | All tracked agents |
| `enabled` | Agents with `enabled` status |
| `disabled` | Agents with `disabled` status |
| `deprecated` | Agents with `deprecated` status |
| `categories` | Distinct categories (sorted) |
| `registryVersion` | Semantic version string |

---

## Future Agent Runtime

1. **Dispatch layer** reads `queryByStatus(registry, "enabled")` and matches capabilities to request intent.
2. **Session binding** links agent id to `RuntimeSession` in Session Registry.
3. **Policy Engine** evaluates whether an agent may run for a given trust/confidence context.
4. **Execution adapter** invokes agent handler — separate from registry catalog.

The registry remains the **source of truth for agent metadata**; runtime executes elsewhere.

---

## Future Multi-Agent System

1. **Orchestration graph** — multiple enabled agents collaborate on sub-tasks.
2. **Capability routing** — planner selects agents via `queryByCapability`.
3. **Category teams** — research agents, analysis agents, etc. grouped by `category`.
4. **Lifecycle governance** — deprecate agents without deleting audit history.
5. **Version management** — register new versions; deprecate old definitions.

BUILD-046 establishes the catalog contract multi-agent orchestration will build on.

---

## Cloudflare Compatibility

- Pure TypeScript — no Node-only APIs, timers, workers, or browser storage
- In-memory `Map` — edge-safe within a single process or isolate
- No external APIs or AI model calls
- Deterministic ordering and snapshots for testing

---

## Verification

```bash
npm run lint
npm run build
# Test harness: runIntelligenceTestSuite()
```

Expected: lint clean, build succeeds (18 static routes), test harness 9/9 scenarios pass.

---

## Summary

BUILD-046 adds an in-memory Agent Registry for Intelligence Agent metadata with lifecycle states, capability tags, deterministic queries, and snapshots. Agent execution and runtime integration are deferred to future builds.
