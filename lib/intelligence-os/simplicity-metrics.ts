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
