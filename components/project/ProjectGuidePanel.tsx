"use client";

import Link from "next/link";
import type { Project } from "@/lib/project/project-types";
import { resolveProjectGuideStep } from "@/lib/project/project-guide";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ProjectGuidePanelProps = {
  project: Project;
};

/**
 * The Intelligence Guide's one real next step for this Project — never an order, never a
 * fabricated task. Rendered with deliberately soft language ("Suggested Next Step" / "Continue" /
 * "Available Action" / "Ready When You Are") — the mission's rule is never to say "must,"
 * "required," or "mandatory."
 */
export default function ProjectGuidePanel({ project }: ProjectGuidePanelProps) {
  const step = resolveProjectGuideStep(project);
  const isReady = step.id === "ready";

  return (
    <section
      aria-labelledby="project-guide-heading"
      className={`${cbaiGlassCard} space-y-2 border-cyan-500/15 p-4`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cbaiSectionEyebrow} id="project-guide-heading">
          {isReady ? "Ready When You Are" : "Suggested Next Step"}
        </p>
        {!isReady ? (
          <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
            Available Action
          </span>
        ) : null}
      </div>
      <p className="text-sm font-medium text-zinc-100">{step.suggestion}</p>
      <p className="text-xs text-zinc-500">{step.detail}</p>
      {!isReady ? (
        <Link
          href={step.href}
          className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
        >
          Continue →
        </Link>
      ) : null}
    </section>
  );
}
