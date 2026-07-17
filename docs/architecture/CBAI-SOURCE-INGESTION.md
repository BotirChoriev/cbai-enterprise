# CBAI Source Ingestion Architecture (BUILD-028.5)

## Purpose

Persist real Crossref metadata through a provenance-preserving lifecycle from search result to reviewed mission evidence.

## Lifecycle states

```text
search_result → inspected → saved_source → linked_to_mission → awaiting_review → reviewed_evidence
awaiting_review → rejected
reviewed_evidence → superseded
saved_source | linked_to_mission | rejected → archived
```

Invalid transitions are rejected in `lib/knowledge-ingestion/source-lifecycle.ts`.

## Canonical contracts

| Contract | Location |
|----------|----------|
| Saved source | `lib/knowledge-ingestion/source-ingestion.types.ts` |
| Lifecycle rules | `lib/knowledge-ingestion/source-lifecycle.ts` |
| Deduplication | `lib/knowledge-ingestion/source-deduplication.ts` |
| Persistence | `lib/knowledge-ingestion/saved-source-store.ts` |
| Human review | `lib/knowledge-ingestion/source-review-store.ts` |
| Qualifying evidence | `lib/knowledge-ingestion/qualifying-evidence.ts` |

## Identity and deduplication

Priority: DOI → provider + providerRecordId → probable title/year/author (no silent merge).

## Crossref transport

```text
Crossref transport: browser client
Reason: static export (output: export)
Credential exposure: none required
Known limitation: requests originate from user browser
Future server migration: supported by adapter boundary in lib/knowledge-connectors/
```

## Review outcomes

| Decision | Lifecycle | Report readiness |
|----------|-----------|------------------|
| accepted_as_evidence | reviewed_evidence | counts |
| context_only | awaiting_review (review recorded) | does not count |
| insufficient | awaiting_review (review recorded) | does not count |
| rejected | rejected | does not count |

## Persistence

Device-local namespaced localStorage via `resolveStorageKey`. Schema version `SAVED_SOURCE_SCHEMA_VERSION = 1`. Not multi-device or collaboration-ready.

## UI surfaces

- `/knowledge` — `KnowledgeSourceSearchPanel`, progressive actions per lifecycle state
- Saved sources panel — `SavedKnowledgeSourcesPanel`
- Review — `SourceReviewDialog` (self-review, device-local)

## Continuity

All confirmed mutations call `notifyMissionDataChanged("evidence")` and scoped telemetry via `recordConfirmedMutation`.

## Trust derivation

Use `deriveKnowledgeTrustStateFromSavedSource()` — no numeric scores.
