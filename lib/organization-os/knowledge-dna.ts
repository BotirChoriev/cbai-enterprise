/**
 * EPIC-05 — Knowledge DNA architecture (not CV).
 * Demonstrated capability only — never IQ, prestige, university, country, or title.
 */

import type { CapabilityPassport } from "@/lib/capability/capability-passport.types";

export type KnowledgeDnaDimension = {
  readonly domainId: string;
  readonly label: string;
  readonly demonstratedSignals: number;
  readonly maturity: string;
  readonly lastActivityAt: string | null;
  readonly explanation: string;
};

export type KnowledgeDna = {
  readonly ownerRef: string;
  readonly dimensions: readonly KnowledgeDnaDimension[];
  readonly excludedEvaluations: readonly string[];
  readonly limitation: string;
};

const EXCLUDED_EVALUATIONS = [
  "IQ",
  "prestige",
  "university ranking",
  "country of origin",
  "job title",
  "diploma",
  "wealth",
] as const;

export function deriveKnowledgeDna(ownerRef: string, passport: CapabilityPassport): KnowledgeDna {
  return {
    ownerRef,
    dimensions: passport.domains.map((domain) => ({
      domainId: domain.domainId,
      label: domain.domainId,
      demonstratedSignals: domain.signalCount,
      maturity: domain.maturity,
      lastActivityAt: domain.lastActivityAt,
      explanation:
        domain.signalCount > 0
          ? "Derived from recorded platform activity — not self-declared credentials."
          : "No demonstrated signals yet — DNA remains empty rather than inferred.",
    })),
    excludedEvaluations: [...EXCLUDED_EVALUATIONS],
    limitation:
      "Knowledge DNA is architecture-only for multi-user discovery. Device-local capability passport signals apply to the current operator.",
  };
}

export const KNOWLEDGE_DNA_RULES = {
  isCv: false,
  evaluatesPrestige: false,
  evaluatesTitle: false,
  capabilityOnly: true,
} as const;
