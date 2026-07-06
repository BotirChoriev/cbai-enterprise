# BUILD-057 Report — Scheduler Queue Bridge

**Build:** BUILD-057  
**Date:** July 2026  
**Scope:** Caller-driven Runtime Scheduler → Runtime Queue bridge for agent tasks  
**Status:** Complete — explicit evaluation only; no timers or workers

---

## Purpose

BUILD-057 introduces `lib/intelligence/agents/scheduler/` — the **Agent Scheduler Bridge**, connecting the Runtime Scheduler (BUILD-043) to Agent Queue Integration (BUILD-056).

Scheduled agent tasks become queued agent tasks when a **caller** invokes `evaluateReadyTasks(evaluatedAt)` — never automatically.

---

## Scheduler vs Queue

| Layer | Role |
|-------|------|
| **Runtime Scheduler** (BUILD-043) | Holds future `scheduledFor` execution plans |
| **Agent Task Store** (BUILD-052) | Holds `AgentTask` lifecycle records |
| **Runtime Queue** (BUILD-042) | Orders ready work for dispatch preparation |
| **Agent Scheduler Bridge** (BUILD-057) | Promotes due scheduled tasks into the queue |

The scheduler answers *when* work becomes eligible. The queue answers *what order* eligible work is processed. The bridge connects them without executing agents.

---

## Architecture

```
scheduleTask(task, scheduledFor)
  → AgentTaskStore (add/update, status unchanged or lifecycle-valid)
  → RuntimeScheduler.schedule()
  → NOT enqueued

evaluateReadyTasks(evaluatedAt)   ← caller-driven
  → listReadyAt(scheduler, evaluatedAt)
  → AgentQueueIntegration.enqueueTask() per ready item
  → optional cancel schedule item after enqueue
  → NOT dispatch, NOT execute

cancelScheduledTask(taskId)
  → RuntimeScheduler.cancel()
  → task status → cancelled when lifecycle allows
```

### New modules

| File | Responsibility |
|------|----------------|
| `scheduler/types.ts` | Policy, diagnostics, result types |
| `scheduler/agent-scheduler-state.ts` | Diagnostics builder, validation helpers |
| `scheduler/agent-scheduler-policy.ts` | Schedule/evaluate/cancel validation |
| `scheduler/agent-scheduler-bridge.ts` | `AgentSchedulerBridge` + default impl |
| `scheduler/index.ts` | Barrel exports |

### Modified modules

| File | Change |
|------|--------|
| `agents/index.ts` | Re-export scheduler bridge |
| `lib/intelligence/index.ts` | Public exports |
| `testing/test-harness.ts` | Clear scheduler between suite runs |
| `testing/test-scenarios.ts` | 3 scheduler bridge scenarios |

**Not modified:** UI, Intelligence algorithms, Evidence, Confidence, Trust, Agent Execution, Scheduler internals, auto-dequeue loops.

---

## Operations

### scheduleTask(task, scheduledFor)

1. Validate policy (non-terminal, no duplicate task id, not past `scheduledFor`)
2. Add task to `AgentTaskStore` if missing
3. Create `RuntimeScheduler` schedule item
4. Does **not** enqueue immediately

### evaluateReadyTasks(evaluatedAt)

1. Require explicit `evaluatedAt` (policy)
2. List ready schedule items at timestamp
3. Enqueue each via `AgentQueueIntegration`
4. Cancel schedule item after successful enqueue (default policy)
5. Does **not** dispatch or execute

### cancelScheduledTask(taskId)

1. Cancel matching schedule item
2. Update task to `cancelled` when lifecycle allows
3. Clear bridge task ↔ schedule mappings

### Diagnostics

| Field | Description |
|-------|-------------|
| `scheduleItemId` | Runtime schedule item id |
| `taskId` | Agent task id |
| `taskStatus` | Task lifecycle status |
| `scheduleStatus` | Schedule item status |
| `queued` | Whether task was promoted to queue |
| `warnings` | Non-blocking warnings |

---

## Why caller-driven evaluation

Cloudflare Pages requires edge-compatible, stateless execution:

- No `setInterval`, cron, or background workers
- No browser storage or persistent timers
- Caller decides when to poll `evaluateReadyTasks`

This matches BUILD-043 scheduler design — ready detection is deterministic given an explicit timestamp.

---

## Why no timers/workers

Automatic polling would imply:

- Long-running processes incompatible with serverless edge
- Hidden execution paths bypassing policy and diagnostics
- Premature dispatch/execution wiring

BUILD-057 stops at explicit queue promotion.

---

## Future background worker path

```
Future worker / automation (not BUILD-057)
        ↓
Caller or worker: evaluateReadyTasks(now)
        ↓
AgentQueueIntegration.dequeueTask()
        ↓
Dispatch Integration → Execution Coordinator
```

Worker infrastructure remains a separate build.

---

## Future automation path

```
External cron / Cloudflare Cron Trigger (future)
        ↓
HTTP handler invokes evaluateReadyTasks(evaluatedAt)
        ↓
Queue → Dispatch → Execution under Runtime policy
```

Scheduler and bridge are ready; automation wiring is deferred.

---

## Test harness scenarios

| Scenario | Validates |
|----------|-----------|
| `agent-scheduler-schedule` | Task stored, schedule item created, queue empty |
| `agent-scheduler-ready-to-queue` | Due task promoted to queue with `queued` diagnostics |
| `agent-scheduler-cancel` | Schedule cancelled, task status cancelled |

---

## Verification

```bash
npm run lint
npm run build
# Intelligence Test Harness — 27/27 scenarios
```

---

## Summary

BUILD-057 bridges Runtime Scheduler and Agent Queue Integration with caller-driven ready evaluation. No timers, workers, auto-dequeue, dispatch, or execution — those remain future work.
