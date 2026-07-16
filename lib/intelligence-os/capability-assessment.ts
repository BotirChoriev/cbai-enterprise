/**
 * EPIC-21 — Capability assessment offer (optional, after real work only).
 */

import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";

export type CapabilityAssessmentOffer = {
  readonly eligible: boolean;
  readonly reason: string;
  readonly mandatory: false;
  readonly blocksWork: false;
  readonly href: string;
};

export function deriveCapabilityAssessmentOffer(operatorLabel: string): CapabilityAssessmentOffer {
  const passport = buildCapabilityPassport(operatorLabel);
  const eligible = passport.totalSignals >= 3;

  return {
    eligible,
    reason: eligible
      ? "You have recorded enough real activity for an optional capability review."
      : "Complete more real work before an optional capability assessment is offered.",
    mandatory: false,
    blocksWork: false,
    href: "/trust",
  };
}
