# Database Schema

Reference for `supabase/migrations/0001_init_schema.sql` — the source of truth is the SQL file
itself; this is a navigable summary, not a duplicate spec that can drift from it.

## Tables

| Table | Purpose | Owned by |
|---|---|---|
| `profiles` | One row per `auth.users` row — display name, organization, language, workspace role, country, timezone, accessibility preferences, Assistant name/avatar. | `id` (== `auth.uid()`) |
| `projects` | The Project Engine's primary object — title, type, description, status, visibility, primary entity, tags, research question, objectives, report-generated timestamp. | `owner_id` |
| `project_objectives` | Forward-compatible granular objectives per project (today mirrors `projects.objectives` as a single row). | `owner_id` |
| `project_notes` | Real, user-authored notes, optionally linked to evidence or an entity. | `owner_id` |
| `project_tasks` | Todo/in-progress/done tasks. | `owner_id` |
| `project_questions` | Open questions, with a resolved flag and timestamp. | `owner_id` |
| `project_evidence` | Real, user-authored evidence references (never auto-generated). | `owner_id` |
| `project_entity_links` | Related Countries/Companies/Universities/Research topics/Projects. | `owner_id` |
| `bookmarks` | Pinned entities (Workspace / My Work) — separate from high-churn recent-view history, which is intentionally never synced to the cloud. | `owner_id` |
| `reports` | A persisted index of saved reports — kind, entity, title, when saved. Never a content snapshot: reopening always renders the live current report. | `owner_id` |
| `activity_events` | Real, user-caused events only. | `owner_id` |

## Conventions

- **UUID primary keys** (`gen_random_uuid()`) on every table.
- **`owner_id uuid references auth.users(id)`** on every user-owned table (profiles uses `id`
  directly, since it *is* the per-user row).
- **`created_at` / `updated_at` timestamptz**, maintained by a shared `set_updated_at()` trigger —
  never set manually by application code.
- **`local_id text`** on every synced table: the device-local record's own id (e.g.
  `project-1730000000000-ab12cd`), stored once as a dedup marker. Combined with a
  `unique (owner_id, local_id)` constraint, this is what makes every write from
  `lib/supabase/outbox.ts` and `lib/supabase/migration.ts` a safe upsert — retrying a queued
  operation or re-running a migration can never create a duplicate row.
- **JSONB used sparingly** — only `projects.tags` and `profiles.accessibility_preferences`, both
  genuinely flexible metadata. Every relational field (title, status, body, etc.) is a real typed
  column; core data is never folded into one blob (see Phase 5 of the mission that added this).
- **Foreign keys cascade** (`on delete cascade`) from every child table to its parent `projects`
  row, and from every user-owned table to `auth.users` — deleting a project or a user cleans up
  its own records, never someone else's.

## What is intentionally NOT in this schema

- No generic key-value/blob table — see `lib/storage/storage-provider.ts`'s doc comment.
- No `recent_entities` table — recent-view history stays local-only (high-churn, low-value to
  sync).
- No `password_hash` column anywhere — Supabase Auth (`auth.users`) owns credentials entirely.
- No public/team visibility policy — `projects.visibility` can be set to `"team"`/`"public"` in the
  data model, but no RLS policy grants access on that basis yet (see
  [`rls-policy-guide.md`](./rls-policy-guide.md)); those values remain UI-declared Planned only.
