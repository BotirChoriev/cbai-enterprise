/**
 * Preview-only live collaboration proof:
 * - Org create (A), invite+accept (B), stranger denied (C)
 * - Comments + mentions
 * - Approvals decide
 * - Organization activity RPC
 * Never prints secrets. Never targets Production.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generateInvitationTokenSync } from "@/lib/organization-os/invitation-token";
import { readSharedBackendTestEnv } from "@/lib/persistence/test-env-gate";

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const s = line.trim();
    if (!s || s.startsWith("#") || !s.includes("=")) continue;
    const i = s.indexOf("=");
    const k = s.slice(0, i);
    let v = s.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env) || !process.env[k]) process.env[k] = v;
  }
}

async function signIn(
  url: string,
  anonKey: string,
  email: string,
  password: string,
): Promise<{ client: SupabaseClient; userId: string }> {
  const auth = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    throw new Error(`Sign-in failed for ${email}: ${error?.message ?? "no session"}`);
  }
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false },
  });
  return { client, userId: data.user.id };
}

type Proof = Record<string, unknown>;

async function main() {
  loadEnvLocal();
  const env = readSharedBackendTestEnv();
  if (!env) {
    console.error("BLOCKED: shared backend test env incomplete");
    process.exitCode = 2;
    return;
  }
  if (!env.userCEmail || !env.userCPassword) {
    console.error("BLOCKED: User C credentials required for stranger RLS proof");
    process.exitCode = 2;
    return;
  }

  console.log("=== live collaboration verification (Preview) ===");
  console.log(`host: ${new URL(env.url).host}`);

  const proof: Proof = {
    environment: "preview",
    host: new URL(env.url).host,
    startedAt: new Date().toISOString(),
  };

  const a = await signIn(env.url, env.anonKey, env.userAEmail, env.userAPassword);
  const b = await signIn(env.url, env.anonKey, env.userBEmail, env.userBPassword);
  const c = await signIn(env.url, env.anonKey, env.userCEmail, env.userCPassword);
  proof.users = {
    a: a.userId.slice(0, 8),
    b: b.userId.slice(0, 8),
    c: c.userId.slice(0, 8),
  };

  // --- 1) Organization: A creates, B joins as reviewer, C denied ---
  const orgName = `Live Proof Org ${Date.now()}`;
  const { data: created, error: createErr } = await a.client.rpc(
    "create_organization_with_owner",
    { p_name: orgName, p_organization_type: "other" },
  );
  assert.ok(!createErr, `create org: ${createErr?.message}`);
  const orgId = (created as { organization: { id: string } }).organization.id;
  proof.orgId = orgId.slice(0, 8);
  proof.orgName = orgName;

  const { tokenHash, rawToken } = generateInvitationTokenSync();
  const inviteInsert = await a.client.from("organization_invitations").insert({
    organization_id: orgId,
    recipient_email_normalized: env.userBEmail.toLowerCase(),
    intended_role: "reviewer",
    token_hash: tokenHash,
    status: "pending",
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    created_by: a.userId,
  });
  assert.ok(!inviteInsert.error, `invite insert: ${inviteInsert.error?.message}`);

  const accept = await b.client.rpc("accept_organization_invitation_by_token", {
    p_raw_token: rawToken,
  });
  assert.ok(!accept.error, `accept invite: ${accept.error?.message}`);

  const aRead = await a.client.from("organizations").select("id,name").eq("id", orgId).maybeSingle();
  const bRead = await b.client.from("organizations").select("id,name").eq("id", orgId).maybeSingle();
  const cRead = await c.client.from("organizations").select("id,name").eq("id", orgId).maybeSingle();
  assert.equal(aRead.data?.id, orgId, "A must read org");
  assert.equal(bRead.data?.id, orgId, "B must read org after accept");
  assert.equal(cRead.data, null, "C must NOT read org by UUID");
  proof.organizationIsolation = {
    aCanRead: true,
    bCanRead: true,
    cDenied: cRead.data === null,
  };

  // C creates own org (authenticated but unrelated)
  const { data: cOrg, error: cOrgErr } = await c.client.rpc("create_organization_with_owner", {
    p_name: `Stranger Org ${Date.now()}`,
    p_organization_type: "other",
  });
  assert.ok(!cOrgErr, `C own org: ${cOrgErr?.message}`);
  proof.userCOwnOrg = Boolean((cOrg as { organization?: { id: string } })?.organization?.id);

  // --- 2) Comments + mentions ---
  const commentInsert = await a.client
    .from("enterprise_comments")
    .insert({
      organization_id: orgId,
      target_type: "mission",
      target_id: "mission-live-proof",
      author_id: a.userId,
      body: `Live proof comment mentioning B`,
    })
    .select("id")
    .single();
  assert.ok(!commentInsert.error, `comment insert: ${commentInsert.error?.message}`);
  const commentId = commentInsert.data!.id as string;

  const mentionInsert = await a.client.from("enterprise_mentions").insert({
    organization_id: orgId,
    comment_id: commentId,
    mentioned_user_id: b.userId,
    mentioned_by: a.userId,
    target_type: "mission",
    target_id: "mission-live-proof",
  });
  assert.ok(!mentionInsert.error, `mention insert: ${mentionInsert.error?.message}`);

  const bComments = await b.client
    .from("enterprise_comments")
    .select("id,body")
    .eq("organization_id", orgId);
  const cComments = await c.client
    .from("enterprise_comments")
    .select("id")
    .eq("organization_id", orgId);
  assert.ok((bComments.data?.length ?? 0) >= 1, "B must see org comments");
  assert.equal(cComments.data?.length ?? 0, 0, "C must not see org comments");
  assert.ok(!cComments.error || (cComments.data?.length ?? 0) === 0);

  const bMentions = await b.client
    .from("enterprise_mentions")
    .select("id")
    .eq("mentioned_user_id", b.userId);
  assert.ok((bMentions.data?.length ?? 0) >= 1, "B must see own mention");
  proof.comments = {
    created: true,
    bCanRead: (bComments.data?.length ?? 0) >= 1,
    cDenied: (cComments.data?.length ?? 0) === 0,
    mentionVisibleToB: (bMentions.data?.length ?? 0) >= 1,
  };

  // Cross-org ID manipulation: C tries to insert comment into A's org
  const cForge = await c.client.from("enterprise_comments").insert({
    organization_id: orgId,
    target_type: "mission",
    target_id: "forge",
    author_id: c.userId,
    body: "should fail",
  });
  assert.ok(cForge.error, "C forge comment into foreign org must fail RLS");
  proof.crossOrgForgeDenied = Boolean(cForge.error);

  // --- 3) Approvals ---
  const approvalInsert = await a.client
    .from("enterprise_approvals")
    .insert({
      organization_id: orgId,
      target_type: "report",
      target_id: "report-live-proof",
      title: "Live proof approval",
      requested_by: a.userId,
      assigned_to: b.userId,
      status: "pending",
    })
    .select("id,status")
    .single();
  assert.ok(!approvalInsert.error, `approval insert: ${approvalInsert.error?.message}`);
  const approvalId = approvalInsert.data!.id as string;

  const decide = await b.client
    .from("enterprise_approvals")
    .update({ status: "approved", decision_note: "live proof ok" })
    .eq("id", approvalId)
    .select("id,status")
    .single();
  assert.ok(!decide.error, `approval decide: ${decide.error?.message}`);
  assert.equal(decide.data?.status, "approved");

  const cApprovals = await c.client
    .from("enterprise_approvals")
    .select("id")
    .eq("organization_id", orgId);
  assert.equal(cApprovals.data?.length ?? 0, 0, "C must not see approvals");

  const cDecide = await c.client
    .from("enterprise_approvals")
    .update({ status: "rejected" })
    .eq("id", approvalId);
  // Either error or 0 rows — must not change status
  const afterForge = await a.client
    .from("enterprise_approvals")
    .select("status")
    .eq("id", approvalId)
    .single();
  assert.equal(afterForge.data?.status, "approved", "C must not alter approval");
  proof.approvals = {
    requested: true,
    decidedByB: decide.data?.status === "approved",
    cCannotRead: (cApprovals.data?.length ?? 0) === 0,
    cCannotAlter: afterForge.data?.status === "approved",
    cDecideError: Boolean(cDecide.error),
  };

  // --- 4) Organization activity ---
  const activity = await a.client.rpc("append_organization_activity", {
    p_organization_id: orgId,
    p_action: "live_proof_comment",
    p_target_type: "mission",
    p_target_id: "mission-live-proof",
    p_correlation_id: `proof-${Date.now()}`,
  });
  assert.ok(!activity.error, `append activity: ${activity.error?.message}`);
  const activityId = activity.data as string;

  const aActivity = await a.client
    .from("activity_events")
    .select("id,action,organization_id")
    .eq("id", activityId)
    .maybeSingle();
  const bActivity = await b.client
    .from("activity_events")
    .select("id,action")
    .eq("organization_id", orgId);
  const cActivity = await c.client
    .from("activity_events")
    .select("id")
    .eq("organization_id", orgId);
  assert.equal(aActivity.data?.id, activityId);
  assert.ok((bActivity.data?.length ?? 0) >= 1, "B must see org activity");
  assert.equal(cActivity.data?.length ?? 0, 0, "C must not see org activity");

  const cAppend = await c.client.rpc("append_organization_activity", {
    p_organization_id: orgId,
    p_action: "forged",
  });
  assert.ok(cAppend.error, "C append to foreign org must fail");
  proof.activity = {
    appendedByA: Boolean(activityId),
    visibleToB: (bActivity.data?.length ?? 0) >= 1,
    cCannotRead: (cActivity.data?.length ?? 0) === 0,
    cAppendDenied: Boolean(cAppend.error),
  };

  // --- 5) Member self-promote denied (RLS often returns 0 rows, not an error) ---
  const beforeRole = await b.client
    .from("organization_memberships")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", b.userId)
    .single();
  assert.equal(beforeRole.data?.role, "reviewer");

  await b.client
    .from("organization_memberships")
    .update({ role: "owner" })
    .eq("organization_id", orgId)
    .eq("user_id", b.userId);

  const afterRole = await b.client
    .from("organization_memberships")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", b.userId)
    .single();
  assert.equal(afterRole.data?.role, "reviewer", "B must remain reviewer after self-promote attempt");
  proof.rbac = {
    memberSelfPromoteDenied: afterRole.data?.role === "reviewer",
    roleAfterAttempt: afterRole.data?.role,
  };

  proof.verdict = "PASS";
  proof.finishedAt = new Date().toISOString();
  console.log("=== LIVE PROOF RESULT ===");
  console.log(JSON.stringify(proof, null, 2));
  console.log("STATUS: Implemented — live Preview collaboration/approvals/activity verified");
}

main().catch((err) => {
  console.error("LIVE PROOF FAILED:", err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
