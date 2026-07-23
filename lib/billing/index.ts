export type {
  BillingPlanId,
  BillingMeterKind,
  BillingEntitlementId,
  BillingPlan,
  UsageSnapshot,
  BudgetCap,
  DegradationAction,
  DegradationDecision,
  BillingSimulationState,
} from "@/lib/billing/types";

export { BILLING_PLANS, getBillingPlan } from "@/lib/billing/plans";
export { planHasEntitlement, listPlanEntitlements } from "@/lib/billing/entitlements";
export {
  BILLING_METER_KINDS,
  emptyUsageSnapshot,
  defaultBudgetCaps,
  recordSimulatedUsage,
} from "@/lib/billing/usage";
export { evaluateBudgetCap, gracefulDegradationForPlan } from "@/lib/billing/budget";
export { BILLING_ADMIN_ROLE_NOTE, isBillingAdminRoleId } from "@/lib/billing/roles";
export {
  createBillingSimulationState,
  BILLING_TEST_MODE_BANNER,
} from "@/lib/billing/simulation";
