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
    title: "Overview",
    items: [
      {
        label: "Platform Home",
        href: "/",
        icon: "home",
        description: "Platform entry point and module directory.",
      },
      {
        label: "Runtime Dashboard",
        href: "/dashboard",
        icon: "dashboard",
        description: "Live runtime health, queue, scheduler, and agent state.",
      },
    ],
  },
  {
    title: "Intelligence",
    items: [
      {
        label: "CBAI Core",
        href: "/core",
        icon: "core",
        description: "Central intelligence engine command center.",
      },
      {
        label: "Reasoning Explorer",
        href: "/reasoning",
        icon: "reasoning",
        description: "Evidence-to-judgment pipeline architecture — no hidden AI.",
      },
      {
        label: "Governance Control",
        href: "/ai-control",
        icon: "ai-control",
        description: "Constitutional rules, standards, and compliance status.",
      },
    ],
  },
  {
    title: "Entities",
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
    ],
  },
  {
    title: "Discovery",
    items: [
      {
        label: "Global Search",
        href: "/search",
        icon: "search",
        description: "Search countries, companies, and universities.",
      },
      {
        label: "Knowledge Graph",
        href: "/graph",
        icon: "graph",
        description: "Evidence relationship navigation across platform entities.",
      },
      {
        label: "Evidence Explorer",
        href: "/knowledge",
        icon: "knowledge",
        description: "Platform evidence architecture, source status, and coverage gaps.",
      },
    ],
  },
  {
    title: "Intelligence Workspaces",
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
    title: "Operations",
    items: [
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
      {
        label: "Reports Center",
        href: "/analytics",
        icon: "analytics",
        description: "Evidence-based report readiness — not fake analytics.",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: "settings",
        description: "Organization and platform configuration (coming soon).",
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
