import type { WorkspaceRole } from "@/lib/assistant/assistant-profile";
import { PLATFORM_MODULES } from "@/lib/context";
import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";

export type RoleDestination = {
  /** Key inside dictionary.home — every destination label is real, translated copy. */
  labelKey: keyof Pick<
    TranslationDictionary["home"],
    | "destOpenMyWork"
    | "destSearchIntelligence"
    | "destExploreCountries"
    | "destReviewEvidence"
    | "destExploreResearch"
    | "destExploreCompanies"
    | "destExploreUniversities"
    | "destResearchWorkspace"
    | "destReviewStandards"
    | "destInvestorWorkspace"
    | "destReviewInstitutions"
    | "destGovernmentWorkspace"
    | "destOpenReports"
    | "destOpenDashboard"
    | "destOpenTrust"
    | "destCitizenWorkspace"
  >;
  href: string;
};

const MY_WORK: RoleDestination = { labelKey: "destOpenMyWork", href: "/my-work" };
const EVIDENCE: RoleDestination = { labelKey: "destReviewEvidence", href: "/knowledge" };
const COUNTRIES: RoleDestination = { labelKey: "destExploreCountries", href: "/countries" };
const RESEARCH: RoleDestination = { labelKey: "destExploreResearch", href: "/research" };

/**
 * Role-adaptive quick destinations for the homepage command surface (BUILD-009 Phase 5/6) — the
 * same four-slot shape for every role so the layout never jumps, but the real routes and labels
 * change to match what that professional lens actually needs first. Every href is a real,
 * pre-existing route (no new pages); every "4th slot" still ends on Open My Work or the role's own
 * workspace so "continue real work" is never demoted below role-specific browsing. Neutral/signed-
 * out visitors never see this — HomeAssistantGreeting keeps its own fixed, honest default set for
 * that case, matching Phase 6's "clear neutral/default mode" requirement.
 */
export const ROLE_DESTINATIONS: Record<WorkspaceRole, readonly RoleDestination[]> = {
  citizen: [
    { labelKey: "destSearchIntelligence", href: "/search" },
    COUNTRIES,
    EVIDENCE,
    MY_WORK,
  ],
  student: [
    RESEARCH,
    COUNTRIES,
    EVIDENCE,
    MY_WORK,
  ],
  researcher: [
    { labelKey: "destResearchWorkspace", href: "/research/workspace" },
    RESEARCH,
    EVIDENCE,
    MY_WORK,
  ],
  professor: [
    RESEARCH,
    { labelKey: "destExploreUniversities", href: "/universities" },
    EVIDENCE,
    MY_WORK,
  ],
  academic: [
    RESEARCH,
    { labelKey: "destExploreUniversities", href: "/universities" },
    EVIDENCE,
    MY_WORK,
  ],
  engineer: [
    RESEARCH,
    { labelKey: "destReviewStandards", href: "/trust" },
    EVIDENCE,
    MY_WORK,
  ],
  investor: [
    { labelKey: "destExploreCompanies", href: "/companies" },
    COUNTRIES,
    { labelKey: "destInvestorWorkspace", href: "/investor" },
    MY_WORK,
  ],
  company: [
    { labelKey: "destExploreCompanies", href: "/companies" },
    COUNTRIES,
    EVIDENCE,
    MY_WORK,
  ],
  university: [
    { labelKey: "destExploreUniversities", href: "/universities" },
    RESEARCH,
    EVIDENCE,
    MY_WORK,
  ],
  research_center: [
    RESEARCH,
    { labelKey: "destResearchWorkspace", href: "/research/workspace" },
    EVIDENCE,
    MY_WORK,
  ],
  government: [
    COUNTRIES,
    { labelKey: "destReviewInstitutions", href: "/ai-control" },
    { labelKey: "destGovernmentWorkspace", href: "/government" },
    { labelKey: "destOpenReports", href: PLATFORM_MODULES.reports.path },
  ],
  administrator: [
    { labelKey: "destOpenDashboard", href: "/dashboard" },
    EVIDENCE,
    { labelKey: "destOpenTrust", href: "/trust" },
    MY_WORK,
  ],
  economist: [
    COUNTRIES,
    { labelKey: "destExploreCompanies", href: "/companies" },
    { labelKey: "destInvestorWorkspace", href: "/investor" },
    MY_WORK,
  ],
  legal: [
    EVIDENCE,
    { labelKey: "destOpenTrust", href: "/trust" },
    COUNTRIES,
    MY_WORK,
  ],
  social_sector: [
    { labelKey: "destCitizenWorkspace", href: "/citizen" },
    EVIDENCE,
    COUNTRIES,
    MY_WORK,
  ],
};

export function resolveRoleDestinations(role: WorkspaceRole): readonly RoleDestination[] {
  return ROLE_DESTINATIONS[role];
}
