/**
 * Intelligence Compass (Platform Activation mission, Mission 10) — a functional navigation
 * mechanism, not a decorative clock. Six real directions, each pointing at an already-real,
 * already-existing route (Search/Research/Evidence/Research Workspace/My Work/Reports) — never a
 * new page. Only the framing text changes per the user's real, already-saved `workspaceRole`
 * (the same field Role/Work-Context lenses already set); the destinations themselves never change,
 * so the Compass can never point a role at a page another role can't also reach the same way.
 * A standard accessible menu (the existing Sidebar/nav) remains the primary navigation at all
 * times — the Compass is an additional, alternate way in, never a replacement.
 */

import type { WorkspaceRole } from "@/lib/assistant/assistant-profile";

export type CompassDirectionId = "discover" | "research" | "evidence" | "analyze" | "organize" | "report";

export type CompassDirection = {
  id: CompassDirectionId;
  label: string;
  description: string;
  href: string;
};

const DIRECTION_HREFS: Record<CompassDirectionId, string> = {
  discover: "/search",
  research: "/research",
  evidence: "/knowledge",
  analyze: "/research/workspace",
  organize: "/my-work",
  report: "/analytics",
};

type DirectionCopy = Record<CompassDirectionId, { label: string; description: string }>;

const DEFAULT_COPY: DirectionCopy = {
  discover: { label: "Discover", description: "Search countries, companies, universities, and research topics." },
  research: { label: "Research", description: "Explore real research topics and their evidence." },
  evidence: { label: "Evidence", description: "Review official source status across profiles." },
  analyze: { label: "Analyze", description: "Organize evidence, notes, and open questions." },
  organize: { label: "Organize", description: "Continue or start a project to track your work." },
  report: { label: "Report", description: "Generate and review real, evidence-backed reports." },
};

const ACADEMIC_COPY: DirectionCopy = {
  discover: { label: "Question", description: "Start from a real research question." },
  research: { label: "Research", description: "Explore related research topics." },
  evidence: { label: "Evidence", description: "Connect supporting and counter evidence." },
  analyze: { label: "Notes", description: "Document findings in your research workspace." },
  organize: { label: "Analysis", description: "Track your project's real progress." },
  report: { label: "Report", description: "Assemble your findings into a report." },
};

const ENGINEER_COPY: DirectionCopy = {
  discover: { label: "Requirement", description: "Search the standards, systems, and organizations involved." },
  research: { label: "Standard", description: "Explore relevant technical research topics." },
  evidence: { label: "Evidence", description: "Review connected technical evidence and sources." },
  analyze: { label: "Decision Record", description: "Document your evaluation in project notes." },
  organize: { label: "Project", description: "Track tasks and open questions." },
  report: { label: "Report", description: "Generate your technical assessment report." },
};

const INVESTOR_COPY: DirectionCopy = {
  discover: { label: "Market", description: "Search companies, countries, and industries." },
  research: { label: "Organization", description: "Explore related companies and research." },
  evidence: { label: "Evidence", description: "Review connected financial and evidence sources." },
  analyze: { label: "Comparison", description: "Compare organizations side by side." },
  organize: { label: "Project", description: "Track your investment analysis." },
  report: { label: "Report", description: "Generate your investment intelligence report." },
};

const GOVERNMENT_COPY: DirectionCopy = {
  discover: { label: "Country", description: "Search countries and public institutions." },
  research: { label: "Institution", description: "Explore related institutions and research." },
  evidence: { label: "Indicator", description: "Review connected governance evidence." },
  analyze: { label: "Scenario", description: "Document policy analysis in your workspace." },
  organize: { label: "Project", description: "Track your policy review." },
  report: { label: "Report", description: "Generate your policy intelligence report." },
};

const ROLE_COPY: Partial<Record<WorkspaceRole, DirectionCopy>> = {
  student: ACADEMIC_COPY,
  researcher: ACADEMIC_COPY,
  professor: ACADEMIC_COPY,
  academic: ACADEMIC_COPY,
  university: ACADEMIC_COPY,
  research_center: ACADEMIC_COPY,
  engineer: ENGINEER_COPY,
  investor: INVESTOR_COPY,
  company: INVESTOR_COPY,
  economist: INVESTOR_COPY,
  government: GOVERNMENT_COPY,
  administrator: GOVERNMENT_COPY,
};

const DIRECTION_ORDER: readonly CompassDirectionId[] = [
  "discover",
  "research",
  "evidence",
  "analyze",
  "organize",
  "report",
];

/** Real directions for the current role — same 6 real destinations always, framing text adapted
 * only for roles with a genuinely distinct real workflow; every other role gets the honest,
 * general default rather than a guessed specialization. */
export function resolveCompassDirections(role: WorkspaceRole): readonly CompassDirection[] {
  const copy = ROLE_COPY[role] ?? DEFAULT_COPY;
  return DIRECTION_ORDER.map((id) => ({
    id,
    label: copy[id].label,
    description: copy[id].description,
    href: DIRECTION_HREFS[id],
  }));
}
