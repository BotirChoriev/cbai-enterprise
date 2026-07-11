export type ResearchHealthState = "healthy" | "stable" | "weak" | "critical";

export const RESEARCH_HEALTH_LABELS: Record<ResearchHealthState, string> = {
  healthy: "Healthy",
  stable: "Stable",
  weak: "Weak",
  critical: "Critical",
};
