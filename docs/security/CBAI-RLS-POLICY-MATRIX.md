# CBAI RLS Policy Matrix (BUILD-037)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| organizations | active member | authenticated creator | owner/admin | — |
| organization_memberships | org member | invite/accept path | owner/admin, last-owner protected | owner/admin, last-owner protected |
| organization_invitations | admin or recipient pending | admin/mission_lead | admin or recipient accept | — |
| organization_audit_events | owner/admin | actor insert | — | — |
| mission_collaborations | creator/participant/org member | creator | creator/participant | — |
| collaboration_participants | active participant | creator invites | self accept / creator revoke | — |
| collaboration_shared_objects | active participant + active status | sharer participant | sharer revoke | — |
| collaboration_review_assignments | assignee/assigner/participant | assigner | assignee/assigner | — |
| user_notifications | recipient | actor/recipient | recipient read mark | — |
| living_relationships | creator/org member/collab participant | creator | creator | — |

## Verification status

Migration file: `supabase/migrations/0006_rls_organization_collaboration.sql`

Live policy test: **not run** — Supabase not configured in dev environment.

Unit tests: `scripts/test-genesis-build034-038.ts` (application-layer authorization)
