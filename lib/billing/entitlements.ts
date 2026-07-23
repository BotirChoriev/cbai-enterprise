import { getBillingPlan } from "@/lib/billing/plans";
import type { BillingEntitlementId, BillingPlanId } from "@/lib/billing/types";

export function planHasEntitlement(
  planId: BillingPlanId,
  entitlement: BillingEntitlementId,
): boolean {
  return getBillingPlan(planId).entitlements.includes(entitlement);
}

export function listPlanEntitlements(planId: BillingPlanId): readonly BillingEntitlementId[] {
  return getBillingPlan(planId).entitlements;
}
