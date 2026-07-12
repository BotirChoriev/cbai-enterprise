"use client";

import type { Project } from "@/lib/project/project-types";
import { buildEntityReport } from "@/lib/entity/entity-report";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ProjectTimelinePanelProps = {
  project: Project;
};

/**
 * Real Project Timeline — reuses the Report Engine's already-real event list
 * (buildEntityReport("project", id).timeline: project created, evidence added, notes written,
 * tasks added, report generated). No new engine, no fake events — an empty project has an empty
 * timeline, not a placeholder one.
 */
export default function ProjectTimelinePanel({ project }: ProjectTimelinePanelProps) {
  const report = buildEntityReport("project", project.id);
  const timeline = report?.timeline ?? [];

  return (
    <section id="project-timeline" aria-labelledby="project-timeline-heading" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <p className={cbaiSectionEyebrow} id="project-timeline-heading">
        Timeline
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
        <p className="text-xs text-zinc-600">
          No activity yet. As you add evidence, write notes, and generate a report, real events will appear here.
        </p>
      )}
    </section>
  );
}
