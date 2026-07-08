# RI-BUILD-004 — Research Entity Model

## Summary

Defines the core Research Intelligence entity system — a read-only static architecture that will become the base for the Global Living Research Graph.

## Entity types (14)

`research_topic`, `organism`, `disease`, `technology`, `method`, `publication`, `dataset`, `patent`, `laboratory`, `university`, `researcher`, `experiment`, `open_question`, `negative_result`

## Research entity model

Each entity includes:

- `entityId`, `entityType`, `displayName`, `description`
- `relatedTopicIds`, `relatedEntityIds`
- `evidenceStatus`, `sourceStatus`, `workspaceStatus`
- `humanReviewRequired`, `version`

## Status values

**evidenceStatus:** `catalog_available`, `evidence_not_connected`, `source_not_connected`

**sourceStatus:** `catalog_only`, `official_source_not_connected`, `future_source_required`

**workspaceStatus:** `not_available_yet`, `future_workspace`

## Seed registry

10 generic catalog-safe seed entities — no fake people, papers, patents, or institutions:

- 5 research topic objects (Microbiology, Antibiotic resistance, CRISPR, Quantum battery, Plant disease resistance)
- Method, Dataset, Laboratory, Open question, Negative result (generic references)

## Query helpers

- `findResearchEntityById`
- `findResearchEntitiesByType`
- `findResearchEntitiesByTopic`
- `listResearchEntityTypes`
- `resolveResearchEntityRelations`

## Validation

`validateResearchEntityRegistry()` checks duplicate IDs, unknown types, broken topic/entity references, and invalid status values. Runs at registry load — build fails on invalid data.

## UI integration

Research Topic Detail pages include a compact **Research entity model** section showing supported types, related seed entities, and relationship preview with honest status labels.

## Not included

- No collaboration, chat, user accounts
- No fake researchers, publications, experiments
- No live database connections

## Copy rules

Use: research object, related research objects, available catalog information, not connected yet, future workspace, human review.

Avoid: graph active, live researchers, AI discovered, best method, ranked, score.
