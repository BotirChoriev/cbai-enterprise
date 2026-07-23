// Phase 11 — Billing simulation (TEST MODE ONLY, never charges).
// Run with: npm run test:phase-11-billing

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BILLING_ADMIN_ROLE_NOTE,
  BILLING_METER_KINDS,
  BILLING_PLANS,
  BILLING_TEST_MODE_BANNER,
  createBillingSimulationState,
  defaultBudgetCaps,
  emptyUsageSnapshot,
  evaluateBudgetCap,
  getBillingPlan,
  gracefulDegradationForPlan,
  isBillingAdminRoleId,
  planHasEntitlement,
  recordSimulatedUsage,
} from "@/lib/billing";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Plans, entitlements, and meters exist in test mode", () => {
  assert.ok(BILLING_PLANS.length >= 3);
  assert.deepEqual([...BILLING_METER_KINDS], [
    "ai_tokens",
    "connectors",
    "reports",
    "storage_mb",
    "members",
  ]);
  const free = getBillingPlan("preview_free");
  assert.equal(free.monthlyPriceUsdSimulated, 0);
  assert.equal(planHasEntitlement("team_simulated", "connectors"), true);
  assert.match(BILLING_TEST_MODE_BANNER, /TEST MODE ONLY/i);
  assert.match(BILLING_TEST_MODE_BANNER, /never charges/i);
});

test("2. Usage metering and budget caps degrade gracefully without charging", () => {
  const caps = defaultBudgetCaps("preview_free");
  let usage = emptyUsageSnapshot();
  usage = recordSimulatedUsage(usage, "reports", caps.find((c) => c.meter === "reports")!.softLimit);
  const soft = evaluateBudgetCap(usage, caps, "reports");
  assert.equal(soft.action, "warn");
  assert.equal(soft.testMode, true);

  usage = recordSimulatedUsage(
    usage,
    "reports",
    caps.find((c) => c.meter === "reports")!.hardLimit,
  );
  const hard = evaluateBudgetCap(usage, caps, "reports");
  assert.equal(hard.action, "block_metered_action");

  const aiHard = recordSimulatedUsage(
    emptyUsageSnapshot(),
    "ai_tokens",
    caps.find((c) => c.meter === "ai_tokens")!.hardLimit,
  );
  const degradation = gracefulDegradationForPlan(aiHard, caps);
  assert.ok(degradation.some((d) => d.action === "throttle_non_essential"));
});

test("3. Simulation state never charges; billing-admin is a note only", () => {
  const state = createBillingSimulationState("enterprise_simulated");
  assert.equal(state.testMode, true);
  assert.equal(state.neverCharges, true);
  assert.equal(BILLING_ADMIN_ROLE_NOTE.neverCharges, true);
  assert.equal(BILLING_ADMIN_ROLE_NOTE.productionForbidden, true);
  assert.equal(isBillingAdminRoleId("billing-admin"), true);
  assert.equal(isBillingAdminRoleId("owner"), false);
});

test("4. /billing route and client declare test mode; no payment processor hooks", () => {
  assert.equal(existsSync(join(process.cwd(), "app/(dashboard)/billing/page.tsx")), true);
  assert.equal(existsSync(join(process.cwd(), "components/billing/BillingPageClient.tsx")), true);
  const client = readSource("components/billing/BillingPageClient.tsx");
  assert.match(client, /TEST MODE ONLY/i);
  assert.match(client, /aria-label=\{`Select simulated plan/);
  assert.equal(client.includes("stripe"), false);
  assert.equal(client.includes("chargeCard"), false);
  assert.equal(client.includes("createPaymentIntent"), false);
});
