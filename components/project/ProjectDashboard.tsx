"use client";

import type { Project } from "@/lib/project/project-types";
import { deriveProjectHealth } from "@/lib/project/project-health";
import {
  loadProjectEntities,
  loadProjectNotes,
} from "@/lib/project/project-store";
import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { buildCountryCoverageProfile } from "@/lib/countries.coverage";
import { buildCompanyCoverageProfile } from "@/lib/companies.coverage";
import { buildUniversityCoverageProfile } from "@/lib/universities.coverage";
import { deriveEvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-engine";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ProjectDashboardProps = {
  project: Project;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${cbaiGlassCard} p-3`}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function HealthRow({ label, achieved, detail }: { label: string; achieved: boolean; detail: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <div className="flex items-start gap-2">
        <span
          aria-hidden="true"
          className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${achieved ? "bg-emerald-400" : "bg-zinc-700"}`}
        />
        <span className={achieved ? "text-zinc-300" : "text-zinc-500"}>{label}</span>
      </div>
      <span className="shrink-0 text-zinc-600">{detail}</span>
    </div>
  );
}

function countMissingEvidence(project: Project): number {
  const entities = loadProjectEntities(project.id);
  let missing = 0;
  for (const entity of entities) {
    if (entity.kind === "country") {
      const country = countries.find((c) => c.id === entity.id);
      if (country) missing += buildCountryCoverageProfile(country).evidenceCoverage.notConnected;
    } else if (entity.kind === "company") {
      const company = companies.find((c) => c.id === entity.id);
      if (company) missing += buildCompanyCoverageProfile(company).evidenceCoverage.notConnected;
    } else if (entity.kind === "university") {
      const university = universities.find((u) => u.id === entity.id);
      if (university) missing += buildUniversityCoverageProfile(university).evidenceCoverage.notConnected;
    } else if (entity.kind === "research_topic") {
      const intelligence = deriveEvidenceGapIntelligence(entity.id);
      if (intelligence) missing += intelligence.disconnectedEvidence.length;
    }
  }
  return missing;
}

/**
 * Real Project Dashboard — the one consolidated status surface for a project (Platform Activation
 * mission; previously split across this Dashboard's own Progress/Evidence/Open-questions stat
 * cards and a separate ProjectHealthPanel showing the same underlying signals as a checklist).
 * Health/Progress checklist, Missing Evidence, Latest Notes, Workspace Status, and Report Status
 * now live in exactly one place. Every field is a pass-through or one-line composition of
 * already-real, already-computed values — no new engine, never a fabricated value.
 *
 * Reads directly from the store on every render (no useState caching) so it reflects sibling
 * panels' mutations immediately, within the same session — the platform should always know the
 * real current state, per the Intelligence Guide Activation mission.
 */
export default function ProjectDashboard({ project }: ProjectDashboardProps) {
  const { isEntityPinned } = usePlatformContext();
  const notes = loadProjectNotes(project.id);
  const missingEvidence = countMissingEvidence(project);
  const health = deriveProjectHealth(project);
  const pinned = isEntityPinned("project", project.id);

  return (
    <section aria-labelledby="project-dashboard-heading" className={`${cbaiGlassCard} space-y-4 p-4 sm:p-5`}>
      <p className={cbaiSectionEyebrow} id="project-dashboard-heading">
        Project Dashboard
      </p>

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Missing evidence" value={String(missingEvidence)} />
        <StatCard label="Tasks done" value={`${health.tasksDoneCount}/${health.tasksCount}`} />
        <StatCard label="Open questions" value={String(health.openQuestionsCount)} />
      </div>

      <div className="space-y-1.5 border-t border-zinc-800/80 pt-3">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-600">Real signals only — never a fabricated score or percentage</p>
        <HealthRow label="Research question" achieved={health.questionExists} detail={health.questionExists ? "Defined" : "Not yet defined"} />
        <HealthRow label="Objectives" achieved={health.objectivesExist} detail={health.objectivesExist ? "Defined" : "Not yet defined"} />
        <HealthRow label="Evidence" achieved={health.evidenceCount > 0} detail={`${health.evidenceCount} added`} />
        <HealthRow label="Notes" achieved={health.notesCount > 0} detail={`${health.notesCount} added`} />
        <HealthRow label="Related entities" achieved={health.entityLinksCount > 0} detail={`${health.entityLinksCount} linked`} />
        <HealthRow label="Report" achieved={health.reportGenerated} detail={health.reportGenerated ? "Generated" : "Not generated yet"} />
      </div>

      <div className="border-t border-zinc-800/80 pt-3">
        <p className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-600">Latest notes</p>
        {notes.length > 0 ? (
          <ul className="space-y-1">
            {notes.slice(0, 3).map((note) => (
              <li key={note.noteId} className="text-xs text-zinc-500">
                {note.body.length > 80 ? `${note.body.slice(0, 80)}…` : note.body}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-600">No notes recorded yet.</p>
        )}
      </div>

      <div className="border-t border-zinc-800/80 pt-3">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">Workspace status</p>
        <p className="mt-1 text-xs text-zinc-400">{pinned ? "Saved to workspace" : "Not saved yet"}</p>
      </div>
    </section>
  );
}
