import type { DeliberationBundle, SynthesisSnapshot } from "@/lib/scientific-deliberation/types";

/**
 * Living Scientific Synthesis — never labeled final truth.
 */
export function buildLivingSynthesis(bundle: DeliberationBundle): SynthesisSnapshot {
  const now = new Date().toISOString();
  const wellSupported = bundle.claims
    .filter((c) => c.status === "supported" || c.status === "human_confirmed")
    .map((c) => c.statement);
  const conditional = bundle.claims
    .filter((c) => c.status === "conditionally_supported")
    .map((c) => c.statement);
  const disputed = bundle.claims
    .filter((c) => c.status === "disputed" || c.status === "contradicted")
    .map((c) => c.statement);
  const unknown = [
    ...bundle.claims.filter((c) => c.status === "unknown" || c.status === "proposed" || c.status === "source_pending").map((c) => c.statement),
    ...bundle.evidence.filter((e) => !e.methodology).map((e) => `methodology unknown for ${e.id}`),
  ];
  const contradictions = bundle.contradictions.map((c) => c.explanation);
  const nextExperiments = [
    bundle.evidence.some((e) => e.stance === "challenge")
      ? "Design a comparative study addressing counter-evidence"
      : "Request additional source-backed supporting evidence",
    bundle.replications.length === 0 ? "Plan an independent replication attempt" : "Document deviations against original protocol",
    "Open a methodology clinic on sampling and measurement units",
  ].slice(0, 5);

  return {
    id: `synth-${bundle.room.id}-${now}`,
    roomId: bundle.room.id,
    wellSupported,
    conditional,
    disputed,
    unknown: unknown.length ? unknown : ["No verified synthesis inputs yet"],
    contradictions: contradictions.length ? contradictions : ["No linked contradictions yet"],
    nextExperiments,
    generatedAt: now,
    evidenceCutoff: now,
    reviewedBy: null,
    humanApprovalStatus: "not_reviewed",
    version: (bundle.synthesis?.version ?? 0) + 1,
    finalTruthForbidden: true,
  };
}

export function synthesisForbidsFinalTruthLanguage(text: string): boolean {
  return !/final\s+truth|winner|permanently\s+true|debate\s+won/i.test(text);
}
