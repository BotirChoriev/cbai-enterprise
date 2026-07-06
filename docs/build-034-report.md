# BUILD-034 Report — Evidence Quality Assessment Layer

**Build:** BUILD-034  
**Date:** July 2026  
**Scope:** Deterministic evidence quality assessment before Confidence Assessment  
**Status:** Complete — quality attached in collector; confidence unchanged

---

## Purpose

BUILD-034 introduces the **Evidence Quality Assessment Layer** — a deterministic post-collection step that evaluates every evidence item on five quality dimensions before the Confidence Assessment Layer runs.

Quality assessment answers:

> "How structurally sound is this evidence item based on metadata we actually have?"

It does **not** verify truth, call AI models, or fetch external data.

---

## Architecture

```
IntelligenceRequest
        ↓
Evidence Collection (adapters merge → dedupe → sort)
        ↓
Evidence Quality Assessment  ← BUILD-034
        ↓
Confidence Assessment        (unchanged — does not use quality yet)
        ↓
Trust Assessment
        ↓
Graph → Memory → Trace → Result
```

Quality runs **inside** `DefaultEvidenceCollector.collect()` after merge/dedupe/sort and before returning `EvidenceCollection`. Pipeline stage order is unchanged — confidence still receives an `EvidenceCollection`, now with `quality` metadata attached.

### Package: `lib/intelligence/evidence/quality/`

| File | Responsibility |
|------|----------------|
| `quality.types.ts` | Dimension scores, bands, per-item and collection summaries |
| `quality-rules.ts` | Deterministic dimension scoring rules |
| `quality-score.ts` | Overall score and band resolution |
| `quality-assessor.ts` | `DefaultEvidenceQualityAssessor` orchestration |
| `index.ts` | Public exports |

---

## Quality Dimensions

Each evidence item receives five dimension scores:

| Dimension | Source metadata | Unknown handling |
|-----------|-----------------|------------------|
| **Completeness** | id, entity refs, source class, excerpt length, source ref/label | Always known (structural) |
| **Provenance** | `source.provenanceStrength` | Known; undeclared → score 15 |
| **Relevance** | `evidence.relevance` | Always known (adapter-assigned) |
| **Freshness** | `evidence.staleness` only | **Unknown** if staleness absent |
| **Consistency** | Duplicate excerpt detection in collection | Always known |

### Provenance mapping

| `provenanceStrength` | Score |
|---------------------|-------|
| `verified` | 90 |
| `inferred` | 55 |
| `unverified` | 25 |
| (missing) | 15 |

### Freshness mapping (when declared)

| `staleness` | Score |
|-------------|-------|
| `fresh` | 85 |
| `aging` | 50 |
| `stale` | 20 |

When `staleness` is **absent**: dimension status = `unknown`, score = `null`, overall composite uses conservative substitute **35**.

---

## Scoring Model

**Per dimension:** 0–100 (or unknown for freshness)

**Overall score:** weighted mean across five dimensions (weight 0.2 each). Unknown freshness uses conservative score 35 — never inflated.

**Collection summary:** mean of item overall scores + collection band.

---

## Quality Bands

| Band | Overall score |
|------|---------------|
| `excellent` | 80–100 |
| `high` | 60–79 |
| `medium` | 40–59 |
| `low` | 20–39 |
| `very-low` | 0–19 |

---

## Warnings

Factual warnings only — generated from assessment rules:

| Warning | Trigger |
|---------|---------|
| `missing-freshness:{id}` | No staleness metadata |
| `weak-provenance:{id}` | Provenance score ≤ 40 |
| `duplicate-content:{id}` | Normalized excerpt matches earlier item |
| `low-quality-evidence:{id}` | Overall score < 40 |

Warnings merge into `EvidenceCollectionMetadata.warnings` alongside adapter warnings.

---

## Type Extensions

**`Evidence.quality`** — optional `EvidenceQualityAssessment` per item

**`EvidenceCollection.quality`** — optional `EvidenceCollectionQualitySummary`

Adapters unchanged — quality attached by collector only.

---

## Relationship with Confidence

| | Quality (BUILD-034) | Confidence (BUILD-024) |
|---|---------------------|------------------------|
| **Question** | How good is each evidence item? | How well does evidence support the claim? |
| **Input** | Item metadata | Collection state + factors |
| **BUILD-034** | Attached to items | **Unchanged** |
| **BUILD-035** | — | Will integrate quality scores |

Confidence assessor does **not** read `evidence.quality` in BUILD-034.

---

## Future Integrations

1. **BUILD-035** — Confidence factor uses mean quality score
2. **Trust layer** — Quality warnings inform governance caps
3. **Result layer** — Quality caveats in executive summary
4. **Trace layer** — Quality dimension breakdown in audit export
5. **Document adapter** — Freshness from ingestion timestamps when connected
6. **Temporal staleness** — Replace unknown freshness with computed age

---

## File Structure

### Created

```
lib/intelligence/evidence/quality/
├── quality.types.ts
├── quality-rules.ts
├── quality-score.ts
├── quality-assessor.ts
└── index.ts

docs/build-034-report.md
```

### Modified

| File | Change |
|------|--------|
| `lib/intelligence/evidence.types.ts` | `Evidence.quality`, `EvidenceCollection.quality` |
| `lib/intelligence/evidence/collector.ts` | Quality assessment after collection; v0.5.0 |
| `lib/intelligence/evidence/index.ts` | Quality exports |
| `lib/intelligence/index.ts` | Re-exports |

---

## Verification

```bash
npm run lint
npm run build
```

Both must pass with 18 static routes unchanged.

---

## References

- `docs/build-030-report.md` — entity-profile adapter (sets `staleness: fresh`)
- `docs/CBAI-Intelligence-Specification-v1.md` §3.4 — Evidence quality dimensions
- `lib/intelligence/confidence/assessor.ts` — unchanged in BUILD-034
