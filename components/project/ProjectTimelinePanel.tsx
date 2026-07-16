"use client";

import type { Project } from "@/lib/project/project-types";
import { buildEntityReport } from "@/lib/entity/entity-report";
import EmptyState from "@/components/shared/EmptyState";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type ProjectTimelinePanelProps = {
  project: Project;
};

export default function ProjectTimelinePanel({ project }: ProjectTimelinePanelProps) {
  const { t } = useTranslation();
  const report = buildEntityReport("project", project.id);
  const timeline = report?.timeline ?? [];

  return (
    <section id="project-timeline" aria-labelledby="project-timeline-heading" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <p className={cbaiSectionEyebrow} id="project-timeline-heading">
        {t("projectPanel.timelineEyebrow")}
      </p>
      {timeline.length > 0 ? (
        <ol className="space-y-2 border-l border-zinc-800 pl-3">
          {timeline.map((event) => (
            <li key={event.id} className="text-xs">
              <p className="text-zinc-300">{event.description}</p>
              <p className="text-[10px] text-zinc-600">{new Date(event.at).toLocaleString()}</p>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState variant="section" message={t("projectPanel.timelineEmpty")} />
      )}
    </section>
  );
}
