# Ontology Migration Policy

## Principles

1. **Idempotent** — safe to run on every load
2. **Non-destructive** — never delete legacy records
3. **Backward compatible** — old records still load
4. **Unknown-field tolerant** — extra keys preserved on ontology objects
5. **Lazy hydration** — adapters project legacy data on first access

## Storage Keys

| Key | Purpose |
|-----|---------|
| `cbai-ontology-objects` | Ontology object records |
| `cbai-ontology-relationships` | Typed relationship edges |
| `cbai-ontology-audit` | Mutation audit log |
| `cbai-ontology-migration-version` | Migration marker |

## Legacy Stores (unchanged)

- `cbai-operational-objects`
- `cbai-projects`
- `cbai-missions`
- `cbai-engine-runs`

## Migration Function

`migrateOntologyStore()` in `lib/ontology/migrations.ts`:

- Normalizes schema version to `1`
- Preserves unknown top-level fields
- Returns `{ objects, result }` with `unknownFieldsPreserved` count

## Rollback

Remove ontology keys from localStorage — legacy stores remain intact. No Supabase schema changes required for this foundation.

## Future Cloud Sync

When Supabase ontology tables are added, device-local records merge via `legacyRecordId` + `legacyStoreKey` provenance fields — not bulk overwrite.
