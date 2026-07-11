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
    | "trust";
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

/**
 * The universal product IA: HOME, MY WORK, EXPLORE, ECOSYSTEMS, INTELLIGENCE, TRUST. Everything
 * else is contextual (workspace-local nav, tabs, /core's full route grid) rather than primary.
 */
export const primaryNavSections: NavSection[] = [
  {
    title: "",
    items: [
      {
        label: "Home",
        href: "/",
        icon: "home",
        description: "Official evidence intelligence for countries, companies, and universities.",
      },
      {
        label: "My Work",
        href: "/my-work",
        icon: "my-work",
        description: "Continue research, evidence reviews, and reports in progress.",
      },
    ],
  },
  {
    title: "Explore",
    items: [
      {
        label: "Search",
        href: "/search",
        icon: "search",
        description: "Search countries, companies, and universities.",
      },
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
        label: "Evidence",
        href: "/knowledge",
        icon: "knowledge",
        description: "Official source status across profiles.",
      },
      {
        label: "Research",
        href: "/research",
        icon: "research",
        description: "Explore scientific topics, labs, experiments, and evidence.",
      },
      {
        label: "Research Workspace",
        href: "/research/workspace",
        icon: "research",
        description: "Structured research workspace for knowledge organization and evidence review.",
      },
      {
        label: "Reports",
        href: "/analytics",
        icon: "analytics",
        description: "Available report types by profile scope.",
      },
    ],
  },
  {
    title: "Ecosystems",
    items: [
      {
        label: "Government",
        href: "/government",
        icon: "government",
        description: "Governance evidence coverage for public institutions.",
      },
      {
        label: "Investor",
        href: "/investor",
        icon: "investor",
        description: "Investment evidence readiness by domain.",
      },
      {
        label: "Citizen",
        href: "/citizen",
        icon: "citizen",
        description: "Public information topics in clear language.",
      },
    ],
  },
  {
    title: "Intelligence",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "dashboard",
        description: "What is available today and what you can do now.",
      },
      {
        label: "Reasoning",
        href: "/reasoning",
        icon: "reasoning",
        description: "How official information supports review before decisions.",
      },
      {
        label: "Knowledge Graph",
        href: "/graph",
        icon: "graph",
        description: "Navigate verified relationships between platform entities.",
      },
      {
        label: "Governance",
        href: "/ai-control",
        icon: "ai-control",
        description: "Platform rules, standards, and review process.",
      },
      {
        label: "Agents",
        href: "/agents",
        icon: "agents",
        description: "Agent capabilities defined on this platform.",
      },
    ],
  },
  {
    title: "",
    items: [
      {
        label: "Trust",
        href: "/trust",
        icon: "trust",
        description: "Constitution, methodology, evidence policy, and version history.",
      },
    ],
  },
];

/** Flat navigation list for module grids and legacy consumers. */
export const mainNav: NavItem[] = primaryNavSections.flatMap((section) => section.items);

/** Platform modules excluding the home route. */
export const platformModules: NavItem[] = mainNav.filter(
  (item) => item.href !== "/",
);

/** Public journey routes — hide internal context chrome. */
export const PUBLIC_JOURNEY_ROUTES = new Set([
  "/",
  "/search",
  "/countries",
  "/companies",
  "/universities",
  "/knowledge",
  "/research",
  "/research/workspace",
  "/analytics",
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
