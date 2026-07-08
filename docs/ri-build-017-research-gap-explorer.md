# RI-BUILD-017 — Research Knowledge Gap Explorer

## Summary

Surfaces what evidence is missing for a research topic using existing catalog profiles, readiness layers, open questions, and negative result readiness — without fake data, live databases, or quality judgments.

## Gap model

Each `ResearchGap` record includes:

- `gapId`, `topicId`, `gapType`, `currentStatus`
- `missingReason`, `futureEvidenceNeeded`, `relatedWorkspaceArea`
- `humanReviewRequired`, `version`

Gap types: publication, experiment, dataset, laboratory, researcher, method, replication, negative result, open question.

Status values: `available_catalog_only`, `not_connected_yet`, `future_workspace`.

## UI integration

| Surface | Section | Content |
|---------|---------|---------|
| Topic detail | Research gaps | Summary + 6 gap cards + future evidence sources |
| Workspace Explorer | Knowledge gaps (right panel) | Publication, experiment, dataset, researcher, replication gaps |

## Honest notice

Every gap section displays:

> These gaps reflect connected catalog status only. They do not judge scientific quality.

## Key files

- `lib/research/gaps/research-gap-types.ts`
- `lib/research/gaps/research-gap-builder.ts`
- `lib/research/gaps/research-gap-query.ts`
- `lib/research/gaps/research-gap-validation.ts`
- `components/research/gaps/ResearchGapExplorer.tsx`

## Non-goals

- No fake publications, experiments, or researchers
- No scores, rankings, or AI conclusions
- No chat or collaboration

## Verification

```bash
npm run lint
npm run build
```
