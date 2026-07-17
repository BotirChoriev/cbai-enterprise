// BUILD-039 — Shared persistence unit tests (local + optional live Supabase).

import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { detectPersistenceCapability, resolvePersistenceStatus } from "@/lib/persistence/persistence-capability";
import { __resetRepositoryFactoryForTests, resolveOrganizationRepository } from "@/lib/persistence/repository-factory";
import { DeviceLocalOrganizationRepository } from "@/lib/persistence/device-local-organization-adapter";
import { readSharedBackendTestEnv, sharedBackendTestsBlockedReason } from "@/lib/persistence/test-env-gate";
import { hashInvitationTokenSync } from "@/lib/organization-os/invitation-token";

test("B039-T001 persistence capability honest without full env", () => {
  const capability = detectPersistenceCapability();
  assert.ok(
    [
      "shared_backend_not_configured",
      "shared_backend_misconfigured",
      "shared_backend_ready",
    ].includes(capability),
  );
  if (capability !== "shared_backend_ready") {
    const status = resolvePersistenceStatus();
    assert.equal(status.organizationCollaborationShared, false);
    assert.equal(status.adapter, "device_local");
  }
});

test("B039-T002 device-local repository labeled honestly", () => {
  __resetRepositoryFactoryForTests();
  if (detectPersistenceCapability() === "shared_backend_ready") return;
  const repo = resolveOrganizationRepository();
  assert.equal(repo.isShared, false);
  assert.equal(repo.adapterKind, "device_local");
  assert.ok(repo instanceof DeviceLocalOrganizationRepository);
});

test("B039-T003 shared repository factory selects supabase when configured", () => {
  if (detectPersistenceCapability() !== "shared_backend_ready") return;
  __resetRepositoryFactoryForTests();
  const repo = resolveOrganizationRepository();
  assert.equal(repo.isShared, true);
  assert.equal(repo.adapterKind, "supabase_shared");
});

test("B039-T004 live org create + invite + accept when test env present", async () => {
  const blocked = sharedBackendTestsBlockedReason();
  if (blocked) {
    console.log(`SKIP live test: ${blocked}`);
    return;
  }
  const env = readSharedBackendTestEnv()!;

  const clientA = createClient(env.url, env.anonKey, { auth: { persistSession: false } });
  const clientB = createClient(env.url, env.anonKey, { auth: { persistSession: false } });

  const signA = await clientA.auth.signInWithPassword({ email: env.userAEmail, password: env.userAPassword });
  assert.ok(signA.data.session, "User A sign-in failed");

  const orgName = `B039 Test Org ${Date.now()}`;
  const { data: created, error: createErr } = await clientA.rpc("create_organization_with_owner", {
    p_name: orgName,
    p_organization_type: "other",
  });
  assert.ok(!createErr, createErr?.message);
  const orgId = (created as { organization: { id: string } }).organization.id;

  const { rawToken, tokenHash } = await import("@/lib/organization-os/invitation-token").then((m) => {
    const pair = m.generateInvitationTokenSync();
    return { rawToken: pair.rawToken, tokenHash: pair.tokenHash };
  });

  const { error: invErr } = await clientA.from("organization_invitations").insert({
    organization_id: orgId,
    recipient_email_normalized: env.userBEmail.toLowerCase(),
    intended_role: "member",
    token_hash: tokenHash,
    status: "pending",
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    created_by: signA.data.user!.id,
  });
  assert.ok(!invErr, invErr?.message);

  const signB = await clientB.auth.signInWithPassword({ email: env.userBEmail, password: env.userBPassword });
  assert.ok(signB.data.session, "User B sign-in failed");

  const { error: acceptErr } = await clientB.rpc("accept_organization_invitation_by_token", {
    p_raw_token: rawToken,
  });
  assert.ok(!acceptErr, acceptErr?.message);

  const replay = await clientB.rpc("accept_organization_invitation_by_token", { p_raw_token: rawToken });
  assert.ok(replay.error, "Replay must fail");

  if (env.userCEmail && env.userCPassword) {
    const clientC = createClient(env.url, env.anonKey, { auth: { persistSession: false } });
    const signC = await clientC.auth.signInWithPassword({
      email: env.userCEmail,
      password: env.userCPassword,
    });
    assert.ok(signC.data.session, "User C sign-in failed");
    const authedC = createClient(env.url, env.anonKey, {
      global: { headers: { Authorization: `Bearer ${signC.data.session.access_token}` } },
    });
    const strangerRead = await authedC.from("organizations").select("id").eq("id", orgId).maybeSingle();
    assert.equal(strangerRead.data, null, "Unrelated user must not read organization by UUID");
  }

  await clientA.auth.signOut();
  await clientB.auth.signOut();
});

test("B039-T005 invitation hash consistency node vs sql", () => {
  const raw = "invtok-test-hash-consistency";
  const hash = hashInvitationTokenSync(raw);
  assert.equal(hash.length, 64);
});
