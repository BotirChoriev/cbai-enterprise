import { defaultBudgetCaps, emptyUsageSnapshot } from "@/lib/billing/usage";
import type { BillingPlanId, BillingSimulationState } from "@/lib/billing/types";

export function createBillingSimulationState(
  planId: BillingPlanId = "preview_free",
): BillingSimulationState {
  return {
    testMode: true,
    planId,
    usage: emptyUsageSnapshot(),
    budgetCaps: defaultBudgetCaps(planId),
    neverCharges: true,
  };
}

export const BILLING_TEST_MODE_BANNER =
  "TEST MODE ONLY — simulated plans and usage. CBAI never charges a real payment method from this surface.";
