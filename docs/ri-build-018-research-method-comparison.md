# RI-BUILD-018 — Research Method Comparison

## Summary

Helps researchers compare methods for a topic using catalog method names and topic-level evidence types — without rankings, success rates, fake results, or recommendations.

## Model

Each `MethodComparison` includes:

- `comparisonId`, `topicId`, `methods`, `evidenceTypes`
- `methodEvidenceRows` with per-method catalog info, evidence needed, missing evidence, status
- `status`, `limitations`, `humanReviewRequired`, `version`

Row status values: `catalog_available`, `evidence_not_connected`, `human_review_required`.

## UI integration

| Surface | Section | Content |
|---------|---------|---------|
| Topic detail | Method comparison | All methods, evidence matrix, limitations, notices |
| Workspace Explorer | Methods to review | Up to 5 methods, evidence needed, not connected status |

## Honest notice

Every comparison displays:

> This comparison uses catalog information only. It does not rank methods or prove outcomes.

## Key files

- `lib/research/method-comparison/method-comparison-types.ts`
- `lib/research/method-comparison/method-comparison-builder.ts`
- `lib/research/method-comparison/method-comparison-query.ts`
- `components/research/method-comparison/MethodComparisonPanel.tsx`
- `components/research/method-comparison/MethodEvidenceMatrix.tsx`

## Non-goals

- No best/strongest method language
- No scores, rankings, or proven outcomes
- No live database connections

## Verification

```bash
npm run lint
npm run build
```
