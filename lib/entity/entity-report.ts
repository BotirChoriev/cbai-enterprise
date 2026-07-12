/**
 * Universal Entity Engine — report facade (Platform Core mission).
 *
 * "Any entity can generate a report using the same engine" — this is a dispatch facade, not a
 * new report system. For Country/Company/University it returns the exact same, already-real,
 * already-tested report objects `buildCountryReport`/`buildCompanyReport`/`buildUniversityReport`
 * produce (byte-identical output, safe to swap into existing "Generate report" buttons). For
 * Research topics — which never had a report — it compiles a minimal, honest one from the same
 * real data `ResearchIntelligenceOverview.tsx` already renders (`buildResearchMission`), never
 * inventing a methodology list or evidence total that doesn't exist for research topics today.
 */

import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { getCountryRelationships } from "@/lib/countries.adapter";
import { getCompanyLinkedEntities } from "@/lib/companies.adapter";
import { getUniversityRelationships } from "@/lib/universities.adapter";
import { buildCountryUserJourney } from "@/lib/country-user-journey";
import { buildCompanyUserJourney } from "@/lib/company-user-journey";
import { buildUniversityUserJourney } from "@/lib/university-user-journey";
import { buildCountryReport, type CountryReport } from "@/lib/country-report";
import { buildCompanyReport, type CompanyReport } from "@/lib/company-report";
import { buildUniversityReport, type UniversityReport } from "@/lib/university-report";
import { buildResearchMission } from "@/lib/research-mission/research-mission-builder";
import { getResearchTopicById } from "@/lib/research/research-topics";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import type { EntityRelationship } from "@/lib/entity/entity.types";
import type { Evidence } from "@/lib/foundation/foundation-model";
import { resolveEntityDataStatus } from "@/components/shared/entity-profile-copy";
import type { ProductStatus } from "@/lib/product-status";
import { loadResearchNotes, type PersistedResearchNote } from "@/lib/research/research-workspace-store";
import type { Project } from "@/lib/project/project-types";
import { getProjectTypeLabel } from "@/lib/project/project-types";
import {
  loadProject,
  loadProjectNotes,
  loadProjectTasks,
  loadProjectQuestions,
  loadProjectEvidence,
} from "@/lib/project/project-store";
import type { ProjectNote, ProjectTask, ProjectQuestion, ProjectEvidenceReference } from "@/lib/project/project-types";

export type ResearchTopicReport = {
  topicId: string;
  topicName: string;
  domain: string;
  description: string;
  /** The real research question, from the Research Mission's own mission center. */
  question: string;
  evidenceConnectedCount: number;
  supportingEvidence: readonly Evidence[];
  counterEvidence: readonly Evidence[];
  /** Real, persisted user notes for this topic — empty until the user writes one. */
  notes: readonly PersistedResearchNote[];
  relationships: EntityRelationship[];
  trustStatement: string;
  limitations: string[];
};

export type ProjectTimelineEntry = {
  id: string;
  description: string;
  at: string;
};

export type ProjectReport = {
  projectId: string;
  title: string;
  typeLabel: string;
  description: string;
  researchQuestion: string | null;
  objectives: string | null;
  notes: readonly ProjectNote[];
  tasks: readonly ProjectTask[];
  openQuestions: readonly ProjectQuestion[];
  evidence: readonly ProjectEvidenceReference[];
  relationships: EntityRelationship[];
  timeline: readonly ProjectTimelineEntry[];
  trustStatement: string;
  limitations: string[];
};

export type EntityReport =
  | ({ entityType: "country"; dataStatus: ProductStatus } & CountryReport)
  | ({ entityType: "company"; dataStatus: ProductStatus } & CompanyReport)
  | ({ entityType: "university"; dataStatus: ProductStatus } & UniversityReport)
  | ({ entityType: "research_topic"; dataStatus: ProductStatus } & ResearchTopicReport)
  | ({ entityType: "project"; dataStatus: ProductStatus } & ProjectReport);

const PROJECT_TRUST_STATEMENT =
  "CBAI provides evidence-based project intelligence. Every entity link, note, and evidence reference in this report was added by the user — never inferred or fabricated.";

function buildProjectReport(project: Project): ProjectReport {
  const notes = loadProjectNotes(project.id);
  const tasks = loadProjectTasks(project.id);
  const openQuestions = loadProjectQuestions(project.id);
  const evidence = loadProjectEvidence(project.id);
  const relationships = buildEntityRelationships("project", project.id);

  const timeline: ProjectTimelineEntry[] = [
    { id: `project-created-${project.id}`, description: "Project created", at: project.createdAt },
    ...notes.map((n): ProjectTimelineEntry => ({ id: `note-${n.noteId}`, description: "Note added", at: n.createdAt })),
    ...tasks.map((t): ProjectTimelineEntry => ({ id: `task-${t.taskId}`, description: `Task added: ${t.title}`, at: t.createdAt })),
    ...evidence.map((e): ProjectTimelineEntry => ({ id: `evidence-${e.evidenceRefId}`, description: `Evidence added: ${e.title}`, at: e.createdAt })),
    ...(project.reportGeneratedAt
      ? [{ id: `report-${project.id}`, description: "Report generated", at: project.reportGeneratedAt } satisfies ProjectTimelineEntry]
      : []),
  ].sort((a, b) => b.at.localeCompare(a.at));

  const unresolvedQuestions = openQuestions.filter((q) => !q.resolved);

  const limitations: string[] = [
    "Evidence references are user-authored citations, not an automated evidence discovery system.",
    "Related entities are only those the user has explicitly linked — never inferred.",
  ];
  if (evidence.length === 0) {
    limitations.push("No evidence has been added to this project yet.");
  }
  if (unresolvedQuestions.length > 0) {
    limitations.push(`${unresolvedQuestions.length} open question(s) remain unresolved.`);
  }

  return {
    projectId: project.id,
    title: project.title,
    typeLabel: getProjectTypeLabel(project.type),
    description: project.description,
    researchQuestion: project.researchQuestion?.trim() || null,
    objectives: project.objectives?.trim() || null,
    notes,
    tasks,
    openQuestions,
    evidence,
    relationships,
    timeline,
    trustStatement: PROJECT_TRUST_STATEMENT,
    limitations,
  };
}

const RESEARCH_TRUST_STATEMENT =
  "CBAI provides evidence-based research intelligence. Findings, hypotheses, and connections are shown only when verified — never inferred or fabricated.";

function buildResearchTopicReport(topicId: string): ResearchTopicReport | null {
  const topic = getResearchTopicById(topicId);
  if (!topic) return null;

  const mission = buildResearchMission({ missionId: topicId });
  const contract = mission.workspaceContract;
  const evidenceConnectedCount = contract?.evidenceSummary.evidence.length ?? 0;
  const question = contract?.missionSummary.missionCenter.question.question ?? topic.description;
  const notes = loadResearchNotes(topicId);

  const limitations: string[] = [
    "No verified link between this research topic and any country or university exists yet.",
    "Related companies are matched by industry keyword, not a confirmed institutional link.",
  ];
  if (evidenceConnectedCount === 0) {
    limitations.push("No evidence is connected to this research topic yet.");
  }
  if ((contract?.evidenceSummary.conflictingEvidence.length ?? 0) === 0) {
    limitations.push("No counter evidence is connected yet — this does not confirm the absence of one.");
  }

  return {
    topicId: topic.topicId,
    topicName: topic.topicName,
    domain: topic.domain,
    description: topic.description,
    question,
    evidenceConnectedCount,
    supportingEvidence: contract?.evidenceSummary.supportingEvidence ?? [],
    counterEvidence: contract?.evidenceSummary.conflictingEvidence ?? [],
    notes,
    relationships: buildEntityRelationships("research_topic", topicId),
    trustStatement: RESEARCH_TRUST_STATEMENT,
    limitations,
  };
}

/**
 * Universal entry point: one function name for "generate a report for this entity," dispatching
 * to the real per-module builder. Returns null when the entity id doesn't resolve to a real
 * catalog record — never a fabricated report. Overloaded per literal entityType so call sites get
 * the exact report shape back (e.g. CountryReportView can take the "country" call's result
 * directly) without a manual narrowing check at every call site.
 */
export function buildEntityReport(entityType: "country", id: string): (EntityReport & { entityType: "country" }) | null;
export function buildEntityReport(entityType: "company", id: string): (EntityReport & { entityType: "company" }) | null;
export function buildEntityReport(entityType: "university", id: string): (EntityReport & { entityType: "university" }) | null;
export function buildEntityReport(entityType: "research_topic", id: string): (EntityReport & { entityType: "research_topic" }) | null;
export function buildEntityReport(entityType: "project", id: string): (EntityReport & { entityType: "project" }) | null;
export function buildEntityReport(
  entityType: "country" | "company" | "university" | "research_topic" | "project",
  id: string,
): EntityReport | null {
  switch (entityType) {
    case "country": {
      const country = countries.find((c) => c.id === id);
      if (!country) return null;
      const journey = buildCountryUserJourney(country, getCountryRelationships(country));
      const report = buildCountryReport(country, journey);
      return {
        entityType: "country",
        dataStatus: resolveEntityDataStatus(report.evidence.connectedSources, report.evidence.totalSources),
        ...report,
      };
    }
    case "company": {
      const company = companies.find((c) => c.id === id);
      if (!company) return null;
      const journey = buildCompanyUserJourney(company, getCompanyLinkedEntities(company));
      const report = buildCompanyReport(company, journey);
      return {
        entityType: "company",
        dataStatus: resolveEntityDataStatus(report.evidence.connectedSources, report.evidence.totalSources),
        ...report,
      };
    }
    case "university": {
      const university = universities.find((u) => u.id === id);
      if (!university) return null;
      const journey = buildUniversityUserJourney(university, getUniversityRelationships(university));
      const report = buildUniversityReport(university, journey);
      return {
        entityType: "university",
        dataStatus: resolveEntityDataStatus(report.evidence.connectedSources, report.evidence.totalSources),
        ...report,
      };
    }
    case "research_topic": {
      const report = buildResearchTopicReport(id);
      if (!report) return null;
      // No real "total possible sources" concept exists for research topics (unlike
      // Country/Company/University's coverage.sources.length), so this reports "live" only when
      // real evidence is connected and "waiting for verified data" otherwise — never a fabricated
      // ratio against a total that doesn't exist.
      return {
        entityType: "research_topic",
        dataStatus: report.evidenceConnectedCount > 0 ? "live" : "waiting_for_verified_data",
        ...report,
      };
    }
    case "project": {
      const project = loadProject(id);
      if (!project) return null;
      const report = buildProjectReport(project);
      // No fixed "total possible" concept exists for a Project (it's user-scoped, not catalog-
      // scoped like Country/Company/University's coverage.sources.length), so this reports "live"
      // only when the user has actually added real evidence or notes, honestly
      // "waiting_for_verified_data" for a freshly created, still-empty project.
      const hasRealContent = report.evidence.length > 0 || report.notes.length > 0;
      return {
        entityType: "project",
        dataStatus: hasRealContent ? "live" : "waiting_for_verified_data",
        ...report,
      };
    }
  }
}
