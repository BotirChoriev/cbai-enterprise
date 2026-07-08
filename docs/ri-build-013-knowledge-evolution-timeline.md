# RI-BUILD-013 — Knowledge Evolution Timeline

## Summary

Adds a read-only knowledge evolution timeline to Research Intelligence — a research workflow organizer, not historical truth or AI prediction.

## Timeline model

- `timelineId`, `topicId`, `stages`, `status`, `humanReviewRequired`, `version`

## Stages (same for every topic)

1. Research Topic — Define the scientific subject
2. Current Knowledge — Review available catalog information
3. Methods — Understand research methods
4. Evidence — Review evidence types
5. Open Questions — Identify unanswered questions
6. Future Evidence — Future publications, experiments, datasets, laboratories
7. Research Workspace — Future collaboration space

## Status values

- `catalog_available`
- `future_workspace`
- `not_connected_yet`

## Data sources

Built from existing catalog data only — topic profile, methods, evidence types, open question categories, future workspace text.

## UI integration

**Knowledge Evolution** section on topic detail with vertical timeline, stage cards, legend, and workflow notice.

## Not included

- No fake discoveries, dates, Nobel prizes, publications, researchers, or milestones
- No historical chronology or AI prediction

## Honest notice

"This timeline represents the research workflow inside CBAI. It is not a historical record."

## Copy rules

Use: knowledge evolution, research lifecycle, future evidence, human scientific review, available catalog information.

Avoid: history, prediction, future discovery, AI forecast, best approach, scientific truth.
