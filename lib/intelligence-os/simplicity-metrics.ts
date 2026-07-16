/**
 * EPIC-21 — Simplicity metrics architecture (no fabricated analytics).
 */

export type SimplicityMetricKind =
  | "time_to_first_success"
  | "time_to_resume"
  | "navigation_confidence"
  | "context_continuity"
  | "mission_completion_flow"
  | "decision_confidence";

export type SimplicityMetric = {
  readonly kind: SimplicityMetricKind;
  readonly label: string;
  readonly value: null;
  readonly unit: null;
  readonly limitation: string;
};

const METRIC_LABELS: Record<SimplicityMetricKind, string> = {
  time_to_first_success: "Time To First Success",
  time_to_resume: "Time To Resume",
  navigation_confidence: "Navigation Confidence",
  context_continuity: "Context Continuity",
  mission_completion_flow: "Mission Completion Flow",
  decision_confidence: "Decision Confidence",
};

export function listSimplicityMetrics(): readonly SimplicityMetric[] {
  return (Object.keys(METRIC_LABELS) as SimplicityMetricKind[]).map((kind) => ({
    kind,
    label: METRIC_LABELS[kind],
    value: null,
    unit: null,
    limitation: "Metric architecture only — no analytics pipeline connected.",
  }));
}

export const SIMPLICITY_METRICS_NOTE =
  "UX metrics are defined for future instrumentation. Values are never fabricated.";

export type PrimaryScreenId =
  | "home"
  | "evidence"
  | "reasoning"
  | "reports"
  | "graph"
  | "search"
  | "trust"
  | "my-work";

export type ScreenSimplicityAudit = {
  readonly screen: PrimaryScreenId;
  readonly score: number;
  readonly target: number;
  readonly meetsTarget: boolean;
  readonly note: string;
};

const SCREEN_TARGETS: Record<PrimaryScreenId, number> = {
  home: 8,
  evidence: 8,
  reasoning: 8,
  reports: 8.5,
  graph: 7.5,
  search: 9,
  trust: 7.5,
  "my-work": 7,
};

/** Heuristic simplicity audit — architecture only, derived from disclosure depth. */
export function deriveScreenSimplicityAudit(
  screen: PrimaryScreenId,
  disclosureLevel: "beginner" | "professional" | "expert",
): ScreenSimplicityAudit {
  const target = SCREEN_TARGETS[screen];
  const depthPenalty = disclosureLevel === "expert" ? 0.8 : disclosureLevel === "professional" ? 0.4 : 0;
  const screenBase: Record<PrimaryScreenId, number> = {
    home: 9.2,
    evidence: 9,
    reasoning: 8.8,
    reports: 9.1,
    graph: 8.5,
    search: 9.3,
    trust: 8,
    "my-work": 7.8,
  };
  const score = Math.round((screenBase[screen] - depthPenalty) * 10) / 10;
  return {
    screen,
    score,
    target,
    meetsTarget: score >= target,
    note: "Heuristic audit from disclosure level — not live analytics.",
  };
}
