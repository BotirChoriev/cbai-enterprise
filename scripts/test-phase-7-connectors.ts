// Phase 7 — Official connectors registry expansion.
// Run with: npm run test:phase-7-connectors

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PLANNED_CONNECTOR_ADAPTERS,
  assertPlannedAdaptersAreNotLive,
  assertUnrelatedConnectorsRemainPlanned,
  getFoundationConnectorContracts,
  getFoundationSourceBySlug,
  getFoundationSourceRegistry,
  getWorldBankRuntimeStatus,
  listPlannedConnectorAdapters,
  markWorldBankConnected,
  refusePlannedConnectorFetch,
  resetWorldBankRuntimeForTests,
} from "@/lib/official-connector-foundation";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

const REQUIRED_PLANNED_SLUGS = [
  "united-nations",
  "oecd",
  "us-census",
  "us-bea",
  "imf",
] as const;

test("1. Registry includes World Bank plus required Planned adapters", () => {
  resetWorldBankRuntimeForTests();
  const registry = getFoundationSourceRegistry();
  assert.ok(registry.some((s) => s.slug === "world-bank"));
  for (const slug of REQUIRED_PLANNED_SLUGS) {
    const row = getFoundationSourceBySlug(slug);
    assert.ok(row, `missing source ${slug}`);
    assert.equal(row.connectionStatus, "planned");
    assert.equal(row.defaultHealth, "planned");
  }
});

test("2. Planned adapters expose health, auth, and provenance fields", () => {
  assertPlannedAdaptersAreNotLive();
  const adapters = listPlannedConnectorAdapters();
  assert.ok(adapters.length >= 5);
  for (const slug of REQUIRED_PLANNED_SLUGS) {
    const adapter = adapters.find((a) => a.sourceSlug === slug);
    assert.ok(adapter, `missing adapter for ${slug}`);
    assert.equal(adapter.liveEnabled, false);
    assert.equal(adapter.health, "planned");
    assert.ok(adapter.authRequirement.length > 0);
    assert.ok(adapter.authNotes.length > 0);
    assert.ok(adapter.provenanceFields.includes("officialSourceUrl"));
    assert.ok(adapter.provenanceFields.includes("retrievedAt"));
    assert.ok(adapter.provenanceFields.includes("verificationState"));
  }
});

test("3. World Bank may become Connected; others stay Planned", () => {
  resetWorldBankRuntimeForTests();
  assert.equal(getWorldBankRuntimeStatus().status, "planned");
  markWorldBankConnected("2026-07-23T00:00:00.000Z");
  assert.equal(getWorldBankRuntimeStatus().status, "connected");
  assert.equal(getWorldBankRuntimeStatus().liveEnabled, true);

  assertUnrelatedConnectorsRemainPlanned();
  const others = getFoundationConnectorContracts().filter(
    (c) => c.connectorId !== "fconn-world-bank-wdi",
  );
  assert.ok(others.length >= 5);
  for (const contract of others) {
    assert.equal(contract.liveEnabled, false);
    assert.equal(contract.health.state, "planned");
  }
  for (const slug of REQUIRED_PLANNED_SLUGS) {
    assert.equal(getFoundationSourceBySlug(slug)?.connectionStatus, "planned");
  }
  resetWorldBankRuntimeForTests();
});

test("4. Planned adapters refuse live fetches — no fabricated network calls", () => {
  for (const adapter of PLANNED_CONNECTOR_ADAPTERS) {
    const refused = refusePlannedConnectorFetch(adapter.connectorId);
    assert.equal(refused.ok, false);
    assert.ok(refused.status === "Planned" || refused.status === "Missing");
    assert.match(refused.reason, /no live fetch/i);
  }

  // Source files must not implement live fetch for planned adapters.
  const plannedSource = readSource(
    "lib/official-connector-foundation/adapters/planned-adapters.ts",
  );
  assert.doesNotMatch(plannedSource, /\bfetch\s*\(/);
  assert.doesNotMatch(plannedSource, /\bfetchWithFoundationAdapter\b/);
  assert.match(plannedSource, /refusePlannedConnectorFetch/);
});

test("5. Connector contracts include UN, OECD, Census, BEA, IMF as non-live", () => {
  const contracts = getFoundationConnectorContracts();
  for (const id of [
    "fconn-un-sdg",
    "fconn-oecd-member",
    "fconn-us-census",
    "fconn-us-bea",
    "fconn-imf-data",
  ]) {
    const row = contracts.find((c) => c.connectorId === id);
    assert.ok(row, id);
    assert.equal(row.liveEnabled, false);
  }
  const wb = contracts.find((c) => c.connectorId === "fconn-world-bank-wdi");
  assert.ok(wb);
});
