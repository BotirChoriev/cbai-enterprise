# BUILD-035 Report — Confidence Integration with Evidence Quality

**Build:** BUILD-035  
**Date:** July 2026  
**Scope:** Integrate BUILD-034 evidence quality into Confidence Assessment  
**Status:** Complete — trust unchanged; pipeline order unchanged

---

## Purpose

BUILD-035 connects the **Evidence Quality Assessment Layer** (BUILD-034) to the **Confidence Assessment Layer**. Confidence now uses `EvidenceCollection.quality` — mean overall score, quality band, and quality warnings — to produce a more grounded composite score.

Quality **influences** confidence conservatively. It does **not** replace evidence quantity or sufficiency gates.

---

## Architecture

```
Request
      ↓
Evidence Collection (+ quality on items and collection)
      ↓
Confidence Assessment  ← BUILD-035 uses EvidenceCollection.quality
      ↓
Trust Assessment       (unchanged)
      ↓
Graph → Memory → Trace → Result
```

Pipeline stage order is unchanged. Quality assessment still runs inside the collector before confidence receives the collection.

### New modules

| File | Responsibility |
|------|----------------|
| `quality-integration.ts` | Extract quality context; build quality factor; apply adjustments |
| `quality-weighting.ts` | Conservative weights, warning penalties, band caps |

---

## Quality Integration

### Inputs from `EvidenceCollection.quality`

| Field | Use in confidence |
|-------|-------------------|
| `meanOverallScore` | Evidence-quality factor score (dampened 90%) |
| `band` | Upper cap on composite score |
| `warnings` | Post-composite penalty deduction |

### Per-item quality

Mean **provenance** dimension score from `Evidence.quality.dimensions` is included in factor detail for explainability.

### Unknown quality

When `EvidenceCollection.quality` is absent:

- Evidence-quality factor score = **30** (conservative substitute)
- Composite capped at **50** after adjustments
- `degraded: true` with explicit reason

---

## Weighting Model

### Five confidence factors (weight 0.2 each)

| Factor | Source | BUILD-035 |
|--------|--------|-----------|
| Evidence Volume | Item count + sufficiency | Unchanged |
| Source Relevance | `meanRelevance` | Unchanged |
| **Evidence Quality** | `quality.meanOverallScore` | **NEW** |
| Graph Connectivity | Deferred | Score 0 |
| Entity Signal Quality | Deferred | Score 0 |

### Composite calculation

1. **Raw composite** = weighted sum of five factors
2. **Quality band cap** applied if band known (e.g. `low` → max 55)
3. **Warning penalty** subtracted (max 25 points)
4. **Unknown quality cap** at 50 if quality summary missing

### Warning penalties

| Warning type | Penalty |
|--------------|---------|
| `missing-freshness` | 3 |
| `weak-provenance` | 4 |
| `duplicate-content` | 5 |
| `low-quality-evidence` | 6 |

### Quality band caps

| Quality band | Max confidence |
|--------------|----------------|
| excellent | 100 |
| high | 90 |
| medium | 75 |
| low | 55 |
| very-low | 35 |

---

## Examples

### Example A — Good local evidence with quality

- 6 items, sufficiency `adequate`, mean relevance 68, quality band `high`, mean overall 72
- Factors: volume 65, relevance 68, quality 65 (72×0.9), graph 0, entity 0
- Raw composite ≈ 40
- After band cap (90) and no warnings → score ≈ **40**, band `medium`

### Example B — Quality warnings present

- Same as A but warnings: `weak-provenance`, `duplicate-content`
- Penalty: 4 + 5 = 9 points
- Final score ≈ **31**, band `low`, `degraded: true`

### Example C — Unknown quality summary

- Items present but `EvidenceCollection.quality` missing
- Quality factor = 30, composite capped at 50
- `degraded: true`

---

## Relationship with Trust

| Layer | BUILD-035 |
|-------|-----------|
| **Confidence** | Uses quality scores, warnings, band caps |
| **Trust** | **Unchanged** — does not read quality integration |

Trust continues to derive from evidence sufficiency and its own rules. Quality-confidence integration is independent.

---

## Type Extensions

**`ConfidenceFactorId`** — added `evidence-quality`

**`ConfidenceAssessment.qualityIntegration`** — optional summary:

- `meanOverallScore`, `qualityBand`, `qualityWarnings`
- `meanProvenanceScore`, `warningPenaltyApplied`, `qualityBandCapApplied`
- `qualityUnknown`

**Confidence bands unchanged** — same thresholds in `bands.ts`

---

## Future Roadmap

1. **BUILD-036+** — Wire graph connectivity factor to graph context scores
2. **Entity signal factor** — Subject entity `aiScore` from evidence items
3. **Trust integration** — Quality warnings as trust governance caps
4. **Result layer** — Surface quality-confidence breakdown in executive summary
5. **Trace layer** — Export quality integration summary in audit trail

---

## File Structure

### Created

```
lib/intelligence/confidence/
├── quality-integration.ts
└── quality-weighting.ts

docs/build-035-report.md
```

### Modified

| File | Change |
|------|--------|
| `lib/intelligence/confidence/assessor.ts` | Quality integration flow; v0.2.0 |
| `lib/intelligence/confidence/factors.ts` | Fifth factor; rebalanced weights |
| `lib/intelligence/confidence.types.ts` | `evidence-quality` factor; `qualityIntegration` |
| `lib/intelligence/confidence/index.ts` | Exports |
| `lib/intelligence/index.ts` | Re-exports |

### Unchanged

- Trust assessor
- Evidence adapters
- Pipeline stages order
- UI / dashboard

---

## Verification

```bash
npm run lint
npm run build
```

Both must pass with 18 static routes unchanged.

---

## References

- `docs/build-034-report.md` — Evidence Quality Assessment Layer
- `lib/intelligence/trust/assessor.ts` — unchanged in BUILD-035
- `docs/CBAI-Intelligence-Specification-v1.md` §4 — Confidence model
