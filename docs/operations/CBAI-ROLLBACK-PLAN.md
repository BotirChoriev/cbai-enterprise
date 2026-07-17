# CBAI Rollback Plan (BUILD-038)

## Static export

1. Identify last known-good commit (tag or `git log`).
2. `git checkout <commit> && npm run build`
3. Deploy prior `out/` artifact to hosting (manual — Cloudflare unchanged in this program).

## Supabase

1. Do not drop tables in production without backup.
2. Roll forward preferred: apply compensating migration.
3. Migration rollback scripts: reverse DDL from `0005`/`0006` only in non-production.

## Data

Device-local users lose no server data on rollback. Cloud-synced projects/notes use existing Supabase tables from earlier migrations.
