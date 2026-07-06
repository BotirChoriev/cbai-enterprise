export type NavItem = {
  label: string;
  href: string;
  description: string;
  icon:
    | "home"
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
    | "workflows"
    | "analytics"
    | "settings"
    | "government"
    | "investor"
    | "citizen";
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const platformNavSections: NavSection[] = [
  {
    title: "Platform",
    items: [
      {
        label: "Home",
        href: "/",
        icon: "home",
        description: "Platform entry point and module directory.",
      },
      {
        label: "Search",
        href: "/search",
        icon: "search",
        description: "Search countries, companies, and universities.",
      },
      {
        label: "Evidence Explorer",
        href: "/knowledge",
        icon: "knowledge",
        description: "Platform evidence architecture, source status, and coverage gaps.",
      },
      {
        label: "Reports",
        href: "/analytics",
        icon: "analytics",
        description: "Evidence-based report readiness — not fake analytics.",
      },
      {
        label: "Reasoning",
        href: "/reasoning",
        icon: "reasoning",
        description: "Evidence-to-judgment pipeline architecture — no hidden AI.",
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
        description: "Country intelligence profiles and relationships.",
      },
      {
        label: "Companies",
        href: "/companies",
        icon: "companies",
        description: "Company intelligence profiles and market links.",
      },
      {
        label: "Universities",
        href: "/universities",
        icon: "universities",
        description: "Evidence-based university profiles from the local registry.",
      },
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
        description: "Investment evidence readiness — no recommendations.",
      },
      {
        label: "Citizen",
        href: "/citizen",
        icon: "citizen",
        description: "Public information topics in clear, honest language.",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Governance",
        href: "/ai-control",
        icon: "ai-control",
        description: "Constitutional rules, standards, and compliance status.",
      },
      {
        label: "System Monitor",
        href: "/dashboard",
        icon: "dashboard",
        description: "Runtime observability from local intelligence harness — static export.",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: "settings",
        description: "Organization and platform configuration (coming soon).",
      },
    ],
  },
  {
    title: "Extended",
    items: [
      {
        label: "CBAI Core",
        href: "/core",
        icon: "core",
        description: "Extended route — pipeline shell only, not live inference.",
      },
      {
        label: "Knowledge Graph",
        href: "/graph",
        icon: "graph",
        description: "Evidence relationship navigation across platform entities.",
      },
      {
        label: "AI Agents",
        href: "/agents",
        icon: "agents",
        description: "Agent catalog, deployment status, and activity.",
      },
      {
        label: "Workflows",
        href: "/workflows",
        icon: "workflows",
        description: "Workflow automation builder (coming soon).",
      },
    ],
  },
];

/** Flat navigation list for module grids and legacy consumers. */
export const mainNav: NavItem[] = platformNavSections.flatMap(
  (section) => section.items,
);

/** Platform modules excluding the home route. */
export const platformModules: NavItem[] = mainNav.filter(
  (item) => item.href !== "/",
);
