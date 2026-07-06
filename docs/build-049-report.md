# BUILD-049 Report — Agent Dispatch Foundation

**Build:** BUILD-049  
**Date:** July 2026  
**Scope:** Deterministic Agent Dispatcher for task-to-agent selection  
**Status:** Complete — selection only; no execution or runtime wiring

---

## Purpose

BUILD-049 introduces `lib/intelligence/agents/dispatch/` — the **Agent Dispatch Foundation**, responsible for selecting an Intelligence Agent for an `AgentTask`.

The dispatcher performs **deterministic agent selection** using registry metadata, task requirements, and configurable policies. It does **not** execute agents, call provider SDKs, or wire into Runtime.

---

## Architecture

```
AgentTask (BUILD-048)
        +
AgentDefinition[] from Registry (BUILD-046)
        +
DispatchPolicy
        ↓
AgentDispatcher.dispatch(input)
        ↓
DispatchResult { selectedAgentId, decision, reason, candidateAgents }
        ↓
Future: Agent Runtime executes selected agent   ← not wired
```

### New modules

| File | Responsibility |
|------|----------------|
| `dispatch/types.ts` | Policy, decision, candidate types |
| `dispatch/dispatch-context.ts` | Context envelope and policy defaults |
| `dispatch/dispatch-result.ts` | Result envelope builder |
| `dispatch/dispatch-policy.ts` | Eligibility rules and selection algorithms |
| `dispatch/dispatcher.ts` | `AgentDispatcher` + `DefaultAgentDispatcher` |
| `dispatch/index.ts` | Barrel exports |

### Modified modules

| File | Change |
|------|--------|
| `agents/index.ts` | Re-exports dispatch module |
| `lib/intelligence/index.ts` | Public exports |

**Not modified:** Runtime, Queue, Scheduler, Session Registry, Agent Runtime Contract, intelligence algorithms, UI.

---

## AgentDispatcher Interface

| Method | Behavior |
|--------|----------|
| `dispatch(input)` | Full selection with `DispatchResult` |
| `selectAgent(input)` | Returns selected agent id or null |
| `validateAssignment(...)` | Validates a specific agent id for a task |
| `explainSelection(input)` | Deterministic explanation string |

---

## Dispatch Context

| Field | Description |
|-------|-------------|
| `task` | `AgentTask` requiring selection |
| `availableAgents` | Agent definitions from registry |
| `runtimeSessionId` | Optional session reference (not wired) |
| `intelligenceType` | Optional intelligence product type for matching |
| `policy` | Active dispatch policy |
| `evaluatedAt` | Optional evaluation timestamp |

---

## Dispatch Result

| Field | Description |
|-------|-------------|
| `selectedAgentId` | Chosen agent id or null |
| `decision` | `selected` \| `rejected` \| `deferred` \| `unsupported` |
| `reason` | Deterministic selection reason |
| `warnings` | Non-blocking warnings |
| `candidateAgents` | All evaluated candidates with eligibility |
| `timestamp` | ISO-8601 evaluation time |
| `dispatchVersion` | Semantic version |

---

## Selection Rules

Agents are **rejected** when:

| Rule | Condition |
|------|-----------|
| Disabled | `status === "disabled"` |
| Deprecated | `status === "deprecated"` |
| Not enabled | `status !== "enabled"` |
| Capability mismatch | Missing any `requestedCapabilities` |
| Entity mismatch | Subject entity type not in `supportedEntityTypes` (when declared) |
| Intelligence mismatch | `intelligenceType` not in `supportedIntelligenceTypes` (when declared) |

Selection is **deterministic** — same inputs produce the same agent id.

---

## Dispatch Policies

| Policy | Behavior |
|--------|----------|
| `first-matching-agent` | First eligible agent by sorted id (default) |
| `highest-capability-score` | Highest capability match count; tie-break by id |
| `single-agent-only` | Only evaluates `task.agentId` |
| `future-multi-agent` | Reserved — returns `unsupported` |

---

## Relationship with Runtime

| Layer | Role |
|-------|------|
| **Runtime Session** | How execution lives |
| **Agent Task** | One unit of work |
| **Agent Dispatcher** | Which agent should handle the task |

The dispatcher accepts an optional `runtimeSessionId` reference but does not create or mutate runtime sessions in BUILD-049.

---

## Relationship with Agent Registry

The dispatcher consumes **`AgentDefinition[]`** from the registry — it does not modify registry state. Registry provides catalog metadata; dispatcher applies selection rules against that metadata.

Typical future flow:

1. Load enabled agents from registry.
2. Build `AgentTask`.
3. Call `defaultAgentDispatcher.dispatch({ task, availableAgents })`.
4. Use `selectedAgentId` for runtime contract invocation (future build).

---

## Future Multi-Agent Dispatch

The `future-multi-agent` policy mode is reserved. BUILD-049 returns `decision: "unsupported"` with an explanatory reason. Future builds may:

1. Select multiple agents for parallel sub-tasks.
2. Return ordered agent id lists in `DispatchResult`.
3. Coordinate via task graph orchestration.

---

## Cloudflare Compatibility

- Pure TypeScript — no SDKs, timers, workers, or browser storage
- Deterministic sorting and scoring
- Edge-safe metadata-only selection

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

BUILD-049 adds deterministic agent selection for tasks with configurable policies and full candidate audit trails. Agent execution and runtime wiring are deferred to future builds.
