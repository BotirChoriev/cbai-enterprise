# BUILD-028 Report — Reasoning Trace Layer

**Build:** BUILD-028  
**Date:** July 2026  
**Scope:** Reasoning Trace Layer for the CBAI Intelligence Engine  
**Status:** Complete — factual pipeline audit only

---

## Summary

BUILD-028 introduces `lib/intelligence/trace/` — the Reasoning Trace Layer that records pipeline execution in a structured, auditable form. `DefaultReasoningTraceBuilder` replaces the placeholder trace stage that previously duplicated timestamps and fabricated skeleton output strings.

The trace records **only what actually happened**: stage IDs, timestamps, durations, statuses, factual layer summaries, warnings, and verification results. No AI reasoning, no conclusions, no hallucinated explanations.

---

## Reasoning vs Trace

| | Reasoning (future) | Trace (BUILD-028) |
|---|-------------------|---------------------|
| **Purpose** | Synthesize claims from evidence | Record pipeline execution |
| **Content** | Conclusions, decisions, answers | Timestamps, statuses, metrics |
| **Source** | Evidence + graph + models | Observed stage outputs only |
| **UI surface** | `/reasoning` answer panels | Audit log, compliance export |
| **BUILD-028** | Not implemented | Fully wired |

**Trace is the audit trail.** Reasoning is the intelligence product. They must never be conflated — trace output strings report `items=0`, `band=insufficient`, not "therefore X is true."

---

## Purpose of Trace

Per Intelligence Specification §8.5, every intelligence run requires an auditable trace:

1. **Reproducibility** — which stages ran, in what order, for how long
2. **Accountability** — verification pass/fail/degraded with explicit warnings
3. **Explainability foundation** — factual inputs for future UI without fabricating narrative
4. **Compliance** — enterprise audit export of pipeline integrity checks

---

## File Structure

```
lib/intelligence/
├── trace.types.ts              Extended ReasoningTrace + TraceVerificationSummary
└── trace/
    ├── index.ts                Public barrel exports
    ├── trace-builder.ts        ReasoningTraceBuilder + DefaultReasoningTraceBuilder
    ├── timeline.ts             Stage timeline helpers
    └── verification.ts         Pipeline integrity verification
```

### Modified

| File | Change |
|------|--------|
| `lib/intelligence/trace.types.ts` | `warnings`, `TraceVerificationSummary` on `ReasoningTrace` |
| `lib/intelligence/engine/pipeline.ts` | Timed `runStage`, timeline capture, trace input bundle |
| `lib/intelligence/engine/stages.ts` | `stageReasoningTrace` delegates to builder |
| `lib/intelligence/index.ts` | Re-exports trace module |

---

## Builder Contract

### Input: `PipelineTraceInput`

| Field | Source |
|-------|--------|
| `runId` | Pipeline orchestrator |
| `pipelineStartedAt` | Pipeline start timestamp |
| `timeline` | Observed stage executions (request → memory) |
| `request` | Validated intelligence request |
| `evidence` | Evidence Layer output |
| `confidence` | Confidence Layer output |
| `trust` | Trust Layer output |
| `graphContext` | Graph Context Layer output |
| `memoryContext` | Memory Context Layer output |

### Output: `ReasoningTrace`

| Field | BUILD-028 content |
|-------|-------------------|
| `stages` | Timeline entries + reasoning-trace assembly stage |
| `agentDecisions` | `[]` (no agents in pipeline yet) |
| `verificationResult` | `pass` \| `fail` \| `degraded` |
| `verificationSummary` | Structural check breakdown |
| `warnings` | Factual warnings from layer metadata |
| `producerVersion` | Engine skeleton version |

---

## Timeline Helper

Each executed stage produces a `StageTimelineEntry`:

| Field | Description |
|-------|-------------|
| `stageId` | Pipeline stage identifier |
| `label` | Human-readable label |
| `startedAt` | ISO-8601 start |
| `finishedAt` | ISO-8601 finish |
| `durationMs` | Wall-clock duration |
| `status` | `complete` \| `failed` |

`TRACE_TIMELINE_STAGE_ORDER` records: request → evidence → confidence → trust → graph → memory.

The pipeline `runStage` helper captures timing automatically. Failed stages record `status: failed` before rethrowing.

---

## Verification Helper

`verifyPipelineTrace()` returns `TraceVerificationSummary` only:

| Check | Method |
|-------|--------|
| Required stages executed | All 6 pre-trace stages present with `complete` |
| Pipeline integrity | Stages in canonical order |
| Missing context | Graph/memory/evidence-sources requested but not connected |
| Degraded execution | Empty evidence, degraded confidence, warnings present |
| Warnings | Factual messages from layer metadata |

Overall result:

| Condition | Result |
|-----------|--------|
| Missing stages or order violation | `fail` |
| Degraded execution | `degraded` |
| All checks pass | `pass` |

Current empty-evidence runs: **`degraded`** with warnings (not `fail`).

---

## Factual Stage Outputs (examples)

No fabricated reasoning — only observed metrics:

```
Request validated: id=req-001.
Evidence collection status=no-sources-connected; items=0; sufficiency=insufficient.
Confidence score=0; band=insufficient; degraded=true.
Trust level=unverified; score=0; automation=false.
Graph context enabled=false; status=disabled; paths=0.
Memory context enabled=false; status=disabled; entries=0.
Trace assembled by default-reasoning-trace-builder; verification=degraded.
```

---

## Pipeline Integration

```
Request → Evidence → Confidence → Trust → Graph → Memory → Reasoning Trace → Result
         └──────────────── timeline captured per stage ────────────────┘
```

`runStage` records timing before trace assembly. Trace builder receives timeline snapshot excluding its own stage (added during build).

`intelligence-result` runs after trace — not included in `ReasoningTrace.stages` (assembly, not inference).

---

## Auditability

| Audit question | Trace answer |
|----------------|--------------|
| Did all stages run? | `verificationSummary.requiredStagesExecuted` |
| In correct order? | `verificationSummary.pipelineIntegrity` |
| Was evidence collected? | Stage output `items=N` |
| Was execution degraded? | `verificationSummary.degradedExecution` |
| Why degraded? | `warnings[]` |
| How long did each stage take? | `stages[].durationMs` |
| When did the run complete? | `completedAt` |

---

## Enterprise Compliance

Trace layer prepares:

- **SOC 2** — immutable-style execution logs with verification outcomes
- **Human override audit** — trace preserved when intelligence superseded (future)
- **Agent accountability** — `agentDecisions[]` ready for multi-agent runs
- **Data residency** — traces tenant-scoped via `request.tenantId` (future persistence)
- **Retention policies** — trace schema versioned via `producerVersion`

No PII is fabricated. Trace contains only request IDs and layer metrics.

---

## Future Explainability Integration

| Future build | Trace integration |
|--------------|-------------------|
| `/reasoning` UI | Display `stages[]` timeline and `warnings` |
| Evidence adapter | Stage output shows real item counts |
| Graph adapter | Paths count in graph stage output |
| LLM reasoning | **Separate** reasoning stages — never overwrite audit trace |
| Agent runtime | Populate `agentDecisions[]` |
| Persistence | Store `ReasoningTrace` per `runId` in tenant DB |

Explainability UI reads trace for **how the pipeline ran**; intelligence result for **what was concluded** — when reasoning exists.

---

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass — 18 static routes |
| Fabricated reasoning | None |
| `verificationResult` (empty evidence) | `degraded` |
| Entity Framework | Unmodified |
| UI / dashboard | Unmodified |

---

*BUILD-028 — Reasoning Trace Layer. No commits created.*
