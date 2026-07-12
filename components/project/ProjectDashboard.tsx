"use client";

import type { Project } from "@/lib/project/project-types";
import { deriveProjectProgress } from "@/lib/project/project-progress";
import {
  loadProjectEntities,
  loadProjectNotes,
  loadProjectEvidence,
  loadProjectQuestions,
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
 * Real Project Dashboard — Progress, Recent Activity, Evidence Summary, Open Questions, Related
 * Entities, Missing Evidence, Latest Notes, Workspace Status, Report Status. Every field is a
 * pass-through or one-line composition of already-real, already-computed values (the same
 * pattern proven by ResearchWorkspaceDashboard.tsx) — no new engine, never a fabricated value.
 *
 * Reads directly from the store on every render (no useState caching) so it reflects sibling
 * panels' mutations immediately, within the same session — the platform should always know the
 * real current state, per the Intelligence Guide Activation mission.
 */
export default function ProjectDashboard({ project }: ProjectDashboardProps) {
  const { isEntityPinned } = usePlatformContext();
  const entities = loadProjectEntities(project.id);
  const notes = loadProjectNotes(project.id);
  const evidence = loadProjectEvidence(project.id);
  const questions = loadProjectQuestions(project.id);
  const missingEvidence = countMissingEvidence(project);

  const progress = deriveProjectProgress(project);
  const openQuestions = questions.filter((q) => !q.resolved);
  const pinned = isEntityPinned("project", project.id);

  return (
    <section aria-labelledby="project-dashboard-heading" className={`${cbaiGlassCard} space-y-4 p-4 sm:p-5`}>
      <p className={cbaiSectionEyebrow} id="project-dashboard-heading">
        Project Dashboard
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label="Progress" value={`${progress.completedCount}/${progress.totalCount} milestones`} />
        <StatCard label="Evidence added" value={String(evidence.length)} />
        <StatCard label="Missing evidence" value={String(missingEvidence)} />
        <StatCard label="Open questions" value={String(openQuestions.length)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
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

        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-600">Related entities</p>
          <p className="text-xs text-zinc-500">
            {entities.length > 0 ? `${entities.length} entities linked.` : "No entities linked yet."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/80 pt-3 sm:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Workspace status</p>
          <p className="mt-1 text-xs text-zinc-400">{pinned ? "Saved to workspace" : "Not saved yet"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Report status</p>
          <p className="mt-1 text-xs text-zinc-400">
            {project.reportGeneratedAt ? `Generated ${new Date(project.reportGeneratedAt).toLocaleString()}` : "Not generated yet"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Status</p>
          <p className="mt-1 text-xs text-zinc-400 capitalize">{project.status}</p>
        </div>
      </div>
    </section>
  );
}
