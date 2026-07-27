import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readSharedBackendTestEnv, sharedBackendTestsBlockedReason } from "@/lib/persistence/test-env-gate";

async function authenticatedClient(
  url: string,
  anonKey: string,
  email: string,
  password: string,
): Promise<{ client: SupabaseClient; userId: string }> {
  const authClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) throw new Error(`Test-account sign-in failed: ${error?.message ?? "no session"}`);
  return {
    userId: data.user.id,
    client: createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
      auth: { persistSession: false },
    }),
  };
}

function payload(problemId: string, decisions: unknown[] = [], activity: unknown[] = []) {
  return {
    id: problemId,
    schemaVersion: 1,
    status: "investigating",
    finalDecisionOwner: "human",
    decisions,
    activity,
  };
}

test("Problem OS live RLS, IDOR, history and audit boundaries", async (t) => {
  const blocked = sharedBackendTestsBlockedReason();
  if (blocked) {
    t.skip(blocked);
    return;
  }
  const env = readSharedBackendTestEnv()!;
  const a = await authenticatedClient(env.url, env.anonKey, env.userAEmail, env.userAPassword);
  const b = await authenticatedClient(env.url, env.anonKey, env.userBEmail, env.userBPassword);
  const anon = createClient(env.url, env.anonKey, { auth: { persistSession: false } });
  const localId = `rls-verification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const created = await a.client.from("problem_snapshots").insert({
    owner_id: a.userId,
    local_id: localId,
    schema_version: 1,
    status: "investigating",
    payload: payload(localId),
  }).select("id,version").single();
  assert.equal(created.error, null, created.error?.message);
  assert.equal(created.data?.version, 1);

  const ownerRead = await a.client.from("problem_snapshots").select("local_id").eq("local_id", localId);
  assert.equal(ownerRead.error, null);
  assert.equal(ownerRead.data?.length, 1, "Owner must read own Problem");

  const strangerRead = await b.client.from("problem_snapshots").select("local_id").eq("local_id", localId);
  assert.equal(strangerRead.error, null);
  assert.deepEqual(strangerRead.data, [], "Unrelated user must not read Problem by ID");

  const anonRead = await anon.from("problem_snapshots").select("local_id").eq("local_id", localId);
  assert.equal(anonRead.error, null);
  assert.deepEqual(anonRead.data, [], "Anonymous client must not read Problem");

  const forgedInsert = await b.client.from("problem_snapshots").insert({
    owner_id: a.userId,
    local_id: `${localId}-forged`,
    schema_version: 1,
    status: "investigating",
    payload: payload(`${localId}-forged`),
  });
  assert.ok(forgedInsert.error, "User B must not create a Problem owned by User A");

  const firstDecision = [{ id: "decision-1", owner: "human", summary: "Human test decision" }];
  const appended = await a.client.from("problem_snapshots")
    .update({ payload: payload(localId, firstDecision, [{ id: "event-1", actor: "human" }]) })
    .eq("local_id", localId)
    .select("version")
    .single();
  assert.equal(appended.error, null, appended.error?.message);
  assert.equal(appended.data?.version, 2, "Server trigger must increment version");

  const rewriteDecision = await a.client.from("problem_snapshots")
    .update({ payload: payload(localId, [{ id: "decision-rewritten", owner: "human" }], [{ id: "event-1", actor: "human" }]) })
    .eq("local_id", localId);
  assert.ok(rewriteDecision.error, "A human decision snapshot must be append-only");

  const directAuditWrite = await a.client.from("problem_audit_events").insert({
    problem_local_id: localId,
    owner_id: a.userId,
    actor_id: a.userId,
    event_type: "forged_client_event",
  });
  assert.ok(directAuditWrite.error, "Clients must not forge audit events");

  const auditRead = await a.client.from("problem_audit_events")
    .select("event_type")
    .eq("problem_local_id", localId)
    .order("created_at", { ascending: true });
  assert.equal(auditRead.error, null, auditRead.error?.message);
  assert.deepEqual(
    auditRead.data?.map((row) => row.event_type),
    ["problem_snapshot_created", "problem_snapshot_updated"],
    "Trusted triggers must create the audit trail",
  );

  const strangerAuditRead = await b.client.from("problem_audit_events").select("id").eq("problem_local_id", localId);
  assert.equal(strangerAuditRead.error, null);
  assert.deepEqual(strangerAuditRead.data, [], "Unrelated user must not read audit history");
});
