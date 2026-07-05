# BUILD-022 Report — Intelligence Engine Skeleton

**Build:** BUILD-022  
**Date:** July 2026  
**Scope:** First execution skeleton of the CBAI Intelligence Engine  
**Status:** Complete — framework only, no intelligence logic

---

## Summary

BUILD-022 implements the execution framework for the CBAI Intelligence Engine on top of the BUILD-021 type foundation. The skeleton orchestrates eight pipeline stages in canonical order, returns typed placeholder objects at each stage, and exposes `DefaultIntelligenceEngine` implementing the `IntelligenceEngine` interface.

No UI, dashboard, Entity Framework, API routes, LLM integration, mock business data, graph traversal, memory reads, or scoring algorithms were added.

---

## Architecture

```
lib/intelligence/
├── index.ts                    Public exports (types + engine)
├── pipeline-stage.types.ts     Stage IDs, labels, order (shared with trace types)
├── *.types.ts                  BUILD-021 interfaces
└── engine/
    ├── index.ts                Engine module barrel
    ├── engine.ts               DefaultIntelligenceEngine class
    ├── pipeline.ts             Pipeline orchestrator (executePipeline)
    ├── stages.ts               Eight stage functions (placeholders)
    └── errors.ts               Governed error hierarchy
```

### Layering

| Layer | Responsibility |
|-------|----------------|
| **Types** (`lib/intelligence/*.types.ts`) | Epistemic contracts — what intelligence artifacts look like |
| **Stages** (`stages.ts`) | Pure functions — one per pipeline step; swappable independently |
| **Pipeline** (`pipeline.ts`) | Sequencing, error wrapping, conditional stage execution |
| **Engine** (`engine.ts`) | Public entry point implementing `IntelligenceEngine` |
| **Errors** (`errors.ts`) | Governed failure types per Specification §15 |

The engine layer does not import UI, Next.js, graph builder, search, reasoning mock, or entity adapters. It depends only on BUILD-021 types and its own modules.

---

## Execution Flow

### Pipeline order (canonical)

```
1. Request              → validate required fields
2. Evidence Collection  → empty EvidenceCollection placeholder
3. Confidence Assessment → zero score, insufficient band
4. Trust Assessment     → unverified tier, skeleton-mode cap
5. Graph Context        → only when request.includeGraph === true
6. Memory Context       → only when request.includeMemory === true
7. Reasoning Trace      → degraded verification, all stages logged
8. Intelligence Result  → wire prior outputs into IntelligenceResult
```

### Sequence diagram

```
Caller
  │
  ▼
DefaultIntelligenceEngine.run(request)
  │
  ▼
executePipeline(request)
  │
  ├─► stageRequest(request)
  ├─► stageEvidenceCollection(request)
  ├─► stageGraphContext(request)          [if includeGraph]
  ├─► stageConfidenceAssessment(...)
  ├─► stageTrustAssessment(...)
  ├─► stageMemoryContext(request)         [if includeMemory]
  ├─► stageReasoningTrace(runId, times)
  └─► stageIntelligenceResult(context)
  │
  ▼
IntelligenceResult (draft, unverified, degraded trace)
```

### Error governance

| Error | When thrown |
|-------|-------------|
| `IntelligenceValidationError` | Missing `id`, `question`, or `requestedAt` on request |
| `IntelligencePipelineError` | Unexpected failure inside a stage (wrapped with stage ID) |
| `IntelligenceEngineError` | Base class for all engine failures |

Failures propagate to the caller. The skeleton does not return high-confidence placeholders on error (Specification §15.2 F1).

### Conditional stages

Graph and memory stages are **opt-in** via request flags:

- `includeGraph: true` → `graphContext` populated on result
- `includeMemory: true` → `memoryContext` populated on result

When flags are omitted or false, those contexts are absent from the result. This preserves a minimal execution path until real implementations are wired.

---

## Stage Functions

| Function | Output type | Placeholder behavior |
|----------|-------------|---------------------|
| `stageRequest` | `IntelligenceRequest` | Validates required fields; passthrough |
| `stageEvidenceCollection` | `EvidenceCollection` | Empty items, insufficient, zero relevance |
| `stageConfidenceAssessment` | `ConfidenceAssessment` | Score 0, insufficient band, four zero factors |
| `stageTrustAssessment` | `TrustAssessment` | Unverified tier, skeleton-mode cap |
| `stageGraphContext` | `GraphContext` | Empty subgraph, zero connectivity |
| `stageMemoryContext` | `MemoryContext` | Empty entries, tenant passthrough |
| `stageReasoningTrace` | `ReasoningTrace` | All 8 stages logged as degraded |
| `stageIntelligenceResult` | `IntelligenceResult` | Skeleton notice text, draft lifecycle |

Each function is exported individually for unit testing and incremental replacement in future builds.

---

## DefaultIntelligenceEngine

```typescript
class DefaultIntelligenceEngine implements IntelligenceEngine {
  readonly version = "0.1.0-skeleton";

  run(request): Promise<IntelligenceResult>   // → executePipeline
  verify(result): Promise<IntelligenceResult> // → marks trace degraded, adds skeleton cap
}
```

A shared singleton `defaultIntelligenceEngine` is exported for modules that need a default reference. Future builds may replace this with dependency injection.

### verify()

The optional `IntelligenceEngine.verify` method is implemented on the default class. The skeleton marks `verificationResult: "degraded"` and ensures `skeleton-mode` appears in trust caps. Full Specification §8 structural checks are an extension point for BUILD-023+.

---

## Extension Points

Future builds replace **stage function bodies** without changing the pipeline contract:

| Stage | Future implementation |
|-------|----------------------|
| `stageEvidenceCollection` | Global Search, entity profiles, document RAG, graph-path evidence |
| `stageConfidenceAssessment` | Weighted factor computation (§4.2) |
| `stageTrustAssessment` | Producer matrix, source trust, contradiction caps (§5) |
| `stageGraphContext` | `buildKnowledgeGraph()` adapter, bounded traversal (§10) |
| `stageMemoryContext` | CBAI Core memory reads (§9) |
| `stageReasoningTrace` | Per-stage timing, agent decisions, pass/fail verification |
| `stageIntelligenceResult` | Claim synthesis, summary generation, lifecycle assignment |

Additional extension hooks:

- **`runStage()` in pipeline.ts** — stage timing, streaming progress callbacks
- **`PipelineContext`** — accumulates artifacts for downstream stages and trace emission
- **`createRunId()`** — replace with server-generated IDs in production
- **Error hierarchy** — add `IntelligenceInsufficientEvidenceError`, policy blocks, etc.

### Wiring to existing modules (not in BUILD-022)

| Existing module | Future stage wiring |
|-----------------|---------------------|
| `lib/search/` | `stageEvidenceCollection` — search matches |
| `lib/graph/graph.builder.ts` | `stageGraphContext` — traversal |
| `lib/reasoning/` | Bridge to `IntelligenceResult` or replace stages |
| `lib/core.ts` memory | `stageMemoryContext` |
| `/reasoning` UI | Consume `IntelligenceResult` instead of `ReasoningResult` |

---

## Why No Intelligence Logic Exists Yet

BUILD-022 deliberately implements **structure before substance** for three reasons aligned with the Constitution and Intelligence Specification:

### 1. Contract before computation

BUILD-021 defined the epistemic contracts. BUILD-022 proves the pipeline can execute end-to-end and produce validly typed artifacts at every step. Adding search, graph, or scoring logic before the orchestration exists would risk ad hoc coupling — the anti-pattern the Domain Model forbids (single source of truth, derivation over duplication).

### 2. Governed failure before simulated success

The Intelligence Specification requires that pipeline failures never mask as high-confidence intelligence (§15.2 F1). Establishing error types, stage boundaries, and degraded trace semantics first ensures future logic inherits governed failure behavior by default.

### 3. Incremental replacement without UI churn

Each stage is an isolated function returning typed output. Future builds swap one stage at a time — evidence first, then confidence, then graph — without touching `DefaultIntelligenceEngine.run()` or any UI surface. This satisfies the BUILD-022 rule: no UI redesign, no dashboard changes.

### What placeholder outputs communicate

Skeleton results explicitly state:

- `claim` / `finalAnswer`: skeleton notice text
- `confidence.band`: `insufficient`
- `trust.tier`: `unverified`
- `trust.capsApplied`: includes `skeleton-mode`
- `reasoningTrace.verificationResult`: `degraded`
- `lifecycleState`: `draft`

These values prevent accidental presentation as production intelligence.

---

## Files Created

| File | Purpose |
|------|---------|
| `lib/intelligence/pipeline-stage.types.ts` | Stage IDs shared with ReasoningTrace |
| `lib/intelligence/engine/errors.ts` | Error hierarchy |
| `lib/intelligence/engine/stages.ts` | Eight stage functions + PipelineContext |
| `lib/intelligence/engine/pipeline.ts` | `executePipeline` orchestrator |
| `lib/intelligence/engine/engine.ts` | `DefaultIntelligenceEngine` |
| `lib/intelligence/engine/index.ts` | Engine module exports |
| `docs/build-022-report.md` | This document |

### Modified

| File | Change |
|------|--------|
| `lib/intelligence/index.ts` | Re-exports engine module |
| `lib/intelligence/trace.types.ts` | Extended `PipelineStageId` union |

---

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass — 18 static routes |
| Entity Framework | Unmodified |
| Dashboard pages | Unmodified |
| UI modules | Unmodified |
| API routes | None added |
| LLM integration | None |
| Mock business data | None |

---

## Usage Example (not wired to UI)

```typescript
import {
  defaultIntelligenceEngine,
  type IntelligenceRequest,
} from "@/lib/intelligence";

const request: IntelligenceRequest = {
  id: "req-001",
  question: "Analyze market entry options",
  requestedAt: new Date().toISOString(),
  includeGraph: true,
};

const result = await defaultIntelligenceEngine.run(request);
// result.lifecycleState === "draft"
// result.trust.tier === "unverified"
```

---

## Next Steps (not in BUILD-022 scope)

1. **BUILD-023** — Implement `stageEvidenceCollection` with Global Search adapter
2. **BUILD-024** — Implement `stageGraphContext` with graph builder adapter
3. **BUILD-025** — Confidence and trust scoring from real evidence
4. **BUILD-026** — Bridge `/reasoning` UI to `IntelligenceResult` (no redesign)

---

*BUILD-022 — Intelligence Engine execution skeleton. No commits created.*
