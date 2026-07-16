/**
 * Module Accountability Registry — every primary route must answer six questions.
 *
 * What real work happens here?
 * What evidence enters?
 * What reasoning happens?
 * What knowledge leaves?
 * Who benefits?
 * What risk exists?
 */

export type ModuleAccountabilityEntry = {
  readonly route: string;
  readonly moduleName: string;
  readonly realWork: string;
  readonly evidenceEnters: string;
  readonly reasoningHappens: string;
  readonly knowledgeLeaves: string;
  readonly whoBenefits: string;
  readonly riskExists: string;
  readonly maturity: "live" | "partial" | "preview" | "planned";
};

export const MODULE_ACCOUNTABILITY: readonly ModuleAccountabilityEntry[] = [
  {
    route: "/",
    moduleName: "Home",
    realWork: "Resume active projects and navigate to intelligence surfaces.",
    evidenceEnters: "Pinned and recent entity context from local session.",
    reasoningHappens: "Operator command resolution — deterministic, not generative.",
    knowledgeLeaves: "Navigation to the next working surface.",
    whoBenefits: "Every user entering the one intelligence environment.",
    riskExists: "Must not imply live activity that does not exist.",
    maturity: "live",
  },
  {
    route: "/my-work",
    moduleName: "My Work",
    realWork: "Create and continue projects; link evidence, notes, and questions.",
    evidenceEnters: "User-linked evidence refs and entity attachments.",
    reasoningHappens: "Project health from real task/note counts — no fabricated progress.",
    knowledgeLeaves: "Structured project artifacts and Capability Passport signals.",
    whoBenefits: "Anyone holding an active investigation.",
    riskExists: "Local-only storage unless cloud account connected.",
    maturity: "live",
  },
  {
    route: "/search",
    moduleName: "Search",
    realWork: "Find real entity profiles in local catalogs.",
    evidenceEnters: "Local registry indexes only.",
    reasoningHappens: "Deterministic matching — no inferred entities.",
    knowledgeLeaves: "Entity profile navigation.",
    whoBenefits: "All users seeking a known entity.",
    riskExists: "Fuzzy matching must not fabricate matches.",
    maturity: "live",
  },
  {
    route: "/countries",
    moduleName: "Country Intelligence",
    realWork: "Review country registry facts, evidence status, comparables, relationships.",
    evidenceEnters: "Local country adapter and source coverage metadata.",
    reasoningHappens: "Evidence gap analysis and timeline readiness — no political scoring.",
    knowledgeLeaves: "Entity reports and project links.",
    whoBenefits: "Analysts, citizens, government, researchers.",
    riskExists: "Must not imply live API data or geopolitical rankings.",
    maturity: "live",
  },
  {
    route: "/companies",
    moduleName: "Company Intelligence",
    realWork: "Review company registry facts, comparables, source coverage.",
    evidenceEnters: "Local company adapter.",
    reasoningHappens: "Evidence comparison — no market scores.",
    knowledgeLeaves: "Entity reports and project links.",
    whoBenefits: "Investors, analysts, engineers, researchers.",
    riskExists: "Must not show partnership or competitor claims without evidence.",
    maturity: "live",
  },
  {
    route: "/universities",
    moduleName: "University Intelligence",
    realWork: "Review university registry facts, comparables, relationships.",
    evidenceEnters: "Local university adapter.",
    reasoningHappens: "Evidence gap and relationship panels — no league tables.",
    knowledgeLeaves: "Entity reports and project links.",
    whoBenefits: "Students, academics, institutions.",
    riskExists: "Must not show rankings or employability scores.",
    maturity: "live",
  },
  {
    route: "/research",
    moduleName: "Research Catalog",
    realWork: "Browse real research topics and enter topic workspaces.",
    evidenceEnters: "Catalog metadata and topic evidence lifecycle models.",
    reasoningHappens: "Human review gates before scientific claims support decisions.",
    knowledgeLeaves: "Research workspace artifacts and reports.",
    whoBenefits: "Scientists, students, professors, citizens.",
    riskExists: "Live scientific databases not connected — must stay labeled.",
    maturity: "partial",
  },
  {
    route: "/knowledge",
    moduleName: "Evidence",
    realWork: "Inspect official source connection status across the platform.",
    evidenceEnters: "Evidence infrastructure registry.",
    reasoningHappens: "Source readiness assessment — no live fetch.",
    knowledgeLeaves: "Understanding of what is connected vs missing.",
    whoBenefits: "Anyone verifying provenance before deciding.",
    riskExists: "Must not imply sources are live-integrated when they are declared only.",
    maturity: "partial",
  },
  {
    route: "/graph",
    moduleName: "Knowledge Graph",
    realWork: "Navigate verified catalog relationships between entities.",
    evidenceEnters: "Local entity adapters and relationship builder.",
    reasoningHappens: "Edge evidence status per relationship — no inferred paths.",
    knowledgeLeaves: "Relationship understanding for scoping and projects.",
    whoBenefits: "Researchers, analysts, graph explorers.",
    riskExists: "Extended entity types prepared but not connected.",
    maturity: "partial",
  },
  {
    route: "/analytics",
    moduleName: "Reports Center",
    realWork: "Assess report readiness and view saved reports.",
    evidenceEnters: "Connected registry facts and methodology definitions.",
    reasoningHappens: "Readiness model — no report generated without evidence.",
    knowledgeLeaves: "Saved report metadata; export honestly unavailable.",
    whoBenefits: "Anyone compiling findings for decision support.",
    riskExists: "Must not claim PDF/CSV/API export until readiness met.",
    maturity: "partial",
  },
  {
    route: "/trust",
    moduleName: "Trust Center",
    realWork: "Read constitution, methodology, and evidence policy.",
    evidenceEnters: "Governance and standards documents.",
    reasoningHappens: "Transparency about verification model.",
    knowledgeLeaves: "Informed trust in platform limits.",
    whoBenefits: "Every user before relying on intelligence.",
    riskExists: "Must stay synchronized with actual enforcement state.",
    maturity: "live",
  },
  {
    route: "/government",
    moduleName: "Governance Intelligence Lens",
    realWork: "Review institutional evidence readiness by domain.",
    evidenceEnters: "Workspace model definitions — not live government APIs.",
    reasoningHappens: "Gap analysis framing — not political ratings.",
    knowledgeLeaves: "Scoped understanding for policy questions.",
    whoBenefits: "Government leaders, policy analysts, citizens.",
    riskExists: "Preview state — must not imply full policy evidence connected.",
    maturity: "preview",
  },
  {
    route: "/investor",
    moduleName: "Economic Intelligence Lens",
    realWork: "Review due-diligence evidence readiness.",
    evidenceEnters: "Indicator readiness models.",
    reasoningHappens: "Domain coverage assessment — no market scores.",
    knowledgeLeaves: "Scoped investment question framing.",
    whoBenefits: "Investors, economists, business leaders.",
    riskExists: "Must not show financial scores without connected sources.",
    maturity: "preview",
  },
  {
    route: "/citizen",
    moduleName: "Public Intelligence Lens",
    realWork: "Access public information topics in plain language.",
    evidenceEnters: "Citizen workspace topic models.",
    reasoningHappens: "Evidence status explanation — no simplified verdicts.",
    knowledgeLeaves: "Accessible understanding of what institutions publish.",
    whoBenefits: "Citizens and public-interest readers.",
    riskExists: "Must not gatekeep public understanding behind login walls.",
    maturity: "preview",
  },
  {
    route: "/ai-control",
    moduleName: "Governance Control",
    realWork: "Review constitutional rules, validation pipeline, and limits.",
    evidenceEnters: "Governance rule registry.",
    reasoningHappens: "Manual audit model — not automated enforcement.",
    knowledgeLeaves: "Compliance understanding for releases.",
    whoBenefits: "Platform stewards and auditors.",
    riskExists: "Must not imply rules are auto-enforced when declarative only.",
    maturity: "partial",
  },
  {
    route: "/agents",
    moduleName: "Agents (planned)",
    realWork: "None today — catalog only.",
    evidenceEnters: "None.",
    reasoningHappens: "None.",
    knowledgeLeaves: "None.",
    whoBenefits: "Future orchestration layer.",
    riskExists: "Route must remain honestly labeled preview.",
    maturity: "planned",
  },
  {
    route: "/workflows",
    moduleName: "Workflows (planned)",
    realWork: "None today.",
    evidenceEnters: "None.",
    reasoningHappens: "None.",
    knowledgeLeaves: "None.",
    whoBenefits: "Future automation layer.",
    riskExists: "Must not show fake workflow execution.",
    maturity: "planned",
  },
] as const;

export function getModuleAccountability(route: string): ModuleAccountabilityEntry | undefined {
  const normalized = route.split("?")[0];
  return MODULE_ACCOUNTABILITY.find((m) => m.route === normalized);
}

export function getAccountabilityGaps(): ModuleAccountabilityEntry[] {
  return MODULE_ACCOUNTABILITY.filter((m) => m.maturity === "planned" || m.maturity === "preview");
}
