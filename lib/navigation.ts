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

/**
 * Navigation simplification (Global Language Foundation + Premium Interface mission, Phase 15).
 * One global navigation source, structured to match the approved information architecture:
 * Home / My Work / Search (flat, no group header) → Explore (Countries/Companies/Universities/
 * Research/Evidence) → Reports / Trust / Settings (flat). `secondaryNavSections` below holds the
 * real, working Ecosystems (Government/Investor/Citizen) and advanced Intelligence
 * (Dashboard/Reasoning/Knowledge Graph/Governance) modules — still real routes, still one click
 * away (Sidebar renders them in a collapsed "More" disclosure), just no longer competing with the
 * 7 primary items for attention. Nothing was deleted or made unreachable.
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
      {
        label: "Search",
        href: "/search",
        icon: "search",
        description: "Search countries, companies, and universities.",
      },
    ],
  },
  {
    title: "Explore",
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
        href: "/knowledge",
        icon: "knowledge",
        description: "Official source status across profiles.",
      },
    ],
  },
  {
    title: "",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: "analytics",
        description: "Report readiness and saved reports from real project work.",
      },
      {
        label: "Trust",
        href: "/trust",
        icon: "trust",
        description: "Constitution, methodology, evidence policy, and version history.",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: "settings",
        description: "Assistant, accessibility, and account preferences.",
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

/**
 * Real, working modules kept out of the primary 7-item list so they don't clutter it — every
 * route here is unchanged and fully functional; this only affects where it's discoverable from.
 */
export const secondaryNavSections: NavSection[] = [
  {
    title: "Intelligence Lenses",
    items: [
      {
        label: "Government",
        href: "/government",
        icon: "government",
        description: "Governance evidence lens — one system, not a separate portal.",
      },
      {
        label: "Investor",
        href: "/investor",
        icon: "investor",
        description: "Economic evidence lens — one system, not a separate portal.",
      },
      {
        label: "Citizen",
        href: "/citizen",
        icon: "citizen",
        description: "Public information lens — one system, not a separate portal.",
      },
    ],
  },
  {
    title: "Intelligence",
    items: [
      {
        label: "Mission Center",
        href: "/",
        icon: "home",
        description: "Current mission and operating state — replaces legacy dashboard.",
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
        href: "/governance",
        icon: "ai-control",
        description: "Platform rules, standards, and review process.",
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

/** Flat navigation list for module grids and legacy consumers — primary + secondary combined, so
 * `/core`'s full route grid still shows every real module even though Sidebar only renders
 * `primaryNavSections` prominently. */
export const mainNav: NavItem[] = [...primaryNavSections, ...secondaryNavSections].flatMap(
  (section) => section.items,
);

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
