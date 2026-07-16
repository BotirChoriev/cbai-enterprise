/**
 * Platform Home — Elite final architecture (Evidence Intelligence Platform entrance).
 * Static, honest copy only. No fabricated metrics or promises.
 */

export type HomeModuleIconId =
  | "countries"
  | "companies"
  | "universities"
  | "search"
  | "graph"
  | "reasoning"
  | "governance"
  | "agents"
  | "runtime";

export type TrustPillar = {
  id: string;
  title: string;
  description: string;
};

export const EVIDENCE_NOT_CONNECTED_LABEL = "Evidence Source Not Connected";
export const PLATFORM_VERSION = "0.1.0";

export const TRUST_PILLAR_I18N_KEYS = {
  "sources-before-conclusions": "sourcesBeforeConclusions",
  "uncertainty-visible": "uncertaintyVisible",
  "explainable-recommendations": "explainableRecommendations",
  "comparable-alternatives": "comparableAlternatives",
  "consequences-shown": "consequencesShown",
  "ai-never-the-source": "aiNeverTheSource",
  "history-preserved": "historyPreserved",
  "humans-decide": "humansDecide",
} as const;

export const TRUST_PILLARS: TrustPillar[] = [
  {
    id: "sources-before-conclusions",
    title: "Sources Before Conclusions",
    description:
      "Evidence is connected and reviewed before any conclusion is presented — never the reverse.",
  },
  {
    id: "uncertainty-visible",
    title: "Uncertainty Is Visible",
    description:
      "When evidence is insufficient, that is stated directly — never hidden behind a score.",
  },
  {
    id: "explainable-recommendations",
    title: "Recommendations Are Explainable",
    description:
      "Every recommendation traces back to the evidence and reasoning that produced it.",
  },
  {
    id: "comparable-alternatives",
    title: "Alternatives Can Be Compared",
    description:
      "Options are presented side by side, never as a single forced answer.",
  },
  {
    id: "consequences-shown",
    title: "Consequences Are Shown",
    description:
      "Possible outcomes and limitations are explained alongside every option.",
  },
  {
    id: "ai-never-the-source",
    title: "AI Is Never The Source",
    description:
      "CBAI connects and explains evidence — it never originates facts or acts as a citation.",
  },
  {
    id: "history-preserved",
    title: "History Is Preserved",
    description:
      "Research and evidence changes are kept, not overwritten, so context is never lost.",
  },
  {
    id: "humans-decide",
    title: "Humans Decide",
    description:
      "Final judgment and responsibility always belong to the people using CBAI.",
  },
];

export const HOME_FOOTER = {
  mission:
    "Help people make better decisions using evidence. Never manipulate. Never fabricate. Never become political. Always explain. Always remain transparent.",
  constitution: "CBAI Constitution v1",
  evidencePolicy: "Evidence First — no fact without source or explicit label.",
  transparency: "Unavailable data is disclosed — never hidden behind fake numbers.",
  methodology: "Methods documented before scores; confidence from evidence quality.",
  documentation: "Platform Transformation Master Plan · Brand Foundation",
} as const;
