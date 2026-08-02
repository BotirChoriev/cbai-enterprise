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
 * Canonical Intelligence OS IA (final-product-finish DD-FPF-001):
 * CORE → INTELLIGENCE → OPERATIONS → OVERSIGHT → SYSTEM.
 * Advanced collaboration and specialist extras stay in progressive disclosure.
 */
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
        description: "Missions, projects, operational objects, drafts, and next steps.",
      },
      {
        label: "Problem Space",
        href: "/problems",
        icon: "core",
        description: "Evidence, unknowns, contradictions, scenarios, human decisions, and monitoring.",
      },
      {
        label: "Search",
        href: "/search",
        icon: "search",
        description: "Direct retrieval across known countries, companies, universities, and work.",
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
        description: "Country intelligence cockpits with evidence availability.",
      },
      {
        label: "Companies",
        href: "/companies",
        icon: "companies",
        description: "Company profiles and official information.",
      },
      {
        label: "Universities",
        href: "/universities",
        icon: "universities",
        description: "University profiles and official information.",
      },
      {
        label: "Research",
        href: "/research",
        icon: "research",
        description: "Expert research catalog, topics, and evidence framing.",
      },
      {
        label: "Evidence",
        href: "/evidence",
        icon: "knowledge",
        description: "Source status, provenance, and human evidence review.",
      },
      {
        label: "Knowledge Graph",
        href: "/graph",
        icon: "graph",
        description: "Verified relationships between platform entities.",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Live Rooms",
        href: "/rooms",
        icon: "agents",
        description: "Live intelligence rooms — shared sessions with confirmation-gated actions.",
      },
      {
        label: "Reports",
        href: "/reports",
        icon: "analytics",
        description: "Report readiness from real project work — never fabricated cards.",
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
        description: "Platform rules, standards, review, and human oversight.",
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
        description: "Preferences, privacy defaults, and voice diagnostics.",
      },
      {
        label: "About",
        href: "/about",
        icon: "about",
        description: "CheckBalanceAI.Global platform identity and CBAI Intelligence OS.",
      },
    ],
  },
];

/** Progressive disclosure — advanced collaboration and specialist extras. */
export const secondaryNavSections: NavSection[] = [
  {
    title: "Advanced",
    items: [
      {
        label: "Global Activity",
        href: "/discover",
        icon: "analytics",
        description: "Guided exploration of opted-in public projects, research, groups, and media.",
      },
      {
        label: "Global Updates",
        href: "/notifications",
        icon: "analytics",
        description: "Country local time, verified source changes, and your watches.",
      },
      {
        label: "Research Workspace",
        href: "/research/workspace",
        icon: "research",
        description: "Structured research and evidence review.",
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
    // Institutional collaboration stays in progressive disclosure (DD-FPF-001);
    // account/authorization gated features are never promoted to primary nav.
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
];

export const mainNav: NavItem[] = [...primaryNavSections, ...secondaryNavSections].flatMap(
  (section) => section.items,
);

export const navigationCenterHrefs = ["/", "/my-work", "/search", "/governance"] as const;
export type NavigationCenterHref = (typeof navigationCenterHrefs)[number];

const workCenterRoutes = [
  "/my-work",
  "/problems",
  "/rooms",
  "/reports",
  "/workspace",
  "/scientific-documents",
  "/files",
  "/teams",
  "/messages",
  "/publications",
  "/investor",
  "/government",
];

const intelligenceCenterRoutes = [
  "/search",
  "/countries",
  "/companies",
  "/universities",
  "/research",
  "/evidence",
  "/graph",
  "/discover",
  "/notifications",
  "/reasoning",
  "/citizen",
];

const oversightCenterRoutes = ["/governance", "/trust", "/settings", "/about"];

function routeMatches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getNavigationCenterHref(pathname: string): NavigationCenterHref {
  if (workCenterRoutes.some((href) => routeMatches(pathname, href))) return "/my-work";
  if (oversightCenterRoutes.some((href) => routeMatches(pathname, href))) return "/governance";
  if (intelligenceCenterRoutes.some((href) => routeMatches(pathname, href))) return "/search";
  return "/";
}

export function isNavigationCenterHref(href: string): href is NavigationCenterHref {
  return navigationCenterHrefs.some((centerHref) => centerHref === href);
}

export const navigationCenterItems: NavItem[] = navigationCenterHrefs
  .map((href) => mainNav.find((item) => item.href === href))
  .filter((item): item is NavItem => Boolean(item));

/** Every non-center destination remains available behind progressive disclosure. */
export const navigationAdvancedSections: NavSection[] = [
  ...primaryNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !isNavigationCenterHref(item.href)),
    }))
    .filter((section) => section.items.length > 0),
  ...secondaryNavSections,
];

export function isContextualNavigationRoute(pathname: string): boolean {
  return !navigationCenterHrefs.some((href) => pathname === href);
}

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
