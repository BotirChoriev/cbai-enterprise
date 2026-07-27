import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

test("Problem OS preflight is read-only and detects partial installs", () => {
  const sql = read("supabase/verification/problem_os_preflight.sql");
  assert.match(sql, /to_regclass\('auth\.users'\)/);
  assert.match(sql, /review_existing_install/);
  assert.doesNotMatch(sql, /\b(create|alter|drop|insert|update|delete)\s+(table|policy|trigger|function|into|from)\b/i);
});

test("Problem OS postflight verifies RLS, policies, triggers and audit immutability", () => {
  const sql = read("supabase/verification/problem_os_postflight.sql");
  const hardening = read("supabase/migrations/0009_problem_os_function_hardening.sql");
  assert.match(sql, /relrowsecurity/);
  assert.match(sql, /pg_policies/);
  assert.match(sql, /protect_problem_history_trigger/);
  assert.match(sql, /audit_has_no_client_mutation_policy/);
  assert.match(sql, /history_trigger_not_client_executable/);
  assert.match(hardening, /revoke all privileges on function public\.protect_problem_history\(\) from public, anon, authenticated/);
  assert.match(hardening, /revoke all privileges on function public\.audit_problem_snapshot_change\(\) from public, anon, authenticated/);
});

test("rollout runbook requires human gates and preserves decision history", () => {
  const runbook = read("docs/runbooks/problem-os-supabase-rollout.md");
  assert.match(runbook, /Human approval gates/);
  assert.match(runbook, /A skip is not a pass/);
  assert.match(runbook, /Do not drop the Problem tables/);
  assert.match(runbook, /Voice Operator remains on the existing Platform Action pipeline/);
});
