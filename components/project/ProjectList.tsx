"use client";

import Link from "next/link";
import { loadProjects, loadProjectEvidence, loadProjectNotes } from "@/lib/project/project-store";
import type { Project } from "@/lib/project/project-types";
import { resolveProjectGuideStep } from "@/lib/project/project-guide";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import { useTranslation } from "@/lib/i18n/use-translation";
import { translateProjectTypeLabel, translateProjectStatus } from "@/lib/i18n/project-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import EmptyState from "@/components/shared/EmptyState";
import { useMissionDataRevision } from "@/lib/hooks/use-mission-data-revision";

/**
 * My Work, Project-first: Recent Projects (every real project, most recently updated first) and
 * Pinned Projects (via the same pinEntity/SaveToWorkspaceButton architecture every other entity
 * kind already uses). Honestly empty until the user creates the first project.
 *
 * Real hydration-mismatch fix (found via actual browser testing): loadProjects() is honestly
 * empty on the server, so a plain useState(() => loadProjects()) lazy initializer rendered the
 * empty state server-side but the real project list client-side — a genuine, guaranteed structural
 * mismatch for any returning user with 1+ saved projects. Gated on useHydrated() so the server and
 * the client's first render match exactly; the real list appears in the very next commit.
 */
export default function ProjectList() {
  const hydrated = useHydrated();
  useMissionDataRevision();
  const projects = hydrated ? loadProjects() : [];
  const { context } = usePlatformContext();
  const { t } = useTranslation();
  const pinnedProjectIds = new Set(
    context.pinnedEntities.filter((e) => e.kind === "project").map((e) => e.id),
  );

  if (projects.length === 0) {
    return (
      <EmptyState
        title={t("project.catalog.recentProjects")}
        message={t("project.catalog.noProjectsCreatedYet")}
      />
    );
  }

  const pinned = projects.filter((p) => pinnedProjectIds.has(p.id));

  return (
    <div className="space-y-4">
      {pinned.length > 0 ? (
        <section aria-labelledby="my-work-pinned-projects-heading" className="space-y-2">
          <p className={cbaiSectionEyebrow} id="my-work-pinned-projects-heading">
            {t("project.catalog.pinnedProjects")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {pinned.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="my-work-recent-projects-heading" className="space-y-2">
        <p className={cbaiSectionEyebrow} id="my-work-recent-projects-heading">
          {t("project.catalog.recentProjects")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Project, Project-first (Intelligence Guide Activation mission): Current status, Suggested next
 * step, Last activity, and a Continue button — the "Continue" link goes straight to the Guide's
 * real next-step anchor, not just the project's home, reusing resolveProjectGuideStep rather than
 * a second suggestion mechanism.
 */
function ProjectCard({ project }: { project: Project }) {
  useMissionDataRevision();
  const step = resolveProjectGuideStep(project);
  const { t } = useTranslation();
  const evidenceCount = loadProjectEvidence(project.id).length;
  const notesCount = loadProjectNotes(project.id).length;
  const liveSignals = [
    evidenceCount > 0 ? t("activation.projectEvidenceCount", { count: String(evidenceCount) }) : null,
    notesCount > 0 ? t("activation.projectNotesCount", { count: String(notesCount) }) : null,
    project.reportGeneratedAt ? t("activation.projectReportReady") : null,
  ].filter(Boolean);

  return (
    <div className={`${cbaiGlassCard} space-y-2 p-4`}>
      <div className="flex items-start justify-between gap-2">
        <Link href={`/my-work?project=${project.id}`} className="text-sm font-semibold text-teal-400 hover:text-teal-300">
          {project.title}
        </Link>
        <SaveToWorkspaceButton entity={{ kind: "project", id: project.id, name: project.title }} className="shrink-0" />
      </div>
      <p className="text-xs text-zinc-500">
        {translateProjectTypeLabel(t, project.type)} · {translateProjectStatus(t, project.status)}
      </p>
      {liveSignals.length > 0 ? (
        <p className="text-[11px] text-zinc-500" role="status">
          {liveSignals.join(" · ")}
        </p>
      ) : null}
      <p className="text-xs text-zinc-400">
        <span className="text-zinc-600">{t("project.catalog.suggestedNextStep")}</span> {step.suggestion}
      </p>
      <div className="flex items-center justify-between gap-2 border-t border-zinc-800/80 pt-2">
        <p className="text-[11px] text-zinc-600">{t("project.lastActivity")}: {new Date(project.updatedAt).toLocaleString()}</p>
        <Link href={step.href} className="shrink-0 text-xs font-medium text-teal-400 hover:text-teal-300">
          {t("project.catalog.continueAction")} →
        </Link>
      </div>
    </div>
  );
}
