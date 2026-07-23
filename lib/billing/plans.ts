import type { BillingPlan } from "@/lib/billing/types";

/** Simulated catalog only — prices never charged. */
export const BILLING_PLANS: readonly BillingPlan[] = [
  {
    id: "preview_free",
    label: "Preview Free (simulated)",
    description: "Default preview plan — test-mode entitlements only.",
    monthlyPriceUsdSimulated: 0,
    entitlements: ["ai_assist", "reports_export", "storage", "members"],
    includedUsage: {
      ai_tokens: 50_000,
      connectors: 2,
      reports: 20,
      storage_mb: 512,
      members: 5,
    },
  },
  {
    id: "team_simulated",
    label: "Team (simulated)",
    description: "Higher simulated caps for team preview — still never charges.",
    monthlyPriceUsdSimulated: 49,
    entitlements: [
      "ai_assist",
      "connectors",
      "reports_export",
      "storage",
      "members",
      "digital_twin_registry",
    ],
    includedUsage: {
      ai_tokens: 500_000,
      connectors: 10,
      reports: 200,
      storage_mb: 5_120,
      members: 25,
    },
  },
  {
    id: "enterprise_simulated",
    label: "Enterprise (simulated)",
    description: "Largest simulated envelope — not a real contract or invoice.",
    monthlyPriceUsdSimulated: 0,
    entitlements: [
      "ai_assist",
      "connectors",
      "reports_export",
      "storage",
      "members",
      "digital_twin_registry",
      "priority_support_simulated",
    ],
    includedUsage: {
      ai_tokens: 5_000_000,
      connectors: 50,
      reports: 2_000,
      storage_mb: 51_200,
      members: 500,
    },
  },
] as const;

export function getBillingPlan(planId: BillingPlan["id"]): BillingPlan {
  const found = BILLING_PLANS.find((plan) => plan.id === planId);
  if (!found) return BILLING_PLANS[0];
  return found;
}
