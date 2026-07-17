# CBAI Local-to-Shared Migration (BUILD-039)

## Organization migration

Module: `lib/persistence/local-to-shared-org-migration.ts`

### Principles

- User must be authenticated on shared backend
- Preview counts before upload (`previewLocalOrganizationMigration()`)
- Never silently upload — explicit `migrateLocalOrganizationsToShared()` call
- Local records never deleted on success
- Marker key: `cbai-org-shared-migration:{userId}`

### Statuses

`not_started` | `preview_ready` | `in_progress` | `partially_completed` | `completed` | `failed` | `cancelled`

### Skipped records

Organizations owned by a different local user id are skipped with reason in report.

## Project migration (existing)

`lib/supabase/migration.ts` — projects, notes, tasks, etc. (BUILD prior to 039)

## Verification

Not live-verified — requires configured Supabase and signed-in user.
