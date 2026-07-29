import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/0014_organization_responsibility_maps.sql"),
  "utf8",
);

test("responsibility persistence is additive and problem-scoped", () => {
  assert.match(migration, /create table if not exists public\.organization_responsibility_maps/);
  assert.match(migration, /organization_id uuid not null references public\.organizations/);
  assert.match(migration, /problem_local_id text not null/);
  assert.match(migration, /unique \(organization_id, problem_local_id\)/);
  assert.doesNotMatch(migration, /\bdrop table\b|\balter table public\.organizations add\b/i);
});

test("direct client writes are unavailable", () => {
  assert.match(migration, /enable row level security/);
  assert.match(migration, /create policy responsibility_maps_select_member/);
  assert.doesNotMatch(migration, /create policy responsibility_maps_(insert|update|delete)/);
  assert.match(migration, /grant select on table public\.organization_responsibility_maps to authenticated/);
  assert.doesNotMatch(migration, /grant (insert|update|delete|all).*organization_responsibility_maps/i);
});

test("confirmation RPC requires a human organization leader", () => {
  assert.match(migration, /v_actor uuid := auth\.uid\(\)/);
  assert.match(migration, /private\.current_user_org_role\(p_organization_id\)/);
  assert.match(migration, /'owner', 'administrator', 'mission_lead'/);
  assert.match(migration, /responsibility_map_confirmation_not_authorized/);
  assert.match(migration, /grant execute .*[\s\S]*to authenticated/);
  assert.match(migration, /revoke all privileges .*[\s\S]*from public, anon, authenticated/);
});

test("RPC verifies real active memberships and separation of duties", () => {
  assert.match(migration, /from public\.organization_memberships m/);
  assert.match(migration, /m\.status = 'active'/);
  assert.match(migration, /required_responsibility_missing/);
  assert.match(migration, /decision_owner_is_evidence_reviewer/);
  assert.match(migration, /problem_has_no_independent_monitor/);
  assert.match(migration, /responsibility_map_version_conflict/);
});

test("every confirmed map appends an organization audit event", () => {
  assert.match(migration, /insert into public\.organization_audit_events/);
  assert.match(migration, /responsibility_map_human_confirmed/);
  assert.match(migration, /assignmentCount/);
  const auditInsert = migration.slice(migration.indexOf("insert into public.organization_audit_events"));
  assert.doesNotMatch(auditInsert, /'assignments'|p_assignments/);
});
