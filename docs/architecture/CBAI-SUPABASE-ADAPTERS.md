# CBAI Supabase Adapters (BUILD-039)

## Architecture

```text
OrganizationPageClient / domain services
        ↓
organization-persistence-service.ts
        ↓
repository-factory.ts
    ├── SupabaseOrganizationRepository (shared_backend_ready)
    └── DeviceLocalOrganizationRepository (otherwise)
```

Collaboration follows the same pattern with `DeviceLocalCollaborationRepository` today; Supabase collaboration adapter is staged for BUILD-040.

## RPC functions (migration 0007)

| Function | Purpose |
|----------|---------|
| `create_organization_with_owner` | Atomic org + owner membership + audit |
| `accept_organization_invitation_by_token` | Hash validate, email bind, membership insert |

## Rules

- Browser uses anon key only (`lib/supabase/client.ts`).
- Never expose service-role key in client bundle.
- Session mirror hydrates authorization reads after Supabase mutations.
- Device-local path remains explicitly labeled in UI.

## Verification

```bash
npm run test:shared-persistence
npm run test:rls   # requires test env
```
