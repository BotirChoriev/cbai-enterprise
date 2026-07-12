/**
 * Role / Work-Context cards (Global Language Foundation + Multilingual Voice Commands mission,
 * Phase 11). Presentation-layer configuration only — selecting a card never creates a separate
 * data model. It sets `AssistantProfile.workspaceRole` (already real, already persisted) and
 * links to the existing Project Engine (`/my-work?projectType=...`, reusing `CreateProjectForm`
 * exactly like the Government/Investor/Citizen "Start a [Role] Project" entry points already do)
 * or an existing real workspace route. Every `primaryProjectType` here is a real, pre-existing
 * `ProjectTypeId` — no new project type was invented for this mission.
 *
 * Card text (title/description/firstAction) is real, translated content — see the `roles`
 * namespace in lib/i18n/dictionaries/*.ts — never hardcoded English-only strings.
 */

import type { WorkspaceRole } from "@/lib/assistant/assistant-profile";
import type { ProjectTypeId } from "@/lib/project/project-types";

export type RoleWorkContextId =
  | "scientistAcademic"
  | "professorResearcher"
  | "student"
  | "engineer"
  | "laboratorySpecialist"
  | "governmentLeader"
  | "economist"
  | "investorBusiness"
  | "legalProfessional"
  | "socialSector"
  | "generalUser";

export type RoleWorkContext = {
  id: RoleWorkContextId;
  workspaceRole: WorkspaceRole;
  primaryProjectType: ProjectTypeId;
  /** Where "first useful action" actually navigates — either the Project Engine pre-filled with
   * the right type, or a real, already-working workspace route. */
  firstActionHref: string;
};

export const ROLE_WORK_CONTEXTS: readonly RoleWorkContext[] = [
  { id: "scientistAcademic", workspaceRole: "academic", primaryProjectType: "research_project", firstActionHref: "/my-work?projectType=research_project" },
  { id: "professorResearcher", workspaceRole: "professor", primaryProjectType: "research_project", firstActionHref: "/research/workspace" },
  { id: "student", workspaceRole: "student", primaryProjectType: "research_project", firstActionHref: "/research" },
  { id: "engineer", workspaceRole: "engineer", primaryProjectType: "technology_assessment", firstActionHref: "/my-work?projectType=technology_assessment" },
  { id: "laboratorySpecialist", workspaceRole: "research_center", primaryProjectType: "evidence_review", firstActionHref: "/my-work?projectType=evidence_review" },
  { id: "governmentLeader", workspaceRole: "government", primaryProjectType: "policy_analysis", firstActionHref: "/my-work?projectType=policy_analysis" },
  { id: "economist", workspaceRole: "economist", primaryProjectType: "investment_analysis", firstActionHref: "/my-work?projectType=investment_analysis" },
  { id: "investorBusiness", workspaceRole: "investor", primaryProjectType: "investment_analysis", firstActionHref: "/my-work?projectType=investment_analysis" },
  { id: "legalProfessional", workspaceRole: "legal", primaryProjectType: "evidence_review", firstActionHref: "/my-work?projectType=evidence_review" },
  { id: "socialSector", workspaceRole: "social_sector", primaryProjectType: "evidence_review", firstActionHref: "/citizen" },
  { id: "generalUser", workspaceRole: "citizen", primaryProjectType: "evidence_review", firstActionHref: "/search" },
];
