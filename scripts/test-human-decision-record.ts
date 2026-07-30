import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { persistConfirmedHumanDecision } from "@/lib/decision-ledger/persistence";

const migration = readFileSync(
  "supabase/migrations/0016_human_decision_records.sql",
  "utf8",
);
const persistence = readFileSync("lib/decision-ledger/persistence.ts", "utf8");

test("decision schema is immutable-by-default and owner-readable", () => {
  assert.match(migration, /create table if not exists public\.human_decision_records/);
  assert.match(migration, /status = 'human_confirmed'/);
  assert.match(migration, /human_decision_records_select_owner/);
  assert.match(migration, /human_decision_history_is_immutable/);
  assert.match(migration, /before update or delete/);
  assert.doesNotMatch(migration, /create policy human_decision_records_(insert|update|delete)/);
  assert.match(migration, /revoke all privileges on table public\.human_decision_records/);
});

test("confirmation RPC validates options, identity, and audit", () => {
  assert.match(migration, /authentication_required/);
  assert.match(migration, /at_least_two_options_required/);
  assert.match(migration, /chosen_option_must_match_considered_option/);
  assert.match(migration, /human_decision_confirmed/);
  assert.match(migration, /security definer/);
  assert.match(migration, /set search_path = pg_catalog/);
});

test("client refuses persistence without explicit human confirmation", async () => {
  const result = await persistConfirmedHumanDecision({
    missionLocalId: "mission-1",
    decisionSummary: "Choose option A",
    optionsConsidered: ["A", "B"],
    chosenOption: "A",
    rationale: "Human rationale",
    evidenceRefs: [],
    unknownsAtDecision: [],
    idempotencyKey: "mission-1:test",
    humanConfirmed: false,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /human confirmation/i);
  assert.match(persistence, /client\.rpc\("confirm_human_decision"/);
});
