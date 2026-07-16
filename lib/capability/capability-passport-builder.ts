/**
 * Builds a Capability Passport from real project work only — never from role, title, or diploma.
 */

import { loadProjects, loadProjectNotes, loadProjectEvidence, loadProjectQuestions } from "@/lib/project/project-store";
import type { Project, ProjectTypeId } from "@/lib/project/project-types";
import type {
  CapabilityDomainId,
  CapabilityPassport,
  CapabilitySignal,
  CapabilitySignalSource,
} from "@/lib/capability/capability-passport.types";
import {
  CAPABILITY_DOMAIN_LABELS,
  capabilityMaturityFromCount,
} from "@/lib/capability/capability-passport.types";

const PROJECT_TYPE_DOMAINS: Record<ProjectTypeId, CapabilityDomainId[]> = {
  research_project: ["research", "synthesis"],
  country_analysis: ["analysis", "evidence"],
  company_analysis: ["analysis", "evidence"],
  university_study: ["analysis", "evidence"],
  policy_analysis: ["governance", "analysis"],
  investment_analysis: ["analysis", "evidence"],
  technology_assessment: ["research", "analysis"],
  evidence_review: ["evidence", "synthesis"],
};

function newSignal(
  domainId: CapabilityDomainId,
  source: CapabilitySignalSource,
  label: string,
  occurredAt: string,
  projectId?: string,
  evidenceCount?: number,
): CapabilitySignal {
  return {
    id: `${source}-${domainId}-${occurredAt}-${Math.random().toString(36).slice(2, 6)}`,
    domainId,
    source,
    label,
    occurredAt,
    projectId,
    evidenceCount,
  };
}

function signalsFromProject(project: Project): CapabilitySignal[] {
  const signals: CapabilitySignal[] = [];
  const domains = PROJECT_TYPE_DOMAINS[project.type] ?? ["analysis"];
  const at = project.updatedAt ?? project.createdAt;

  for (const domainId of domains) {
    signals.push(
      newSignal(
        domainId,
        project.status === "completed" ? "project_completed" : "project_created",
        project.status === "completed"
          ? `Completed: ${project.title}`
          : `Active project: ${project.title}`,
        at,
        project.id,
      ),
    );
  }

  const notes = loadProjectNotes(project.id);
  for (const note of notes) {
    signals.push(
      newSignal(
        "synthesis",
        "note_authored",
        `Note on ${project.title}`,
        note.createdAt,
        project.id,
      ),
    );
  }

  const evidenceRefs = loadProjectEvidence(project.id);
  if (evidenceRefs.length > 0) {
    signals.push(
      newSignal(
        "evidence",
        "evidence_linked",
        `${evidenceRefs.length} evidence link${evidenceRefs.length === 1 ? "" : "s"} in ${project.title}`,
        at,
        project.id,
        evidenceRefs.length,
      ),
    );
  }

  const questions = loadProjectQuestions(project.id);
  for (const q of questions) {
    signals.push(
      newSignal(
        "research",
        "question_opened",
        `Open question in ${project.title}`,
        q.createdAt,
        project.id,
      ),
    );
  }

  return signals;
}

export function buildCapabilityPassport(ownerLabel: string): CapabilityPassport {
  const projects = loadProjects();
  const allSignals = projects.flatMap(signalsFromProject);
  allSignals.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const domainCounts = new Map<CapabilityDomainId, { count: number; lastAt: string | null }>();
  for (const domainId of Object.keys(CAPABILITY_DOMAIN_LABELS) as CapabilityDomainId[]) {
    domainCounts.set(domainId, { count: 0, lastAt: null });
  }

  for (const signal of allSignals) {
    const entry = domainCounts.get(signal.domainId)!;
    entry.count += 1;
    if (!entry.lastAt || signal.occurredAt > entry.lastAt) {
      entry.lastAt = signal.occurredAt;
    }
  }

  const domains = (Object.keys(CAPABILITY_DOMAIN_LABELS) as CapabilityDomainId[]).map((domainId) => {
    const { count, lastAt } = domainCounts.get(domainId)!;
    return {
      domainId,
      signalCount: count,
      lastActivityAt: lastAt,
      maturity: capabilityMaturityFromCount(count),
    };
  });

  const totalSignals = allSignals.length;
  const readiness: CapabilityPassport["readiness"] =
    totalSignals === 0 ? "empty" : totalSignals <= 3 ? "emerging" : "active";

  return {
    ownerLabel,
    updatedAt: new Date().toISOString(),
    totalSignals,
    domains,
    recentSignals: allSignals.slice(0, 12),
    readiness,
  };
}

export function buildEmptyCapabilityPassport(ownerLabel: string): CapabilityPassport {
  return buildCapabilityPassport(ownerLabel);
}
