export type NavItem = {
  label: string;
  href: string;
  description: string;
  icon:
    | "home"
    | "my-work"
    | "dashboard"
    | "core"
    | "countries"
    | "companies"
    | "universities"
    | "search"
    | "graph"
    | "reasoning"
    | "ai-control"
    | "agents"
    | "knowledge"
    | "research"
    | "workflows"
    | "analytics"
    | "settings"
    | "government"
    | "investor"
    | "citizen"
    | "trust"
    | "about";
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

/** Seven canonical destinations — everything else is progressive disclosure. */
export const primaryNavSections: NavSection[] = [
  {
    title: "",
    items: [
      {
        label: "Home",
        href: "/",
        icon: "home",
        description: "Spatial intelligence command surface — globe, mission, and active work.",
      },
      {
        label: "My Work",
        href: "/my-work",
        icon: "my-work",
        description: "Adaptive personal workspace, drafts, and confirmed work.",
      },
      {
        label: "Search",
        href: "/search",
        icon: "search",
        description: "Search countries, companies, and universities.",
      },
    ],
  },
  {
    title: "Discover",
    items: [
      {
        label: "Global Activity",
        href: "/discover",
        icon: "analytics",
        description: "Opted-in public projects, research, groups, and media.",
      },
      {
        label: "World Intelligence",
        href: "/countries",
        icon: "countries",
        description: "Countries, companies, and universities in one evidence-led entity system.",
      },
    ],
  },
  {
    title: "Create",
    items: [
      {
        label: "Research & Evidence",
        href: "/research",
        icon: "research",
        description: "Research questions, source material, evidence review, and knowledge relationships.",
      },
      {
        label: "Reports",
        href: "/reports",
        icon: "knowledge",
        description: "Report readiness and saved reports from real project work.",
      },
    ],
  },
];

/** Entity drill-downs, role lenses, collaboration, and system controls. */
export const secondaryNavSections: NavSection[] = [
  {
    title: "World Intelligence",
    items: [
      { label: "Countries", href: "/countries", icon: "countries", description: "Country intelligence cockpits." },
      { label: "Companies", href: "/companies", icon: "companies", description: "Company profiles and official information." },
      { label: "Universities", href: "/universities", icon: "universities", description: "University profiles and official information." },
      {
        label: "Global Updates",
        href: "/notifications",
        icon: "analytics",
        description: "Country local time, verified source changes, and your watches.",
      },
    ],
  },
  {
    title: "Research & Evidence",
    items: [
      { label: "Evidence", href: "/evidence", icon: "knowledge", description: "Source status and human evidence review." },
      { label: "Knowledge Graph", href: "/graph", icon: "graph", description: "Verified relationships between platform entities." },
      { label: "Research Workspace", href: "/research/workspace", icon: "research", description: "Structured research and evidence review." },
    ],
  },
  {
    title: "Collaborate",
    items: [
      {
        label: "Live Rooms",
        href: "/rooms",
        icon: "agents",
        description: "Live intelligence rooms — shared sessions with confirmation-gated actions.",
      },
      {
        label: "Workspace",
        href: "/workspace",
        icon: "my-work",
        description: "Personal cabinet — private projects, files, and continuation.",
      },
      {
        label: "Scientific Documents",
        href: "/scientific-documents",
        icon: "research",
        description: "Signed-in scientific document intake — confirmation-gated.",
      },
      {
        label: "Files",
        href: "/files",
        icon: "dashboard",
        description: "Personal files — private by default.",
      },
      {
        label: "Teams",
        href: "/teams",
        icon: "citizen",
        description: "Team preparation — invitations require authorization.",
      },
      {
        label: "Messages",
        href: "/messages",
        icon: "reasoning",
        description: "Team conversations — account required.",
      },
      {
        label: "Publications",
        href: "/publications",
        icon: "knowledge",
        description: "Publication preparation — explicit confirmation and rights.",
      },
    ],
  },
  {
    title: "Specialist Workspaces",
    items: [
      {
        label: "Investor",
        href: "/investor",
        icon: "investor",
        description: "Economic evidence lens — non-advisory due diligence workspace.",
      },
      {
        label: "Government",
        href: "/government",
        icon: "government",
        description: "Public-administration evidence workspace — human-controlled research.",
      },
      {
        label: "Citizen",
        href: "/citizen",
        icon: "citizen",
        description: "Public information lens — one system, not a separate portal.",
      },
      {
        label: "Reasoning",
        href: "/reasoning",
        icon: "reasoning",
        description: "How official information supports review before decisions.",
      },
    ],
  },
  {
    title: "Trust",
    items: [
      { label: "Governance", href: "/governance", icon: "ai-control", description: "Platform rules, standards, review, and human oversight." },
      { label: "Trust", href: "/trust", icon: "trust", description: "Constitution, methodology, evidence policy, and version history." },
      { label: "Privacy", href: "/settings", icon: "settings", description: "Privacy defaults, voice diagnostics, and account preferences." },
      { label: "About", href: "/about", icon: "about", description: "CheckBalanceAI.Global platform identity and CBAI Intelligence OS." },
    ],
  },
];

export const mainNav: NavItem[] = [...primaryNavSections, ...secondaryNavSections].flatMap(
  (section) => section.items,
);

export const platformModules: NavItem[] = mainNav.filter(
  (item) => item.href !== "/",
);

export const PUBLIC_JOURNEY_ROUTES = new Set([
  "/",
  "/search",
  "/countries",
  "/companies",
  "/universities",
  "/knowledge",
  "/research",
  "/research/workspace",
  "/reports",
  "/analytics",
  "/governance",
  "/ai-control",
  "/dashboard",
]);

export function isPublicJourneyRoute(pathname: string): boolean {
  if (PUBLIC_JOURNEY_ROUTES.has(pathname)) {
    return true;
  }
  if (pathname.startsWith("/research/")) {
    return true;
  }
  return false;
}
