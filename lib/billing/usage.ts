import { getBillingPlan } from "@/lib/billing/plans";
import type {
  BillingMeterKind,
  BillingPlanId,
  BudgetCap,
  UsageSnapshot,
} from "@/lib/billing/types";

export const BILLING_METER_KINDS: readonly BillingMeterKind[] = [
  "ai_tokens",
  "connectors",
  "reports",
  "storage_mb",
  "members",
] as const;

export function emptyUsageSnapshot(): UsageSnapshot {
  return {
    ai_tokens: 0,
    connectors: 0,
    reports: 0,
    storage_mb: 0,
    members: 0,
  };
}

export function defaultBudgetCaps(planId: BillingPlanId): readonly BudgetCap[] {
  const included = getBillingPlan(planId).includedUsage;
  return BILLING_METER_KINDS.map((meter) => ({
    meter,
    softLimit: Math.floor(included[meter] * 0.8),
    hardLimit: included[meter],
  }));
}

export function recordSimulatedUsage(
  usage: UsageSnapshot,
  meter: BillingMeterKind,
  amount: number,
): UsageSnapshot {
  if (amount < 0) {
    throw new Error("Usage amount must be non-negative in test mode.");
  }
  return {
    ...usage,
    [meter]: usage[meter] + amount,
  };
}
