# CBAI Knowledge Lifecycle (BUILD-028.5)

## Truth rules

- Search results are not saved knowledge.
- Saved sources are not verified evidence.
- Mission link is not human review.
- Only `accepted_as_evidence` review creates qualifying project evidence.
- Context-only and rejected sources remain visible but do not increase report readiness.

## State machine

Implemented in `lib/knowledge-ingestion/source-lifecycle.ts` with persisted transitions in `cbai-source-lifecycle-transitions`.

## User workflow on `/knowledge`

1. Inspect Crossref result (in-memory `inspected` state)
2. Save source → `saved_source`
3. Link to mission → `linked_to_mission`
4. Send for review → `awaiting_review`
5. Complete review → `reviewed_evidence` | `rejected` | review recorded without evidence qualification

## Report readiness

`deriveReportReadiness()` requires qualifying reviewed evidence (`reviewOutcome === "accepted_as_evidence"`) before `canClaimReadiness`.

Blockers surfaced via `deriveReportEvidenceBlocker()`.

## Telemetry events

`source_result_inspected`, `source_saved`, `source_linked_to_mission`, `source_review_requested`, `source_review_completed`, `source_review_rejected`.

Recorded only after confirmed persistence.
