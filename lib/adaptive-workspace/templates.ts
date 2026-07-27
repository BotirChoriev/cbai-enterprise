/**
 * Adaptive workspace template registry.
 *
 * Templates are starting structures mapped onto Operational Objects and projects.
 * They are not identity labels and every field remains editable after confirmation.
 */

import type { WorkspaceRole } from "@/lib/assistant/assistant-profile";
import type { OperationalObjectDomain, OperationalObjectType } from "@/lib/operational-objects/operational-object.types";

export type WorkspaceTemplateId =
  | "student"
  | "researcher_scientist"
  | "chemist_scientist"
  | "academic_educator"
  | "economist"
  | "government"
  | "investor_analyst"
  | "organization"
  | "general";

export type WorkspacePrivacy = "private" | "shared" | "public";

export type WorkspaceFieldId = string;

export type WorkspaceTemplateField = {
  readonly id: WorkspaceFieldId;
  readonly labelKey: string;
  readonly required: boolean;
  readonly inferredByDefault?: boolean;
};

export type WorkspaceTemplate = {
  readonly id: WorkspaceTemplateId;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly roles: readonly WorkspaceRole[];
  readonly operationalObjectType: OperationalObjectType;
  readonly domain: OperationalObjectDomain;
  readonly fields: readonly WorkspaceTemplateField[];
  readonly defaultPrivacy: WorkspacePrivacy;
  readonly nonAdvisoryDisclaimer?: boolean;
};

const TEMPLATES: readonly WorkspaceTemplate[] = [
  {
    id: "student",
    titleKey: "adaptiveWorkspace.templateStudent",
    descriptionKey: "adaptiveWorkspace.templateStudentDesc",
    roles: ["student"],
    operationalObjectType: "work_plan",
    domain: "research",
    defaultPrivacy: "private",
    fields: [
      { id: "learningObjective", labelKey: "adaptiveWorkspace.fieldLearningObjective", required: true },
      { id: "subject", labelKey: "adaptiveWorkspace.fieldSubject", required: true },
      { id: "assignmentOrQuestion", labelKey: "adaptiveWorkspace.fieldAssignment", required: true },
      { id: "readingList", labelKey: "adaptiveWorkspace.fieldReadingList", required: false },
      { id: "studyPlan", labelKey: "adaptiveWorkspace.fieldStudyPlan", required: false },
      { id: "deadlines", labelKey: "adaptiveWorkspace.fieldDeadlines", required: false },
      { id: "notes", labelKey: "adaptiveWorkspace.fieldNotes", required: false },
      { id: "mentorOrGroup", labelKey: "adaptiveWorkspace.fieldMentorGroup", required: false },
      { id: "finalOutput", labelKey: "adaptiveWorkspace.fieldFinalOutput", required: false },
    ],
  },
  {
    id: "researcher_scientist",
    titleKey: "adaptiveWorkspace.templateResearcher",
    descriptionKey: "adaptiveWorkspace.templateResearcherDesc",
    roles: ["researcher", "engineer", "research_center"],
    operationalObjectType: "research_question",
    domain: "research",
    defaultPrivacy: "private",
    fields: [
      { id: "researchQuestion", labelKey: "adaptiveWorkspace.fieldResearchQuestion", required: true },
      { id: "hypothesis", labelKey: "adaptiveWorkspace.fieldHypothesis", required: false },
      { id: "methodology", labelKey: "adaptiveWorkspace.fieldMethodology", required: false },
      { id: "evidenceAndSources", labelKey: "adaptiveWorkspace.fieldEvidenceSources", required: false },
      { id: "datasetOrExperiment", labelKey: "adaptiveWorkspace.fieldDataset", required: false },
      { id: "uncertainty", labelKey: "adaptiveWorkspace.fieldUncertainty", required: false },
      { id: "collaborators", labelKey: "adaptiveWorkspace.fieldCollaborators", required: false },
      { id: "reviewCheckpoints", labelKey: "adaptiveWorkspace.fieldReviewCheckpoints", required: false },
      { id: "publicationOutput", labelKey: "adaptiveWorkspace.fieldPublicationOutput", required: false },
    ],
  },
  {
    id: "chemist_scientist",
    titleKey: "adaptiveWorkspace.templateChemist",
    descriptionKey: "adaptiveWorkspace.templateChemistDesc",
    roles: ["researcher", "engineer"],
    operationalObjectType: "research_question",
    domain: "research",
    defaultPrivacy: "private",
    fields: [
      { id: "overview", labelKey: "adaptiveWorkspace.fieldOverview", required: true },
      { id: "researchQuestion", labelKey: "adaptiveWorkspace.fieldResearchQuestion", required: true },
      { id: "hypothesis", labelKey: "adaptiveWorkspace.fieldHypothesis", required: false },
      { id: "literatureSources", labelKey: "adaptiveWorkspace.fieldLiteratureSources", required: false },
      { id: "thesisLibrary", labelKey: "adaptiveWorkspace.fieldThesisLibrary", required: false },
      { id: "experimentsMethodology", labelKey: "adaptiveWorkspace.fieldExperimentsMethodology", required: false },
      { id: "materialsData", labelKey: "adaptiveWorkspace.fieldMaterialsData", required: false },
      { id: "evidenceMap", labelKey: "adaptiveWorkspace.fieldEvidenceMap", required: false },
      { id: "findings", labelKey: "adaptiveWorkspace.fieldFindings", required: false },
      { id: "openQuestions", labelKey: "adaptiveWorkspace.fieldOpenQuestions", required: false },
      { id: "risksSafety", labelKey: "adaptiveWorkspace.fieldRisksSafety", required: false },
      { id: "supervisorCollaborators", labelKey: "adaptiveWorkspace.fieldSupervisorCollaborators", required: false },
      { id: "tasksMilestones", labelKey: "adaptiveWorkspace.fieldTasksMilestones", required: false },
      { id: "reports", labelKey: "adaptiveWorkspace.fieldReports", required: false },
      { id: "provenanceAudit", labelKey: "adaptiveWorkspace.fieldProvenanceAudit", required: false },
    ],
  },
  {
    id: "academic_educator",
    titleKey: "adaptiveWorkspace.templateAcademic",
    descriptionKey: "adaptiveWorkspace.templateAcademicDesc",
    roles: ["academic", "professor", "university"],
    operationalObjectType: "work_plan",
    domain: "research",
    defaultPrivacy: "private",
    fields: [
      { id: "teachingObjective", labelKey: "adaptiveWorkspace.fieldTeachingObjective", required: true },
      { id: "courseOrTopic", labelKey: "adaptiveWorkspace.fieldCourseTopic", required: true },
      { id: "curriculum", labelKey: "adaptiveWorkspace.fieldCurriculum", required: false },
      { id: "audience", labelKey: "adaptiveWorkspace.fieldAudience", required: false },
      { id: "references", labelKey: "adaptiveWorkspace.fieldReferences", required: false },
      { id: "schedule", labelKey: "adaptiveWorkspace.fieldSchedule", required: false },
      { id: "assessment", labelKey: "adaptiveWorkspace.fieldAssessment", required: false },
      { id: "classOutput", labelKey: "adaptiveWorkspace.fieldClassOutput", required: false },
    ],
  },
  {
    id: "economist",
    titleKey: "adaptiveWorkspace.templateEconomist",
    descriptionKey: "adaptiveWorkspace.templateEconomistDesc",
    roles: ["economist"],
    operationalObjectType: "research_question",
    domain: "investor",
    defaultPrivacy: "private",
    fields: [
      { id: "questionAndGeography", labelKey: "adaptiveWorkspace.fieldQuestionGeography", required: true },
      { id: "indicatorSet", labelKey: "adaptiveWorkspace.fieldIndicatorSet", required: false, inferredByDefault: true },
      { id: "sourceInstitutions", labelKey: "adaptiveWorkspace.fieldSourceInstitutions", required: false, inferredByDefault: true },
      { id: "observationPeriods", labelKey: "adaptiveWorkspace.fieldObservationPeriods", required: false },
      { id: "methodology", labelKey: "adaptiveWorkspace.fieldMethodology", required: false },
      { id: "risks", labelKey: "adaptiveWorkspace.fieldRisks", required: false },
      { id: "scenarios", labelKey: "adaptiveWorkspace.fieldScenarios", required: false },
      { id: "evidenceUpdates", labelKey: "adaptiveWorkspace.fieldEvidenceUpdates", required: false },
      { id: "reportOutput", labelKey: "adaptiveWorkspace.fieldReportOutput", required: false },
    ],
  },
  {
    id: "government",
    titleKey: "adaptiveWorkspace.templateGovernment",
    descriptionKey: "adaptiveWorkspace.templateGovernmentDesc",
    roles: ["government", "administrator"],
    operationalObjectType: "decision_brief",
    domain: "governance",
    defaultPrivacy: "private",
    fields: [
      { id: "publicServiceQuestion", labelKey: "adaptiveWorkspace.fieldPublicServiceQuestion", required: true },
      { id: "jurisdiction", labelKey: "adaptiveWorkspace.fieldJurisdiction", required: true },
      { id: "policyContext", labelKey: "adaptiveWorkspace.fieldPolicyContext", required: false },
      { id: "officialSources", labelKey: "adaptiveWorkspace.fieldOfficialSources", required: false },
      { id: "stakeholders", labelKey: "adaptiveWorkspace.fieldStakeholders", required: false },
      { id: "legalReview", labelKey: "adaptiveWorkspace.fieldLegalReview", required: false },
      { id: "evidenceGaps", labelKey: "adaptiveWorkspace.fieldEvidenceGaps", required: false },
      { id: "humanDecisionOwner", labelKey: "adaptiveWorkspace.fieldHumanDecisionOwner", required: true },
      { id: "reportOutput", labelKey: "adaptiveWorkspace.fieldReportOutput", required: false },
    ],
  },
  {
    id: "investor_analyst",
    titleKey: "adaptiveWorkspace.templateInvestor",
    descriptionKey: "adaptiveWorkspace.templateInvestorDesc",
    roles: ["investor"],
    operationalObjectType: "decision_brief",
    domain: "investor",
    defaultPrivacy: "private",
    nonAdvisoryDisclaimer: true,
    fields: [
      { id: "analysisQuestion", labelKey: "adaptiveWorkspace.fieldAnalysisQuestion", required: true },
      { id: "entitySectorGeography", labelKey: "adaptiveWorkspace.fieldEntitySector", required: true },
      { id: "evidenceCoverage", labelKey: "adaptiveWorkspace.fieldEvidenceCoverage", required: false },
      { id: "officialSources", labelKey: "adaptiveWorkspace.fieldOfficialSources", required: false },
      { id: "riskIndicators", labelKey: "adaptiveWorkspace.fieldRiskIndicators", required: false },
      { id: "missingEvidence", labelKey: "adaptiveWorkspace.fieldMissingEvidence", required: false },
      { id: "scenarios", labelKey: "adaptiveWorkspace.fieldScenarios", required: false },
      { id: "disclaimer", labelKey: "adaptiveWorkspace.fieldNonAdvisory", required: true, inferredByDefault: true },
      { id: "reportOutput", labelKey: "adaptiveWorkspace.fieldReportOutput", required: false },
    ],
  },
  {
    id: "organization",
    titleKey: "adaptiveWorkspace.templateOrganization",
    descriptionKey: "adaptiveWorkspace.templateOrganizationDesc",
    roles: ["company", "university", "research_center"],
    operationalObjectType: "project",
    domain: "general",
    defaultPrivacy: "private",
    fields: [
      { id: "organizationGoal", labelKey: "adaptiveWorkspace.fieldOrganizationGoal", required: true },
      { id: "team", labelKey: "adaptiveWorkspace.fieldTeam", required: false },
      { id: "project", labelKey: "adaptiveWorkspace.fieldProject", required: true },
      { id: "responsibilities", labelKey: "adaptiveWorkspace.fieldResponsibilities", required: false },
      { id: "evidence", labelKey: "adaptiveWorkspace.fieldEvidence", required: false },
      { id: "milestones", labelKey: "adaptiveWorkspace.fieldMilestones", required: false },
      { id: "meetings", labelKey: "adaptiveWorkspace.fieldMeetings", required: false },
      { id: "decisions", labelKey: "adaptiveWorkspace.fieldDecisions", required: false },
      { id: "deliverables", labelKey: "adaptiveWorkspace.fieldDeliverables", required: false },
    ],
  },
  {
    id: "general",
    titleKey: "adaptiveWorkspace.templateGeneral",
    descriptionKey: "adaptiveWorkspace.templateGeneralDesc",
    roles: ["citizen", "legal", "social_sector"],
    operationalObjectType: "work_plan",
    domain: "general",
    defaultPrivacy: "private",
    fields: [
      { id: "goal", labelKey: "adaptiveWorkspace.fieldGoal", required: true },
      { id: "context", labelKey: "adaptiveWorkspace.fieldContext", required: false },
      { id: "tasks", labelKey: "adaptiveWorkspace.fieldTasks", required: false },
      { id: "evidence", labelKey: "adaptiveWorkspace.fieldEvidence", required: false },
      { id: "people", labelKey: "adaptiveWorkspace.fieldPeople", required: false },
      { id: "dates", labelKey: "adaptiveWorkspace.fieldDates", required: false },
      { id: "nextAction", labelKey: "adaptiveWorkspace.fieldNextAction", required: true },
      { id: "output", labelKey: "adaptiveWorkspace.fieldOutput", required: false },
    ],
  },
];

export function listWorkspaceTemplates(): readonly WorkspaceTemplate[] {
  return TEMPLATES;
}

export function getWorkspaceTemplate(id: WorkspaceTemplateId): WorkspaceTemplate {
  const found = TEMPLATES.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown workspace template: ${id}`);
  return found;
}

export function templateForRole(role: WorkspaceRole): WorkspaceTemplate {
  return TEMPLATES.find((item) => item.roles.includes(role)) ?? getWorkspaceTemplate("general");
}

export type DetectedRoleIntent = {
  readonly role: WorkspaceRole;
  readonly templateId: WorkspaceTemplateId;
  readonly confidence: "explicit" | "likely" | "unsure";
  readonly missingFollowUps: readonly string[];
};

const ROLE_PATTERNS: readonly { role: WorkspaceRole; pattern: RegExp; templateId?: WorkspaceTemplateId }[] = [
  {
    role: "researcher",
    pattern:
      /\b(chemist|research\s*chemist|laboratory\s*scientist|phd\s*researcher|kimyogar(?:man)?|kimyager(?:im)?|химик|лабораторн)\b/i,
    templateId: "chemist_scientist",
  },
  { role: "student", pattern: /\b(student|o['‘`]?quvchi|talaba|ученик|студент|öğrenci)\b/i },
  { role: "researcher", pattern: /\b(researcher|scientist|tadqiqotchi|olim|исследователь|учёный|araştırmacı|bilim\s*insanı)\b/i },
  { role: "academic", pattern: /\b(academic|professor|educator|teacher|o['‘`]?qituvchi|professor|академик|преподаватель|akademisyen|öğretmen)\b/i },
  { role: "economist", pattern: /\b(economist|iqtisodchi(?:man)?|экономист|ekonomist)\b/i },
  { role: "government", pattern: /\b(government|public\s*admin|davlat|hukumat|правительств|государств|kamu|devlet)\b/i },
  { role: "investor", pattern: /\b(investor|analyst|tahlilchi|инвестор|аналитик|yatırımcı|analist)\b/i },
  { role: "company", pattern: /\b(organization|organisation|company|tashkilot|организация|компания|kuruluş|şirket)\b/i },
];

/**
 * Detect a possible role from explicit user text only.
 * Never persists — callers must show interpretation and require confirmation.
 */
export function detectRoleIntent(text: string): DetectedRoleIntent {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      role: "citizen",
      templateId: "general",
      confidence: "unsure",
      missingFollowUps: ["goal", "domain", "privacy"],
    };
  }
  for (const entry of ROLE_PATTERNS) {
    if (entry.pattern.test(trimmed)) {
      const templateId = entry.templateId ?? templateForRole(entry.role).id;
      const missing: string[] = [];
      if (templateId === "chemist_scientist") {
        if (!/\b(field|soha|fan|област|alan|organic|inorganic|physical|analytical)/i.test(trimmed)) {
          missing.push("field");
        }
        if (!/\b(thesis|dissert|loyih|project|title|mavzu|тема)/i.test(trimmed)) {
          missing.push("project");
        }
        if (!/\b(objective|maqsad|цель|hedef|hypothesis|gipoteza)/i.test(trimmed)) {
          missing.push("objective");
        }
        if (!/\b(experimental|theoretical|review|eksperiment|nazariy|обзор)/i.test(trimmed)) {
          missing.push("researchType");
        }
        if (!/\b(stage|bosqich|этап|aşama)/i.test(trimmed)) {
          missing.push("stage");
        }
        missing.push("files", "language", "privacy");
      } else {
        if (!/\b(about|bo['‘`]?yicha|по|hakkında|inflat|tadqiqot|research|project|loyih)/i.test(trimmed)) {
          missing.push("goal");
        }
        if (!/\b(subject|field|soha|fan|област|alan|country|davlat|mamlakat|strana|ülke)/i.test(trimmed)) {
          missing.push("domain");
        }
        if (missing.length < 3) missing.push("privacy");
      }
      return {
        role: entry.role,
        templateId,
        confidence: "explicit",
        missingFollowUps: missing.slice(0, 4),
      };
    }
  }
  return {
    role: "citizen",
    templateId: "general",
    confidence: "unsure",
    missingFollowUps: ["role", "goal", "privacy"],
  };
}
