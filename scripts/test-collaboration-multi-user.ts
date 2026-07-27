// BUILD-039 — Real collaboration multi-user RLS journey against linked test accounts.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readSharedBackendTestEnv, sharedBackendTestsBlockedReason } from "@/lib/persistence/test-env-gate";

async function signIn(
  url: string,
  anonKey: string,
  email: string,
  password: string,
): Promise<{ client: SupabaseClient; userId: string }> {
  const auth = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) throw new Error(`Sign-in failed: ${error?.message ?? "no session"}`);
  return {
    userId: data.user.id,
    client: createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
      auth: { persistSession: false },
    }),
  };
}

test("B039-COL real collaboration multi-user RLS journey", async (t) => {
  const blocked = sharedBackendTestsBlockedReason();
  if (blocked) {
    t.skip(blocked);
    return;
  }
  const env = readSharedBackendTestEnv()!;
  const a = await signIn(env.url, env.anonKey, env.userAEmail, env.userAPassword);
  const b = await signIn(env.url, env.anonKey, env.userBEmail, env.userBPassword);
  const anon = createClient(env.url, env.anonKey, { auth: { persistSession: false } });
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const created = await a.client.from("mission_collaborations").insert({
    mission_id: `collaboration-security-${stamp}`,
    title: `Collaboration security ${stamp}`,
    description: "Preview-only RLS verification fixture",
    visibility: "invited_participants",
    status: "active",
    created_by: a.userId,
  }).select("id").single();
  assert.equal(created.error, null, created.error?.message);
  const collaborationId = created.data!.id;

  const participants = await a.client.from("collaboration_participants").insert([
    {
      collaboration_id: collaborationId,
      participant_type: "user",
      user_id: a.userId,
      role: "owner",
      status: "active",
      invited_by: a.userId,
      accepted_at: new Date().toISOString(),
    },
    {
      collaboration_id: collaborationId,
      participant_type: "user",
      user_id: b.userId,
      role: "reviewer",
      status: "invited",
      invited_by: a.userId,
    },
  ]);
  assert.equal(participants.error, null, participants.error?.message);

  const accepted = await b.client.from("collaboration_participants")
    .update({ status: "active", accepted_at: new Date().toISOString() })
    .eq("collaboration_id", collaborationId)
    .eq("user_id", b.userId);
  assert.equal(accepted.error, null, accepted.error?.message);

  const selfPromote = await b.client.from("collaboration_participants")
    .update({ role: "owner" })
    .eq("collaboration_id", collaborationId)
    .eq("user_id", b.userId);
  assert.ok(selfPromote.error, "Participant must not change their own role");
  const roleAfterAttempt = await b.client.from("collaboration_participants")
    .select("role,status")
    .eq("collaboration_id", collaborationId)
    .eq("user_id", b.userId)
    .single();
  assert.equal(roleAfterAttempt.error, null, roleAfterAttempt.error?.message);
  assert.deepEqual(roleAfterAttempt.data, { role: "reviewer", status: "active" });

  const memberRead = await b.client.from("mission_collaborations").select("id").eq("id", collaborationId).single();
  assert.equal(memberRead.error, null, memberRead.error?.message);
  assert.equal(memberRead.data?.id, collaborationId);

  const shared = await a.client.from("collaboration_shared_objects").insert({
    collaboration_id: collaborationId,
    object_type: "problem",
    object_id: `problem-${stamp}`,
    access_level: "review",
    shared_by: a.userId,
    status: "active",
  });
  assert.equal(shared.error, null, shared.error?.message);

  const memberSharedRead = await b.client.from("collaboration_shared_objects")
    .select("object_id")
    .eq("collaboration_id", collaborationId)
    .single();
  assert.equal(memberSharedRead.error, null, memberSharedRead.error?.message);
  assert.equal(memberSharedRead.data?.object_id, `problem-${stamp}`);

  const anonRead = await anon.from("mission_collaborations").select("id").eq("id", collaborationId);
  assert.ok(anonRead.error || !anonRead.data?.length, "Anonymous user must not read collaboration");
});
