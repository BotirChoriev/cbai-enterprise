import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/0018_personal_workspace_cloud.sql", "utf8");
const repository = readFileSync("lib/human-centered-workspace/cloud-workspace-lifecycle-repository.ts", "utf8");
const screen = readFileSync("components/workspace/PersonalWorkspaceHome.tsx", "utf8");
const voice = readFileSync("lib/voice-operator/conversation-engine.ts", "utf8");

test("personal workspaces and creation runs are owner-private", () => {
  assert.match(migration, /personal_workspace_aggregates enable row level security/);
  assert.match(migration, /workspace_creation_runs enable row level security/);
  assert.match(migration, /owner_id = auth\.uid\(\)/g);
  assert.match(migration, /revoke all privileges on table public\.personal_workspace_aggregates from public, anon/);
  assert.match(migration, /revoke all privileges on table public\.workspace_creation_runs from public, anon/);
});

test("workspace and recovery checkpoint persist atomically through authenticated RPC", () => {
  assert.match(migration, /create or replace function public\.save_personal_workspace/);
  assert.match(migration, /security definer set search_path = pg_catalog/);
  assert.match(migration, /authentication_required/);
  assert.match(migration, /workspace_owner_mismatch/);
  assert.match(migration, /insert into public\.personal_workspace_aggregates/);
  assert.match(migration, /insert into public\.workspace_creation_runs/);
  assert.doesNotMatch(migration, /grant (insert|update|delete) on table public\.personal_workspace/i);
});

test("voice completion reports cloud failure and never discards local recovery", () => {
  assert.match(voice, /await saveCloudPersonalWorkspace/);
  assert.match(voice, /Workspace qurilmada saqlandi, lekin cloud checkpoint yozilmadi/);
  assert.match(voice, /No data was discarded/);
});

test("workspace screen hydrates cloud records back into the local recovery cache", () => {
  assert.match(screen, /readCloudPersonalWorkspace\(workspaceId\)/);
  assert.match(screen, /deviceLocalWorkspaceLifecycleRepository\.saveWorkspace/);
  assert.match(screen, /Cloud sinxronlash bajarilmadi/);
  assert.doesNotMatch(repository, /localStorage/);
});
