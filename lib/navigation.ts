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
    title: "Start",
    items: [
      {
        label: "Home",
        href: "/",
        icon: "home",
        description: "Search and browse the platform.",
      },
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "dashboard",
        description: "What is available today and what you can do now.",
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
        description: "Country profiles — evidence, gaps, decision package, reports.",
      },
      {
        label: "Companies",
        href: "/companies",
        icon: "companies",
        description: "Company profiles from the local registry.",
      },
      {
        label: "Universities",
        href: "/universities",
        icon: "universities",
        description: "University profiles from the local registry.",
      },
      {
        label: "Evidence Explorer",
        href: "/knowledge",
        icon: "knowledge",
        description: "Platform-wide source and indicator coverage.",
      },
      {
        label: "Reports",
        href: "/analytics",
        icon: "analytics",
        description: "Available report types by entity scope.",
      },
      {
        label: "Reasoning",
        href: "/reasoning",
        icon: "reasoning",
        description: "Evidence-to-judgment pipeline architecture.",
      },
    ],
  },
  {
    title: "Workspaces",
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
    title: "Governance",
    items: [
      {
        label: "Governance",
        href: "/ai-control",
        icon: "ai-control",
        description: "Platform rules, standards, and compliance status.",
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
