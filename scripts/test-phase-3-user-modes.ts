// Phase 3 — Ten user modes foundations.
// Run with: npm run test:phase-3-user-modes

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DEFAULT_USER_MODE_ID,
  USER_MODE_CATALOG,
  USER_MODE_IDS,
  getUserModeCatalogEntry,
  isUserModeId,
  buildUserModeSuggestionHints,
} from "@/lib/user-modes";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Catalog exposes exactly ten user modes", () => {
  assert.equal(USER_MODE_CATALOG.length, 10);
  assert.equal(USER_MODE_IDS.length, 10);
  const expected = [
    "general",
    "senior_executive",
    "journalist",
    "investor",
    "business_owner",
    "academic",
    "politician",
    "legal",
    "economist",
    "student",
  ];
  assert.deepEqual([...USER_MODE_IDS], expected);
});

test("2. Every catalog entry has label, description, href, and suggested modules", () => {
  for (const entry of USER_MODE_CATALOG) {
    assert.ok(entry.label.length > 0);
    assert.ok(entry.description.length > 0);
    assert.ok(entry.defaultDashboardHref.startsWith("/"));
    assert.ok(entry.suggestedModules.length >= 1);
  }
});

test("3. Default mode is general and invalid ids are rejected", () => {
  assert.equal(DEFAULT_USER_MODE_ID, "general");
  assert.equal(isUserModeId("general"), true);
  assert.equal(isUserModeId("admin"), false);
  assert.equal(getUserModeCatalogEntry("investor").defaultDashboardHref, "/investor");
});

test("4. Assistant hints are navigation stubs — never invent evidence", () => {
  const hints = buildUserModeSuggestionHints("legal");
  assert.ok(hints.length >= 1);
  assert.ok(hints.every((hint) => hint.href.startsWith("/")));
  assert.ok(hints.some((hint) => hint.href === "/modes"));
  assert.ok(
    hints.some((hint) =>
      hint.prompt.toLowerCase().includes("does not change organization permissions"),
    ),
  );
});

test("5. ModeAwareWorkspace and /modes route exist; RBAC disclaimer in UI copy", () => {
  const component = readSource("components/user-modes/ModeAwareWorkspace.tsx");
  assert.match(component, /does.*not.*replace organization RBAC/i);
  assert.match(component, /setSelectedUserMode/);
  const page = readSource("app/(dashboard)/modes/page.tsx");
  assert.match(page, /ModesPageClient/);
  const settings = readSource("components/settings/SettingsPageClient.tsx");
  assert.match(settings, /ModeAwareWorkspace/);
});

test("6. Device-local persistence uses namespaced storage key", () => {
  const store = readSource("lib/user-modes/mode-store.ts");
  assert.match(store, /cbai-user-mode/);
  assert.match(store, /resolveStorageKey/);
});
