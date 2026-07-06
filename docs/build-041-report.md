# BUILD-041 Report — Intelligence Runtime

**Build:** BUILD-041  
**Date:** July 2026  
**Scope:** Runtime layer for single intelligence execution lifecycle  
**Status:** Complete — orchestrator integration; no algorithm changes

---

## Purpose

BUILD-041 introduces `lib/intelligence/runtime/` — the **Intelligence Runtime**, which manages **HOW** a single intelligence execution lives from start to finish.

| Layer | Responsibility |
|-------|----------------|
| **Engine** | Public API — `IntelligenceEngine.run()` |
| **Orchestrator** | Decides **WHAT** to execute — stage plan, policies, module delegation |
| **Runtime** | Manages **HOW** execution lives — lifecycle, events, session state |

The Runtime does **not** generate intelligence, modify algorithms, or replace the Orchestrator.

---

## Architecture

```
IntelligenceRequest
        ↓
Orchestrator.execute()
  ├── RuntimeSession.create()     ← BUILD-041
  ├── Stage loop (unchanged logic)
  │     ├── session.onStageStarted()
  │     ├── delegate to modules
  │     └── session.onStageCompleted() / onStageFailed()
  └── session.complete() / fail()
        ↓
IntelligenceResult + orchestration + runtime snapshot
```

The Orchestrator creates a `RuntimeSession` at the start of each run and emits lifecycle events during stage execution.

### New modules

| File | Responsibility |
|------|----------------|
| `runtime/runtime.types.ts` | Lifecycle, state, failure types |
| `runtime/runtime-events.ts` | Deterministic event types and factory |
| `runtime/runtime-state.ts` | Immutable state snapshot builder |
| `runtime/runtime-session.ts` | `RuntimeSession` lifecycle manager |
| `runtime/runtime.ts` | `IntelligenceRuntime` + factory |
| `runtime/index.ts` | Barrel exports |

### Modified modules

| File | Change |
|------|--------|
| `orchestrator/orchestrator.ts` | Creates session; emits runtime events |
| `orchestrator/types.ts` | `runtime` on `OrchestratorRunResult` |
| `result.types.ts` | Optional `runtime` on `IntelligenceResult` |
| `index.ts` | Public exports |

---

## Runtime Lifecycle

| Status | Description |
|--------|-------------|
| `created` | Session instantiated, not yet started |
| `running` | Active execution |
| `paused` | Reserved for future agent runtime |
| `completed` | Successful terminal state |
| `failed` | Failure terminal state |
| `cancelled` | Cancellation terminal state |

---

## Runtime Events

| Event | When emitted |
|-------|--------------|
| `SessionStarted` | Session transitions to running |
| `StageStarted` | Orchestrator begins a stage |
| `StageCompleted` | Stage completes successfully |
| `StageFailed` | Stage throws or fails validation |
| `SessionCompleted` | Session completes successfully |
| `SessionCancelled` | Session cancelled (future use) |

Events are deterministic — no AI inference or fabricated payloads.

---

## Runtime State Snapshot

Immutable `RuntimeState` includes:

| Field | Description |
|-------|-------------|
| `sessionId` | Unique runtime session identifier |
| `requestId` | Source intelligence request id |
| `lifecycle` | Current lifecycle status |
| `startedAt` / `finishedAt` / `durationMs` | Timing |
| `activeStage` | Stage currently running |
| `lastCompletedStage` | Most recently completed stage |
| `policies` | Active orchestrator policies |
| `warnings` | Runtime warnings |
| `failures` | Stage failures with timestamps |
| `eventCount` | Total events emitted |

Attached as optional `IntelligenceResult.runtime` for backward compatibility.

---

## Engine vs Orchestrator vs Runtime

```
┌─────────────────────────────────────────────────────────┐
│  Engine (BUILD-022)                                     │
│  Stable entry point: run(request) → IntelligenceResult  │
└───────────────────────────┬─────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  Orchestrator (BUILD-040)                               │
│  WHAT: execution plan, policies, stage delegation       │
└───────────────────────────┬─────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  Runtime (BUILD-041)                                    │
│  HOW: session lifecycle, events, warnings, failures     │
└───────────────────────────┬─────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  Modules: Evidence, Quality, Contradictions,            │
│  Confidence, Trust, Graph, Memory, Trace, Result,       │
│  Diagnostics (algorithms unchanged)                     │
└─────────────────────────────────────────────────────────┘
```

---

## Failure Handling

| Condition | Runtime behavior |
|-----------|------------------|
| Stage failure (critical) | `StageFailed` event; session `failed` |
| Stage failure (non-critical) | `StageFailed` event; orchestrator may continue |
| Orchestrator catch block | Session `failed` if not already terminal |
| Successful completion | `SessionCompleted` event; lifecycle `completed` |

Runtime failures are recorded separately from orchestrator context warnings.

---

## Future Agent Runtime

| Phase | Enhancement |
|-------|-------------|
| Phase 1 | Runtime session + events (BUILD-041) |
| Phase 2 | Agent runtime uses `pause()` / `resume()` on sessions |
| Phase 3 | Multi-agent sessions with event subscriptions |
| Phase 4 | Human approval checkpoints via `SessionCancelled` / resume |
| Phase 5 | Streaming event consumers for live observability |

---

## Future Distributed Execution

The Runtime session model is designed for serialization:

- `RuntimeState` snapshots are immutable and portable
- Event log provides replay audit trail
- Session id correlates across distributed workers
- Orchestrator plan can be rehydrated from session state in future builds

No distributed infrastructure is included in BUILD-041.

---

## Constraints Honored

- No UI, dashboard, Entity Framework, or adapter changes
- Confidence, trust, and intelligence algorithms unchanged
- Orchestrator logic preserved — runtime hooks only
- No external services, AI models, or fabricated intelligence
- Cloudflare Pages compatibility preserved

---

## Verification

```bash
npm run lint
npm run build
# Test harness: runIntelligenceTestSuite() — 9/9 scenarios
```

---

## Files

### Created

- `lib/intelligence/runtime/runtime.ts`
- `lib/intelligence/runtime/runtime-state.ts`
- `lib/intelligence/runtime/runtime-events.ts`
- `lib/intelligence/runtime/runtime-session.ts`
- `lib/intelligence/runtime/runtime.types.ts`
- `lib/intelligence/runtime/index.ts`
- `docs/build-041-report.md`

### Modified

- `lib/intelligence/orchestrator/orchestrator.ts`
- `lib/intelligence/orchestrator/types.ts`
- `lib/intelligence/result.types.ts`
- `lib/intelligence/index.ts`
