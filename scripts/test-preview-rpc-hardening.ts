import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  new URL("../supabase/migrations/0010_preview_rpc_security_hardening.sql", import.meta.url),
  "utf8",
);

test("authenticated organization RPCs explicitly exclude anon and PUBLIC", () => {
  for (const name of [
    "create_organization_with_owner",
    "accept_organization_invitation_by_token",
    "append_organization_activity",
  ]) {
    assert.match(migration, new RegExp(`revoke all privileges on function public\\.${name}`));
  }
  assert.match(migration, /from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.create_organization_with_owner[\s\S]*to authenticated/);
  assert.match(migration, /grant execute on function public\.accept_organization_invitation_by_token[\s\S]*to authenticated/);
  assert.match(migration, /grant execute on function public\.append_organization_activity[\s\S]*to authenticated/);
});

test("RLS helpers remain authenticated-only and internal triggers lose client execution", () => {
  for (const name of [
    "current_user_org_role",
    "is_active_org_member",
    "is_active_collaboration_participant",
    "organization_active_owner_count",
  ]) {
    assert.match(migration, new RegExp(`grant execute on function public\\.${name}\\(uuid\\) to authenticated`));
  }
  assert.doesNotMatch(migration, /grant execute on function public\.(set_updated_at|rls_auto_enable)/);
});

test("mutable search paths are hardened", () => {
  assert.match(migration, /alter function public\.set_updated_at\(\) set search_path = pg_catalog/);
  assert.match(migration, /alter function public\.organization_active_owner_count\(uuid\) set search_path = pg_catalog/);
});

test("collaboration self-acceptance is guarded from role and identity mutation", () => {
  const guard = readFileSync(
    new URL("../supabase/migrations/0011_collaboration_participant_acceptance_guard.sql", import.meta.url),
    "utf8",
  );
  assert.match(guard, /user_id = auth\.uid\(\)/);
  assert.match(guard, /participant_identity_or_role_is_immutable_for_self/);
  assert.match(guard, /old\.status <> 'invited'/);
  assert.match(guard, /new\.status <> 'active'/);
  assert.match(guard, /revoke all privileges on function public\.protect_collaboration_participant_self_update/);
});

test("RLS SECURITY DEFINER implementations move outside the exposed public schema", () => {
  const privateHelpers = readFileSync(
    new URL("../supabase/migrations/0012_private_rls_helpers.sql", import.meta.url),
    "utf8",
  );
  assert.match(privateHelpers, /create schema if not exists private/);
  assert.match(privateHelpers, /create or replace function private\.current_user_org_role/);
  assert.match(privateHelpers, /create or replace function private\.is_active_org_member/);
  assert.match(privateHelpers, /create or replace function private\.is_active_collaboration_participant/);
  assert.match(privateHelpers, /create or replace function public\.current_user_org_role[\s\S]*security invoker/);
  assert.match(privateHelpers, /revoke all on schema private from public, anon/);
});
