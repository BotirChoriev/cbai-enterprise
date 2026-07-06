# BUILD-038 Report — Intelligence Run Diagnostics Layer

**Build:** BUILD-038  
**Date:** July 2026  
**Scope:** Deterministic run diagnostics for the CBAI Intelligence Engine  
**Status:** Complete — post-result enrichment; no scoring changes

---

## Purpose

BUILD-038 introduces `lib/intelligence/diagnostics/` — a deterministic layer that produces an **`IntelligenceRunDiagnostics`** summary after every pipeline run. Diagnostics explain run health, stage health, degraded mode, warnings, and blocking conditions for engineering and enterprise monitoring.

Diagnostics **observe** pipeline artifacts. They do not mutate confidence, trust, evidence, or result meaning.

---

## Diagnostics vs Trace

| Dimension | Reasoning Trace (BUILD-028) | Run Diagnostics (BUILD-038) |
|-----------|----------------------------|----------------------------|
| Question | What happened during execution? | Is this run healthy for reliance? |
| Output | Stage timeline, verification, audit warnings | Run health, issues, recommended action |
| Audience | Audit, reproducibility, explainability | Engineering ops, monitoring, SRE |
| Scope | Raw execution record | Classified health summary |
| Mutates layers | No | No |

The trace records **facts**. Diagnostics **classify** those facts into actionable health signals.

---

## Architecture

```
Request
  → Evidence Collection (+ quality)
  → Contradiction Detection
  → Confidence Assessment
  → Trust Assessment
  → Graph → Memory → Trace → Result
  → Run Diagnostics (post-result)   ← BUILD-038
```

Diagnostics run **after** result assembly in `executePipeline`. Pipeline stage order is unchanged — diagnostics is a post-pipeline enrichment step.

### New modules

| File | Responsibility |
|------|----------------|
| `diagnostics/types.ts` | `IntelligenceRunDiagnostics`, health and issue types |
| `diagnostics/issues.ts` | Deterministic issue collection and action resolution |
| `diagnostics/health.ts` | Run health and stage health rules |
| `diagnostics/diagnostics-builder.ts` | `DiagnosticsBuilder` + `DefaultDiagnosticsBuilder` |
| `diagnostics/index.ts` | Barrel exports |

### Modified modules

| File | Change |
|------|--------|
| `result.types.ts` | Optional `diagnostics` on `IntelligenceResult` |
| `engine/pipeline.ts` | Attach diagnostics after result assembly |
| `index.ts` | Public exports |

---

## IntelligenceRunDiagnostics Shape

```typescript
{
  runHealth: "healthy" | "degraded" | "blocked";
  stageHealth: StageHealth[];
  warningCount: number;
  blockingIssueCount: number;
  evidenceStatus: string;
  confidenceBand: ConfidenceBand;
  trustLevel: TrustLevel;
  contradictionStatus: ContradictionState;
  graphStatus: GraphContextStatus | "unknown";
  memoryStatus: MemoryContextStatus | "unknown";
  issues: DiagnosticIssue[];
  recommendedNextEngineeringAction: string;
  metadata: { builderId, builderVersion, builtAt };
}
```

Attached as optional `IntelligenceResult.diagnostics` for backward compatibility.

---

## Run Health Rules

| Condition | Run health |
|-----------|------------|
| Any blocking issue | `blocked` |
| Any degraded issue (no blocking) | `degraded` |
| No blocking or degraded issues | `healthy` |

### Blocking conditions

| Signal | Issue code |
|--------|------------|
| `contradictionSummary.hasBlockingConflict === true` | `blocking-contradiction` |
| `request.type === "operational"` AND `!trust.allowExecution` | `blocking-execution-denied` |
| Trace verification `fail` | `blocking-trace-verification-fail` |

### Degraded conditions

| Signal | Issue code |
|--------|------------|
| Evidence insufficient or zero items | `degraded-evidence-insufficient` |
| Confidence band `insufficient` or `very-low` | `degraded-confidence-band` |
| Trust level `unverified` or `low` | `degraded-trust-level` |
| `includeGraph: true` but graph not connected | `degraded-graph-not-connected` |
| `includeMemory: true` but memory not connected | `degraded-memory-not-connected` |
| Trace verification `degraded` | `degraded-trace-verification` |

### Info warnings

Trace warnings are recorded as `info` severity issues and counted in `warningCount`.

---

## Stage Health

Each pipeline stage in the reasoning trace receives a health status:

- `healthy` — stage completed with pass verification and no related issues
- `degraded` — degraded verification or degraded issue linked to stage
- `blocked` — failed stage or blocking issue linked to stage
- `skipped` — stage was skipped

A synthetic `run-diagnostics` stage entry reflects overall run health.

---

## Recommended Next Engineering Action

Deterministic priority order selects one action string:

1. Resolve blocking contradictions
2. Address execution denial for operational requests
3. Investigate trace verification failures
4. Improve evidence sufficiency
5. Connect graph adapter
6. Connect memory store
7. Raise confidence band
8. Raise trust level
9. Review trace degradation
10. Nominal — no action required when healthy

---

## Enterprise Monitoring Role

Diagnostics provide a **single structured object** suitable for:

- Run health dashboards (blocked/degraded/healthy counts)
- Alerting on `blockingIssueCount > 0`
- Stage-level failure triage via `stageHealth`
- Engineering backlog prioritization via `recommendedNextEngineeringAction`
- Layer status snapshots without parsing full traces

No external services, APIs, or databases are required — diagnostics ship with every `IntelligenceResult`.

---

## Future UI Observability Path

| Phase | Enhancement |
|-------|-------------|
| Phase 1 | Diagnostics on `IntelligenceResult` (BUILD-038) |
| Phase 2 | Reasoning dashboard run-health panel reading `result.diagnostics` |
| Phase 3 | Real-time streaming diagnostics during staged pipeline execution |
| Phase 4 | Historical run comparison and trend alerting |
| Phase 5 | Human override workflow linked to blocking issue resolution |

UI is explicitly out of scope for BUILD-038.

---

## Backward Compatibility

- `IntelligenceResult.diagnostics` is optional — existing consumers unchanged
- Result assembler, confidence, and trust scoring untouched
- Pipeline stage order unchanged
- No UI, API routes, Entity Framework, or external service changes

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

- `lib/intelligence/diagnostics/diagnostics-builder.ts`
- `lib/intelligence/diagnostics/health.ts`
- `lib/intelligence/diagnostics/issues.ts`
- `lib/intelligence/diagnostics/types.ts`
- `lib/intelligence/diagnostics/index.ts`
- `docs/build-038-report.md`

### Modified

- `lib/intelligence/result.types.ts`
- `lib/intelligence/engine/pipeline.ts`
- `lib/intelligence/index.ts`
