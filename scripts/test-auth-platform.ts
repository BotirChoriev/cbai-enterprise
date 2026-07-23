// Focused tests for "Authentication + User Platform Foundation" — real password hashing, honest
// SSR-safe auth store behavior, the Supabase-ready storage adapter (honestly unconfigured), and
// the real per-user key namespacing that gives Projects/Bookmarks real ownership without
// duplicating any storage shape. Same zero-dependency harness as every other suite (Node's native
// node:test + the `@/` alias loader) — no DOM/localStorage in this environment, so every
// browser-gated function must stay honest and non-throwing here, exactly like every other store.
// Run with: npm run test:auth-platform

import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSalt, hashPassword, verifyPassword } from "@/lib/auth/auth-crypto";
import { signUp, signIn, signOut, getCurrentUser, getCurrentUserId, loadUsers } from "@/lib/auth/auth-store";
import { toPublicUser, LOCAL_ACCOUNT_NOTICE, type User } from "@/lib/auth/auth-types";
import {
  isCloudStorageConfigured,
  currentStorageMode,
  SupabaseStorageAdapter,
} from "@/lib/storage/storage-provider";
import { namespacedKey } from "@/lib/storage/namespaced-key";
import { loadProjects, createProject } from "@/lib/project/project-store";
import { loadPinnedEntities, loadRecentEntities } from "@/lib/context/context-history";

test("1. Password hashing is real (Web Crypto SHA-256), salted, and deterministic for verification", async () => {
  const salt = generateSalt();
  const hash = await hashPassword("correct horse battery staple", salt);
  assert.equal(typeof hash, "string");
  assert.ok(hash.length > 0);
  assert.notEqual(hash, "correct horse battery staple");

  assert.equal(await verifyPassword("correct horse battery staple", salt, hash), true);
  assert.equal(await verifyPassword("wrong password", salt, hash), false);
});

test("2. Same password with different salts produces different hashes — never a fixed digest", async () => {
  const saltA = generateSalt();
  const saltB = generateSalt();
  assert.notEqual(saltA, saltB);
  const hashA = await hashPassword("same-password", saltA);
  const hashB = await hashPassword("same-password", saltB);
  assert.notEqual(hashA, hashB);
});

test("3. Auth store is honestly SSR-safe — never throws outside a browser, never fabricates a session", async () => {
  await assert.doesNotReject(async () => {
    assert.deepEqual(loadUsers(), []);
    assert.equal(getCurrentUserId(), null);
    assert.equal(getCurrentUser(), null);
  });
});

test("4. signUp validates real input honestly before ever hashing anything", async () => {
  const badEmail = await signUp("not-an-email", "longenoughpassword", "Name");
  assert.equal(badEmail.ok, false);

  const shortPassword = await signUp("real@example.com", "short", "Name");
  assert.equal(shortPassword.ok, false);

  const noName = await signUp("real@example.com", "longenoughpassword", "");
  assert.equal(noName.ok, false);
});

test("5. signIn is honest when no account exists — never a fabricated success", async () => {
  const result = await signIn("nobody@example.com", "whatever-password");
  assert.equal(result.ok, false);
});

test("6. signOut never throws outside a browser", () => {
  assert.doesNotThrow(() => signOut());
});

test("7. toPublicUser never leaks the password hash or salt", () => {
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
  assert.equal(publicUser.email, "test@example.com");
});

test("8. LOCAL_ACCOUNT_NOTICE honestly discloses this is a device-local, not server-verified, account", () => {
  assert.match(LOCAL_ACCOUNT_NOTICE.toLowerCase(), /this device only/);
});

test("9. Cloud storage mode is env-aware — never claims a fake connection when unset", () => {
  if (isCloudStorageConfigured()) {
    assert.equal(currentStorageMode(), "cloud");
  } else {
    assert.equal(isCloudStorageConfigured(), false);
    assert.equal(currentStorageMode(), "local");
  }
});

test("10. SupabaseStorageAdapter is real, typed, and honestly rejects every call when unconfigured", async () => {
  const adapter = new SupabaseStorageAdapter();
  assert.equal(adapter.isConfigured, false);
  await assert.rejects(() => adapter.getItem("any-key"));
  await assert.rejects(() => adapter.setItem("any-key", "value"));
  await assert.rejects(() => adapter.removeItem("any-key"));
});

test("11. namespacedKey resolves to the shared local bucket outside a browser/signed-out session", () => {
  assert.equal(namespacedKey("cbai-projects"), "cbai-projects:local");
  assert.equal(namespacedKey("cbai-platform-pinned-entities"), "cbai-platform-pinned-entities:local");
});

test("12. Project/Bookmark/Recent stores stay honestly SSR-safe after real-user namespacing was wired in", () => {
  assert.doesNotThrow(() => {
    assert.deepEqual(loadProjects(), []);
    assert.deepEqual(loadPinnedEntities(), []);
    assert.deepEqual(loadRecentEntities(), []);
    const project = createProject({
      title: "Namespacing smoke test",
      type: "research_project",
      description: "test",
      tags: [],
      visibility: "private",
      status: "active",
    });
    assert.ok(project.id.length > 0);
  });
});
