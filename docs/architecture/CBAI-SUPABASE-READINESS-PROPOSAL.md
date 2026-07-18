# CBAI Supabase Readiness Proposal (Not Applied)

This document proposes a future shared persistence schema. **No migrations are applied by this build.**

## Principles

- Device-local mode remains the default when Supabase is not configured or the user is not authenticated.
- RLS enforces organization scope for every shared table.
- Audit events are append-only.
- Private Smart Idea artifacts require explicit visibility and encryption policy before cloud storage.

## Proposed Tables

| Table | Purpose | Ownership |
|-------|---------|-------------|
| `missions` | Mission OS records | `owner_user_id`, optional `organization_id` |
| `projects` | Project Engine | `mission_id`, `owner_user_id` |
| `mission_members` | Mission collaboration | `mission_id`, `user_id`, `role` |
| `smart_ideas` | Research Canvas intake | `owner_user_id`, `visibility` |
| `smart_idea_artifacts` | Artifact metadata (not raw blob by default) | `smart_idea_id` |
| `measurement_passports` | Universal measurement records | `smart_idea_id`, `mission_id` |
| `evidence_references` | Linked evidence | `project_id`, `source_uri` |
| `execution_tasks` | Genesis tasks | `mission_id`, `organization_id` |
| `progress_updates` | Progress history | `task_id`, `actor_id` |
| `blockers` | Blocked work | `task_id` |
| `outcomes` | Outcome records | `mission_id` |
| `contribution_claims` | Contribution graph | `actor_id`, `evidence_id` |
| `recognition_records` | Recognition drafts | `subject_id`, `reviewer_id` |
| `audit_events` | Append-only audit | `organization_id`, `actor_id` |

## RLS Sketch

- `SELECT`: member of organization OR owner OR explicit share grant.
- `INSERT`: authenticated user with role ≥ contributor.
- `UPDATE`: owner or role ≥ editor; audit row required.
- `DELETE`: soft-delete only; hard delete admin-only.

## Adapter Interface (client)

- `DeviceLocalPersistenceAdapter` — current genesis-storage.
- `SupabasePersistenceAdapter` — future; returns `backend-unavailable` until configured.
- `OfflineOutboxAdapter` — queues writes when offline.

## Verification Before Cloud Claims

1. Successful authenticated read/write round-trip in staging.
2. RLS tests per organization boundary.
3. No private artifact upload without explicit user consent UI.
