import type { ResearchDomainId } from "@/lib/research/research-topics";

export type ResearchDomainLens = {
  /** Shown when this lens differs from the default "Research Intelligence" room — omitted otherwise. */
  ecosystemLabel?: string;
  atmosphere: string;
  methodsLabel: string;
  evidenceLabel: string;
  actionLabel: string;
  accent: {
    text: string;
    glow: string;
    line: string;
  };
};

const DEFAULT_LENS: ResearchDomainLens = {
  atmosphere:
    "Research Intelligence — catalog topics, their documented methods, and evidence types. No live publications or datasets are connected yet.",
  methodsLabel: "Research methods",
  evidenceLabel: "Evidence types",
  actionLabel: "Open topic",
  accent: { text: "text-teal-300", glow: "rgba(45,212,191,0.14)", line: "#2dd4bf" },
};

// Only domains the mission calls out by name get a fully distinct room — Medicine and
// Engineering (Materials Science folded in, since the mission lists "Materials" under
// Engineering Intelligence and both are real, adjacent catalog domains). Every other domain
// stays in the default Research Intelligence laboratory language, which is already the
// correct atmosphere for it — no need to invent five more identities nobody asked for.
const LENS_OVERRIDES: Partial<Record<ResearchDomainId, Partial<ResearchDomainLens>>> = {
  medicine: {
    ecosystemLabel: "Medical Intelligence",
    atmosphere:
      "The Medical Intelligence lens of Research Intelligence — real clinical-domain topics with their documented methods and evidence types. No trial outcomes, diagnoses, or clinical scores are fabricated here; only what the catalog actually records.",
    methodsLabel: "Clinical methods",
    evidenceLabel: "Clinical evidence",
    actionLabel: "Review clinical evidence",
    accent: { text: "text-teal-300", glow: "rgba(45,212,191,0.16)", line: "#2dd4bf" },
  },
  engineering: {
    ecosystemLabel: "Engineering Intelligence",
    atmosphere:
      "The Engineering Intelligence lens of Research Intelligence — real materials and engineering topics with their documented methods and validation evidence. No simulations, tolerances, or test results are fabricated here; only what the catalog actually records.",
    methodsLabel: "Engineering methods",
    evidenceLabel: "Validation evidence",
    actionLabel: "Review design evidence",
    accent: { text: "text-violet-300", glow: "rgba(139,92,246,0.16)", line: "#8b5cf6" },
  },
  "materials-science": {
    ecosystemLabel: "Engineering Intelligence",
    atmosphere:
      "The Engineering Intelligence lens of Research Intelligence — real materials-science topics with their documented methods and validation evidence. No simulations, tolerances, or test results are fabricated here; only what the catalog actually records.",
    methodsLabel: "Materials methods",
    evidenceLabel: "Validation evidence",
    actionLabel: "Review design evidence",
    accent: { text: "text-violet-300", glow: "rgba(139,92,246,0.16)", line: "#8b5cf6" },
  },
};

export function getResearchDomainLens(domainId: ResearchDomainId | "all"): ResearchDomainLens {
  if (domainId === "all") return DEFAULT_LENS;
  const override = LENS_OVERRIDES[domainId];
  return override ? { ...DEFAULT_LENS, ...override } : DEFAULT_LENS;
}
