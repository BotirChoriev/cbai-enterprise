/**
 * Phase 2 — Complete Authentication and Account System (Preview).
 * Source-wiring assertions + env-aware auth/crypto patterns (no live Supabase required).
 * Run with: npm run test:phase-2-auth-account
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { generateSalt, hashPassword, verifyPassword } from "@/lib/auth/auth-crypto";
import { signUp, signIn, signOut, getCurrentUser, loadUsers } from "@/lib/auth/auth-store";
import { toPublicUser, LOCAL_ACCOUNT_NOTICE, type User } from "@/lib/auth/auth-types";
import {
  isCloudStorageConfigured,
  currentStorageMode,
} from "@/lib/storage/storage-provider";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  changeSignedInPassword,
  completePasswordReset,
  resendEmailConfirmation,
  cloudSignIn,
  getCloudSession,
} from "@/lib/supabase/cloud-auth";
import {
  mayAccessTeamCollaboration,
  mayAccessPersonalCabinet,
} from "@/lib/canonical-contracts/trust-tiers";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

function assertContains(source: string, needle: string, label: string): void {
  assert.ok(source.includes(needle), `${label} missing: ${needle}`);
}

// ---------------------------------------------------------------------------
// Source wiring — Phase 2 surfaces
// ---------------------------------------------------------------------------

test("1. CloudAccountGate exists and gates on mayAccessTeamCollaboration / cloud session", () => {
  const path = "components/account/CloudAccountGate.tsx";
  assert.ok(existsSync(join(ROOT, path)));
  const source = readSource(path);
  assertContains(source, "mayAccessTeamCollaboration", path);
  assertContains(source, "cloudSessionRestoring", path);
  assertContains(source, 'router.replace(`/account', path);
  assertContains(source, "useAuth", path);
});

test("2. Collaboration pages wrap CloudAccountGate (static export — no middleware)", () => {
  const gated = [
    "app/(dashboard)/organization/workspace/page.tsx",
    "app/(dashboard)/organization/page.tsx",
    "app/(dashboard)/approvals/page.tsx",
    "app/(dashboard)/activity/page.tsx",
    "app/(dashboard)/notifications/page.tsx",
    "app/(dashboard)/enterprise/organization/page.tsx",
    "app/(dashboard)/enterprise/workspace/page.tsx",
    "app/(dashboard)/enterprise/mission/page.tsx",
  ];
  for (const path of gated) {
    assert.ok(existsSync(join(ROOT, path)), `missing ${path}`);
    const source = readSource(path);
    assertContains(source, "CloudAccountGate", path);
  }
});

test("3. AccountForm wires resend confirmation, security, profile, and session awareness", () => {
  const path = "components/account/AccountForm.tsx";
  const source = readSource(path);
  assertContains(source, "resendEmailConfirmation", path);
  assertContains(source, "emailNotConfirmed", path);
  assertContains(source, "changeSignedInPassword", path);
  assertContains(source, "upsertCloudProfile", path);
  assertContains(source, "useAssistantProfile", path);
  assertContains(source, "sessionNoMultiDeviceRevoke", path);
  assertContains(source, "CloudProfileSection", path);
  assertContains(source, "CloudSecuritySection", path);
  assertContains(source, "CloudActiveSessionSection", path);
});

test("4. cloud-auth exposes changeSignedInPassword via updateUser path; AuthProvider re-exports it", () => {
  const auth = readSource("lib/supabase/cloud-auth.ts");
  assertContains(auth, "changeSignedInPassword", "cloud-auth");
  assertContains(auth, "updateUser", "cloud-auth");
  assertContains(auth, "resendEmailConfirmation", "cloud-auth");

  const provider = readSource("components/platform/context/AuthProvider.tsx");
  assertContains(provider, "changeSignedInPassword", "AuthProvider");
  assertContains(provider, "resendEmailConfirmation", "AuthProvider");
});

test("5. assistant-storage upserts displayName with avatar/language to cloud profile", () => {
  const source = readSource("lib/assistant/assistant-storage.ts");
  assertContains(source, "displayName: profile.name", "assistant-storage");
  assertContains(source, "avatarMode: profile.avatar", "assistant-storage");
  assertContains(source, "preferredLanguage: profile.preferredLanguage", "assistant-storage");
  assertContains(source, "upsertCloudProfile", "assistant-storage");
});

test("6. Trust tiers: team collab requires cloud; personal cabinet allows device-local", () => {
  assert.equal(mayAccessTeamCollaboration("signed-out"), false);
  assert.equal(mayAccessTeamCollaboration("device-local"), false);
  assert.equal(mayAccessTeamCollaboration("cloud"), true);
  assert.equal(mayAccessPersonalCabinet("device-local"), true);
  assert.equal(mayAccessPersonalCabinet("cloud"), true);
  assert.equal(mayAccessPersonalCabinet("signed-out"), false);
});

// ---------------------------------------------------------------------------
// Env-aware auth patterns (same spirit as test-auth-platform)
// ---------------------------------------------------------------------------

test("7. Password hashing remains real (Web Crypto SHA-256), salted, verifiable", async () => {
  const salt = generateSalt();
  const hash = await hashPassword("phase-2-password-check", salt);
  assert.equal(await verifyPassword("phase-2-password-check", salt, hash), true);
  assert.equal(await verifyPassword("wrong", salt, hash), false);
});

test("8. Auth store stays SSR-safe — never fabricates a session outside a browser", async () => {
  await assert.doesNotReject(async () => {
    assert.deepEqual(loadUsers(), []);
    assert.equal(getCurrentUser(), null);
  });
  assert.doesNotThrow(() => signOut());
  const bad = await signIn("nobody@example.com", "whatever-password");
  assert.equal(bad.ok, false);
  const invalid = await signUp("not-an-email", "longenoughpassword", "Name");
  assert.equal(invalid.ok, false);
});

test("9. toPublicUser never leaks password hash/salt; LOCAL_ACCOUNT_NOTICE stays honest", () => {
  const user: User = {
    id: "u1",
    email: "test@example.com",
    displayName: "Test User",
    organization: "",
    passwordHash: "secret-hash",
    passwordSalt: "secret-salt",
    createdAt: new Date().toISOString(),
  };
  const publicUser = toPublicUser(user);
  assert.equal("passwordHash" in publicUser, false);
  assert.equal("passwordSalt" in publicUser, false);
  assert.match(LOCAL_ACCOUNT_NOTICE.toLowerCase(), /this device only/);
});

test("10. Cloud auth helpers are env-aware — honest when unconfigured; never throw", async () => {
  const configured = isSupabaseConfigured() || isCloudStorageConfigured();

  if (!configured) {
    assert.equal(currentStorageMode(), "local");
    const signInResult = await cloudSignIn("user@example.com", "password12345");
    assert.equal(signInResult.ok, false);
    if (!signInResult.ok) assert.equal(signInResult.code, "not_configured");
    assert.equal(await getCloudSession(), null);
    assert.equal((await changeSignedInPassword("newpassword123")).ok, false);
    assert.equal((await completePasswordReset("newpassword123")).ok, false);
    assert.equal((await resendEmailConfirmation("user@example.com")).ok, false);
  } else {
    // Configured envs still must not fabricate browser sessions in Node — client is null outside window.
    assert.equal(await getCloudSession(), null);
    const change = await changeSignedInPassword("newpassword123");
    assert.equal(change.ok, false);
    const resend = await resendEmailConfirmation("user@example.com");
    assert.equal(resend.ok, false);
    assert.ok(currentStorageMode() === "cloud" || currentStorageMode() === "local");
  }
});

test("11. No service-role credentials are wired into browser auth/account sources", () => {
  const paths = [
    "lib/supabase/cloud-auth.ts",
    "components/account/AccountForm.tsx",
    "components/account/CloudAccountGate.tsx",
    "components/platform/context/AuthProvider.tsx",
  ];
  for (const path of paths) {
    const source = readSource(path);
    assert.equal(
      /SUPABASE_SERVICE_ROLE|createClient\([^)]*service/i.test(source),
      false,
      `${path} must not wire a service-role client`,
    );
  }
  // client.ts documents why service-role must never ship in the browser — that prose is intentional.
  const client = readSource("lib/supabase/client.ts");
  assert.ok(client.includes("service-role"), "client.ts should document the service-role ban");
  assert.equal(/SUPABASE_SERVICE_ROLE_KEY/.test(client), false);
  assert.equal(/createClient\([^)]*service/i.test(client), false);
});
