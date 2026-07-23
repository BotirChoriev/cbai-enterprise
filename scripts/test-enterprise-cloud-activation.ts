/**
 * Cloud activation / repository factory / migration preflight tests.
 * Assertions are environment-aware: Preview credentials may be present in the shell.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  __resetRepositoryFactoryForTests,
  resolveCollaborationRepository,
  resolveOrganizationRepository,
} from "@/lib/persistence/repository-factory";
import { __resetSupabaseClientForTests } from "@/lib/supabase/client";
import { runEnterpriseMigrationPreflight } from "@/lib/enterprise-collaboration/migration-preflight";
import { getRealtimeCapability } from "@/lib/enterprise-collaboration/realtime";
import {
  UnconfiguredInviteEmailTransport,
  getInviteEmailTransport,
  setInviteEmailTransport,
} from "@/lib/enterprise-collaboration/email-transport";
import {
  readSharedBackendTestEnv,
  sharedBackendTestsBlockedReason,
} from "@/lib/persistence/test-env-gate";
import { isOrganizationCollaborationShared } from "@/lib/persistence/persistence-capability";
import { detectCollaborationAwarenessIntent } from "@/lib/voice-operator/os/collaboration-awareness";

test("migration preflight reports 0009 uuid FKs and activity compat", () => {
  const report = runEnterpriseMigrationPreflight();
  assert.ok(report.findings.some((f) => f.id === "fk-type" && f.severity === "info"));
  assert.ok(report.findings.some((f) => f.id === "activity-compat"));
  const publicFinding = report.findings.find((f) => f.id === "env-public");
  assert.ok(publicFinding);
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    assert.notEqual(publicFinding.severity, "blocker");
  } else {
    assert.equal(publicFinding.severity, "blocker");
  }
});

test("repository factory follows shared-backend capability", () => {
  __resetSupabaseClientForTests();
  __resetRepositoryFactoryForTests();
  const org = resolveOrganizationRepository();
  const collab = resolveCollaborationRepository();
  if (isOrganizationCollaborationShared()) {
    assert.equal(org.adapterKind, "supabase_shared");
    assert.equal(collab.adapterKind, "supabase_shared");
    assert.equal(collab.isShared, true);
  } else {
    assert.equal(org.adapterKind, "device_local");
    assert.equal(collab.adapterKind, "device_local");
    assert.equal(collab.isShared, false);
  }
});

test("invite email transport never claims delivery when unconfigured", async () => {
  setInviteEmailTransport(new UnconfiguredInviteEmailTransport());
  const result = await getInviteEmailTransport().sendInvitation({
    toEmail: "b@example.com",
    organizationName: "Org",
    inviterDisplayName: "A",
    role: "member",
    acceptUrl: "https://example.com/organization?invite=token",
    expiresAt: new Date().toISOString(),
  });
  assert.equal(result.status, "not_configured");
  assert.match(result.message, /Email delivery not configured/i);
});

test("realtime capability reflects shared backend", () => {
  const cap = getRealtimeCapability();
  if (isOrganizationCollaborationShared()) {
    assert.ok(cap.status === "partially_implemented" || cap.status === "implemented");
  } else {
    assert.equal(cap.status, "blocked");
  }
});

test("digital assistant collaboration awareness refuses autonomous approval language", () => {
  const result = detectCollaborationAwarenessIntent("Show my pending approvals");
  assert.ok(result);
  assert.doesNotMatch(result.assistantText, /I approved|auto-approved|approved on your behalf/i);
  assert.equal(result.href, "/approvals");
});

test("live two-user RLS gate is honest about credentials", () => {
  const blocked = sharedBackendTestsBlockedReason();
  const env = readSharedBackendTestEnv();
  if (env) {
    assert.equal(blocked, "");
    console.log("LIVE CLOUD PROOF: credentials present — run verify:live-enterprise-collaboration");
  } else {
    assert.ok(blocked);
    assert.match(blocked, /INFRASTRUCTURE BLOCKED/);
    console.log(`LIVE CLOUD PROOF: Blocked — ${blocked}`);
  }
});
