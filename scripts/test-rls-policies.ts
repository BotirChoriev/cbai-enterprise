// BUILD-039 — Direct Supabase RLS policy verification.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readSharedBackendTestEnv, sharedBackendTestsBlockedReason } from "@/lib/persistence/test-env-gate";
import { generateInvitationTokenSync } from "@/lib/organization-os/invitation-token";

const TABLES = [
  "organizations",
  "organization_memberships",
  "organization_invitations",
  "organization_audit_events",
  "mission_collaborations",
  "collaboration_participants",
  "collaboration_shared_objects",
  "collaboration_review_assignments",
  "user_notifications",
  "living_relationships",
] as const;

async function signIn(
  url: string,
  anonKey: string,
  email: string,
  password: string,
): Promise<{ client: SupabaseClient; userId: string }> {
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`Sign-in failed for ${email}`);
  return {
    userId: data.user.id,
    client: createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
      auth: { persistSession: false },
    }),
  };
}

test("B039-RLS suite — direct table boundary tests", async () => {
  const blocked = sharedBackendTestsBlockedReason();
  if (blocked) {
    console.log(`SKIP RLS suite: ${blocked}`);
    return;
  }
  const env = readSharedBackendTestEnv()!;

  const a = await signIn(env.url, env.anonKey, env.userAEmail, env.userAPassword);
  const b = await signIn(env.url, env.anonKey, env.userBEmail, env.userBPassword);
  const clientA = a.client;
  const clientB = b.client;

  const anon = createClient(env.url, env.anonKey, { auth: { persistSession: false } });

  const orgName = `RLS Org ${Date.now()}`;
  const { data: created, error: createErr } = await clientA.rpc("create_organization_with_owner", {
    p_name: orgName,
    p_organization_type: "other",
  });
  assert.ok(!createErr, createErr?.message);
  const orgId = (created as { organization: { id: string } }).organization.id;

  const ownerRead = await clientA.from("organizations").select("id").eq("id", orgId).maybeSingle();
  assert.ok(ownerRead.data?.id, "Owner must read organization");

  const { tokenHash, rawToken } = generateInvitationTokenSync();
  await clientA.from("organization_invitations").insert({
    organization_id: orgId,
    recipient_email_normalized: env.userBEmail.toLowerCase(),
    intended_role: "member",
    token_hash: tokenHash,
    status: "pending",
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    created_by: a.userId,
  });

  await clientB.rpc("accept_organization_invitation_by_token", { p_raw_token: rawToken });
  const memberRead = await clientB.from("organizations").select("id").eq("id", orgId).maybeSingle();
  assert.ok(memberRead.data?.id, "Member must read organization");

  const anonRead = await anon.from("organizations").select("id").eq("id", orgId).maybeSingle();
  assert.equal(anonRead.data, null, "Anonymous must not read private organization");

  for (const rpc of [
    anon.rpc("create_organization_with_owner", { p_name: "forbidden-anon-org", p_organization_type: "other" }),
    anon.rpc("accept_organization_invitation_by_token", { p_raw_token: "forbidden-anon-token" }),
    anon.rpc("append_organization_activity", {
      p_organization_id: orgId,
      p_action: "forbidden_anonymous_event",
      p_target_type: null,
      p_target_id: null,
      p_correlation_id: null,
    }),
  ]) {
    const result = await rpc;
    assert.ok(result.error, "Anonymous RPC execution must be denied");
  }

  if (env.userCEmail && env.userCPassword) {
    const clientC = await signIn(env.url, env.anonKey, env.userCEmail, env.userCPassword);
    const strangerRead = await clientC.client.from("organizations").select("id").eq("id", orgId).maybeSingle();
    assert.equal(strangerRead.data, null, "Unrelated user must not read organization by UUID");
  }

  for (const table of TABLES) {
    const { data, error } = await anon.from(table).select("id").limit(1);
    assert.ok(error || !data?.length, `Anonymous select on ${table} must not leak data`);
  }

  const guestPromote = await clientB
    .from("organization_memberships")
    .update({ role: "owner" })
    .eq("organization_id", orgId)
    .select("role");
  assert.ok(guestPromote.error || guestPromote.data?.length === 0, "Member self-promote must affect no row");
  const roleAfterAttempt = await clientB
    .from("organization_memberships")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", b.userId)
    .single();
  assert.equal(roleAfterAttempt.error, null, roleAfterAttempt.error?.message);
  assert.equal(roleAfterAttempt.data?.role, "member", "Member role must remain unchanged");

  await clientA.auth.signOut();
  await clientB.auth.signOut();
});
