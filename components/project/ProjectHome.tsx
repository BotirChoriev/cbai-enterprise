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
  markProjectReportGenerated,
} from "@/lib/project/project-store";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import { buildEntityReport } from "@/lib/entity/entity-report";
import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import type { ContextEntityRef } from "@/lib/context/context-types";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useAuth } from "@/components/platform/context/AuthProvider";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import SyncStatusBadge from "@/components/shared/SyncStatusBadge";
import GenerateReportToggleButton from "@/components/shared/GenerateReportToggleButton";
import EntityRelatedPanel from "@/components/shared/EntityRelatedPanel";
import ContextualOperatorBanner from "@/components/assistant/ContextualOperatorBanner";
import ProjectGuidePanel from "@/components/project/ProjectGuidePanel";
import ProjectDashboard from "@/components/project/ProjectDashboard";
import ProjectHealthPanel from "@/components/project/ProjectHealthPanel";
import ProjectNotesPanel from "@/components/project/ProjectNotesPanel";
import ProjectTasksPanel from "@/components/project/ProjectTasksPanel";
import ProjectOpenQuestionsPanel from "@/components/project/ProjectOpenQuestionsPanel";
import ProjectEvidencePanel from "@/components/project/ProjectEvidencePanel";
import ProjectTimelinePanel from "@/components/project/ProjectTimelinePanel";
import ProjectReportView from "@/components/project/ProjectReportView";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ProjectHomeProps = {
  project: Project;
};

const METHODOLOGY_POINTS = [
  { id: "user-created", title: "User-created, not AI-generated", description: "Projects, notes, tasks, and evidence references are created only by the user — never auto-generated or fabricated." },
  { id: "real-links-only", title: "Real entity links only", description: "Related Countries/Companies/Universities/Research topics are only ever real catalog entries the user explicitly linked." },
  { id: "no-score", title: "No project score", description: "CBAI does not compute a fabricated project quality or completion score — progress is a real count of completed real milestones." },
  { id: "local-only", title: "Storage", description: "Signed into a cloud account, Projects sync across your devices; otherwise they stay in this browser only. Never shared with other users." },
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
  const { isEntityPinned, pinEntityToWorkspace, unpinEntityFromWorkspace } = usePlatformContext();
  const { accountMode } = useAuth();
  const [project, setProject] = useState(initialProject);
  const [entities, setEntities] = useState<ContextEntityRef[]>(() => loadProjectEntities(project.id));
  const [evidence, setEvidence] = useState(() => loadProjectEvidence(project.id));
  const [showReport, setShowReport] = useState(false);
  const [researchQuestionDraft, setResearchQuestionDraft] = useState(project.researchQuestion ?? "");
  const [objectivesDraft, setObjectivesDraft] = useState(project.objectives ?? "");
  const [questionObjectivesSaved, setQuestionObjectivesSaved] = useState(false);
  // A pure re-render trigger — Dashboard/Guide/Health/Timeline read directly from the store on
  // every render (no internal caching), so bumping this after any sibling panel's mutation is
  // enough to keep them honest and current within the same session.
  const [, bumpRefresh] = useState(0);
  const refresh = () => bumpRefresh((n) => n + 1);

  const relationships = buildEntityRelationships("project", project.id);

  function handleUnlink(entity: ContextEntityRef) {
    unlinkEntityFromProject(project.id, entity.kind, entity.id);
    setEntities((current) => current.filter((e) => !(e.kind === entity.kind && e.id === entity.id)));
    refresh();
  }

  function handleSaveQuestionObjectives() {
    const updated = updateProject(project.id, {
      researchQuestion: researchQuestionDraft.trim() || undefined,
      objectives: objectivesDraft.trim() || undefined,
    });
    if (updated) {
      setProject(updated);
      refresh();
      setQuestionObjectivesSaved(true);
      window.setTimeout(() => setQuestionObjectivesSaved(false), 3000);
    }
  }

  function handleToggleReport() {
    if (!showReport) {
      const updated = markProjectReportGenerated(project.id);
      if (updated) setProject(updated);
    }
    setShowReport((current) => !current);
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
            {accountMode === "cloud" ? <SyncStatusBadge table="projects" localId={project.id} /> : null}
          </div>
        </div>
        <SaveToWorkspaceButton entity={{ kind: "project", id: project.id, name: project.title }} />
      </div>

      <ContextualOperatorBanner projectId={project.id} />

      <ProjectGuidePanel project={project} />

      <ProjectDashboard project={project} />

      <ProjectHealthPanel project={project} />

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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveQuestionObjectives}
            className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-300 hover:border-cyan-500/50"
          >
            Save
          </button>
          {questionObjectivesSaved ? (
            <p role="status" className="text-[11px] text-emerald-400">
              Saved.
            </p>
          ) : null}
          {accountMode === "cloud" ? <SyncStatusBadge table="projects" localId={project.id} /> : null}
        </div>
      </div>

      <div id="project-entities" className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Related Entities</p>
        <LinkEntityForm
          projectId={project.id}
          onLinked={(entity) => {
            setEntities((current) => [...current, entity]);
            refresh();
          }}
        />
        <EntityRelatedPanel
          showHeading={false}
          relationships={relationships}
          emptyLabel="No entities linked yet. Link a Country, Company, or University this project is about."
        />
        {entities.length > 0 ? (
          <div className="space-y-1.5 border-t border-zinc-800/80 pt-2">
            <p className="text-[10px] text-zinc-600">
              Linked entities belong to this project. Bookmarking is separate — it saves an entity
              to your workspace everywhere, not just here.
            </p>
            <div className="flex flex-wrap gap-2">
              {entities.map((entity) => {
                const pinned = isEntityPinned(entity.kind, entity.id);
                return (
                  <div
                    key={`${entity.kind}-${entity.id}`}
                    className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/60 pl-2.5 pr-1 py-1 text-[11px] text-zinc-400"
                  >
                    <span>{entity.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        pinned
                          ? unpinEntityFromWorkspace(entity.kind, entity.id)
                          : pinEntityToWorkspace(entity)
                      }
                      aria-label={pinned ? `Remove ${entity.name} bookmark` : `Bookmark ${entity.name}`}
                      aria-pressed={pinned}
                      title={pinned ? `Remove ${entity.name} bookmark` : `Bookmark ${entity.name}`}
                      className={`rounded-full px-1.5 py-0.5 ${pinned ? "text-cyan-300" : "text-zinc-600 hover:text-cyan-300"}`}
                    >
                      <span aria-hidden="true">{pinned ? "★" : "☆"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnlink(entity)}
                      aria-label={`Unlink ${entity.name}`}
                      title={`Unlink ${entity.name}`}
                      className="rounded-full px-1.5 py-0.5 text-zinc-600 hover:text-red-400"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <ProjectEvidencePanel
        projectId={project.id}
        relatedEntities={entities}
        onAdded={(item) => {
          setEvidence((current) => [item, ...current]);
          refresh();
        }}
      />

      <ProjectNotesPanel projectId={project.id} evidence={evidence} relatedEntities={entities} onAdded={refresh} />

      <ProjectOpenQuestionsPanel projectId={project.id} onChange={refresh} />

      <ProjectTasksPanel projectId={project.id} onChange={refresh} />

      <ProjectTimelinePanel project={project} />

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
          <p className="text-xs text-zinc-600">
            None of this project&apos;s linked entities are bookmarked yet — use the ☆ next to a
            linked entity above to bookmark it.
          </p>
        )}
      </div>

      <div id="project-report" className="space-y-4">
        <GenerateReportToggleButton showReport={showReport} onClick={handleToggleReport} />
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
