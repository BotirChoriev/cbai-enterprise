"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/project/project-types";
import { useTranslation } from "@/lib/i18n/use-translation";
import { translateProjectStatus } from "@/lib/i18n/project-translation";
import {
  loadProjectEntities,
  loadProjectEvidence,
  loadProject,
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
import ShareButton from "@/components/shared/ShareButton";
import SyncStatusBadge from "@/components/shared/SyncStatusBadge";
import GenerateReportToggleButton from "@/components/shared/GenerateReportToggleButton";
import HumanImpactPanel from "@/components/mission/HumanImpactPanel";
import { deriveReportReadiness } from "@/lib/intelligence-os/report-readiness";
import EntityRelatedPanel from "@/components/shared/EntityRelatedPanel";
import ContextualOperatorBanner from "@/components/assistant/ContextualOperatorBanner";
import ProjectGuidePanel from "@/components/project/ProjectGuidePanel";
import ProjectDashboard from "@/components/project/ProjectDashboard";
import ProjectNotesPanel from "@/components/project/ProjectNotesPanel";
import ProjectTasksPanel from "@/components/project/ProjectTasksPanel";
import ProjectOpenQuestionsPanel from "@/components/project/ProjectOpenQuestionsPanel";
import ProjectEvidencePanel from "@/components/project/ProjectEvidencePanel";
import ProjectTimelinePanel from "@/components/project/ProjectTimelinePanel";
import ProjectReportView from "@/components/project/ProjectReportView";
import ActivationStatusLine from "@/components/shared/ActivationStatusLine";
import { useMissionDataRevision } from "@/lib/hooks/use-mission-data-revision";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ProjectHomeProps = {
  project: Project;
};

const METHODOLOGY_POINT_IDS = ["user-created", "real-links-only", "no-score", "local-only"] as const;

function methodologyTitle(t: ReturnType<typeof useTranslation>["t"], id: (typeof METHODOLOGY_POINT_IDS)[number]) {
  switch (id) {
    case "user-created":
      return t("projectHome.methodologyUserCreated");
    case "real-links-only":
      return t("projectHome.methodologyRealLinks");
    case "no-score":
      return t("projectHome.methodologyNoScore");
    case "local-only":
      return t("projectHome.methodologyStorage");
  }
}

function methodologyDetail(t: ReturnType<typeof useTranslation>["t"], id: (typeof METHODOLOGY_POINT_IDS)[number]) {
  switch (id) {
    case "user-created":
      return t("projectHome.methodologyUserCreatedDetail");
    case "real-links-only":
      return t("projectHome.methodologyRealLinksDetail");
    case "no-score":
      return t("projectHome.methodologyNoScoreDetail");
    case "local-only":
      return t("projectHome.methodologyStorageDetail");
  }
}

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
        className="rounded-md border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-medium text-teal-300 hover:border-teal-500/50 disabled:opacity-40"
      >
        Link entity
      </button>
    </form>
  );
}

export default function ProjectHome({ project: initialProject }: ProjectHomeProps) {
  const { isEntityPinned, pinEntityToWorkspace, unpinEntityFromWorkspace } = usePlatformContext();
  const { accountMode } = useAuth();
  const { t } = useTranslation();
  const missionRevision = useMissionDataRevision();
  const [localRevision, setLocalRevision] = useState(0);
  const dataRevision = missionRevision + localRevision;
  const refresh = () => setLocalRevision((n) => n + 1);

  const project = useMemo(
    () => loadProject(initialProject.id) ?? initialProject,
    [initialProject.id, initialProject, dataRevision],
  );
  const entities = useMemo(() => loadProjectEntities(project.id), [project.id, dataRevision]);
  const evidence = useMemo(() => loadProjectEvidence(project.id), [project.id, dataRevision]);

  const [showReport, setShowReport] = useState(false);
  const [reportNotice, setReportNotice] = useState<string | null>(null);
  const [researchQuestionDraft, setResearchQuestionDraft] = useState(project.researchQuestion ?? "");
  const [objectivesDraft, setObjectivesDraft] = useState(project.objectives ?? "");
  const [questionObjectivesSaved, setQuestionObjectivesSaved] = useState(false);

  const relationships = buildEntityRelationships("project", project.id);

  function handleUnlink(entity: ContextEntityRef) {
    unlinkEntityFromProject(project.id, entity.kind, entity.id);
    refresh();
  }

  function handleSaveQuestionObjectives() {
    const updated = updateProject(project.id, {
      researchQuestion: researchQuestionDraft.trim() || undefined,
      objectives: objectivesDraft.trim() || undefined,
    });
    if (updated) {
      refresh();
      setQuestionObjectivesSaved(true);
      window.setTimeout(() => setQuestionObjectivesSaved(false), 3000);
    }
  }

  function handleToggleReport() {
    const readiness = deriveReportReadiness(project.id);
    if (!showReport && !readiness.canClaimReadiness) {
      setReportNotice(readiness.limitation);
      window.setTimeout(() => setReportNotice(null), 5000);
      return;
    }
    if (!showReport) {
      const updated = markProjectReportGenerated(project.id);
      if (updated) refresh();
    }
    setShowReport((current) => !current);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/my-work" className="text-xs text-teal-400 hover:text-teal-300">
            ← My Work
          </Link>
          <h1 className="cbai-display mt-2 text-2xl text-zinc-50">{project.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{project.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="rounded-md border border-zinc-800 px-2 py-0.5 uppercase tracking-wider">{translateProjectStatus(t, project.status)}</span>
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-zinc-800 px-2 py-0.5">
                {tag}
              </span>
            ))}
            {accountMode === "cloud" ? <SyncStatusBadge table="projects" localId={project.id} /> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SaveToWorkspaceButton entity={{ kind: "project", id: project.id, name: project.title }} />
          <ShareButton />
        </div>
      </div>

      <ContextualOperatorBanner projectId={project.id} />

      <ProjectGuidePanel project={project} />

      <ProjectDashboard project={project} />

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
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
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
            placeholder={t("projectHome.questionPlaceholder")}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveQuestionObjectives}
            className="rounded-md border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-medium text-teal-300 hover:border-teal-500/50"
          >
            {t("projectHome.saveQuestionObjectives")}
          </button>
          {questionObjectivesSaved ? (
            <ActivationStatusLine compact message={t("projectHome.questionSaved")} />
          ) : null}
          {accountMode === "cloud" ? <SyncStatusBadge table="projects" localId={project.id} /> : null}
        </div>
      </div>

      <div id="project-entities" className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>{t("projectHome.relatedEntities")}</p>
        <LinkEntityForm projectId={project.id} onLinked={() => refresh()} />
        <EntityRelatedPanel
          showHeading={false}
          relationships={relationships}
          emptyLabel={t("projectHome.entitiesEmpty")}
        />
        {entities.length > 0 ? (
          <div className="space-y-1.5 border-t border-zinc-800/80 pt-2">
            <p className="text-[10px] text-zinc-600">{t("projectHome.entitiesBookmarkNote")}</p>
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
                      className={`rounded-full px-1.5 py-0.5 ${pinned ? "text-teal-300" : "text-zinc-600 hover:text-teal-300"}`}
                    >
                      <span aria-hidden="true">{pinned ? "★" : "☆"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnlink(entity)}
                      aria-label={`Unlink ${entity.name}`}
                      title={`Unlink ${entity.name}`}
                      className="rounded-full px-1.5 py-0.5 text-zinc-600 hover:text-amber-400"
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

      <div id="project-evidence">
      <ProjectEvidencePanel
        projectId={project.id}
        relatedEntities={entities}
        onAdded={() => refresh()}
      />
      </div>

      <ProjectNotesPanel projectId={project.id} evidence={evidence} relatedEntities={entities} onAdded={refresh} />

      <div id="project-questions">
        <ProjectOpenQuestionsPanel projectId={project.id} onChange={refresh} />
      </div>

      <ProjectTasksPanel projectId={project.id} onChange={refresh} />

      <ProjectTimelinePanel project={project} />

      <div className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Bookmarks</p>
        {entities.filter((e) => isEntityPinned(e.kind, e.id)).length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {entities
              .filter((e) => isEntityPinned(e.kind, e.id))
              .map((e) => (
                <li key={`${e.kind}-${e.id}`} className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 text-xs text-teal-300">
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
        {reportNotice ? (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300/90" role="status">
            {reportNotice}
          </p>
        ) : null}
        <GenerateReportToggleButton showReport={showReport} onClick={handleToggleReport} />
        {showReport
          ? (() => {
              const report = buildEntityReport("project", project.id);
              return report ? <ProjectReportView report={report} /> : null;
            })()
          : null}
      </div>

      <div id="human-impact">
        <HumanImpactPanel projectId={project.id} onSaved={refresh} />
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Trust &amp; Methodology</p>
        <p className="text-xs text-zinc-500">
          CBAI provides evidence-based project intelligence. Every entity link, note, and evidence
          reference in this project was added by the user — never inferred or fabricated.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {METHODOLOGY_POINT_IDS.map((pointId) => (
            <div key={pointId} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
              <p className="text-xs font-medium text-zinc-300">{methodologyTitle(t, pointId)}</p>
              <p className="mt-1 text-[11px] text-zinc-500">{methodologyDetail(t, pointId)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
