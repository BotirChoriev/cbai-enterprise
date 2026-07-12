"use client";

import type { Project } from "@/lib/project/project-types";
import { deriveProjectHealth } from "@/lib/project/project-health";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ProjectHealthPanelProps = {
  project: Project;
};

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

/**
 * Project Health — eight real signals, never a fabricated score or percentage (Intelligence Guide
 * Activation mission). Every value is a pass-through of already-real, already-persisted state via
 * deriveProjectHealth.
 */
export default function ProjectHealthPanel({ project }: ProjectHealthPanelProps) {
  const health = deriveProjectHealth(project);

  return (
    <section aria-labelledby="project-health-heading" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <div>
        <p className={cbaiSectionEyebrow} id="project-health-heading">
          Project Health
        </p>
        <p className="mt-1 text-[11px] text-zinc-600">Real signals only — never a fabricated score or percentage.</p>
      </div>
      <div className="space-y-1.5">
        <HealthRow label="Research question" achieved={health.questionExists} detail={health.questionExists ? "Defined" : "Not yet defined"} />
        <HealthRow label="Objectives" achieved={health.objectivesExist} detail={health.objectivesExist ? "Defined" : "Not yet defined"} />
        <HealthRow label="Evidence" achieved={health.evidenceCount > 0} detail={`${health.evidenceCount} added`} />
        <HealthRow label="Notes" achieved={health.notesCount > 0} detail={`${health.notesCount} added`} />
        <HealthRow label="Related entities" achieved={health.entityLinksCount > 0} detail={`${health.entityLinksCount} linked`} />
        <HealthRow label="Report" achieved={health.reportGenerated} detail={health.reportGenerated ? "Generated" : "Not generated yet"} />
        <HealthRow label="Tasks" achieved={health.tasksCount > 0} detail={`${health.tasksDoneCount}/${health.tasksCount} done`} />
        <HealthRow label="Open questions" achieved={health.openQuestionsCount === 0} detail={`${health.openQuestionsCount} open`} />
      </div>
    </section>
  );
}
