import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const migration = readFileSync("supabase/migrations/0017_human_context_cloud.sql", "utf8");
const repository = readFileSync("lib/human-centered-workspace/cloud-context-repository.ts", "utf8");

test("Human Context cloud rows are owner-private and anonymous access is revoked", () => {
  assert.match(migration, /enable row level security/g);
  assert.match(migration, /owner_id = auth\.uid\(\)/g);
  assert.match(migration, /revoke all privileges on table public\.human_context_snapshots from public, anon/);
  assert.match(migration, /revoke all privileges on table public\.human_context_events from public, anon/);
});

test("context writes are authenticated, versioned, atomic RPC operations", () => {
  assert.match(migration, /create or replace function public\.save_human_context/);
  assert.match(migration, /security definer set search_path = pg_catalog/);
  assert.match(migration, /authentication_required/);
  assert.match(migration, /human_context_version_conflict/);
  assert.match(migration, /insert into public\.human_context_events/);
  assert.doesNotMatch(migration, /grant (insert|update|delete) on table public\.human_context_snapshots/i);
});

test("audit metadata excludes the complete personal context payload", () => {
  assert.match(migration, /jsonb_build_object\('changedKeys'/);
  assert.doesNotMatch(migration, /safe_metadata[^;]+p_context/s);
});

test("owner deletion removes the snapshot and cascades its personal event history", () => {
  assert.match(migration, /create or replace function public\.delete_human_context/);
  assert.match(migration, /where owner_id = v_actor and context_id = btrim\(p_context_id\)/);
  assert.match(migration, /references public\.human_context_snapshots[\s\S]+on delete cascade/);
});

test("browser repository reports cloud and version failures instead of silently pretending to save", () => {
  assert.match(repository, /cloud_unavailable/);
  assert.match(repository, /version_conflict/);
  assert.match(repository, /client\.rpc\("save_human_context"/);
  assert.match(repository, /client\.rpc\("delete_human_context"/);
  assert.doesNotMatch(repository, /localStorage/);
});
