import type { CompassDirectionCopy } from "@/lib/i18n/dictionary-types";

/** English compass direction copy — source of truth mirrored in all language dictionaries. */
export const COMPASS_COPY_EN: {
  default: CompassDirectionCopy;
  academic: CompassDirectionCopy;
  engineer: CompassDirectionCopy;
  investor: CompassDirectionCopy;
  government: CompassDirectionCopy;
} = {
  default: {
    discover: { label: "Discover", description: "Search countries, companies, universities, and research topics." },
    research: { label: "Research", description: "Explore real research topics and their evidence." },
    evidence: { label: "Evidence", description: "Review official source status across profiles." },
    analyze: { label: "Analyze", description: "Organize evidence, notes, and open questions." },
    organize: { label: "Organize", description: "Continue or start a project to track your work." },
    report: { label: "Report", description: "Generate and review real, evidence-backed reports." },
  },
  academic: {
    discover: { label: "Question", description: "Start from a real research question." },
    research: { label: "Research", description: "Explore related research topics." },
    evidence: { label: "Evidence", description: "Connect supporting and counter evidence." },
    analyze: { label: "Notes", description: "Document findings in your research workspace." },
    organize: { label: "Analysis", description: "Track your project's real progress." },
    report: { label: "Report", description: "Assemble your findings into a report." },
  },
  engineer: {
    discover: { label: "Requirement", description: "Search the standards, systems, and organizations involved." },
    research: { label: "Standard", description: "Explore relevant technical research topics." },
    evidence: { label: "Evidence", description: "Review connected technical evidence and sources." },
    analyze: { label: "Decision Record", description: "Document your evaluation in project notes." },
    organize: { label: "Project", description: "Track tasks and open questions." },
    report: { label: "Report", description: "Generate your technical assessment report." },
  },
  investor: {
    discover: { label: "Market", description: "Search companies, countries, and industries." },
    research: { label: "Organization", description: "Explore related companies and research." },
    evidence: { label: "Evidence", description: "Review connected financial and evidence sources." },
    analyze: { label: "Comparison", description: "Compare organizations side by side." },
    organize: { label: "Project", description: "Track your investment analysis." },
    report: { label: "Report", description: "Generate your investment intelligence report." },
  },
  government: {
    discover: { label: "Country", description: "Search countries and public institutions." },
    research: { label: "Institution", description: "Explore related institutions and research." },
    evidence: { label: "Indicator", description: "Review connected governance evidence." },
    analyze: { label: "Scenario", description: "Document policy analysis in your workspace." },
    organize: { label: "Project", description: "Track your policy review." },
    report: { label: "Report", description: "Generate your policy intelligence report." },
  },
};

export const PRODUCT_STATUS_EN = {
  live: { label: "Available", explanation: "Works today with real, connected data." },
  partial: { label: "Partial", explanation: "Some real data is connected here; other parts are not yet." },
  waiting_for_verified_data: {
    label: "Awaiting data",
    explanation: "Built and ready, but no verified source is connected yet.",
  },
  preview: { label: "Preview", explanation: "An early, limited version — not the full capability yet." },
  restricted: { label: "Restricted", explanation: "Available only in specific contexts or to specific roles." },
  not_connected: { label: "Not connected", explanation: "No data source or integration is connected yet." },
  planned: { label: "Planned", explanation: "Planned for a future release — not built yet." },
} as const;

export const ENTITIES_EN = {
  countriesDescription: "Overview, available information, missing information, and reports for each country.",
  companiesDescription: "Overview, available information, missing information, and reports for each company.",
  universitiesDescription: "Overview, available information, missing information, and reports for each university.",
  noMatchFilters: "No results match your filters.",
  clearFilters: "Clear filters",
  selected: "Selected",
  worldMapTitle: "World Intelligence Map",
  worldMapShowing: "World Intelligence Map — showing {name}",
  worldMapHeading: "Which countries have profiles?",
  worldMapDescription:
    "Every country in the local registry, grouped by region, with its real evidence data status. Select a country to open its profile.",
  worldMapSearchLabel: "Search countries by name, code, or region",
  worldMapSearchPlaceholder: "Search countries…",
  worldMapLegendAria: "Data status legend",
  worldMapResultsMatch: "{count} countries match \"{query}\"",
  worldMapResultsMatchOne: "1 country matches \"{query}\"",
  worldMapNoMatch: "No country matches \"{query}\" in the local registry.",
  share: "Share",
  linkCopied: "Link copied",
  linkCopyFailed: "Could not copy link",
  entityNotFound:
    "We couldn't find a {entityLabel} matching \"{requestedId}\" — the link may be out of date. Showing {fallbackName} instead; use search or the list below to find the right one.",
} as const;

export const MY_WORK_EN = {
  title: "My Work",
  yourWork: "{name}'s Work",
  restoringSession: "Restoring your session…",
  projectUnavailable: "This project isn't available.",
  projectUnavailableBody:
    "Projects are saved to this browser only, so this link may be from another device, or the project may have been removed here. Your real projects are listed below.",
  backToMyWork: "← Back to My Work",
  localProfileNotSetUp: "Local Assistant profile not set up yet",
  savedToBrowser:
    "Saved to this browser — real projects, research, and evidence entry points below, never fabricated activity or recommendations.",
  signInPrompt: "Sign in",
  signInOrCreate: "Sign in or create a local account",
  signedInCloud: "Signed in with a cloud account as {email} — Projects and Bookmarks below sync across every device you sign into.",
  signedInLocal: "Signed in as {email} — Projects and Bookmarks below belong to your account, saved to this device only.",
  continueLinksHeading: "Continue",
  onboardingHeading: "Get started",
  pageDescription: "Mission home — progress, next action, and latest work in one place.",
} as const;

export const SYSTEM_EN = {
  returnHome: "Return Home",
  goBack: "Go Back",
  search: "Search",
  continueProject: "Continue Project",
  tryAgain: "Try Again",
  feedback: "Feedback",
} as const;
