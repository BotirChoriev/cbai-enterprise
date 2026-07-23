/**
 * Smart report summaries — compose honest text from existing report + status builders.
 * Does not change Reports Center architecture.
 */

import { buildEntityReport } from "@/lib/entity/entity-report";
import { buildGlobalStatus } from "@/lib/enterprise/global-status";
import { ENTERPRISE_REPORT_ARCHITECTURE } from "@/lib/enterprise/report-architecture";
import type { AssistantOsContext } from "@/lib/voice-operator/os/session-context";
import { getPrimaryEntity, type PlatformContextSnapshot } from "@/lib/context";

export type SmartSummaryKind =
  | "executive"
  | "government"
  | "investor"
  | "academic"
  | "research"
  | "evidence";

export type SmartSummaryResult = {
  readonly kind: SmartSummaryKind;
  readonly assistantText: string;
  readonly href: string;
};

const KIND_PATTERNS: readonly { kind: SmartSummaryKind; pattern: RegExp }[] = [
  { kind: "executive", pattern: /\b(executive summary|executive report|generate executive)\b/i },
  { kind: "government", pattern: /\b(government summary|government report|generate government)\b/i },
  { kind: "investor", pattern: /\b(investor summary|investor report|generate investor|investor brief)\b/i },
  { kind: "academic", pattern: /\b(academic summary|academic report|generate academic|methodology report)\b/i },
  { kind: "research", pattern: /\b(research summary|research report|generate research summary)\b/i },
  { kind: "evidence", pattern: /\b(evidence summary|evidence report|generate evidence)\b/i },
];

function resolveKind(raw: string): SmartSummaryKind | null {
  for (const entry of KIND_PATTERNS) {
    if (entry.pattern.test(raw)) return entry.kind;
  }
  if (/\bgenerate (a )?report\b/i.test(raw) && /\bsummary\b/i.test(raw)) {
    return "executive";
  }
  return null;
}

function entityLines(
  platform: PlatformContextSnapshot | null,
  os: AssistantOsContext,
): string[] {
  const primary = platform ? getPrimaryEntity(platform) : null;
  const lines: string[] = [];

  if (primary?.kind === "country" || os.countryName) {
    const id = primary?.kind === "country" ? primary.id : null;
    const report = id ? buildEntityReport("country", id) : null;
    if (report && report.entityType === "country") {
      lines.push(
        `Country focus: ${report.country.name}. Data status: ${report.dataStatus}.`,
        `Limitations: ${report.limitations.slice(0, 2).join(" ")}`,
      );
    } else if (os.countryName) {
      lines.push(`Country focus: ${os.countryName} (registry context).`);
    }
  }

  if (primary?.kind === "company" || os.companyName) {
    const id = primary?.kind === "company" ? primary.id : null;
    const report = id ? buildEntityReport("company", id) : null;
    if (report && report.entityType === "company") {
      lines.push(
        `Company focus: ${report.company.name}. Data status: ${report.dataStatus}.`,
        `Limitations: ${report.limitations.slice(0, 2).join(" ")}`,
      );
    } else if (os.companyName) {
      lines.push(`Company focus: ${os.companyName} (registry context).`);
    }
  }

  if (primary?.kind === "university" || os.universityName) {
    const id = primary?.kind === "university" ? primary.id : null;
    const report = id ? buildEntityReport("university", id) : null;
    if (report && report.entityType === "university") {
      lines.push(
        `University focus: ${report.university.name}. Data status: ${report.dataStatus}.`,
        `Limitations: ${report.limitations.slice(0, 2).join(" ")}`,
      );
    } else if (os.universityName) {
      lines.push(`University focus: ${os.universityName} (registry context).`);
    }
  }

  if (os.researchTopicId) {
    const report = buildEntityReport("research_topic", os.researchTopicId);
    if (report && report.entityType === "research_topic") {
      lines.push(
        `Research topic: ${report.topicName}. Evidence connected: ${report.evidenceConnectedCount}.`,
        report.trustStatement,
      );
    }
  }

  if (os.missionProblem) {
    lines.push(`Active mission: ${os.missionProblem.slice(0, 120)}.`);
  }

  return lines;
}

export function detectSmartSummaryIntent(
  raw: string,
  platform: PlatformContextSnapshot | null,
  os: AssistantOsContext,
): SmartSummaryResult | null {
  const kind = resolveKind(raw);
  if (!kind) return null;

  const blueprint = ENTERPRISE_REPORT_ARCHITECTURE.find((r) => r.id === kind)
    ?? ENTERPRISE_REPORT_ARCHITECTURE.find((r) =>
      kind === "research" ? r.id === "academic" : r.id === kind,
    );

  const status = buildGlobalStatus();
  const focus = entityLines(platform, os);
  const title = blueprint?.title ?? `${kind} summary`;

  const assistantText = [
    `${title} (honest registry summary — not a finished formal export).`,
    `Architecture status: ${blueprint?.status ?? "Planned"}.`,
    `Required evidence: ${blueprint?.requiredEvidence ?? "Connected official sources"}.`,
    `Coverage: ${status.coveragePercent === null ? "not assessed" : `${status.coveragePercent}%`} · Confidence: ${status.confidence}.`,
    `Connected sources: ${status.connectedSources} · Missing: ${status.missingSources}.`,
    focus.length > 0 ? focus.join(" ") : "No primary entity selected — open a country, company, university, or research topic for a focused summary.",
    "Open Reports to continue with the existing report architecture. I will not invent unsupported findings.",
  ].join(" ");

  return {
    kind,
    assistantText,
    href: blueprint?.relatedRoute ?? "/reports",
  };
}
