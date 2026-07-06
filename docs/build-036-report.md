# BUILD-036 Report — Trust Integration with Evidence Quality

**Build:** BUILD-036  
**Date:** July 2026  
**Scope:** Integrate BUILD-034 evidence quality into Trust Assessment  
**Status:** Complete — confidence unchanged; pipeline order unchanged

---

## Purpose

BUILD-036 connects the **Evidence Quality Assessment Layer** (BUILD-034) to the **Trust Assessment Layer** (BUILD-025). Trust now uses `EvidenceCollection.quality` — mean overall score, quality band, and quality warnings — to cap trust scores and enforce governance permissions.

Quality **influences** organizational reliance conservatively. Trust remains **evidence-first** and **never copies** the confidence score.

---

## Trust vs Confidence

| Dimension | Confidence (BUILD-035) | Trust (BUILD-036) |
|-----------|------------------------|-------------------|
| Question | How certain is the reasoning? | Should the organization rely on this result? |
| Primary inputs | Evidence volume, relevance, quality factor | Evidence sufficiency, diversity, relevance |
| Quality role | Weighted factor + band cap + penalty | Caps + penalty + governance gates |
| Score reuse | N/A | **Never uses confidence score magnitude** |
| Permissions | None | `allowRecommendation`, `allowAutomation`, `allowExecution` |

Both layers read the same `EvidenceCollection.quality` summary produced by the collector. They apply **different rules** tuned to their respective questions.

---

## Architecture

```
Request
      ↓
Evidence Collection (+ quality on items and collection)
      ↓
Confidence Assessment  (unchanged — BUILD-035)
      ↓
Trust Assessment       ← BUILD-036 uses EvidenceCollection.quality
      ↓
Graph → Memory → Trace → Result
```

Pipeline stage order is unchanged. Quality assessment still runs inside the collector before trust receives the collection.

### New modules

| File | Responsibility |
|------|----------------|
| `trust/quality-integration.ts` | Extract quality context; caps; penalties; `qualityGate` metadata |
| `trust/governance-rules.ts` | Permission gates; `governanceGate` metadata; reason enrichment |

### Modified modules

| File | Change |
|------|--------|
| `trust/assessor.ts` | v0.2.0-quality-integration; wires quality + governance |
| `trust/rules.ts` | Quality cap application in `applyTrustScoreCaps` |
| `trust.types.ts` | `qualityGate`, `governanceGate`, `trustWarnings` |
| `trust/index.ts` | Exports new modules |
| `index.ts` | Public type and function exports |

---

## Why Quality Affects Trust

Organizational reliance requires **grounded, verifiable evidence** — not just sufficient quantity. Quality dimensions map to trust risk:

| Quality signal | Trust impact |
|----------------|--------------|
| Weak provenance | Caps trust at 45; blocks automation |
| Missing freshness | Caps trust at 50 |
| Low quality evidence | Caps trust at 35; blocks automation |
| Unknown quality summary | Caps trust at 40; blocks automation |
| Duplicate content | Caps trust at 40 |
| Quality band | Upper ceiling on final score |

Trust penalties are **deduplicated by warning type** (max 30 points total), separate from confidence penalties.

---

## Trust Scoring Flow

1. **Base score** — `computeTrustScoreFromEvidence()` from sufficiency, diversity, relevance (unchanged).
2. **Evidence caps** — no-evidence, insufficient, contradiction, confidence-degraded (unchanged).
3. **Quality caps** — weak-provenance, missing-freshness, low-quality, duplicate-content, quality-unknown.
4. **Quality adjustments** — band ceiling + warning penalty via `applyQualityTrustAdjustments()`.
5. **Level resolution** — `resolveTrustLevel(trustScore)`.
6. **Governance gates** — enforce permission minimums via `applyGovernanceGates()`.

Trust score is **never** derived from `ConfidenceAssessment.score`.

---

## Governance Gates

### Permission minimums

| Action | Minimum trust level | Minimum score |
|--------|---------------------|---------------|
| Recommendation | `moderate` | ≥ 26 |
| Execution | `verified` | ≥ 76 |
| Automation | `verified` | ≥ 76 |

### Quality blocks

| Condition | Blocked action |
|-----------|----------------|
| Low quality evidence warning | Automation |
| Weak provenance warning | Automation |
| Unknown quality summary | Automation |

### Empty evidence baseline (unchanged)

| Field | Value |
|-------|-------|
| `trustLevel` | `unverified` |
| `trustScore` | `0` |
| `allowAutomation` | `false` |
| `allowRecommendation` | `false` |
| `allowExecution` | `false` |

---

## TrustAssessment Metadata (BUILD-036)

### `qualityGate`

```typescript
{
  passed: boolean;
  meanOverallScore: number | null;
  qualityBand: EvidenceQualityBand | null;
  capsApplied: string[];
  penaltyApplied: number;
}
```

### `governanceGate`

```typescript
{
  passed: boolean;
  automationPermitted: boolean;
  recommendationPermitted: boolean;
  executionPermitted: boolean;
  minimumLevels: { recommendation: "moderate"; execution: "verified" };
  blockedActions: string[];
}
```

### `trustWarnings`

Namespaced trust warnings, e.g. `trust:weak-provenance`, `trust:missing-freshness`, `trust:low-quality-evidence`.

All three fields are **optional** on `TrustAssessment` for backward compatibility with existing consumers.

---

## Automation Safeguards

Automation is the highest-risk organizational action. BUILD-036 requires:

1. **Verified trust level** (score ≥ 76) from evidence sufficiency baseline.
2. **No low-quality or weak-provenance quality warnings.**
3. **Known quality summary** on the evidence collection.

Even high sufficiency with weak provenance cannot trigger automation.

---

## Future Human Approval Model

The `TrustAssessment` model is designed for Specification §13 human override:

| Field | Future use |
|-------|------------|
| `humanVerified` | Elevated trust after human review |
| `governanceGate.blockedActions` | Audit trail for why actions were denied |
| `qualityGate` | Pre-approval quality checklist |
| `trustWarnings` | Surface items requiring human attention |

Phase 2 will wire RBAC role overrides. Phase 3 will allow human verification to elevate `trustLevel` and clear specific governance blocks — without bypassing empty-evidence baselines.

---

## Backward Compatibility

- Existing `TrustAssessment` fields unchanged in shape and semantics.
- New fields are optional — consumers that ignore them continue to work.
- `TRUST_LEVEL_PERMISSIONS` table unchanged — governance rules enforce stricter runtime checks.
- Confidence assessor and formula untouched.

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

- `lib/intelligence/trust/quality-integration.ts`
- `lib/intelligence/trust/governance-rules.ts`
- `docs/build-036-report.md`

### Modified

- `lib/intelligence/trust/assessor.ts`
- `lib/intelligence/trust/rules.ts`
- `lib/intelligence/trust.types.ts`
- `lib/intelligence/trust/index.ts`
- `lib/intelligence/index.ts`
