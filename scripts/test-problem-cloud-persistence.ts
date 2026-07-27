import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SYNC_TABLES } from "@/lib/supabase/cloud-tables";

const migration = readFileSync(
  new URL("../supabase/migrations/0008_problem_os.sql", import.meta.url),
  "utf8",
);
const repository = readFileSync(
  new URL("../lib/problems/problem-repository.ts", import.meta.url),
  "utf8",
);
const pullSync = readFileSync(
  new URL("../lib/supabase/pull-sync.ts", import.meta.url),
  "utf8",
);

test("Problem snapshots are part of the existing retry-safe cloud outbox", () => {
  assert.ok(SYNC_TABLES.includes("problem_snapshots"));
  assert.match(repository, /enqueueSync\(ownerId,\s*"problem_snapshots",\s*"upsert"/);
  assert.match(repository, /getSyncedCloudUserId/);
});

test("Problem RLS is owner-bound and anonymous access has no policy", () => {
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /owner_id = auth\.uid\(\)/);
  assert.doesNotMatch(migration, /to\s+anon/i);
  assert.doesNotMatch(migration, /using\s*\(\s*true\s*\)/i);
});

test("Decision and activity history are append-only at the database boundary", () => {
  assert.match(migration, /problem_decision_history_is_append_only/);
  assert.match(migration, /problem_activity_is_append_only/);
  assert.match(migration, /new_decisions_prefix\s+<>\s+old_decisions/);
  assert.match(migration, /new_activity_prefix\s+<>\s+old_activity/);
  assert.match(migration, /jsonb_agg\(item order by position\)/);
});

test("Audit events are server-triggered and have no client mutation policy", () => {
  assert.match(migration, /audit_problem_snapshot_change_trigger/);
  assert.match(migration, /security definer/);
  assert.match(migration, /problem_audit_events_select_owner/);
  assert.doesNotMatch(migration, /problem_audit_events_insert/);
  assert.doesNotMatch(migration, /problem_audit_events_update/);
});

test("Cloud pull hydrates the existing namespaced local Problem cache", () => {
  assert.match(pullSync, /listCloudRows\("problem_snapshots", ownerId\)/);
  assert.match(pullSync, /cloudBucketKey\(PROBLEMS_KEY, ownerId\)/);
  assert.match(pullSync, /mergeByRecency/);
});
