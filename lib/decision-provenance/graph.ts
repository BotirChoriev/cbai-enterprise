/**
 * Decision Provenance Graph — source → claim → counter-evidence → assumption →
 * option → risk → approval → outcome. CBAI never auto-approves the final decision.
 */

export const DECISION_PROVENANCE_SCHEMA_VERSION = 1 as const;

export type ProvenanceNodeKind =
  | "source"
  | "claim"
  | "counter_evidence"
  | "assumption"
  | "option"
  | "risk"
  | "approval"
  | "outcome";

export type ProvenanceNode = {
  readonly id: string;
  readonly kind: ProvenanceNodeKind;
  readonly label: string;
  readonly detail: string | null;
  readonly passportId: string | null;
  readonly knowledgeState: "known" | "disputed" | "unknown";
};

export type ProvenanceEdge = {
  readonly fromId: string;
  readonly toId: string;
  readonly relation: string;
};

export type DecisionProvenanceGraph = {
  readonly schemaVersion: typeof DECISION_PROVENANCE_SCHEMA_VERSION;
  readonly graphId: string;
  readonly title: string;
  readonly nodes: readonly ProvenanceNode[];
  readonly edges: readonly ProvenanceEdge[];
  readonly humanApprovalRequired: true;
  readonly finalDecisionOwner: "human";
  readonly contentLocale: string;
  readonly createdAt: string;
};

export type BuildProvenanceInput = {
  readonly title: string;
  readonly sourceLabel: string;
  readonly sourceDetail?: string | null;
  readonly claimText: string;
  readonly counterEvidence?: string | null;
  readonly assumption: string;
  readonly options: readonly string[];
  readonly risk: string;
  readonly passportId?: string | null;
  readonly contentLocale?: string;
};

export function buildDecisionProvenanceGraph(input: BuildProvenanceInput): DecisionProvenanceGraph {
  const now = new Date().toISOString();
  const options = input.options.map((o) => o.trim()).filter(Boolean).slice(0, 5);
  if (options.length < 3) {
    throw new Error("provenance_requires_3_to_5_options");
  }

  const sourceId = "node-source";
  const claimId = "node-claim";
  const counterId = "node-counter";
  const assumptionId = "node-assumption";
  const riskId = "node-risk";
  const approvalId = "node-approval";
  const outcomeId = "node-outcome";

  const nodes: ProvenanceNode[] = [
    {
      id: sourceId,
      kind: "source",
      label: input.sourceLabel.trim() || "Source",
      detail: input.sourceDetail ?? null,
      passportId: input.passportId ?? null,
      knowledgeState: "known",
    },
    {
      id: claimId,
      kind: "claim",
      label: input.claimText.trim(),
      detail: null,
      passportId: input.passportId ?? null,
      knowledgeState: "disputed",
    },
    {
      id: counterId,
      kind: "counter_evidence",
      label: input.counterEvidence?.trim() || "Counter-evidence not yet attached",
      detail: input.counterEvidence ? null : "Unknown until evidence is linked.",
      passportId: null,
      knowledgeState: input.counterEvidence ? "known" : "unknown",
    },
    {
      id: assumptionId,
      kind: "assumption",
      label: input.assumption.trim(),
      detail: "Marked as assumption — not proven fact.",
      passportId: null,
      knowledgeState: "unknown",
    },
    ...options.map((label, i) => ({
      id: `node-option-${i + 1}`,
      kind: "option" as const,
      label,
      detail: null,
      passportId: null,
      knowledgeState: "unknown" as const,
    })),
    {
      id: riskId,
      kind: "risk",
      label: input.risk.trim() || "Risks not yet specified",
      detail: null,
      passportId: null,
      knowledgeState: "unknown",
    },
    {
      id: approvalId,
      kind: "approval",
      label: "Human approval required",
      detail: "CBAI structures options; the human decides.",
      passportId: null,
      knowledgeState: "known",
    },
    {
      id: outcomeId,
      kind: "outcome",
      label: "Outcome (not yet recorded)",
      detail: "Outcome learning awaits human decision and later observation.",
      passportId: null,
      knowledgeState: "unknown",
    },
  ];

  const edges: ProvenanceEdge[] = [
    { fromId: sourceId, toId: claimId, relation: "supports_or_informs" },
    { fromId: claimId, toId: counterId, relation: "challenged_by" },
    { fromId: claimId, toId: assumptionId, relation: "depends_on_assumption" },
    ...options.map((_, i) => ({
      fromId: claimId,
      toId: `node-option-${i + 1}`,
      relation: "suggests_option",
    })),
    ...options.map((_, i) => ({
      fromId: `node-option-${i + 1}`,
      toId: riskId,
      relation: "carries_risk",
    })),
    { fromId: riskId, toId: approvalId, relation: "awaits_human_approval" },
    { fromId: approvalId, toId: outcomeId, relation: "leads_to_outcome_after_decision" },
  ];

  return {
    schemaVersion: DECISION_PROVENANCE_SCHEMA_VERSION,
    graphId: `prov-${Date.now().toString(36)}`,
    title: input.title.trim() || "Decision provenance",
    nodes,
    edges,
    humanApprovalRequired: true,
    finalDecisionOwner: "human",
    contentLocale: input.contentLocale ?? "en",
    createdAt: now,
  };
}

export function explainWhyConclusionShown(graph: DecisionProvenanceGraph): {
  readonly whyShown: string;
  readonly whatIsUnknown: readonly string[];
  readonly humanMustDecide: true;
} {
  const unknowns = graph.nodes.filter((n) => n.knowledgeState === "unknown").map((n) => n.label);
  return {
    whyShown:
      "This conclusion path is shown because sources, claims, assumptions, and options were structured for human review — not because CBAI decided.",
    whatIsUnknown: unknowns,
    humanMustDecide: true,
  };
}
