# CBAI Shared Persistence Boundary

## Verdict

```text
shared backend: optional (Supabase) — not configured in default dev environment
organization/membership/collaboration/living-object: device-local only
multi-device verified: no
multi-user verified: no (same-browser account switching only)
```

## Supabase (when configured)

- Auth + sync for projects, notes, tasks, evidence refs, bookmarks, reports
- RLS policies in `supabase/migrations/0002_rls_policies.sql`
- No organization or collaboration tables synced

## Device-local stores

| Domain | Key namespace |
|--------|---------------|
| Organizations | `cbai-organizations` |
| Memberships | `cbai-organization-memberships` |
| Invitations | `cbai-organization-invitations` |
| Org audit | `cbai-organization-audit` |
| Living relationships | `cbai-living-relationships` |
| Collaborations | `cbai-mission-collaborations` |
| Saved sources | `cbai-saved-knowledge-sources` |

## Static export

`output: export` — no server API routes. Client-side Supabase only. Private keys never in client.

## BUILD-030 blocker

Real cross-account collaboration requires shared persistence for org membership and collaboration records. Until Supabase (or equivalent) org tables exist with RLS, product state is **device-local** with honest UI disclosure.
