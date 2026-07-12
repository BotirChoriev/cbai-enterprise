/**
 * Adapter: maps Project → universal Entity interface (Project Engine Activation mission).
 * Mirrors toCountryEntity/toCompanyEntity/toResearchTopicEntity exactly — factual fields only,
 * zeroed scores (this platform does not fabricate AI/investment/risk scores for any entity type).
 */

import type { Project } from "@/lib/project/project-types";
import { getProjectTypeLabel } from "@/lib/project/project-types";
import { loadProjectEntities, loadProjectNotes, loadProjectTasks } from "@/lib/project/project-store";
import type { Entity } from "@/lib/entity/entity.types";

const INSUFFICIENT_EVIDENCE_LABEL = "Insufficient Evidence";

export function toProjectEntity(project: Project): Entity {
  const linkedEntities = loadProjectEntities(project.id);
  const notes = loadProjectNotes(project.id);
  const tasks = loadProjectTasks(project.id);

  return {
    id: project.id,
    type: "project",
    name: project.title,
    category: getProjectTypeLabel(project.type),
    overview: project.description,
    summary: project.description,
    status: project.status === "archived" ? "archived" : project.status === "active" ? "active" : "pending",
    scores: { aiScore: 0, investmentScore: 0, riskScore: 0 },
    tags: project.tags.map((tag) => ({ id: tag, label: tag })),
    timeline: [],
    aiSummary: INSUFFICIENT_EVIDENCE_LABEL,
    metadata: {
      type: project.type,
      status: project.status,
      visibility: project.visibility,
    },
    metrics: [
      { id: "linked-entities", label: "Linked Entities", value: linkedEntities.length, unit: "records" },
      { id: "notes", label: "Notes", value: notes.length, unit: "records" },
      { id: "tasks", label: "Tasks", value: tasks.length, unit: "records" },
    ],
    subtitle: getProjectTypeLabel(project.type),
    reportsAvailable: true,
  };
}

export function toProjectEntities(projects: readonly Project[]): Entity[] {
  return projects.map(toProjectEntity);
}
