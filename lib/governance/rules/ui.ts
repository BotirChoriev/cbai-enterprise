import type { UiRule } from "@/lib/governance/types";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";

function defineUiRule(input: Omit<UiRule, "category" | "version">): UiRule {
  return { ...input, category: "ui", version: GOVERNANCE_VERSION };
}

/** UI surface governance rules — presentation constraints only. */
export const UI_RULES: readonly UiRule[] = [
  defineUiRule({
    id: "ui-no-fake-kpi",
    slug: "no-fake-kpi",
    uiConstraint: "no-fake-kpi",
    title: "No Fake KPI",
    description:
      "Key performance indicators on user-facing routes must be ops-honest or evidence-backed — never fabricated.",
    severity: "critical",
    allowed: [
      "Dashboard runtime metrics from real singletons",
      "Registry counts with catalog scope",
      "Not connected labels instead of KPIs",
    ],
    forbidden: [
      "Fabricated token usage trends",
      "Fake corpus size metrics",
      "Invented entity counts",
    ],
    standardReference: "docs/standards/08-design-standard.md",
  }),
  defineUiRule({
    id: "ui-no-fake-charts",
    slug: "no-fake-charts",
    uiConstraint: "no-fake-charts",
    title: "No Fake Charts",
    description:
      "Charts and time series require connected data sources — empty states preferred over invented series.",
    severity: "critical",
    allowed: [
      "Empty chart states with honest copy",
      "Pipeline SVG diagrams without metrics",
      "Charts from verified time series only",
    ],
    forbidden: [
      "Decorative charts with random data",
      "Invented trend lines",
      "Historical data without source",
    ],
    standardReference: "docs/standards/08-design-standard.md",
  }),
  defineUiRule({
    id: "ui-no-fake-confidence",
    slug: "no-fake-confidence",
    uiConstraint: "no-fake-confidence",
    title: "No Fake Confidence",
    description:
      "Confidence bars, percentages, and rings require verified evidence chain — not UI decoration.",
    severity: "critical",
    allowed: [
      "Engine-layer confidence with documented inputs (future, gated)",
      "Absence of confidence UI when no evidence",
    ],
    forbidden: [
      "96.1% confidence displays",
      "Progress rings without methodology",
      "High/Medium/Low confidence without inputs",
    ],
    standardReference: "docs/standards/01-cbai-constitution.md",
  }),
  defineUiRule({
    id: "ui-no-ai-wording",
    slug: "no-ai-wording",
    uiConstraint: "no-ai-wording",
    title: "No Misleading AI Wording",
    description:
      "AI marketing copy (neural link, omniscient AI) is forbidden on intelligence routes.",
    severity: "critical",
    allowed: [
      "Reasoning pipeline stage labels",
      "Honest simulated/stub labels where engine is stub",
      "Agent capability definitions",
    ],
    forbidden: [
      "NEURAL LINK ACTIVE",
      "AI knows best copy",
      "Fake AI summaries as verified intelligence",
    ],
    standardReference: "docs/standards/08-design-standard.md",
  }),
  defineUiRule({
    id: "ui-accessibility-required",
    slug: "accessibility-required",
    uiConstraint: "accessibility-required",
    title: "Accessibility Required",
    description:
      "User-facing routes must meet WCAG AA: keyboard, contrast, screen readers, ARIA where needed.",
    severity: "major",
    allowed: [
      "Skip links and focus rings",
      "Textual status alongside color",
      "Graph edge list fallback",
    ],
    forbidden: [
      "Keyboard-inaccessible primary flows",
      "Color-only status communication",
      "Removed focus outlines without replacement",
    ],
    standardReference: "docs/standards/09-accessibility-standard.md",
  }),
  defineUiRule({
    id: "ui-status-badge-consistency",
    slug: "status-badge-consistency",
    uiConstraint: "no-fake-kpi",
    title: "Status Badge Consistency",
    description:
      "Evidence status vocabulary must be consistent: Not connected, Connected, Planned, Verification pending, Deprecated.",
    severity: "major",
    allowed: [
      "Uppercase tracking badge labels",
      "Shared badge component tokens",
    ],
    forbidden: [
      "Module-specific status synonyms that hide gaps",
      "Green/red judgment colors for entity quality",
    ],
    standardReference: "docs/standards/08-design-standard.md",
  }),
  defineUiRule({
    id: "ui-no-decorative-controls",
    slug: "no-decorative-controls",
    uiConstraint: "no-ai-wording",
    title: "No Decorative Controls",
    description:
      "Controls that imply functionality must be wired or removed — no fake interactivity.",
    severity: "major",
    allowed: [
      "Disabled controls with coming-soon label",
      "Removed unwired search bars",
    ],
    forbidden: [
      "Unwired search that appears functional",
      "Placeholder buttons accumulating silently",
    ],
    standardReference: "docs/standards/01-cbai-constitution.md",
  }),
] as const;

export function getUiRuleByConstraint(
  constraint: UiRule["uiConstraint"],
): UiRule[] {
  return UI_RULES.filter((rule) => rule.uiConstraint === constraint);
}
