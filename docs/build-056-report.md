# BUILD-056 Report — Agent Queue Integration

**Build:** BUILD-056  
**Date:** July 2026  
**Scope:** Connect Agent Task Store with Runtime Queue  
**Status:** Complete — enqueue/dequeue only; no auto execution

---

## Purpose

BUILD-056 introduces `lib/intelligence/agents/queue/` — the **Agent Queue Integration** layer. It bridges agent task records and the runtime queue so tasks can be queued and dequeued for future dispatch and execution preparation.

This build does not run agents, call dispatchers automatically, or wire the scheduler.

---

## Queue vs Task Store

| Layer | Role |
|-------|------|
| **Agent Task Store** (BUILD-052) | Holds `AgentTask` records with lifecycle metadata |
| **Runtime Queue** (BUILD-042) | Orders intelligence request ids for deferred processing |
| **Agent Queue Integration** (BUILD-056) | Synchronizes tasks into the store and queue together |

The task store answers *what* work exists. The runtime queue answers *when* work is picked up. Integration keeps both aligned without executing agents.

---

## Architecture

```
AgentTask
        ↓
AgentQueueIntegration.enqueueTask()
  → validate policy
  → AgentTaskStore.add/update (status → queued)
  → RuntimeQueue.enqueue(requestId, priority)
        ↓
AgentQueueIntegration.dequeueTask()
  → RuntimeQueue.dequeue() → running
  → resolve AgentTask from store
  → return diagnostics (readyForDispatch)
        ↓
Future: Dispatch Integration / Execution Coordinator   ← not wired
```

### New modules

| File | Responsibility |
|------|----------------|
| `queue/types.ts` | Policy, diagnostics, enqueue/dequeue result types |
| `queue/agent-queue-state.ts` | Priority mapping, diagnostics builder, readiness |
| `queue/agent-queue-policy.ts` | Enqueue/dequeue validation |
| `queue/agent-queue-integration.ts` | `AgentQueueIntegration` + default impl |
| `queue/index.ts` | Barrel exports |

### Modified modules

| File | Change |
|------|--------|
| `agents/index.ts` | Re-export queue integration |
| `lib/intelligence/index.ts` | Public exports |
| `testing/test-harness.ts` | Clear runtime queue between suite runs |
| `testing/test-scenarios.ts` | 3 queue integration scenarios |

**Not modified:** UI, Intelligence algorithms, Evidence, Confidence, Trust, Scheduler, Session Registry, auto-dispatch, agent execution.

---

## Operations

### enqueueTask(task)

1. Validate policy (non-terminal, lifecycle, no duplicate task id)
2. Add task to `AgentTaskStore` if missing
3. Transition status `created` → `queued` when valid
4. Enqueue `requestId` on `RuntimeQueue` with mapped priority
5. Return diagnostics

### dequeueTask()

1. Dequeue next pending item from `RuntimeQueue` (→ `running`)
2. Resolve matching `AgentTask` from store by task id mapping / request id
3. Return task + queue item + diagnostics
4. Does **not** execute agent or call dispatcher

### Diagnostics

| Field | Description |
|-------|-------------|
| `queueItemId` | Runtime queue item id |
| `taskId` | Agent task id |
| `taskStatus` | Task lifecycle status |
| `queueStatus` | Queue item status |
| `warnings` | Non-blocking warnings |
| `readyForDispatch` | True when dequeued task is eligible for dispatch prep |

### Policies

- Reject duplicate task id in active queue
- Reject terminal tasks
- Reject missing task on dequeue
- Preserve task lifecycle transition validation

---

## Why no auto execution

BUILD-056 establishes **queue plumbing** only:

- No scheduler polling or auto-dequeue loops
- No dispatcher invocation on dequeue
- No agent runtime execute() calls
- No external services or AI models

Automatic processing requires a worker layer deferred to future builds.

---

## Future scheduler bridge

```
Runtime Scheduler (BUILD-043)
        ↓
Future: schedule tick → AgentQueueIntegration.dequeueTask()
        ↓
Dispatch Integration → Execution Coordinator
```

Scheduler remains unwired — connecting it prematurely would imply background workers incompatible with Cloudflare Pages constraints until a deliberate worker build.

---

## Future worker path

```
Worker / poller (future)
        ↓
dequeueTask() → readyForDispatch
        ↓
prepareDispatch() → runAgentExecutionPipeline()
        ↓
Runtime observability via Session Registry
```

---

## Test harness scenarios

| Scenario | Validates |
|----------|-----------|
| `agent-queue-enqueue` | Task queued in store + pending queue item |
| `agent-queue-dequeue` | Task resolved; queue item running; readyForDispatch |
| `agent-queue-reject-terminal-task` | Terminal task rejected; queue empty |

---

## Cloudflare compatibility

- Pure in-memory TypeScript
- No timers, workers, browser storage, or external APIs
- Synchronous enqueue/dequeue within caller context

---

## Verification

```bash
npm run lint
npm run build
# Intelligence Test Harness — 24/24 scenarios
```

---

## Summary

BUILD-056 connects Agent Task Store and Runtime Queue with policy-gated enqueue/dequeue and diagnostics. Scheduler wiring, auto-dequeue, and dispatch execution remain deferred.
