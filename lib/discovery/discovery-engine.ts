/**
 * Discovery Engine — surfaces exceptional capability from demonstrated work.
 *
 * NOT connected to external registries, social graphs, or ranking systems yet.
 * Today: derives discovery candidates ONLY from local project activity with honest labels.
 * No country, wealth, education, title, or organization filtering — capability signals only.
 */

import type { CapabilityPassport, CapabilitySignal } from "@/lib/capability/capability-passport.types";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";

export type DiscoveryCandidate = {
  readonly id: string;
  readonly label: string;
  readonly domainId: CapabilitySignal["domainId"];
  readonly demonstratedAt: string;
  readonly signalSource: CapabilitySignal["source"];
  readonly opportunityReadiness: "not_connected" | "local_only";
};

export type DiscoveryEngineStatus = {
  readonly connected: false;
  readonly localSignalCount: number;
  readonly candidates: readonly DiscoveryCandidate[];
  readonly limitation: string;
};

export function runDiscoveryEngine(ownerLabel: string): DiscoveryEngineStatus {
  const passport = buildCapabilityPassport(ownerLabel);
  const demonstrated = passport.recentSignals.filter(
    (s) => s.source === "project_completed" || s.source === "evidence_linked",
  );

  const candidates: DiscoveryCandidate[] = demonstrated.slice(0, 5).map((signal) => ({
    id: signal.id,
    label: signal.label,
    domainId: signal.domainId,
    demonstratedAt: signal.occurredAt,
    signalSource: signal.source,
    opportunityReadiness: "local_only" as const,
  }));

  return {
    connected: false,
    localSignalCount: passport.totalSignals,
    candidates,
    limitation:
      "Discovery runs on local demonstrated work only. External opportunity registries and cross-platform discovery are not connected.",
  };
}

export function summarizePassportForAdaptation(passport: CapabilityPassport): {
  primaryDomain: CapabilitySignal["domainId"] | null;
  suggestedFocus: string[];
} {
  const active = passport.domains
    .filter((d) => d.signalCount > 0)
    .sort((a, b) => b.signalCount - a.signalCount);

  const primaryDomain = active[0]?.domainId ?? null;
  const suggestedFocus = active.slice(0, 3).map((d) => d.domainId);

  return { primaryDomain, suggestedFocus };
}
