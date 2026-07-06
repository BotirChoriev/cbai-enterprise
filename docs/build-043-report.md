# BUILD-043 Report — Runtime Scheduler Foundation

**Build:** BUILD-043  
**Date:** July 2026  
**Scope:** In-memory Runtime Scheduler foundation for future scheduled executions  
**Status:** Complete — foundation only; not wired to Orchestrator or Queue

---

## Purpose

BUILD-043 introduces `lib/intelligence/runtime/scheduler/` — an **in-memory Runtime Scheduler** that prepares the CBAI Intelligence Runtime for future **time-based** intelligence executions.

The scheduler accepts intelligence request ids with a target `scheduledFor` timestamp, tracks item lifecycle, enforces scheduling policies, exposes immutable state snapshots, and provides deterministic **ready detection** — without timers, workers, persistence, or orchestrator integration.

---

## Queue vs Scheduler

| Aspect | Runtime Queue (BUILD-042) | Runtime Scheduler (BUILD-043) |
|--------|---------------------------|-------------------------------|
| **Trigger** | Immediate dispatch (FIFO / priority) | Future time (`scheduledFor`) |
| **Primary action** | `enqueue` → `dequeue` | `schedule` → `listReadyAt(timestamp)` |
| **Time dimension** | None — items are ready when enqueued | Items become ready when `scheduledFor <= evaluatedAt` |
| **Execution model** | Worker pulls next pending item | External caller polls ready items at a timestamp |
| **Status lifecycle** | pending → running → completed/failed | scheduled → cancelled (expired is computed, not stored) |
| **Use case** | Backlog, throttling, retry queues | Cron-like plans, delayed runs, agent schedules |

Both layers are **in-memory foundations**. Neither executes intelligence runs in BUILD-043.

---

## Architecture

```
Future Automation (not in BUILD-043)
        ↓
RuntimeScheduler.schedule({ requestId, scheduledFor, priority })
        ↓
External caller: listReadyAt(scheduler, evaluatedAt)
        ↓
Future: RuntimeQueue.enqueue(readyItem)   ← not wired yet
        ↓
Future: Orchestrator.execute(request)     ← not wired yet
```

### New modules

| File | Responsibility |
|------|----------------|
| `scheduler/types.ts` | Schedule item, policy, snapshot types |
| `scheduler/schedule-item.ts` | Item creation, cancellation, ready/expired helpers |
| `scheduler/schedule-policy.ts` | Limits, duplicate rejection, past-time rejection |
| `scheduler/schedule-state.ts` | Snapshot builder, ready list helper |
| `scheduler/scheduler.ts` | `RuntimeScheduler` + `DefaultRuntimeScheduler` |
| `scheduler/index.ts` | Barrel exports |

### Modified modules

| File | Change |
|------|--------|
| `runtime/index.ts` | Re-exports scheduler module |
| `index.ts` | Public exports |

**Not modified:** Orchestrator, Engine pipeline, Queue wiring, UI, adapters, algorithms.

---

## RuntimeScheduler Interface

| Method | Behavior |
|--------|----------|
| `schedule(input)` | Add item; returns accepted/rejected with reason |
| `cancel(itemId, reason?)` | Mark item cancelled; returns updated item or null |
| `get(itemId)` | Retrieve item by id (copy) |
| `list()` | All items in deterministic `createdAt` order |
| `snapshot(evaluatedAt?)` | Immutable counts: total, scheduled, cancelled, expired, readyCount |
| `clear()` | Remove all items |

### Ready detection

`listReadyAt(scheduler, evaluatedAt)` returns items where:

- `status === "scheduled"`
- `scheduledFor <= evaluatedAt`

Sorted deterministically: higher `priority` first, then earlier `scheduledFor`, then `id`.

**No auto-execution.** The caller decides when to poll and what to do with ready items.

---

## ScheduleItem

| Field | Description |
|-------|-------------|
| `id` | Unique schedule item identifier |
| `requestId` | Intelligence request id |
| `status` | `scheduled` \| `cancelled` |
| `scheduledFor` | ISO-8601 target ready time |
| `createdAt` / `updatedAt` | ISO-8601 timestamps |
| `cancelledAt` | ISO-8601 when cancelled |
| `reason` | Optional factual note |
| `priority` | Stored for future dispatch ordering only |

---

## Scheduler Policies

| Policy | Default | Behavior |
|--------|---------|----------|
| `maxScheduledItems` | 100 | Reject when capacity reached |
| `rejectDuplicateRequestId` | true | Reject when active scheduled item exists for request id |
| `rejectPastScheduledTime` | true | Reject when `scheduledFor < referenceAt` |
| `cancellationRequiredBeforeReschedule` | true | Same request id must be cancelled before new schedule |

Priority is **storage only** in BUILD-043 — used for ready-list ordering, not execution.

---

## Schedule State Snapshot

| Field | Description |
|-------|-------------|
| `total` | All items tracked |
| `scheduled` | Active future schedules (`status === scheduled`, not expired) |
| `cancelled` | Cancelled items |
| `expired` | Scheduled items past `scheduledFor` at `evaluatedAt` |
| `readyCount` | Items ready at `evaluatedAt` |
| `evaluatedAt` | Timestamp used for ready/expired evaluation |
| `policy` | Active policy copy |
| `schedulerVersion` | Semantic version string |

---

## Why No Timers or Workers Yet

1. **Cloudflare Pages compatibility** — edge/static deployments have no long-lived Node process, `setInterval`, cron daemons, or background workers.
2. **Deterministic foundation** — scheduling logic must be testable without wall-clock races.
3. **Separation of concerns** — BUILD-043 defines *what* is scheduled and *when* it is ready; future builds wire *who* polls and *how* execution starts.
4. **No fabricated intelligence** — the scheduler tracks request ids and timestamps only; it never runs models or generates outputs.

---

## Future Automation Path

1. **External poller** (Cloudflare Cron Trigger, CI job, or admin API) calls `listReadyAt(scheduler, now)` on each tick.
2. Ready items move to **Runtime Queue** via `enqueue({ requestId, priority })`.
3. **Runtime worker** dequeues and invokes **Orchestrator**.
4. Completed schedules are cancelled or archived by policy.

This keeps timer/cron logic outside the intelligence library while the scheduler remains pure and portable.

---

## Future Agent Scheduler Path

Agent-driven workflows can use the same scheduler:

1. Agent plans a follow-up intelligence run → `schedule({ requestId, scheduledFor })`.
2. Agent or orchestration layer polls `snapshot()` and `listReadyAt()` for visibility.
3. When ready, agent confirms context and enqueues execution.
4. Cancellation supports replanning: `cancel(itemId)` before rescheduling the same request id.

Priority storage enables agent priority queues without changing the scheduler contract.

---

## Cloudflare Compatibility

- **Pure TypeScript** — no Node-only APIs, no `setTimeout`/`setInterval`, no `Worker` threads.
- **In-memory only** — no database, no KV, no browser `localStorage`.
- **Stateless-friendly** — each invocation can construct a fresh scheduler or receive state from a future persistence layer.
- **Edge-safe** — runs identically in Cloudflare Pages Functions, SSR, or unit tests.

---

## Verification

```bash
npm run lint
npm run build
```

Expected: lint clean; build succeeds with existing static routes unchanged.

---

## Summary

BUILD-043 adds a deterministic, in-memory Runtime Scheduler that complements the Runtime Queue. The queue handles *immediate* backlog; the scheduler handles *future* readiness. Ready detection is explicit and caller-driven. Orchestrator and Queue integration are deferred to future builds.
