/**
 * Enterprise report architecture — extends Reports Center with named report families.
 * Availability stays honest (Planned / Registry only / Not available). Never invents content.
 */

export type EnterpriseReportKind =
  | "executive"
  | "government"
  | "investor"
  | "academic"
  | "risk"
  | "evidence";

export type EnterpriseReportBlueprint = {
  id: EnterpriseReportKind;
  title: string;
  audience: string;
  purpose: string;
  status: "Planned" | "Registry facts only" | "Not available";
  requiredEvidence: string;
  relatedRoute?: string;
};

export const ENTERPRISE_REPORT_ARCHITECTURE: readonly EnterpriseReportBlueprint[] = [
  {
    id: "executive",
    title: "Executive Report",
    audience: "Leadership",
    purpose: "Decision-ready summary of connected evidence, gaps, and next review steps.",
    status: "Planned",
    requiredEvidence: "Connected official sources + human-reviewed gap summary",
    relatedRoute: "/reports",
  },
  {
    id: "government",
    title: "Government Report",
    audience: "Public sector",
    purpose: "Domain coverage, missing official disclosures, and publication priorities.",
    status: "Registry facts only",
    requiredEvidence: "Country indicator coverage + planned official source map",
    relatedRoute: "/governance",
  },
  {
    id: "investor",
    title: "Investor Report",
    audience: "Investors",
    purpose: "Due-diligence scoping from registry facts — no invented market scores.",
    status: "Not available",
    requiredEvidence: "Connected fiscal, company, and procurement sources",
    relatedRoute: "/investor",
  },
  {
    id: "academic",
    title: "Academic Report",
    audience: "Researchers",
    purpose: "Methodology, evidence readiness, and open questions for a research topic.",
    status: "Registry facts only",
    requiredEvidence: "Research catalog methods + evidence types",
    relatedRoute: "/research",
  },
  {
    id: "risk",
    title: "Risk Report",
    audience: "Risk & compliance",
    purpose: "Evidence-backed risk overview only when verified sources are connected.",
    status: "Not available",
    requiredEvidence: "Verified risk methodology indicators + official sources",
  },
  {
    id: "evidence",
    title: "Evidence Report",
    audience: "Analysts",
    purpose: "Connected vs missing sources, freshness, and verification status.",
    status: "Registry facts only",
    requiredEvidence: "Evidence infrastructure registry + gap explorer",
    relatedRoute: "/evidence",
  },
] as const;

export function enterpriseReportStatusClass(
  status: EnterpriseReportBlueprint["status"],
): string {
  switch (status) {
    case "Registry facts only":
      return "border-teal-500/25 bg-teal-500/10 text-teal-300";
    case "Planned":
      return "border-amber-500/25 bg-amber-500/10 text-amber-300";
    case "Not available":
      return "border-zinc-600/80 bg-zinc-800/60 text-zinc-400";
  }
}
