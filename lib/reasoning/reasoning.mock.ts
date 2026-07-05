import type { ReasoningStageId } from "@/lib/reasoning/reasoning.types";

export type PipelineStageDef = {
  id: ReasoningStageId;
  label: string;
  description: string;
};

/** Static pipeline stage definitions */
export const REASONING_PIPELINE_STAGES: PipelineStageDef[] = [
  {
    id: "question",
    label: "Question",
    description: "Parse and classify the intelligence query",
  },
  {
    id: "search",
    label: "Search",
    description: "Query the global entity index via CBAI Search",
  },
  {
    id: "knowledge-graph",
    label: "Knowledge Graph",
    description: "Traverse entity relationships in the knowledge graph",
  },
  {
    id: "evidence",
    label: "Evidence",
    description: "Collect and rank supporting evidence from sources",
  },
  {
    id: "reasoning",
    label: "Reasoning",
    description: "Apply multi-factor analysis across entity signals",
  },
  {
    id: "decision",
    label: "Decision",
    description: "Evaluate decision paths and select optimal outcome",
  },
  {
    id: "confidence",
    label: "Confidence",
    description: "Compute confidence score from evidence quality",
  },
  {
    id: "final-answer",
    label: "Final Answer",
    description: "Synthesize conclusion and recommended actions",
  },
];

/** Milliseconds per stage during simulated execution */
export const REASONING_STAGE_DELAYS: Record<ReasoningStageId, number> = {
  question: 600,
  search: 900,
  "knowledge-graph": 1100,
  evidence: 800,
  reasoning: 1000,
  decision: 900,
  confidence: 700,
  "final-answer": 600,
};

/** Preset questions for quick demo */
export const SAMPLE_REASONING_QUESTIONS: string[] = [
  "Which country has the strongest AI investment potential?",
  "What are NVIDIA's key research partnerships?",
  "Compare Stanford and MIT AI readiness",
  "Who are Apple's main competitors in AI?",
  "Which universities partner with Google?",
];

/** Answer templates keyed by query intent */
export type AnswerTemplate = {
  keywords: string[];
  intro: string;
  conclusion: string;
};

export const ANSWER_TEMPLATES: AnswerTemplate[] = [
  {
    keywords: ["country", "investment", "potential", "gdp", "economy"],
    intro: "Based on cross-entity analysis of country profiles, investment scores, and industry clusters,",
    conclusion:
      "emerges as the strongest candidate when weighting AI readiness, investment score, and risk profile across the knowledge graph.",
  },
  {
    keywords: ["partner", "partnership", "research", "collaborat"],
    intro: "Traversing the knowledge graph for research-partner and industry edges reveals that",
    conclusion:
      "maintains the most significant research and industry partnership network among matched entities.",
  },
  {
    keywords: ["compare", "versus", "vs", "difference"],
    intro: "Comparative entity analysis across AI score, innovation metrics, and risk signals indicates",
    conclusion:
      "shows measurable advantages in the queried dimensions, though both entities remain strategically relevant.",
  },
  {
    keywords: ["competitor", "competition", "rival"],
    intro: "Knowledge graph competitor edges and market positioning data identify",
    conclusion:
      "as the primary competitive landscape for the target entity within the AI and technology sector.",
  },
  {
    keywords: ["university", "universities", "academic", "education"],
    intro: "Academic entity profiling combined with industry partnership edges shows",
    conclusion:
      "leads among matched institutions for research strength and industry collaboration density.",
  },
];

export const DEFAULT_ANSWER_TEMPLATE: AnswerTemplate = {
  keywords: [],
  intro: "Synthesizing evidence from global search, knowledge graph traversal, and entity intelligence profiles,",
  conclusion:
    "represents the highest-confidence match for your query based on relevance scoring and relationship density.",
};
