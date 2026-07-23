/**
 * Phase 11 — Billing simulation (TEST MODE ONLY).
 * Never charges real payment methods. No Production billing.
 */

export type BillingPlanId = "preview_free" | "team_simulated" | "enterprise_simulated";

export type BillingMeterKind =
  | "ai_tokens"
  | "connectors"
  | "reports"
  | "storage_mb"
  | "members";

export type BillingEntitlementId =
  | "ai_assist"
  | "connectors"
  | "reports_export"
  | "storage"
  | "members"
  | "digital_twin_registry"
  | "priority_support_simulated";

export type BillingPlan = {
  readonly id: BillingPlanId;
  readonly label: string;
  readonly description: string;
  readonly monthlyPriceUsdSimulated: number;
  readonly entitlements: readonly BillingEntitlementId[];
  readonly includedUsage: Readonly<Record<BillingMeterKind, number>>;
};

export type UsageSnapshot = Readonly<Record<BillingMeterKind, number>>;

export type BudgetCap = {
  readonly meter: BillingMeterKind;
  readonly softLimit: number;
  readonly hardLimit: number;
};

export type DegradationAction =
  | "allow"
  | "warn"
  | "throttle_non_essential"
  | "block_metered_action";

export type DegradationDecision = {
  readonly meter: BillingMeterKind;
  readonly action: DegradationAction;
  readonly reason: string;
  readonly testMode: true;
};

export type BillingSimulationState = {
  readonly testMode: true;
  readonly planId: BillingPlanId;
  readonly usage: UsageSnapshot;
  readonly budgetCaps: readonly BudgetCap[];
  readonly neverCharges: true;
};
