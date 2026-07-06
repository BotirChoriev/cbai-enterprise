# BUILD-040 Report — Intelligence Orchestrator

**Build:** BUILD-040  
**Date:** July 2026  
**Scope:** Central orchestration layer for the CBAI Intelligence Engine  
**Status:** Complete — coordinates existing modules; no intelligence generation

---

## Purpose

BUILD-040 introduces `lib/intelligence/orchestrator/` — the **Intelligence Orchestrator**, the central coordinator of all intelligence engine modules. The orchestrator:

- Receives an `IntelligenceRequest`
- Produces a deterministic `ExecutionPlan`
- Executes stages in canonical order
- Tracks stage completion in `OrchestratorExecutionContext`
- Collects diagnostics
- Handles stage failures per policy
- Stops execution when policy requires

The orchestrator **does not generate intelligence**. It delegates to existing Evidence, Quality, Contradiction, Confidence, Trust, Graph, Memory, Trace, Result, and Diagnostics modules unchanged.

---

## Architecture

```
IntelligenceRequest
        ↓
IntelligenceOrchestrator
  ├── buildExecutionPlan()
  ├── OrchestratorExecutionContext (tracking)
  ├── Policy evaluation
  └── Stage delegation
        ↓
Existing module stage functions (unchanged algorithms)
        ↓
IntelligenceResult + diagnostics + orchestration summary
```

`executePipeline()` and `DefaultIntelligenceEngine.run()` now delegate to `executeOrchestratedRun()`.

### New modules

| File | Responsibility |
|------|----------------|
| `orchestrator/types.ts` | Execution plan, stage, and summary types |
| `orchestrator/policies.ts` | ContinueOnWarning, StopOnBlockingConflict, etc. |
| `orchestrator/execution-plan.ts` | Deterministic plan builder |
| `orchestrator/execution-context.ts` | Runtime context tracking |
| `orchestrator/orchestrator.ts` | `DefaultIntelligenceOrchestrator` |
| `orchestrator/index.ts` | Barrel exports |

### Modified modules

| File | Change |
|------|--------|
| `engine/pipeline.ts` | Delegates to orchestrator |
| `result.types.ts` | Optional `orchestration` summary on result |
| `index.ts` | Public exports |

---

## Execution Lifecycle

### Stage order

```
Request
  → Evidence
  → Quality
  → Contradictions
  → Confidence
  → Trust
  → Graph
  → Memory
  → Trace
  → Result
  → Diagnostics
```

Each plan stage includes: `name`, `enabled`, `required`, `status`.

| Stage | Module | Notes |
|-------|--------|-------|
| Evidence | Evidence Collector | Includes adapter merge |
| Quality | Quality Assessor | Logical stage — verifies `evidence.quality` from collector |
| Contradictions | Contradiction Detector | Enriches evidence collection |
| Confidence | Confidence Assessor | Unchanged formula |
| Trust | Trust Assessor | Unchanged formula |
| Graph | Graph Context Builder | Unchanged |
| Memory | Memory Context Builder | Unchanged |
| Trace | Reasoning Trace Builder | Uses orchestrator timeline |
| Result | Result Assembler | Unchanged |
| Diagnostics | Diagnostics Builder | BUILD-038 |

---

## Policies

| Policy | Default | Behavior |
|--------|---------|----------|
| `ContinueOnWarning` | `true` | Continue when non-blocking warnings observed |
| `StopOnBlockingConflict` | `false` | Stop after contradictions when blocking conflict detected |
| `StopOnCriticalFailure` | `true` | Halt and throw on required stage failure |
| `RunDiagnosticsAlways` | `true` | Always schedule diagnostics stage |

Policies are code-level flags only — no runtime configuration UI.

---

## Execution Context

`OrchestratorExecutionContext` tracks:

| Field | Description |
|-------|-------------|
| `runId` / `requestId` | Correlation identifiers |
| `startedAt` / `finishedAt` | Timestamps |
| `currentStage` | Active stage while running |
| `completedStages` / `failedStages` / `skippedStages` | Stage outcomes |
| `warnings` / `blockingIssues` | Collected signals |
| `plan` | Live execution plan with updated statuses |
| `timeline` | Pipeline timeline for trace assembly |
| Layer artifacts | evidence, confidence, trust, graph, memory, trace, result, diagnostics |

---

## Failure Handling

| Condition | Behavior |
|-----------|----------|
| Required stage throws + `StopOnCriticalFailure` | Run marked failed; `IntelligencePipelineError` thrown |
| Required stage throws + policy off | Run stopped; remaining stages skipped |
| Blocking contradiction + `StopOnBlockingConflict` | Stages after contradictions skipped |
| Warnings + `ContinueOnWarning: false` | Early stop after warning-producing stage |
| Diagnostics unavailable artifacts | Warning recorded; diagnostics skipped |

Default policies preserve pre-BUILD-040 full-pipeline behavior.

---

## Orchestration Summary

Optional `IntelligenceResult.orchestration` includes:

```typescript
{
  runId: string;
  outcome: "complete" | "stopped" | "failed";
  stoppedReason?: string;
  stagesCompleted: number;
  stagesFailed: number;
  stagesSkipped: number;
  durationMs: number;
  policies: OrchestratorPolicies;
  orchestratorVersion: string;
}
```

No business intelligence — orchestration facts only.

---

## Future Agent Runtime Integration

| Phase | Enhancement |
|-------|-------------|
| Phase 1 | Central orchestrator (BUILD-040) |
| Phase 2 | Agent runtime dispatches via orchestrator with per-agent policies |
| Phase 3 | Multi-agent parallel stage fan-out with merge rules |
| Phase 4 | Human approval gates as orchestrator policy checkpoints |
| Phase 5 | Distributed stage execution with context serialization |

The orchestrator is the stable coordination boundary for future agent and workflow runtimes.

---

## Constraints Honored

- No UI, dashboard, Entity Framework, or evidence adapter changes
- Confidence and trust algorithms unchanged
- Graph builder unchanged
- No external services, AI models, or fabricated intelligence
- Cloudflare Pages compatibility preserved

---

## Verification

```bash
npm run lint
npm run build
```

Both must pass with 18 static routes and no TypeScript errors.

---

## Files

### Created

- `lib/intelligence/orchestrator/orchestrator.ts`
- `lib/intelligence/orchestrator/execution-plan.ts`
- `lib/intelligence/orchestrator/execution-context.ts`
- `lib/intelligence/orchestrator/policies.ts`
- `lib/intelligence/orchestrator/types.ts`
- `lib/intelligence/orchestrator/index.ts`
- `docs/build-040-report.md`

### Modified

- `lib/intelligence/engine/pipeline.ts`
- `lib/intelligence/result.types.ts`
- `lib/intelligence/index.ts`
