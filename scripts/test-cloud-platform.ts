// Focused tests for "Real Supabase Authentication + Cloud Persistence" — mode detection, honest
// unauthenticated/unconfigured behavior, ownership-key precedence (cloud > device-local > local),
// migration dedup/retry safety, save-status defaults, and no-credential-leakage. Same
// zero-dependency harness as every other suite (Node's native node:test + the `@/` alias loader).
// There is no window/localStorage in this environment and no real Supabase project configured, so
// every function under test must stay honest and non-throwing here — exactly the same discipline
// every other store in this app already follows. Live cloud behavior (RLS enforcement, multi-device
// sync, actual network retries) requires a real configured Supabase project and is NOT verified by
// this suite — see the mission's final report for what was and wasn't browser-verified.
// Run with: npm run test:cloud-platform

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isSupabaseConfigured, getSupabaseBrowserClient, getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/client";
import { cloudSignIn, cloudSignUp, getCloudSession, requestPasswordReset, completePasswordReset } from "@/lib/supabase/cloud-auth";
import { getSyncedCloudUserId } from "@/lib/supabase/cloud-session-sync";
import { namespacedKey } from "@/lib/storage/namespaced-key";
import { upsertCloudRow, deleteCloudRowByLocalId, listCloudRows, SYNC_TABLES } from "@/lib/supabase/cloud-tables";
import { enqueueSync, getSyncStatus, pendingSyncCount } from "@/lib/supabase/outbox";
import { detectLocalWork, hasMigratedToCloud, migrateLocalWorkToCloud } from "@/lib/supabase/migration";
import { pullCloudDataToLocal } from "@/lib/supabase/pull-sync";
import { loadReports, saveReport, deleteReport } from "@/lib/reports/reports-store";
import { fetchCloudProfile, upsertCloudProfile } from "@/lib/supabase/cloud-profile";
import { LocalStorageAdapter, SupabaseStorageAdapter, currentStorageMode } from "@/lib/storage/storage-provider";
import { createProject, saveProjectNote, linkEntityToProject } from "@/lib/project/project-store";
import { pinEntity, loadPinnedEntities } from "@/lib/context/context-history";
import { saveAssistantProfile, loadAssistantProfile } from "@/lib/assistant/assistant-storage";
import { createEmptyAssistantProfile } from "@/lib/assistant/assistant-profile";

// ---------------------------------------------------------------------------
// 1-2. Cloud/local mode detection + graceful missing-environment behavior
// ---------------------------------------------------------------------------

test("1. Supabase is honestly unconfigured in this environment — never claims a fake connection", () => {
  assert.equal(isSupabaseConfigured(), false);
  assert.equal(getSupabaseUrl(), undefined);
  assert.equal(getSupabaseAnonKey(), undefined);
  assert.equal(currentStorageMode(), "local");
});

test("2. getSupabaseBrowserClient returns null outside a browser and when unconfigured — never fabricates a client", () => {
  assert.equal(getSupabaseBrowserClient(), null);
});

// ---------------------------------------------------------------------------
// 3-4. Unauthenticated / unconfigured auth behavior
// ---------------------------------------------------------------------------

test("3. cloudSignIn/cloudSignUp are honest when Supabase is not configured — never a fabricated session", async () => {
  const signInResult = await cloudSignIn("user@example.com", "password123");
  assert.equal(signInResult.ok, false);
  if (!signInResult.ok) assert.equal(signInResult.code, "not_configured");

  const signUpResult = await cloudSignUp("user@example.com", "password123");
  assert.equal(signUpResult.ok, false);
  if (!signUpResult.ok) assert.equal(signUpResult.code, "not_configured");
});

test("4. getCloudSession/password reset are honest when unconfigured — never throw, never fabricate", async () => {
  assert.equal(await getCloudSession(), null);

  const resetRequest = await requestPasswordReset("user@example.com", "https://example.com/reset-password");
  assert.equal(resetRequest.ok, false);

  const resetComplete = await completePasswordReset("newpassword123");
  assert.equal(resetComplete.ok, false);
});

// ---------------------------------------------------------------------------
// 5. Session restoration (synchronous cloud-session peek)
// ---------------------------------------------------------------------------

test("5. getSyncedCloudUserId is honestly null outside a browser and never throws on malformed storage", () => {
  assert.equal(getSyncedCloudUserId(), null);
});

// ---------------------------------------------------------------------------
// 6. Ownership mapping — namespacedKey precedence
// ---------------------------------------------------------------------------

test("6. namespacedKey falls back to the shared local bucket with no session of any kind", () => {
  assert.equal(namespacedKey("cbai-projects"), "cbai-projects:local");
});

// ---------------------------------------------------------------------------
// 7. Adapter selection
// ---------------------------------------------------------------------------

test("7. LocalStorageAdapter is real and honestly no-ops outside a browser", async () => {
  const adapter = new LocalStorageAdapter();
  assert.equal(adapter.isConfigured, false);
  assert.equal(await adapter.getItem("any-key"), null);
  await adapter.setItem("any-key", "value"); // must not throw
  await adapter.removeItem("any-key"); // must not throw
});

test("8. SupabaseStorageAdapter stays honestly inactive and points at the real integration", async () => {
  const adapter = new SupabaseStorageAdapter();
  assert.equal(adapter.isConfigured, false);
  await assert.rejects(() => adapter.getItem("any-key"));
  await assert.rejects(() => adapter.setItem("any-key", "value"));
  await assert.rejects(() => adapter.removeItem("any-key"));
});

// ---------------------------------------------------------------------------
// 9-10. Cloud table CRUD is honest when unconfigured
// ---------------------------------------------------------------------------

test("9. upsertCloudRow/deleteCloudRowByLocalId are honest when Supabase is not configured", async () => {
  const upsertResult = await upsertCloudRow("projects", {
    owner_id: "owner-1",
    local_id: "project-1",
    title: "Test",
    project_type: "research_project",
    description: "",
    primary_entity_kind: null,
    primary_entity_id: null,
    primary_entity_name: null,
    research_question: null,
    objectives: null,
    report_generated_at: null,
  });
  assert.equal(upsertResult.ok, false);

  const deleteResult = await deleteCloudRowByLocalId("projects", "owner-1", "project-1");
  assert.equal(deleteResult.ok, false);
});

test("10. listCloudRows returns an empty array (never throws) when Supabase is not configured", async () => {
  const rows = await listCloudRows("projects", "owner-1");
  assert.deepEqual(rows, []);
  assert.equal(SYNC_TABLES.includes("projects"), true);
  assert.equal(SYNC_TABLES.includes("bookmarks"), true);
  assert.equal(SYNC_TABLES.includes("reports"), true);
});

// ---------------------------------------------------------------------------
// 11-12. Outbox / save status — never enqueues without a real cloud session, never throws
// ---------------------------------------------------------------------------

test("11. Outbox save status defaults to idle and enqueueSync is a safe no-op outside a browser", () => {
  assert.equal(getSyncStatus("projects", "project-1"), "idle");
  enqueueSync("owner-1", "projects", "upsert", "project-1", { owner_id: "owner-1", local_id: "project-1" });
  assert.equal(pendingSyncCount("owner-1"), 0);
});

test("12. Project/Bookmark/Assistant-profile mutations never throw when a cloud sync is attempted with no session", () => {
  const project = createProject({
    title: "Cloud platform test project",
    type: "research_project",
    description: "",
    tags: [],
    visibility: "private",
    status: "active",
  });
  assert.ok(project.id);
  saveProjectNote({ projectId: project.id, body: "A note" });
  linkEntityToProject(project.id, { kind: "country", id: "usa", name: "United States" });
  pinEntity({ kind: "country", id: "usa", name: "United States" });
  assert.deepEqual(loadPinnedEntities(), []); // honestly empty outside a browser

  const profile = { ...createEmptyAssistantProfile(), name: "Operator" };
  saveAssistantProfile(profile);
  assert.deepEqual(loadAssistantProfile(), createEmptyAssistantProfile()); // honestly empty outside a browser
});

// ---------------------------------------------------------------------------
// 13-14. Reports ownership
// ---------------------------------------------------------------------------

test("13. Reports store is honestly SSR-safe — never throws, never fabricates a saved report outside a browser", () => {
  assert.deepEqual(loadReports(), []);
  const report = saveReport({ kind: "country", entityId: "usa", entityName: "United States", title: "USA Report" });
  assert.ok(report.id);
  deleteReport(report.id); // must not throw
});

test("14. Cloud profile CRUD is honest when unconfigured", async () => {
  assert.equal(await fetchCloudProfile("owner-1"), null);
  assert.equal(await upsertCloudProfile("owner-1", { displayName: "Test" }), null);
});

// ---------------------------------------------------------------------------
// 15. Migration detection / dedup / retry safety
// ---------------------------------------------------------------------------

test("15. detectLocalWork reports honest zero counts outside a browser (isEmpty true)", () => {
  const detected = detectLocalWork();
  assert.equal(detected.isEmpty, true);
  assert.equal(detected.projects, 0);
});

test("16. hasMigratedToCloud is honestly false outside a browser — never assumes a prior migration", () => {
  assert.equal(hasMigratedToCloud("owner-1"), false);
});

test("17. migrateLocalWorkToCloud is retry-safe — running it twice with no cloud configured never throws and never claims success", async () => {
  const first = await migrateLocalWorkToCloud("owner-1");
  assert.equal(first.projects, 0); // nothing to load outside a browser
  const second = await migrateLocalWorkToCloud("owner-1");
  assert.deepEqual(first, second); // idempotent: identical honest zero-result both times
});

test("18. pullCloudDataToLocal never throws outside a browser", async () => {
  await pullCloudDataToLocal("owner-1"); // must resolve without throwing
});

// ---------------------------------------------------------------------------
// 19. No credential leakage
// ---------------------------------------------------------------------------

test("19. SupabaseStorageAdapter's error message never mentions a service-role or secret key", async () => {
  const adapter = new SupabaseStorageAdapter();
  try {
    await adapter.getItem("k");
    assert.fail("expected rejection");
  } catch (error) {
    const message = String(error);
    assert.equal(/service[_-]?role/i.test(message), false);
    assert.equal(/secret/i.test(message), false);
  }
});

test("20. .env.example documents only public variable names, never a real credential or a service-role variable", () => {
  const content = readFileSync(join(process.cwd(), ".env.example"), "utf-8");
  assert.ok(content.includes("NEXT_PUBLIC_SUPABASE_URL"));
  assert.ok(content.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
  // The file explains, in prose, *why* no service-role variable exists — that mention is expected.
  // What must never appear is an actual SERVICE_ROLE_KEY=... variable definition, or a real value
  // (a live URL / JWT) following any variable's `=`.
  assert.equal(/^\s*[A-Z_]*SERVICE_ROLE[A-Z_]*\s*=/im.test(content), false);
  assert.equal(/=\s*["']?(https?:\/\/[a-z0-9-]+\.supabase\.co|eyJ)/i.test(content), false);
});

// ---------------------------------------------------------------------------
// 21. RLS policy presence (static check against the real migration SQL)
// ---------------------------------------------------------------------------

test("21. Every user-owned table enables RLS and defines exactly 4 own-record policies", () => {
  const schema = readFileSync(join(process.cwd(), "supabase/migrations/0001_init_schema.sql"), "utf-8");
  const rls = readFileSync(join(process.cwd(), "supabase/migrations/0002_rls_policies.sql"), "utf-8");

  const tables = [
    "profiles",
    "projects",
    "project_objectives",
    "project_notes",
    "project_tasks",
    "project_questions",
    "project_evidence",
    "project_entity_links",
    "bookmarks",
    "reports",
    "activity_events",
  ];

  for (const table of tables) {
    assert.ok(schema.includes(`create table if not exists public.${table}`), `${table} table must exist`);
    assert.ok(rls.includes(`alter table public.${table} enable row level security;`), `${table} must enable RLS`);
    const policyCount = (rls.match(new RegExp(`create policy ${table}_[a-z]+_own on public\\.${table}`, "g")) ?? []).length;
    assert.equal(policyCount, 4, `${table} must define exactly 4 own-record policies (select/insert/update/delete)`);
  }
});

test("22. No RLS policy trusts a browser-supplied owner_id without an auth.uid() check", () => {
  const rls = readFileSync(join(process.cwd(), "supabase/migrations/0002_rls_policies.sql"), "utf-8");
  const insertPolicies = rls.match(/create policy \w+_insert_own[\s\S]*?;/g) ?? [];
  assert.ok(insertPolicies.length > 0);
  for (const policy of insertPolicies) {
    assert.ok(policy.includes("with check (auth.uid()"), `insert policy must verify auth.uid(): ${policy}`);
  }
});
