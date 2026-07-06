# BUILD-048 Report — Agent Task Model

**Build:** BUILD-048  
**Date:** July 2026  
**Scope:** Agent Task contracts and lifecycle foundation  
**Status:** Complete — metadata only; no execution or runtime wiring

---

## Purpose

BUILD-048 introduces `lib/intelligence/agents/tasks/` — the **Agent Task Model**, representing one unit of work assigned to an Intelligence Agent.

Tasks capture intent, scope, priority, lifecycle state, and structural result references — without executing agents, calling AI providers, or producing fabricated intelligence.

---

## Task vs Runtime Session vs Agent

| Concept | Role |
|---------|------|
| **Agent** (BUILD-046) | Catalog entry — who can do work (metadata, capabilities) |
| **Agent Task** (BUILD-048) | One unit of work assigned to an agent |
| **Runtime Session** (BUILD-041) | How a single intelligence execution lives |

A task **references** an `agentId`, optional `runtimeSessionId`, and `requestId` but does not drive runtime execution in BUILD-048. Future Agent Runtime will bind tasks to sessions and contracts.

---

## Architecture

```
Agent Registry (BUILD-046) — who
        ↓
Agent Task (BUILD-048) — what unit of work
        ↓
Agent Runtime Contract (BUILD-047) — how agent plugs in
        ↓
Runtime Session (BUILD-041) — how execution lives
        ↓
Future: task dispatch and execution   ← not wired
```

### New modules

| File | Responsibility |
|------|----------------|
| `tasks/types.ts` | Shared constraints, context, reference types |
| `tasks/task-priority.ts` | Priority tiers and comparison |
| `tasks/task-lifecycle.ts` | Status states and transition validation |
| `tasks/task-request.ts` | Task request envelope |
| `tasks/task-result.ts` | Task result envelope (no business intelligence) |
| `tasks/task.ts` | `AgentTask` model and validation |
| `tasks/index.ts` | Barrel exports |

### Modified modules

| File | Change |
|------|--------|
| `agents/index.ts` | Re-exports task model |
| `lib/intelligence/index.ts` | Public exports |

**Not modified:** Runtime, Queue, Scheduler, Session Registry, Agent Registry, Agent Runtime Contract, evidence, confidence, trust, UI.

---

## AgentTask

| Field | Description |
|-------|-------------|
| `id` | Unique task identifier |
| `agentId` | Assigned agent from registry |
| `runtimeSessionId` | Optional session reference |
| `requestId` | Source intelligence request id |
| `title` / `description` | Factual task metadata |
| `priority` | Dispatch priority tier |
| `status` | Lifecycle status |
| `taskRequest` | Intent, capabilities, entities, context, constraints |
| `createdAt` / `updatedAt` | ISO-8601 timestamps |
| `startedAt` / `finishedAt` | Reserved for future execution |
| `timeoutAt` | Optional deadline |

---

## Task Request

| Field | Description |
|-------|-------------|
| `intent` | Query intent (`QueryIntent`) |
| `requestedCapabilities` | Capability tags for dispatch matching |
| `subjectEntities` | Entity scope (`EntityRef[]`) |
| `context` | Tenant, conversation, session refs, tags |
| `constraints` | maxDurationMs, deadlineAt, required capabilities, notes |

---

## Task Result

| Field | Description |
|-------|-------------|
| `status` | `pending` \| `completed` \| `failed` \| `cancelled` \| `timeout` \| `unsupported` |
| `warnings` | Non-blocking messages |
| `errors` | Terminal error messages |
| `diagnosticsReference` | Id/source pointer only |
| `resultReference` | Id/kind pointer only |

No business conclusions or model output in task results.

---

## Lifecycle

| Status | Meaning |
|--------|---------|
| `created` | New task |
| `queued` | Accepted into backlog |
| `ready` | Ready for dispatch |
| `running` | Execution in progress (reserved) |
| `completed` | Successful terminal state |
| `failed` | Failed terminal state |
| `cancelled` | Cancelled terminal state |
| `timeout` | Timed out terminal state |

`validateTaskLifecycleTransition(from, to)` enforces allowed transitions deterministically.

---

## Priority

`critical` > `high` > `normal` > `low` > `background`

`compareTaskPriority` and `sortAgentTasks` provide deterministic ordering.

---

## Validation Helpers

| Helper | Purpose |
|--------|---------|
| `validateTaskRequest` | Request envelope fields and constraints |
| `validateAgentTask` | Full task record integrity |
| `validateTaskResult` | Result envelope consistency |
| `validateTaskLifecycleTransition` | Allowed status transitions |

---

## Future Agent Runtime

1. Create `AgentTask` when dispatching work to an enabled agent.
2. Transition lifecycle: `created` → `queued` → `ready` → `running`.
3. Bind `runtimeSessionId` when Runtime Session starts.
4. Invoke `AgentRuntimeContract` on ready tasks.
5. Populate `TaskResult` references from diagnostics and result artifacts.

---

## Future Multi-Agent Execution

1. Planner decomposes work into multiple `AgentTask` records.
2. Tasks sorted by `compareTaskPriority` for dispatch order.
3. Capability matching via `requestedCapabilities` and registry.
4. Parallel tasks reference distinct agents and session ids.
5. Coordinator aggregates `TaskResult` references — not fabricated content.

---

## Cloudflare Compatibility

- Pure TypeScript — no SDKs, timers, workers, or browser storage
- Deterministic validation and lifecycle rules
- Edge-safe metadata envelopes

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

BUILD-048 adds the Agent Task Model — contracts and lifecycle for one unit of agent work. Execution, runtime wiring, and multi-agent orchestration are deferred to future builds.
