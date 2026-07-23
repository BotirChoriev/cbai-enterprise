/**
 * Cloud activation / repository factory / migration preflight tests.
 * Live multi-user proof remains blocked without Preview Supabase credentials.
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
import { sharedBackendTestsBlockedReason } from "@/lib/persistence/test-env-gate";
import { detectCollaborationAwarenessIntent } from "@/lib/voice-operator/os/collaboration-awareness";

test("migration preflight reports activity_events conflict and 0009 uuid FKs", () => {
  const report = runEnterpriseMigrationPreflight();
  assert.ok(report.findings.some((f) => f.id === "fk-type" && f.severity === "info"));
  assert.ok(report.findings.some((f) => f.id === "activity-compat"));
  assert.ok(report.findings.some((f) => f.id === "env-public" && f.severity === "blocker"));
  assert.equal(report.okToApply, false);
});

test("repository factory selects device-local when shared backend not configured", () => {
  __resetSupabaseClientForTests();
  __resetRepositoryFactoryForTests();
  const org = resolveOrganizationRepository();
  const collab = resolveCollaborationRepository();
  assert.equal(org.adapterKind, "device_local");
  assert.equal(collab.adapterKind, "device_local");
  assert.equal(collab.isShared, false);
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

test("realtime capability is blocked without shared backend", () => {
  const cap = getRealtimeCapability();
  assert.equal(cap.status, "blocked");
});

test("digital assistant collaboration awareness refuses autonomous approval language", () => {
  const result = detectCollaborationAwarenessIntent("Show my pending approvals");
  assert.ok(result);
  assert.doesNotMatch(result.assistantText, /I approved|auto-approved|approved on your behalf/i);
  assert.equal(result.href, "/approvals");
});

test("live two-user RLS proof remains blocked without credentials", () => {
  const blocked = sharedBackendTestsBlockedReason();
  assert.ok(blocked);
  assert.match(blocked, /INFRASTRUCTURE BLOCKED/);
  console.log(`LIVE CLOUD PROOF: Blocked — ${blocked}`);
});
