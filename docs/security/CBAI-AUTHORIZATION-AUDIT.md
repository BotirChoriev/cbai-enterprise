# CBAI Authorization Audit (BUILD-037)

## Application layer

Central entry: `authorizeOrganizationAction()` in `lib/organization-os/authorization-policy.ts`.

| Actor | Resource | Action | Result (device-local tests) |
|-------|----------|--------|----------------------------|
| owner | organization | view, edit, invite | allowed |
| member | organization | view | allowed |
| member | organization | edit_organization | denied |
| guest | organization | edit_organization | denied |
| non-member | organization | view | denied (`not_authorized`) |
| revoked | organization | any | denied |

Collaboration uses participant status checks in `collaboration-store.ts` — non-participants cannot load shared objects.

## Data layer

RLS policies defined in `supabase/migrations/0006_rls_organization_collaboration.sql`.

**Not verified live** — no Supabase credentials in this environment.

## Gaps

- Organization/collaboration device-local stores bypass RLS when shared backend is not configured.
- Graph projection filters unauthorized nodes at resolve time; not a substitute for server-side graph queries.
