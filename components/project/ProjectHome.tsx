"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/project/project-types";
import { PROJECT_STATUS_LABELS } from "@/lib/project/project-types";
import {
  loadProjectEntities,
  loadProjectEvidence,
  linkEntityToProject,
  unlinkEntityFromProject,
  updateProject,
} from "@/lib/project/project-store";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import { buildEntityReport } from "@/lib/entity/entity-report";
import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import type { ContextEntityRef } from "@/lib/context/context-types";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import EntityRelatedPanel from "@/components/shared/EntityRelatedPanel";
import ProjectDashboard from "@/components/project/ProjectDashboard";
import ProjectNotesPanel from "@/components/project/ProjectNotesPanel";
import ProjectTasksPanel from "@/components/project/ProjectTasksPanel";
import ProjectOpenQuestionsPanel from "@/components/project/ProjectOpenQuestionsPanel";
import ProjectEvidencePanel from "@/components/project/ProjectEvidencePanel";
import ProjectReportView from "@/components/project/ProjectReportView";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ProjectHomeProps = {
  project: Project;
};

const METHODOLOGY_POINTS = [
  { id: "user-created", title: "User-created, not AI-generated", description: "Projects, notes, tasks, and evidence references are created only by the user — never auto-generated or fabricated." },
  { id: "real-links-only", title: "Real entity links only", description: "Related Countries/Companies/Universities/Research topics are only ever real catalog entries the user explicitly linked." },
  { id: "no-score", title: "No project score", description: "CBAI does not compute a fabricated project quality or completion score — progress is a real count of completed real milestones." },
  { id: "local-only", title: "Local to this device", description: "Projects are stored in this browser only — there is no account system, so nothing here is shared or synced." },
];

function LinkEntityForm({ projectId, onLinked }: { projectId: string; onLinked: (entity: ContextEntityRef) => void }) {
  const [kind, setKind] = useState<"country" | "company" | "university" | "research_topic">("country");
  const [id, setId] = useState("");

  const options =
    kind === "country"
      ? countries.map((c) => ({ id: c.id, name: c.name }))
      : kind === "company"
        ? companies.map((c) => ({ id: c.id, name: c.name }))
        : kind === "university"
          ? universities.map((u) => ({ id: u.id, name: u.name }))
          : RESEARCH_TOPICS.map((t) => ({ id: t.topicId, name: t.topicName }));

  function handleLink(event: React.FormEvent) {
    event.preventDefault();
    const option = options.find((o) => o.id === id);
    if (!option) return;
    const entity: ContextEntityRef = { kind, id: option.id, name: option.name };
    linkEntityToProject(projectId, entity);
    onLinked(entity);
    setId("");
  }

  return (
    <form onSubmit={handleLink} className="flex flex-wrap gap-2">
      <select
        value={kind}
        onChange={(e) => {
          setKind(e.target.value as typeof kind);
          setId("");
        }}
        className="rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-[11px] text-zinc-400"
      >
        <option value="country">Country</option>
        <option value="company">Company</option>
        <option value="university">University</option>
        <option value="research_topic">Research Topic</option>
      </select>
      <select
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-[11px] text-zinc-400"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!id}
        className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-300 hover:border-cyan-500/50 disabled:opacity-40"
      >
        Link entity
      </button>
    </form>
  );
}

export default function ProjectHome({ project: initialProject }: ProjectHomeProps) {
  const { isEntityPinned } = usePlatformContext();
  const [project, setProject] = useState(initialProject);
  const [entities, setEntities] = useState<ContextEntityRef[]>(() => loadProjectEntities(project.id));
  const [evidence] = useState(() => loadProjectEvidence(project.id));
  const [showReport, setShowReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [researchQuestionDraft, setResearchQuestionDraft] = useState(project.researchQuestion ?? "");
  const [objectivesDraft, setObjectivesDraft] = useState(project.objectives ?? "");

  const relationships = buildEntityRelationships("project", project.id);

  function handleUnlink(entity: ContextEntityRef) {
    unlinkEntityFromProject(project.id, entity.kind, entity.id);
    setEntities((current) => current.filter((e) => !(e.kind === entity.kind && e.id === entity.id)));
  }

  function handleSaveQuestionObjectives() {
    const updated = updateProject(project.id, {
      researchQuestion: researchQuestionDraft.trim() || undefined,
      objectives: objectivesDraft.trim() || undefined,
    });
    if (updated) setProject(updated);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/my-work" className="text-xs text-cyan-400 hover:text-cyan-300">
            ← My Work
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-50">{project.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{project.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="rounded-md border border-zinc-800 px-2 py-0.5 uppercase tracking-wider">{PROJECT_STATUS_LABELS[project.status]}</span>
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-zinc-800 px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <SaveToWorkspaceButton entity={{ kind: "project", id: project.id, name: project.title }} />
      </div>

      <ProjectDashboard project={project} reportGeneratedThisSession={reportGenerated} />

      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Research Question &amp; Objectives</p>
        <div>
          <label htmlFor="project-question" className="text-xs text-zinc-500">
            Research Question
          </label>
          <textarea
            id="project-question"
            value={researchQuestionDraft}
            onChange={(e) => setResearchQuestionDraft(e.target.value)}
            rows={2}
            placeholder="What question is this project answering?"
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
          />
        </div>
        <div>
          <label htmlFor="project-objectives" className="text-xs text-zinc-500">
            Objectives
          </label>
          <textarea
            id="project-objectives"
            value={objectivesDraft}
            onChange={(e) => setObjectivesDraft(e.target.value)}
            rows={2}
            placeholder="What does this project need to accomplish?"
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
          />
        </div>
        <button
          type="button"
          onClick={handleSaveQuestionObjectives}
          className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-300 hover:border-cyan-500/50"
        >
          Save
        </button>
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Related Entities</p>
        <LinkEntityForm projectId={project.id} onLinked={(entity) => setEntities((current) => [...current, entity])} />
        <EntityRelatedPanel
          showHeading={false}
          relationships={relationships}
          emptyLabel="No entities linked to this project yet — link one above."
        />
        {entities.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-zinc-800/80 pt-2">
            {entities.map((entity) => (
              <button
                key={`${entity.kind}-${entity.id}`}
                type="button"
                onClick={() => handleUnlink(entity)}
                title={`Unlink ${entity.name}`}
                className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-500 hover:border-red-500/30 hover:text-red-400"
              >
                Unlink {entity.name} ×
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <ProjectEvidencePanel projectId={project.id} relatedEntities={entities} />

      <ProjectNotesPanel projectId={project.id} evidence={evidence} relatedEntities={entities} />

      <ProjectOpenQuestionsPanel projectId={project.id} />

      <ProjectTasksPanel projectId={project.id} />

      <div className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Bookmarks</p>
        {entities.filter((e) => isEntityPinned(e.kind, e.id)).length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {entities
              .filter((e) => isEntityPinned(e.kind, e.id))
              .map((e) => (
                <li key={`${e.kind}-${e.id}`} className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {e.name}
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-600">None of this project&apos;s linked entities are bookmarked yet.</p>
        )}
      </div>

      <div id="project-report" className="space-y-4">
        <button
          type="button"
          onClick={() => {
            setShowReport((current) => !current);
            setReportGenerated(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:border-cyan-500/50"
        >
          {showReport ? "Hide report" : "Generate report"}
        </button>
        {showReport
          ? (() => {
              const report = buildEntityReport("project", project.id);
              return report ? <ProjectReportView report={report} /> : null;
            })()
          : null}
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Trust &amp; Methodology</p>
        <p className="text-xs text-zinc-500">
          CBAI provides evidence-based project intelligence. Every entity link, note, and evidence
          reference in this project was added by the user — never inferred or fabricated.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {METHODOLOGY_POINTS.map((point) => (
            <div key={point.id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
              <p className="text-xs font-medium text-zinc-300">{point.title}</p>
              <p className="mt-1 text-[11px] text-zinc-500">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
