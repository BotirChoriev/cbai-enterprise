"use client";

import { useState } from "react";
import {
  BILLING_ADMIN_ROLE_NOTE,
  BILLING_PLANS,
  BILLING_TEST_MODE_BANNER,
  createBillingSimulationState,
  evaluateBudgetCap,
  getBillingPlan,
  listPlanEntitlements,
  recordSimulatedUsage,
  type BillingMeterKind,
  type BillingPlanId,
} from "@/lib/billing";
import { getPhase12Labels, resolvePhase12Locale } from "@/lib/i18n/phase-12-labels";
import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import {
  cbaiMineralSurface,
  cbaiSectionEyebrow,
  cbaiTextBody,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

/**
 * Billing dashboard — TEST MODE ONLY. Never charges.
 */
export default function BillingPageClient() {
  const { language } = useTranslation();
  const labels = getPhase12Labels(resolvePhase12Locale(language));
  const [planId, setPlanId] = useState<BillingPlanId>("preview_free");
  const [state, setState] = useState(() => createBillingSimulationState("preview_free"));
  const plan = getBillingPlan(planId);
  const entitlements = listPlanEntitlements(planId);

  function switchPlan(next: BillingPlanId) {
    setPlanId(next);
    setState(createBillingSimulationState(next));
  }

  function bump(meter: BillingMeterKind, amount: number) {
    setState((prev) => ({
      ...prev,
      usage: recordSimulatedUsage(prev.usage, meter, amount),
    }));
  }

  return (
    <OperatingPageShell
      title={labels.billingTitle}
      description={labels.billingTestModeBanner}
      showMissionContext={false}
    >
      <div className="space-y-6 md:space-y-8">
        <p className={`md:hidden ${cbaiTextMuted}`}>{labels.mobileNavNote}</p>
        <section
          className={`${cbaiMineralSurface} space-y-3 border border-amber-500/20 p-4`}
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-amber-100">{BILLING_TEST_MODE_BANNER}</p>
          <p className={cbaiTextMuted}>
            Simulated price shown for planning only: ${plan.monthlyPriceUsdSimulated}/mo — not invoiced.
          </p>
        </section>

        <section className={`${cbaiMineralSurface} space-y-3 p-4`} aria-labelledby="billing-plans-heading">
          <p className={cbaiSectionEyebrow}>Plans</p>
          <h2 id="billing-plans-heading" className="text-sm font-medium text-zinc-100">
            Simulated plan catalog
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {BILLING_PLANS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Select simulated plan ${item.label}`}
                aria-pressed={item.id === planId}
                onClick={() => switchPlan(item.id)}
                className={`rounded-md border px-3 py-2 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400 ${
                  item.id === planId
                    ? "border-teal-400/40 bg-teal-500/10 text-teal-100"
                    : "border-teal-500/10 bg-slate-950/40 text-zinc-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className={cbaiTextBody}>{plan.description}</p>
        </section>

        <section
          className={`${cbaiMineralSurface} space-y-3 p-4`}
          aria-labelledby="billing-entitlements-heading"
        >
          <p className={cbaiSectionEyebrow}>Entitlements</p>
          <h2 id="billing-entitlements-heading" className="text-sm font-medium text-zinc-100">
            Included capabilities (simulated)
          </h2>
          <ul className={`list-disc space-y-1 pl-5 ${cbaiTextMuted}`}>
            {entitlements.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </section>

        <section className={`${cbaiMineralSurface} space-y-3 p-4`} aria-labelledby="billing-usage-heading">
          <p className={cbaiSectionEyebrow}>Usage metering</p>
          <h2 id="billing-usage-heading" className="text-sm font-medium text-zinc-100">
            Simulated usage (AI, connectors, reports, storage, members)
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(state.usage) as BillingMeterKind[]).map((meter) => {
              const decision = evaluateBudgetCap(state.usage, state.budgetCaps, meter);
              return (
                <li
                  key={meter}
                  className="flex flex-col gap-2 rounded-lg border border-teal-500/10 bg-slate-950/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm text-zinc-100">{meter}</p>
                    <p className={cbaiTextMuted}>
                      {state.usage[meter]} — {decision.action}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Add simulated usage for ${meter}`}
                    onClick={() => bump(meter, meter === "ai_tokens" ? 10_000 : 1)}
                    className="rounded-md border border-teal-500/20 px-3 py-2 text-xs text-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400"
                  >
                    Simulate +usage
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={`${cbaiMineralSurface} space-y-3 p-4`} aria-labelledby="billing-admin-heading">
          <p className={cbaiSectionEyebrow}>Role</p>
          <h2 id="billing-admin-heading" className="text-sm font-medium text-zinc-100">
            {BILLING_ADMIN_ROLE_NOTE.label}
          </h2>
          <p className={cbaiTextBody}>{BILLING_ADMIN_ROLE_NOTE.summary}</p>
        </section>
      </div>
    </OperatingPageShell>
  );
}
