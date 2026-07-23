import type { UserModeCatalogEntry, UserModeId } from "@/lib/user-modes/types";

/**
 * Honest catalog: links only to existing product routes.
 * No fabricated live data — module suggestions are navigation hints only.
 */
export const USER_MODE_CATALOG: readonly UserModeCatalogEntry[] = [
  {
    id: "general",
    label: "General",
    description: "Balanced starting point across research, evidence, and my work.",
    defaultDashboardHref: "/",
    suggestedModules: ["My Work", "Research", "Evidence", "Search"],
  },
  {
    id: "senior_executive",
    label: "Senior executive",
    description: "Decision-oriented views — reports, trust status, and mission progress.",
    defaultDashboardHref: "/reports",
    suggestedModules: ["Reports", "Trust", "My Work", "Evidence"],
  },
  {
    id: "journalist",
    label: "Journalist",
    description: "Source status, evidence review, and searchable entity profiles.",
    defaultDashboardHref: "/knowledge",
    suggestedModules: ["Evidence", "Search", "Trust", "Research"],
  },
  {
    id: "investor",
    label: "Investor",
    description: "Company and country profiles with honest coverage gaps.",
    defaultDashboardHref: "/investor",
    suggestedModules: ["Investor", "Companies", "Countries", "Reports"],
  },
  {
    id: "business_owner",
    label: "Business owner",
    description: "Company landscape and mission work for operational questions.",
    defaultDashboardHref: "/companies",
    suggestedModules: ["Companies", "My Work", "Reports", "Evidence"],
  },
  {
    id: "academic",
    label: "Academic",
    description: "Research topics, canvas, and evidence review for scholarly work.",
    defaultDashboardHref: "/research",
    suggestedModules: ["Research", "Evidence", "Universities", "My Work"],
  },
  {
    id: "politician",
    label: "Politician / public official",
    description: "Country and governance surfaces with citizen-safe framing.",
    defaultDashboardHref: "/government",
    suggestedModules: ["Government", "Countries", "Trust", "Evidence"],
  },
  {
    id: "legal",
    label: "Legal",
    description: "Evidence provenance and trust review before claims.",
    defaultDashboardHref: "/knowledge",
    suggestedModules: ["Evidence", "Trust", "Reports", "My Work"],
  },
  {
    id: "economist",
    label: "Economist",
    description: "Country indicators and comparative research entry points.",
    defaultDashboardHref: "/countries",
    suggestedModules: ["Countries", "Investor", "Research", "Reports"],
  },
  {
    id: "student",
    label: "Student",
    description: "Learning path through research topics and guided my-work missions.",
    defaultDashboardHref: "/research",
    suggestedModules: ["Research", "My Work", "Universities", "Evidence"],
  },
] as const;

export const USER_MODE_IDS: readonly UserModeId[] = USER_MODE_CATALOG.map((entry) => entry.id);

export const DEFAULT_USER_MODE_ID: UserModeId = "general";

export function getUserModeCatalogEntry(modeId: UserModeId): UserModeCatalogEntry {
  const entry = USER_MODE_CATALOG.find((item) => item.id === modeId);
  if (!entry) {
    return USER_MODE_CATALOG[0];
  }
  return entry;
}

export function isUserModeId(value: unknown): value is UserModeId {
  return typeof value === "string" && (USER_MODE_IDS as readonly string[]).includes(value);
}
