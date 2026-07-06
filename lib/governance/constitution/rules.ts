import type { ConstitutionRule } from "@/lib/governance/types";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";

function defineConstitutionRule(
  input: Omit<ConstitutionRule, "category" | "version">,
): ConstitutionRule {
  return { ...input, category: "constitution", version: GOVERNANCE_VERSION };
}

/** Supreme constitutional principles — all modules inherit these constraints. */
export const CONSTITUTION_RULES: readonly ConstitutionRule[] = [
  defineConstitutionRule({
    id: "const-evidence-first",
    slug: "evidence-first",
    principleId: "evidence-first",
    title: "Evidence First",
    description:
      "No intelligence claim without traceable evidence or an explicit unavailable label.",
    severity: "critical",
    allowed: [
      "Fields with source attribution",
      "Explicit not-connected labels",
      "Local registry facts with catalog scope",
    ],
    forbidden: [
      "Unsourced statistics presented as fact",
      "Hidden evidence gaps",
      "Implied certainty without provenance",
    ],
    standardReference: "docs/standards/01-cbai-constitution.md",
  }),
  defineConstitutionRule({
    id: "const-political-neutrality",
    slug: "political-neutrality",
    principleId: "political-neutrality",
    title: "Political Neutrality",
    description:
      "No partisan framing, national favoritism, or ideological scoring.",
    severity: "critical",
    allowed: [
      "Factual government structure from official records",
      "Neutral comparative methodology text",
    ],
    forbidden: [
      "Partisan endorsements or attacks",
      "National propaganda framing",
      "Ideological scoring indices",
    ],
    standardReference: "docs/standards/01-cbai-constitution.md",
  }),
  defineConstitutionRule({
    id: "const-human-benefit",
    slug: "human-benefit",
    principleId: "human-benefit",
    title: "Human Benefit",
    description:
      "Platform serves citizens, investors, governments, students, researchers, and academics — not engagement metrics.",
    severity: "major",
    allowed: [
      "Persona-specific honest guidance",
      "Decision-support without manipulation",
    ],
    forbidden: [
      "Engagement bait patterns",
      "Fear-based messaging",
      "Dark patterns for retention",
    ],
    standardReference: "docs/standards/01-cbai-constitution.md",
  }),
  defineConstitutionRule({
    id: "const-transparency",
    slug: "transparency",
    principleId: "transparency",
    title: "Transparency",
    description:
      "Status, sources, methodology, and gaps are visible — not hidden behind UI polish.",
    severity: "critical",
    allowed: [
      "Visible evidence status badges",
      "Methodology footers",
      "Source registry references",
    ],
    forbidden: [
      "Hidden unavailable states",
      "Obfuscated data limitations",
      "Black-box conclusions",
    ],
    standardReference: "docs/standards/01-cbai-constitution.md",
  }),
  defineConstitutionRule({
    id: "const-golden-rule",
    slug: "golden-rule",
    principleId: "golden-rule",
    title: "Golden Rule",
    description:
      "If data is unavailable, say so honestly; never invent to fill empty space.",
    severity: "critical",
    allowed: [
      "Not connected",
      "Evidence pending",
      "Coming soon",
      "Withheld fields",
    ],
    forbidden: [
      "Plausible invented values",
      "Placeholder numbers shipped as intelligence",
      "Silent empty-to-fake substitution",
    ],
    standardReference: "docs/standards/01-cbai-constitution.md",
  }),
  defineConstitutionRule({
    id: "const-methodology-before-metrics",
    slug: "methodology-before-metrics",
    principleId: "methodology-before-metrics",
    title: "Methodology Before Metrics",
    description:
      "Define how something would be measured before displaying any number.",
    severity: "critical",
    allowed: [
      "Methodology blocks before evaluations",
      "Future scoring derivation text without scores",
    ],
    forbidden: [
      "Numeric metrics without methodology reference",
      "Scores appearing before indicator definition",
    ],
    standardReference: "docs/standards/06-methodology-standard.md",
  }),
  defineConstitutionRule({
    id: "const-separation-evidence-judgment",
    slug: "separation-of-evidence-and-judgment",
    principleId: "separation-of-evidence-and-judgment",
    title: "Separation of Evidence and Judgment",
    description:
      "Facts (registry, documents) are distinct from evaluations (scores, recommendations).",
    severity: "critical",
    allowed: [
      "Registry facts in dedicated sections",
      "Evaluations clearly labeled when verified",
    ],
    forbidden: [
      "Mixing registry facts with inferred scores",
      "Recommendations without evidence chain",
    ],
    standardReference: "docs/standards/02-evidence-standard.md",
  }),
  defineConstitutionRule({
    id: "const-no-social-sentiment",
    slug: "no-social-sentiment-scoring",
    principleId: "no-social-sentiment-scoring",
    title: "No Social Sentiment Scoring",
    description:
      "No Twitter-style sentiment, popularity, or viral metrics as intelligence.",
    severity: "critical",
    allowed: [
      "Official survey data with source attribution",
      "Bibliometric counts from verified indexes",
    ],
    forbidden: [
      "Social media sentiment indices",
      "Popularity or viral metrics",
      "Engagement-derived intelligence",
    ],
    standardReference: "docs/standards/01-cbai-constitution.md",
  }),
  defineConstitutionRule({
    id: "const-zero-demo-policy",
    slug: "zero-demo-policy",
    principleId: "zero-demo-policy",
    title: "Zero Demo Policy",
    description:
      "No fabricated scores, percentages, rankings, confidence bars, or AI summaries on user-facing routes.",
    severity: "critical",
    allowed: [
      "Honest placeholders",
      "Layout mock in dev-only environments",
      "Ops-honest runtime metrics on dashboard",
    ],
    forbidden: [
      "Fabricated confidence percentages",
      "Fake rankings and league tables",
      "AI summaries without evidence chain",
      "Sci-fi demo copy on production routes",
    ],
    standardReference: "docs/standards/01-cbai-constitution.md",
  }),
  defineConstitutionRule({
    id: "const-platform-consistency",
    slug: "platform-consistency",
    principleId: "platform-consistency",
    title: "Platform Consistency",
    description:
      "Entity routes, search, graph, and home follow the same honesty and layout patterns.",
    severity: "major",
    allowed: [
      "Shared intelligence block pattern",
      "Consistent status badge vocabulary",
      "Golden Rule reference implementation on countries",
    ],
    forbidden: [
      "One route compliant while others fabricate",
      "Inconsistent unavailable labeling",
      "Module-specific honesty exceptions",
    ],
    standardReference: "docs/standards/04-entity-standard.md",
  }),
  defineConstitutionRule({
    id: "const-explain-before-evaluate",
    slug: "explain-before-evaluate",
    principleId: "explain-before-evaluate",
    title: "Explain Before Evaluate",
    description:
      "Users see why an indicator exists and what evidence it needs before any evaluation.",
    severity: "critical",
    allowed: [
      "Indicator methodology before values",
      "Why-it-exists copy on entity blocks",
    ],
    forbidden: [
      "Scores without preceding methodology",
      "Evaluations without indicator ID reference",
    ],
    standardReference: "docs/standards/03-indicator-standard.md",
  }),
  defineConstitutionRule({
    id: "const-no-fake-data",
    slug: "no-fake-data",
    principleId: "no-fake-data",
    title: "No Fake Data",
    description:
      "Mock data for layout development must not ship as intelligence; unavailable fields use honest labels.",
    severity: "critical",
    allowed: [
      "Dev-only mocks with clear separation",
      "Static export of registry facts",
    ],
    forbidden: [
      "Mock scores in production bundles",
      "Invented time series in charts",
      "Fake corpus or agent activity metrics",
    ],
    standardReference: "docs/standards/01-cbai-constitution.md",
  }),
] as const;

export function getConstitutionRuleBySlug(
  slug: ConstitutionRule["slug"],
): ConstitutionRule | undefined {
  return CONSTITUTION_RULES.find((rule) => rule.slug === slug);
}

export function getConstitutionRuleByPrinciple(
  principleId: ConstitutionRule["principleId"],
): ConstitutionRule | undefined {
  return CONSTITUTION_RULES.find((rule) => rule.principleId === principleId);
}
