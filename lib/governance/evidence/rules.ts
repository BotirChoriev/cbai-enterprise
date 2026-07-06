import type { EvidenceRule } from "@/lib/governance/types";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";

function defineEvidenceRule(
  input: Omit<EvidenceRule, "category" | "version">,
): EvidenceRule {
  return { ...input, category: "evidence", version: GOVERNANCE_VERSION };
}

/** Evidence governance rules — source, status, and methodology requirements. */
export const EVIDENCE_RULES: readonly EvidenceRule[] = [
  defineEvidenceRule({
    id: "evid-source-required",
    slug: "source-required",
    requirement: "source-required",
    title: "Evidence Source Required",
    description:
      "Every evidence item must trace to a registered source slug in the evidence source registry.",
    severity: "critical",
    allowed: [
      "Registered source slugs (UN, World Bank, cbai-local-registry)",
      "Source name visible in UI or report",
    ],
    forbidden: [
      "Evidence without source reference",
      "Invented source names",
      "Unregistered ad hoc sources",
    ],
    standardReference: "docs/standards/02-evidence-standard.md",
  }),
  defineEvidenceRule({
    id: "evid-status-required",
    slug: "status-required",
    requirement: "status-required",
    title: "Evidence Status Required",
    description:
      "Every user-facing field must declare evidence status: connected, not_connected, planned, verification_pending, or deprecated.",
    severity: "critical",
    allowed: [
      "Status badges on intelligence blocks",
      "API evidenceStatus wrappers (future)",
      "Graph edge evidence_available / evidence_missing",
    ],
    forbidden: [
      "Values without status label",
      "Connected implied without adapter",
      "Deprecated sources without notice",
    ],
    standardReference: "docs/standards/02-evidence-standard.md",
  }),
  defineEvidenceRule({
    id: "evid-methodology-required",
    slug: "methodology-required",
    requirement: "methodology-required",
    title: "Methodology Required",
    description:
      "Indicators and evaluations must document methodology before values are shown.",
    severity: "critical",
    allowed: [
      "Four-field methodology block on indicators",
      "Methodology version in footers",
    ],
    forbidden: [
      "Evaluations without methodology reference",
      "Hidden scoring formulas",
    ],
    standardReference: "docs/standards/06-methodology-standard.md",
  }),
  defineEvidenceRule({
    id: "evid-verification-gate",
    slug: "verification-before-promotion",
    requirement: "status-required",
    title: "Verification Before Promotion",
    description:
      "Connected sources do not imply verified evidence until validation checklist passes.",
    severity: "major",
    allowed: [
      "verification_pending status label",
      "Withholding evaluations until verified",
    ],
    forbidden: [
      "Using verification_pending data in scores",
      "Promoting to verified without checklist",
    ],
    standardReference: "docs/standards/02-evidence-standard.md",
  }),
  defineEvidenceRule({
    id: "evid-local-registry-scope",
    slug: "local-registry-scope",
    requirement: "source-required",
    title: "Local Registry Scope Declaration",
    description:
      "CBAI local registry evidence must declare catalog scope — what the on-platform registry covers.",
    severity: "major",
    allowed: [
      "Available — local registry labels",
      "Catalog field enumeration in docs",
    ],
    forbidden: [
      "Local registry presented as comprehensive national data",
      "Registry facts without scope label",
    ],
    standardReference: "docs/standards/02-evidence-standard.md",
  }),
  defineEvidenceRule({
    id: "evid-deprecated-handling",
    slug: "deprecated-source-handling",
    requirement: "status-required",
    title: "Deprecated Source Handling",
    description:
      "Deprecated sources must not feed new evidence; historical items retain deprecation metadata.",
    severity: "major",
    allowed: [
      "Deprecated status in source registry",
      "Historical audit retention",
    ],
    forbidden: [
      "New evidence from deprecated sources",
      "Silent deprecation without label",
    ],
    standardReference: "docs/standards/02-evidence-standard.md",
  }),
] as const;

export function getEvidenceRuleByRequirement(
  requirement: EvidenceRule["requirement"],
): EvidenceRule[] {
  return EVIDENCE_RULES.filter((rule) => rule.requirement === requirement);
}
