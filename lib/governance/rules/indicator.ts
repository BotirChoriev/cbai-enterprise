import type { IndicatorRule } from "@/lib/governance/types";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";

function defineIndicatorRule(
  input: Omit<IndicatorRule, "category" | "version">,
): IndicatorRule {
  return { ...input, category: "indicator", version: GOVERNANCE_VERSION };
}

/** Indicator lifecycle governance rules. */
export const INDICATOR_RULES: readonly IndicatorRule[] = [
  defineIndicatorRule({
    id: "ind-lifecycle-planned",
    slug: "indicator-planned-state",
    lifecycleState: "planned",
    title: "Indicator Planned State",
    description:
      "Planned indicators are registry seeds with no live evidence path — must not display as connected or verified.",
    severity: "major",
    allowed: [
      "Registry listing with planned status",
      "Methodology text describing future requirements",
    ],
    forbidden: [
      "Planned indicators showing numeric values",
      "Planned status with implied live data",
    ],
    standardReference: "docs/standards/03-indicator-standard.md",
  }),
  defineIndicatorRule({
    id: "ind-lifecycle-connected",
    slug: "indicator-connected-state",
    lifecycleState: "connected",
    title: "Indicator Connected State",
    description:
      "Connected status requires at least one required source adapter delivering evidence items.",
    severity: "critical",
    allowed: [
      "Connected label with source slug reference",
      "Evidence items flowing from adapter",
    ],
    forbidden: [
      "Connected without working adapter",
      "Connected used for UI-only decoration",
    ],
    standardReference: "docs/standards/03-indicator-standard.md",
  }),
  defineIndicatorRule({
    id: "ind-lifecycle-verified",
    slug: "indicator-verified-state",
    lifecycleState: "verified",
    title: "Indicator Verified State",
    description:
      "Verified status requires validation checklist: schema, freshness, attribution.",
    severity: "critical",
    allowed: [
      "Verified label after validation gate",
      "Entity display of verified indicator values",
    ],
    forbidden: [
      "Verified without validation checklist",
      "Auto-promotion from connected to verified",
    ],
    standardReference: "docs/standards/03-indicator-standard.md",
  }),
  defineIndicatorRule({
    id: "ind-lifecycle-deprecated",
    slug: "indicator-deprecated-state",
    lifecycleState: "deprecated",
    title: "Indicator Deprecated State",
    description:
      "Deprecated indicators retain ID for audit; successor indicator must be documented.",
    severity: "major",
    allowed: [
      "Deprecated status with migration notice",
      "Historical audit references to old ID",
    ],
    forbidden: [
      "Reusing deprecated indicator IDs",
      "Deprecated indicators in new evaluations",
    ],
    standardReference: "docs/standards/03-indicator-standard.md",
  }),
  defineIndicatorRule({
    id: "ind-registry-only",
    slug: "indicator-registry-only",
    title: "Indicators From Registry Only",
    description:
      "Indicators are never invented at render time — they must exist in the global indicator registry.",
    severity: "critical",
    allowed: [
      "References to lib/indicator-framework registry IDs",
      "Query by slug or domain",
    ],
    forbidden: [
      "Ad hoc indicators in components",
      "Page-specific scoring dimensions without registry entry",
    ],
    standardReference: "docs/standards/03-indicator-standard.md",
  }),
  defineIndicatorRule({
    id: "ind-no-scores-in-registry",
    slug: "no-scores-in-registry",
    title: "No Scores In Registry",
    description:
      "The indicator registry is a catalog — not a scoring engine. No ratings or percentages in definitions.",
    severity: "critical",
    allowed: [
      "Methodology futureScoringDerivation text",
      "Status and source slugs",
    ],
    forbidden: [
      "Numeric scores in indicator definitions",
      "Rankings derived from indicator counts",
    ],
    standardReference: "docs/standards/03-indicator-standard.md",
  }),
  defineIndicatorRule({
    id: "ind-methodology-block",
    slug: "indicator-methodology-block",
    title: "Indicator Methodology Block Required",
    description:
      "Every indicator must include whyItExists, requiredEvidence, missingEvidence, futureScoringDerivation.",
    severity: "critical",
    allowed: [
      "Complete four-field methodology",
      "Honest missingEvidence disclosure",
    ],
    forbidden: [
      "Indicators without methodology block",
      "Empty or generic methodology copy",
    ],
    standardReference: "docs/standards/03-indicator-standard.md",
  }),
] as const;

export function getIndicatorRulesByLifecycle(
  state: NonNullable<IndicatorRule["lifecycleState"]>,
): IndicatorRule[] {
  return INDICATOR_RULES.filter((rule) => rule.lifecycleState === state);
}
