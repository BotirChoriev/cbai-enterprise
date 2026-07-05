# BUILD-024 Report — Confidence Assessment Layer

**Build:** BUILD-024  
**Date:** July 2026  
**Scope:** First Confidence Assessment Layer for the CBAI Intelligence Engine  
**Status:** Complete — evidence-only conservative scoring

---

## Summary

BUILD-024 introduces `lib/intelligence/confidence/` — the Confidence Assessment Layer that computes how well evidence supports an intelligence conclusion. Confidence calculation is removed from hardcoded pipeline placeholders and delegated to `DefaultConfidenceAssessor`.

With current empty evidence (BUILD-023), behavior remains conservative: **score 0**, **band `insufficient`**, factors explaining missing evidence. No UI, Entity Framework, API routes, LLM integration, graph scoring, or memory scoring was added.

---

## Confidence Is Not Truth

In CBAI, **confidence answers a different question than truth or prediction**:

| Question | CBAI answer | Layer |
|----------|-------------|-------|
| "Is this claim true?" | Not measured by confidence | Human review / future verification |
| "Will this prediction come true?" | Not measured by confidence | Future predictive intelligence (Phase 5) |
| "How justified is this conclusion given current evidence?" | **Confidence score** | Confidence Assessment Layer |

Confidence is a **weighted composite of evidence quality signals** — volume, relevance, and (future) graph connectivity and entity signals. A high-confidence conclusion means the platform had strong supporting evidence at inference time, not that the conclusion is factually correct or will occur in the future.

This distinction is mandatory per Intelligence Specification §4.1 and must remain visible in all explainability surfaces.

---

## Confidence vs Trust

| Dimension | Confidence | Trust |
|-----------|------------|-------|
| **Nature** | Statistical/epistemic — evidence quality | Organizational — permission to act |
| **Question** | "How well supported is this?" | "May we rely on this for decisions?" |
| **Inputs** | Evidence, graph, entity signals | Confidence + producer + provenance + human review |
| **Layer** | BUILD-024 (this build) | Future Trust Assessment Layer |
| **Example** | Score 72, band `medium` | Tier `exploratory` — analyst review required |

Confidence can be high while trust remains low (weak provenance, no human verification). Trust can be elevated by human override (T4) independent of confidence recalculation. The layers are intentionally separate.

---

## File Structure

```
lib/intelligence/
├── confidence.types.ts         Updated ConfidenceBand enum (BUILD-024 bands)
└── confidence/
    ├── index.ts                Public barrel exports
    ├── assessor.ts             ConfidenceAssessor + DefaultConfidenceAssessor
    ├── factors.ts              Factor builders and composite score
    └── bands.ts                Band resolution helpers
```

### Modified

| File | Change |
|------|--------|
| `lib/intelligence/confidence.types.ts` | New band labels: `very-low`, `low`, `medium`, `high`, `verified` |
| `lib/intelligence/engine/stages.ts` | `stageConfidenceAssessment` delegates to assessor |
| `lib/intelligence/engine/pipeline.ts` | Confidence before graph; assessor receives request + evidence only |
| `lib/intelligence/index.ts` | Re-exports confidence module |

---

## Assessor Contract

### `ConfidenceAssessor` interface

```typescript
interface ConfidenceAssessor {
  assess(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
  ): Promise<ConfidenceAssessment>;
}
```

### `DefaultConfidenceAssessor`

| Property | Value |
|----------|-------|
| ID | `default-confidence-assessor` |
| Version | `0.1.0-foundation` |

**Assessment flow:**

1. Build four canonical factors via `buildConfidenceFactors(evidence)`
2. Check `isEvidenceConfidenceInsufficient(evidence)` — empty items OR `sufficiencyStatus === "insufficient"`
3. If insufficient → force **score 0**, **band `insufficient`**, `degraded: true` with cap explanation
4. Otherwise → `computeCompositeConfidenceScore(factors)` → `resolveConfidenceBand(score)`
5. Mark `degraded: true` when graph/entity factors are still deferred (BUILD-024 scope)

---

## Confidence Bands

| Band | Score range | Meaning |
|------|-------------|---------|
| `insufficient` | 0 | No justification for action |
| `very-low` | 1–20 | Exploratory only |
| `low` | 21–40 | Gaps remain; verify before acting |
| `medium` | 41–60 | Moderate evidence support |
| `high` | 61–80 | Well-supported |
| `verified` | 81–100 | Strong multi-signal support (future builds) |

Helpers in `bands.ts`:

- `resolveConfidenceBand(score)` — score → band
- `clampConfidenceScore(score)` — 0–100 clamp
- `isInsufficientConfidenceBand(band)` — action gate helper
- `CONFIDENCE_BAND_LABELS` — display labels

---

## Factors Used Now (BUILD-024)

All four specification factors (§4.2) appear in every assessment. Only two are computed; two are explicit deferred placeholders.

| Factor | Weight | BUILD-024 status | Source |
|--------|--------|------------------|--------|
| **Evidence Volume** | 0.25 | **Active** | Item count + `sufficiencyStatus` |
| **Source Relevance** | 0.25 | **Active** | `meanRelevance` from collection |
| **Graph Connectivity** | 0.25 | **Deferred** | Score 0 — "not evaluated" detail |
| **Entity Signal Quality** | 0.25 | **Deferred** | Score 0 — "not evaluated" detail |

### Evidence Volume scoring (when not insufficient-gated)

| Sufficiency status | Factor score |
|--------------------|--------------|
| `minimum` | 40 |
| `adequate` | 65 |
| `strong` | 85 |

### Empty / insufficient evidence (current behavior)

Both active factors score **0** with explanatory details:

- Evidence Volume: *"No evidence items collected — no source adapters are enabled."*
- Source Relevance: *"No relevance data — evidence collection is empty."*
- Graph Connectivity: *"Not evaluated — deferred to future build."*
- Entity Signal Quality: *"Not evaluated — deferred to future build."*

Composite score: **0** → band: **`insufficient`**

---

## Future Factors Not Implemented Yet

| Factor | Future input | Build target |
|--------|--------------|--------------|
| Graph Connectivity | `GraphContext.connectivityScore`, path count, stalemate | BUILD-025+ |
| Entity Signal Quality | Mean `aiScore` of subject entities | BUILD-025+ |
| Memory context | Pinned knowledge boost (routing only, not score replacement) | Phase 3 |
| Contradiction caps | Reduce confidence when `contradictionState !== "none"` | Phase 3 |
| Staleness degradation | Reduce confidence when evidence is aging/stale | Phase 3 |
| Source provenance weighting | Verified > inferred > unverified | Phase 2 |

The factor builder functions (`buildGraphConnectivityFactor`, `buildEntitySignalQualityFactor`) are extension points — replace placeholder bodies without changing the assessor contract.

---

## Why Conservative Score Is Required

### 1. Specification compliance (§15.2 F1)

The Intelligence Specification prohibits returning high-confidence intelligence to mask missing evidence. With zero evidence items, any non-zero score would misrepresent justification quality.

### 2. Empty state is the current normal case

BUILD-023 leaves all source adapters disabled. The assessor must treat this as **insufficient by definition**, not as a neutral or middling score.

### 3. Deferred factors must not inflate scores

Graph and entity factors contribute 50% of the weight sum. Reporting score 0 for deferred factors prevents phantom confidence from unimplemented inputs.

### 4. Explicit degradation

`degraded: true` and `degradationReason` make the conservative cap auditable in reasoning traces and future UI — not silent score suppression.

---

## Pipeline Wiring

### Before (BUILD-022/023)

`stageConfidenceAssessment` returned hardcoded zeros with skeleton degradation message.

### After (BUILD-024)

```typescript
export async function stageConfidenceAssessment(request, evidence) {
  return defaultConfidenceAssessor.assess(request, evidence);
}
```

Pipeline order preserved:

```
Request → Evidence → Confidence → Trust → Graph → Memory → Trace → Result
```

Graph context is computed **after** confidence (no graph input to assessor yet).

---

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass — 18 static routes |
| Empty evidence score | 0 |
| Empty evidence band | `insufficient` |
| Entity Framework | Unmodified |
| UI / dashboard | Unmodified |

---

## Usage Example (not wired to UI)

```typescript
import { defaultConfidenceAssessor, defaultEvidenceCollector } from "@/lib/intelligence";

const request = {
  id: "req-001",
  question: "Analyze investment climate",
  requestedAt: new Date().toISOString(),
};

const evidence = await defaultEvidenceCollector.collect(request);
const confidence = await defaultConfidenceAssessor.assess(request, evidence);

// confidence.score === 0
// confidence.band === "insufficient"
// confidence.factors[0].detail includes "no source adapters"
```

---

## Next Steps (not in BUILD-024 scope)

1. **BUILD-025** — Trust Assessment Layer using confidence band + evidence metadata
2. **BUILD-026** — Enable search evidence adapter; observe non-zero volume/relevance factors
3. **BUILD-027** — Wire graph connectivity factor from `GraphContext`
4. **BUILD-028** — Wire entity signal factor from subject entity scores

---

*BUILD-024 — Confidence Assessment Layer. No commits created.*
