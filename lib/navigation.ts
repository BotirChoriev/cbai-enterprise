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

/** Public investor-facing navigation — production journey only. */
export const platformNavSections: NavSection[] = [
  {
    title: "Platform",
    items: [
      {
        label: "Home",
        href: "/",
        icon: "home",
        description: "Official evidence intelligence for countries, companies, and universities.",
      },
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
        label: "Reports",
        href: "/analytics",
        icon: "analytics",
        description: "Available report types by profile scope.",
      },
    ],
  },
];

/** Internal routes — not shown in public sidebar. */
export const internalNavSections: NavSection[] = [
  {
    title: "Internal",
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
      {
        label: "Governance",
        href: "/ai-control",
        icon: "ai-control",
        description: "Platform rules, standards, and review process.",
      },
    ],
  },
];

/** Flat navigation list for module grids and legacy consumers. */
export const mainNav: NavItem[] = [
  ...platformNavSections.flatMap((section) => section.items),
  ...internalNavSections.flatMap((section) => section.items),
];

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
  "/analytics",
  "/dashboard",
]);

export function isPublicJourneyRoute(pathname: string): boolean {
  return PUBLIC_JOURNEY_ROUTES.has(pathname);
}
