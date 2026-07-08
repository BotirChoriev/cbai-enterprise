export const RESEARCH_HOME_VERSION = "1.0.0" as const;

export const RESEARCH_HOME = {
  title: "Research Intelligence",
  subheadline:
    "Connect research topics, experiments, publications, laboratories, universities, and evidence.",
  searchPlaceholder:
    "Search research topics, methods, organisms, diseases, technologies...",
  statusLabel: "Research Intelligence: In development",
  coreMessage:
    "Research Intelligence is not a social feed. It is a structured evidence workspace for scientific review.",
  topicExplorationNote:
    "Topic exploration is in development. This entry point shows direction only — no live scientific databases or publication results yet.",
} as const;

export const RESEARCH_EXAMPLE_TOPICS = [
  "Microbiology",
  "Antibiotic resistance",
  "CRISPR",
  "Quantum battery",
  "Food security",
  "AI safety",
] as const;

export type ResearchWorkspaceArea = {
  id: string;
  label: string;
};

export const RESEARCH_WORKSPACE_AREAS: readonly ResearchWorkspaceArea[] = [
  { id: "topics", label: "Research topics" },
  { id: "experiments", label: "Experiments" },
  { id: "publications", label: "Publications" },
  { id: "datasets", label: "Datasets" },
  { id: "patents", label: "Patents" },
  { id: "laboratories", label: "Laboratories" },
  { id: "universities", label: "Universities" },
  { id: "researchers", label: "Researchers" },
  { id: "open-questions", label: "Open questions" },
  { id: "negative-results", label: "Negative results" },
] as const;

export type ResearchPrinciple = {
  id: string;
  title: string;
  description: string;
};

export const RESEARCH_PRINCIPLES: readonly ResearchPrinciple[] = [
  {
    id: "evidence-first",
    title: "Evidence first",
    description: "Scientific claims require connected sources — not posts, opinions, or summaries alone.",
  },
  {
    id: "topics-before-posts",
    title: "Research topics before posts",
    description: "Structured topics, methods, and open questions come before any social-style feed.",
  },
  {
    id: "human-judgment",
    title: "Human scientific judgment",
    description: "Human review is required before research evidence supports a decision or publication claim.",
  },
  {
    id: "transparent-methods",
    title: "Transparent methods",
    description: "Methods, sources, and limitations are shown clearly — not hidden behind automation.",
  },
] as const;

export const RESEARCH_AVAILABLE_TODAY = [
  "Ecosystem vision and product direction",
  "Research topics catalog (read-only)",
  "Topic exploration entry (this page)",
  "Public research intelligence positioning",
  "Link to university profiles in Public Intelligence",
] as const;

export const RESEARCH_NOT_AVAILABLE_YET = [
  "Researcher accounts",
  "Collaboration workspace",
  "AI Notebook",
  "Live scientific databases",
  "Evidence discussions",
] as const;

export const RESEARCH_UNIVERSITIES_LINK = "/universities";
