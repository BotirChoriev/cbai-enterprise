import type {
  BudgetCap,
  DegradationDecision,
  UsageSnapshot,
  BillingMeterKind,
} from "@/lib/billing/types";

export function evaluateBudgetCap(
  usage: UsageSnapshot,
  caps: readonly BudgetCap[],
  meter: BillingMeterKind,
): DegradationDecision {
  const cap = caps.find((item) => item.meter === meter);
  if (!cap) {
    return {
      meter,
      action: "allow",
      reason: "No budget cap configured for this meter (test mode).",
      testMode: true,
    };
  }
  const value = usage[meter];
  if (value >= cap.hardLimit) {
    return {
      meter,
      action: "block_metered_action",
      reason: `Hard budget cap reached for ${meter} (${value}/${cap.hardLimit}) — graceful block in TEST MODE only.`,
      testMode: true,
    };
  }
  if (value >= cap.softLimit) {
    return {
      meter,
      action: "warn",
      reason: `Soft budget cap reached for ${meter} (${value}/${cap.softLimit}) — warn only, still TEST MODE.`,
      testMode: true,
    };
  }
  return {
    meter,
    action: "allow",
    reason: `Usage under soft cap for ${meter}.`,
    testMode: true,
  };
}

/** Non-essential features degrade before core read-only surfaces. */
export function gracefulDegradationForPlan(
  usage: UsageSnapshot,
  caps: readonly BudgetCap[],
): readonly DegradationDecision[] {
  return caps.map((cap) => {
    const decision = evaluateBudgetCap(usage, caps, cap.meter);
    if (decision.action === "block_metered_action" && cap.meter === "ai_tokens") {
      return {
        ...decision,
        action: "throttle_non_essential",
        reason:
          "AI meter at hard cap — throttle non-essential AI assists; core navigation stays available (TEST MODE).",
      };
    }
    return decision;
  });
}
