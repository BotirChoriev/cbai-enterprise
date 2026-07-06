# BUILD-059 Report — Runtime Worker Abstraction

**Build:** BUILD-059  
**Date:** July 2026  
**Scope:** Caller-driven Runtime Worker abstraction for future runtime coordination  
**Status:** Complete — abstraction only; no automatic execution

---

## Purpose

BUILD-059 introduces `lib/intelligence/runtime/worker/` — the **Runtime Worker Abstraction** for CBAI Enterprise Intelligence Runtime.

The Worker is responsible for **coordinating** future runtime processing by orchestrating existing integrations:

- Agent Scheduler Bridge (BUILD-057)
- Agent Queue Integration (BUILD-056)
- Agent Task Store (BUILD-052)

This build creates the abstraction only. The Worker does **not** execute automatically. All methods are deterministic and caller-driven.

---

## Worker Abstraction

### Lifecycle

```
created → initialize() → initialized → start() → running → stop() → stopped
```

| Method | Behavior |
|--------|----------|
| `initialize()` | Prepare internal state only |
| `start()` | Move to running — no loops, no timers |
| `stop()` | Move to stopped |
| `tick()` | Single evaluation cycle: evaluate scheduler + dequeue one task |
| `processNext()` | Exactly one processing step |
| `snapshot()` | Return diagnostics snapshot |

### tick() cycle

When running, `tick()` may:

1. **Evaluate scheduler** — `schedulerBridge.evaluateReadyTasks(evaluatedAt)`
2. **Dequeue one task** — `queueIntegration.dequeueTask()`

It must **not**:

- Execute agents
- Call AI providers
- Start background threads or timers

### processNext() step

Performs **one** deterministic step in priority order (configurable via policy):

1. `schedule_evaluate` — if scheduler has due items
2. `dequeue` — if queue has pending items
3. `idle` — no work available

---

## Architecture

```
DefaultRuntimeWorker
  ├─ worker-context.ts    Resolved deps (store, bridge, queue integration)
  ├─ worker-state.ts      Lifecycle transitions + snapshot builders
  ├─ worker-policy.ts     Validation + step resolution
  └─ worker.ts            RuntimeWorker contract + DefaultRuntimeWorker
```

### Diagnostics

`snapshot()` returns:

| Field | Description |
|-------|-------------|
| `workerState` | `created \| initialized \| running \| stopped` |
| `processedItems` | Cumulative scheduler enqueues + dequeues |
| `warnings` | Non-blocking warnings from operations |
| `lastTick` | ISO-8601 timestamp of last successful tick |

### New modules

| File | Responsibility |
|------|----------------|
| `worker/types.ts` | Worker types, policy, results |
| `worker/worker-context.ts` | Dependency resolution |
| `worker/worker-state.ts` | State machine + snapshot builders |
| `worker/worker-policy.ts` | Validation and step resolution |
| `worker/worker.ts` | `RuntimeWorker` + default impl |
| `worker/index.ts` | Barrel exports |

### Modified modules

| File | Change |
|------|--------|
| `runtime/index.ts` | Worker exports |
| `lib/intelligence/index.ts` | Public worker exports |
| `testing/test-scenarios.ts` | 3 worker scenarios |

**Not modified:** UI, dashboard, Intelligence algorithms, Evidence, Confidence, Trust, Queue implementation, Scheduler implementation, Agent Runtime Contract, Local Runtime Adapter.

---

## Why Deterministic

1. **No automatic execution** — every operation requires an explicit caller invocation.
2. **No timers or polling** — `evaluatedAt` is caller-supplied or uses a single timestamp at call time.
3. **No AI providers** — worker stops at dequeue; dispatch and execution remain separate.
4. **Injectable dependencies** — isolated instances for test harness scenarios.
5. **Cloudflare Pages compatible** — pure TypeScript, no Node-only or browser APIs.

Determinism ensures reproducible test harness validation and predictable future dashboard integration.

---

## Test Harness Scenarios

| Scenario | Validates |
|----------|-----------|
| `worker-initialize` | `created → initialized`, duplicate init rejected |
| `worker-tick` | Scheduler evaluate + dequeue in one tick, `processedItems` and `lastTick` |
| `worker-stop` | `running → stopped`, tick rejected after stop |

Scenarios use isolated store/queue/scheduler/bridge/worker instances.

---

## Future Background Worker

The abstraction is designed for a future build that may:

1. Wrap `DefaultRuntimeWorker` in a platform-specific loop (Node worker thread, Cloudflare Durable Object alarm).
2. Call `tick()` or `processNext()` on a schedule **outside** the intelligence library.
3. Wire observability (BUILD-058) before/after each tick for health reporting.

The intelligence library itself will remain free of timers and background threads.

---

## Future Cloud Execution

For cloud deployments:

1. **Edge cron / queue consumer** invokes `processNext({ evaluatedAt })` per message.
2. **Durable Object** holds worker state across invocations; `snapshot()` serializes for persistence layer (external to this build).
3. **Multi-step pipelines** chain `processNext()` until `idle`, then hand dequeued tasks to dispatch/execution layers separately.

Agent execution and AI provider calls remain outside the Worker boundary by design.

---

## Public API

```typescript
import {
  DefaultRuntimeWorker,
  defaultRuntimeWorker,
  type RuntimeWorker,
} from "@/lib/intelligence";

const worker = new DefaultRuntimeWorker({ taskStore, queueIntegration, schedulerBridge, scheduler, queue });

worker.initialize();
worker.start();
const tick = worker.tick({ evaluatedAt: "2026-07-06T00:00:00.000Z" });
const step = worker.processNext({ evaluatedAt: "2026-07-06T00:00:00.000Z" });
worker.stop();
const diagnostics = worker.snapshot();
```

No automatic runtime wiring is performed in BUILD-059.

---

## Verification

- `npm run lint`
- `npm run build`
- Intelligence Test Harness (33 scenarios including 3 worker scenarios)

---

## Summary

BUILD-059 establishes the Runtime Worker Abstraction — a deterministic, caller-driven coordination layer atop Scheduler Bridge and Queue Integration. It prepares the enterprise runtime for future background processing and cloud execution without modifying core queue, scheduler, or agent execution behavior.
