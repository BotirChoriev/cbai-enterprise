import Link from "next/link";
import {
  WORKSPACE_OVERVIEW_COPY,
  WORKSPACE_STATUS_LABELS,
  getResearchWorkspace,
} from "@/lib/research/workspace";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function WorkspaceOverview() {
  const workspace = getResearchWorkspace();

  return (
    <section aria-labelledby="workspace-overview-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Workspace foundation</p>
        <h2 id="workspace-overview-heading" className="text-2xl font-semibold text-zinc-100">
          {WORKSPACE_OVERVIEW_COPY.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
          {WORKSPACE_OVERVIEW_COPY.subtitle}
        </p>
      </div>

      <div className={`${cbaiGlassCard} space-y-4 p-6`}>
        <p className="text-sm leading-relaxed text-zinc-400">{WORKSPACE_OVERVIEW_COPY.description}</p>
        <p className="rounded-md border border-teal-500/15 bg-teal-500/5 px-3 py-2 text-xs text-zinc-500">
          {WORKSPACE_OVERVIEW_COPY.notice}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
            {WORKSPACE_STATUS_LABELS[workspace.status]}
          </span>
          <Link href="/research" className="text-teal-400 transition-colors hover:text-teal-300">
            Browse research topics →
          </Link>
        </div>
      </div>
    </section>
  );
}
