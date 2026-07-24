# Migration plan — Supabase forward-only

**Branch:** `preview/spatial-world-intelligence`
**Recorded:** 2026-07-22
**Policy:** Forward-only migrations. No destructive rollback in production without ops approval. **Do not apply to production Supabase in this program** — credentials and deploy access are **EXTERNAL_BLOCKED**.

---

## Applied migrations (repo SQL only — not verified on live project)

| File | Purpose | Live apply status |
|------|---------|-------------------|
| `0001_init_schema.sql` | Profiles projects bookmarks reports activity | **EXTERNAL_BLOCKED** |
| `0002_rls_policies.sql` | RLS for user-owned tables | **EXTERNAL_BLOCKED** |
| `0003_rls_verification_queries.sql` | Verification queries (non-destructive) | **EXTERNAL_BLOCKED** |
| `0004_evidence_bookmarks.sql` | Evidence bookmarks | **EXTERNAL_BLOCKED** |
| `0005_organization_collaboration_graph.sql` | Orgs memberships invitations graph notifications | **EXTERNAL_BLOCKED** |
| `0006_rls_organization_collaboration.sql` | RLS for org/collab tables | **EXTERNAL_BLOCKED** |
| `0007_organization_rpc_functions.sql` | Org RPC helpers | **EXTERNAL_BLOCKED** |

**Gap (start):** No `0008_*` at program start.
**Now present:** `supabase/migrations/0008_object_storage_and_messages.sql` (forward-only SQL in repo).
**Live apply:** still **EXTERNAL_BLOCKED** without credentials / ops approval.

---

## `0008_object_storage_and_messages.sql` (implemented in repo)

**Owner:** object-storage + organization-os messages (DD-PC-003, DD-PC-004)
**Status:** **PROVEN_AUTOMATED** (static SQL + RLS policy presence via `test:preview-completion-rls-static`)
**Live multi-user RLS:** **EXTERNAL_BLOCKED**

### Scope

1. `storage_objects` — metadata refs; lifecycle + scan_status; RLS owner/org
2. `message_threads` / `messages` — sender_user_id = auth.uid(); idempotency unique
3. `activity_events` — client insert denied (append via trusted path later)

Virus scanning service integration remains **EXTERNAL_BLOCKED**.

3. **RLS**
   - Owner read/write on private refs
   - Org membership check for team visibility
   - Public refs require `rights_confirmed` stub alignment (SF-5)

4. **Client mapping**
   - `/scientific-documents` → metadata row + storage ref (never localStorage bytes)
   - `/messages` → thread list when cloud session active

### Forward-only rule

- Add columns/tables only; no `DROP` of legacy local keys in same migration
- Local → cloud idempotency via existing `local_id` pattern in `0001`

---

## Backup / rollback

| Phase | Backup | Rollback |
|-------|--------|----------|
| **Pre-apply (ops)** | Supabase project snapshot / `pg_dump` before `db push` | Restore snapshot; revert app to prior static export |
| **Per migration** | Git tag migration SHA; store applied revision in `supabase_migrations.schema_migrations` | Forward-fix only — **no** `DOWN` scripts in repo |
| **This program** | N/A — no apply attempted | Delete draft `0008` doc/spec if rejected; SQL tree unchanged |

**Local dev:** `supabase db reset` acceptable on disposable local stack only — not production.

---

## Apply procedure (when EXTERNAL_BLOCKED lifted)

1. Ops supplies Supabase project URL + service role (never commit; never log values)
2. Run `0001` → `0007` in order if greenfield; else diff against live schema
3. Add `0008` after review; run RLS verification queries from `0003` + new IDOR tests
4. Configure Storage bucket policies matching RLS
5. Enable client cloud sync paths in `lib/supabase/*` behind feature flag
6. Manual Safari pass on `/scientific-documents`, `/messages`, `/organization`

---

## Verification status

| Gate | Status | Evidence |
|------|--------|----------|
| SQL files parse / ordered | **PROVEN_LOCAL** | Files present under `supabase/migrations/` |
| RLS logic reviewed | **PROVEN_LOCAL** | Stage 0/1 census docs |
| Applied to production Supabase | **EXTERNAL_BLOCKED** | No credentials in program |
| Storage buckets live | **EXTERNAL_BLOCKED** | 0008 not present |
| Client wired to 0008 | **PENDING_IMPLEMENTATION** | Placeholder routes |
