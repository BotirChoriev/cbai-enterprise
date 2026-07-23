// Phase 9 — Enterprise Digital Twin foundations.
// Run with: npm run test:phase-9-digital-twin

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DIGITAL_TWIN_MODULES,
  DIGITAL_TWIN_MODULE_IDS,
  DIGITAL_TWIN_PERMISSIONS_NOTE,
  allDigitalTwinIntegrationsHonest,
  clearOrganizationLocationsForTests,
  createOrganizationLocation,
  digitalTwinRequiresOrganizationScope,
  getDigitalTwinModule,
  isDigitalTwinModuleId,
  listOrganizationLocations,
  locationsFoundationSummary,
} from "@/lib/digital-twin";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Module registry includes required Digital Twin modules", () => {
  const required = [
    "overview",
    "locations",
    "inventory",
    "products",
    "sales",
    "expenses",
    "employees",
    "suppliers",
    "contracts",
    "meetings",
    "tasks",
    "safety",
    "health",
    "incidents",
    "cameras",
    "documents",
    "map",
    "alerts",
    "anomaly",
    "dashboard_ceo",
    "dashboard_regional",
    "dashboard_branch",
  ];
  assert.deepEqual([...DIGITAL_TWIN_MODULE_IDS], required);
  assert.equal(DIGITAL_TWIN_MODULES.length, required.length);
});

test("2. All integrations are Not Connected or Planned — never live fabricated", () => {
  assert.equal(allDigitalTwinIntegrationsHonest(), true);
  for (const module of DIGITAL_TWIN_MODULES) {
    assert.ok(
      module.integrationStatus === "not_connected" || module.integrationStatus === "planned",
    );
  }
  assert.equal(getDigitalTwinModule("anomaly").integrationStatus, "planned");
  assert.equal(getDigitalTwinModule("cameras").camerasRegistryOnly, true);
});

test("3. Locations foundation starts empty and does not invent coordinates", () => {
  clearOrganizationLocationsForTests();
  const summary = locationsFoundationSummary("org-a");
  assert.equal(summary.empty, true);
  assert.equal(summary.count, 0);
  assert.match(summary.note, /no organization locations/i);

  const created = createOrganizationLocation({
    organizationId: "org-a",
    name: "HQ",
    kind: "hq",
  });
  assert.equal(created.latitude, null);
  assert.equal(created.longitude, null);
  assert.equal(listOrganizationLocations("org-a").length, 1);
  assert.equal(listOrganizationLocations("org-b").length, 0);
});

test("4. Permissions note is organization-scoped", () => {
  assert.equal(DIGITAL_TWIN_PERMISSIONS_NOTE.scope, "organization");
  assert.equal(digitalTwinRequiresOrganizationScope(), true);
  assert.match(DIGITAL_TWIN_PERMISSIONS_NOTE.summary, /organization/i);
});

test("5. Route and page client exist; no live camera feed claims", () => {
  assert.equal(existsSync(join(process.cwd(), "app/(dashboard)/digital-twin/page.tsx")), true);
  assert.equal(
    existsSync(join(process.cwd(), "components/digital-twin/DigitalTwinPageClient.tsx")),
    true,
  );
  const page = readSource("components/digital-twin/DigitalTwinPageClient.tsx");
  assert.match(page, /registry only/i);
  assert.match(page, /no live video/i);
  assert.equal(page.toLowerCase().includes("live feed connected"), false);
  assert.equal(isDigitalTwinModuleId("sales"), true);
  assert.equal(isDigitalTwinModuleId("fake"), false);
});
