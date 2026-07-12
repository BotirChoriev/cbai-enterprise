# Local-to-Cloud Migration Guide

What happens to a device's existing local work when its user signs into a Cloud Account, and why
it's safe.

## When it runs

`components/account/LocalWorkMigrationPrompt.tsx` appears on My Work whenever `accountMode ===
"cloud"` and this device has real local Projects/Notes/Tasks/Questions/Evidence/Bookmarks/Reports
that (a) haven't already been migrated for this cloud account
(`lib/supabase/migration.ts`'s `hasMigratedToCloud`) and (b) haven't been explicitly dismissed
("Keep Local for Now") for this cloud account on this device.

## What it shows before asking

Real counts from `detectLocalWork()` — projects, notes, tasks, open questions, evidence
references, related-entity links, bookmarks, and saved reports — computed from the same
synchronous loaders every other part of the app already uses. Never a vague "some data was found."

## What "Import to Cloud" does

`migrateLocalWorkToCloud(ownerId)` walks every local Project and its children, and every Bookmark
and saved Report, and upserts each as a real row via `lib/supabase/cloud-tables.ts`'s
`upsertCloudRow`, keyed on `(owner_id, local_id)` where `local_id` is the record's own existing
local id. That key is `unique` in the schema (`supabase/migrations/0001_init_schema.sql`), so:

- **No duplicate records.** Running the import twice — intentionally (retry after a partial
  failure) or accidentally (a second sign-in) — upserts the same rows again rather than creating
  copies.
- **Retry-safe.** If some records fail (network blip, a temporarily unreachable Supabase project),
  the summary reports exactly how many succeeded and how many didn't; retrying only re-attempts
  the same idempotent upserts.
- **User confirmation required.** Nothing uploads until the user clicks "Import to Cloud" — "Keep
  Local for Now" is always available and never deletes anything.
- **Migration summary.** On success, a real per-category count of what was imported is shown, and
  `hasMigratedToCloud` is marked true for that (device, cloud account) pair so the prompt doesn't
  reappear on every sign-in.
- **Local data is never deleted** by this flow, at any point — before, during, or after a
  successful import. There is currently no "clean up local copy after confirmation" step; the
  device's local data simply becomes a duplicate-but-harmless cache once the same records also
  exist in the cloud (see Cloud→Local Pull below).

## Cloud→Local Pull (the other direction)

On every cloud sign-in, `lib/supabase/pull-sync.ts`'s `pullCloudDataToLocal(ownerId)` fetches every
row the signed-in user owns and writes it into that cloud user's own local cache bucket
(`<key>:cloud:<ownerId>` — see `lib/storage/namespaced-key.ts`), so every existing synchronous
reader (`loadProjects()`, etc.) sees the cloud data immediately with zero call-site changes. It
merges by recency (`updated_at`/`created_at`) per record rather than overwriting wholesale — a
locally-newer edit made just before the pull (e.g. while briefly offline) is kept, not clobbered by
an older cloud copy.

## What is NOT covered

- Recent-view history (`cbai-platform-recent-entities`) is never migrated or synced — it's
  high-churn and low-value across devices by design.
- A "Review items" step beyond the itemized count shown before import was not built as a separate
  page — the counts themselves are the review.
- This flow was implemented and unit-tested (mocked, no live Supabase project); it has not been
  exercised against a real Supabase project's network in this environment — see the mission's
  final report for exactly what was and wasn't browser-verified.
