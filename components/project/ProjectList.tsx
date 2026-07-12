"use client";

import { useState } from "react";
import Link from "next/link";
import { loadProjects } from "@/lib/project/project-store";
import { PROJECT_STATUS_LABELS, PROJECT_TYPES } from "@/lib/project/project-types";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

function typeLabel(id: string): string {
  return PROJECT_TYPES.find((t) => t.id === id)?.label ?? id;
}

/**
 * My Work, Project-first: Recent Projects (every real project, most recently updated first) and
 * Pinned Projects (via the same pinEntity/SaveToWorkspaceButton architecture every other entity
 * kind already uses). Honestly empty until the user creates the first project.
 */
export default function ProjectList() {
  const [projects] = useState(() => loadProjects());
  const { context } = usePlatformContext();
  const pinnedProjectIds = new Set(
    context.pinnedEntities.filter((e) => e.kind === "project").map((e) => e.id),
  );

  if (projects.length === 0) {
    return (
      <section aria-labelledby="my-work-projects-heading" className={`${cbaiGlassCard} space-y-2 p-5`}>
        <p className={cbaiSectionEyebrow} id="my-work-projects-heading">
          Recent Projects
        </p>
        <p className="text-xs text-zinc-500">
          No projects created yet — no fabricated activity. Create the first one above.
        </p>
      </section>
    );
  }

  const pinned = projects.filter((p) => pinnedProjectIds.has(p.id));

  return (
    <div className="space-y-4">
      {pinned.length > 0 ? (
        <section aria-labelledby="my-work-pinned-projects-heading" className="space-y-2">
          <p className={cbaiSectionEyebrow} id="my-work-pinned-projects-heading">
            Pinned Projects
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {pinned.map((project) => (
              <ProjectCard key={project.id} projectId={project.id} title={project.title} typeId={project.type} status={project.status} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="my-work-recent-projects-heading" className="space-y-2">
        <p className={cbaiSectionEyebrow} id="my-work-recent-projects-heading">
          Recent Projects
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} projectId={project.id} title={project.title} typeId={project.type} status={project.status} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProjectCard({ projectId, title, typeId, status }: { projectId: string; title: string; typeId: string; status: string }) {
  return (
    <div className={`${cbaiGlassCard} space-y-2 p-4`}>
      <div className="flex items-start justify-between gap-2">
        <Link href={`/my-work?project=${projectId}`} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">
          {title}
        </Link>
        <SaveToWorkspaceButton entity={{ kind: "project", id: projectId, name: title }} className="shrink-0" />
      </div>
      <p className="text-xs text-zinc-500">
        {typeLabel(typeId)} · {PROJECT_STATUS_LABELS[status as keyof typeof PROJECT_STATUS_LABELS] ?? status}
      </p>
    </div>
  );
}
