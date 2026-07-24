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

/** Primary + Intelligence + Operations — visible in sidebar without disclosure. */
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
        description: "Continue research, evidence reviews, and reports in progress.",
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
    title: "Intelligence",
    items: [
      {
        label: "Countries",
        href: "/countries",
        icon: "countries",
        description: "Country profiles — available information, gaps, and reports.",
      },
      {
        label: "Companies",
        href: "/companies",
        icon: "companies",
        description: "Company profiles with official information and reports.",
      },
      {
        label: "Universities",
        href: "/universities",
        icon: "universities",
        description: "University profiles with official information and reports.",
      },
      {
        label: "Research",
        href: "/research",
        icon: "research",
        description: "Explore scientific topics, labs, experiments, and evidence.",
      },
      {
        label: "Evidence",
        href: "/evidence",
        icon: "knowledge",
        description: "Official source status across profiles.",
      },
      {
        label: "Knowledge Graph",
        href: "/graph",
        icon: "graph",
        description: "Navigate verified relationships between platform entities.",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: "analytics",
        description: "Report readiness and saved reports from real project work.",
      },
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
    ],
  },
  {
    title: "Oversight",
    items: [
      {
        label: "Governance",
        href: "/governance",
        icon: "ai-control",
        description: "Platform rules, standards, and review process.",
      },
      {
        label: "Trust",
        href: "/trust",
        icon: "trust",
        description: "Constitution, methodology, evidence policy, and version history.",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: "settings",
        description: "Assistant, accessibility, voice diagnostics, and account preferences.",
      },
      {
        label: "About",
        href: "/about",
        icon: "about",
        description: "What CBAI is, why it exists, and the principles it holds itself to.",
      },
    ],
  },
];

/** Collaboration + Advanced — progressive disclosure in sidebar. */
export const secondaryNavSections: NavSection[] = [
  {
    title: "Collaboration",
    items: [
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
        label: "Live Rooms",
        href: "/rooms",
        icon: "agents",
        description: "Multilingual live intelligence sessions — meetings, labs, practice, collaboration.",
      },
      {
        label: "Messages",
        href: "/messages",
        icon: "reasoning",
        description: "Team conversations — account required.",
      },
      {
        label: "Notifications",
        href: "/notifications",
        icon: "analytics",
        description: "Activity notifications for your work.",
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
    title: "Advanced",
    items: [
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
      {
        label: "Research Workspace",
        href: "/research/workspace",
        icon: "research",
        description: "Structured research workspace for knowledge organization and evidence review.",
      },
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
