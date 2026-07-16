/**
 * EPIC-13.2 — Capability growth from real signals — never ranking.
 */

import type { CapabilityDomainId, CapabilityPassport } from "@/lib/capability/capability-passport.types";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type CapabilityGrowthSignal = {
  readonly domainId: CapabilityDomainId;
  readonly totalSignals: number;
  readonly recentSignals: number;
  readonly growth: "none" | "new" | "growing" | "steady";
  readonly lastActivityAt: string | null;
};

export function deriveCapabilityGrowth(passport: CapabilityPassport): readonly CapabilityGrowthSignal[] {
  const cutoff = Date.now() - THIRTY_DAYS_MS;

  return passport.domains.map((domain) => {
    const recentSignals = passport.recentSignals.filter(
      (s) => s.domainId === domain.domainId && Date.parse(s.occurredAt) >= cutoff,
    ).length;

    let growth: CapabilityGrowthSignal["growth"] = "none";
    if (domain.signalCount === 0) {
      growth = "none";
    } else if (recentSignals >= 2) {
      growth = "growing";
    } else if (recentSignals === 1 && domain.maturity === "emerging") {
      growth = "new";
    } else if (domain.signalCount > 0) {
      growth = "steady";
    }

    return {
      domainId: domain.domainId,
      totalSignals: domain.signalCount,
      recentSignals,
      growth,
      lastActivityAt: domain.lastActivityAt,
    };
  });
}
