# CBAI Shared Persistence Boundary

## Verdict (BUILD-034)

```text
device-local adapter: active (development_only · single_device · not_collaboration_safe)
shared backend configured: no (default dev — NEXT_PUBLIC_SUPABASE_* unset)
Supabase migrations: 0005 + 0006 created (not applied in this environment)
RLS policies: defined in 0006_rls_organization_collaboration.sql
multi-device verified: no
multi-user verified: no
```

## Architecture

```text
Domain Service (organization-membership-store, collaboration-store)
    ↓
Repository Interface (lib/persistence/organization-repository.types.ts)
    ├── Supabase Shared Adapter (when shared_backend_ready + signed in)
    └── Device-Local Development Adapter (default)
```

## Supabase (when configured)

- Auth + sync for projects, notes, tasks, evidence refs, bookmarks, reports (existing)
- Organization, collaboration, living relationships, notifications (0005 schema + 0006 RLS)
- Client: `lib/supabase/client.ts` — static export, browser-only, anon key only

## Device-local stores

| Domain | Key namespace |
|--------|---------------|
| Organizations | `cbai-organizations` |
| Memberships | `cbai-organization-memberships` |
| Invitations (hashed) | `cbai-organization-invitations` |
| Org audit | `cbai-organization-audit` |
| Living relationships | `cbai-living-relationships` |
| Collaborations | `cbai-mission-collaborations` |
| Review assignments | `cbai-collaboration-review-assignments` |
| Notifications | `cbai-user-notifications` |
| Saved sources | `cbai-saved-knowledge-sources` |

## Configuration detection

`lib/persistence/persistence-capability.ts` exposes `PersistenceCapability` and honest UI labels.

## Setup action required for shared multi-user

1. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Apply migrations 0001–0006 in Supabase SQL editor or `supabase db push`
3. Sign in with two separate accounts in isolated browser contexts
4. Run organization/collaboration Playwright journeys against live project

Until then: **LOCAL INTEGRATION READY** — not Controlled Closed Alpha.
