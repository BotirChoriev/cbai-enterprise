import type { WorkspaceSourceItem } from "@/lib/workspaces";
import { displayStatusLabel, workspaceStatusClass } from "@/lib/workspaces";

type WorkspaceSourceCoverageProps = {
  heading?: string;
  description?: string;
  sources: readonly WorkspaceSourceItem[];
  headingId?: string;
};

export default function WorkspaceSourceCoverage({
  heading = "Source Coverage",
  description = "Official evidence sources from CBAI Evidence Infrastructure — connection status only.",
  sources,
  headingId = "workspace-source-coverage-heading",
}: WorkspaceSourceCoverageProps) {
  return (
    <section className="space-y-4" aria-labelledby={headingId}>
      <div>
        <h2
          id={headingId}
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          {heading}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <ul className="divide-y divide-zinc-800">
          {sources.map((source) => (
            <li
              key={source.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-100">{source.name}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{source.organization}</p>
                <p className="mt-1 text-xs text-zinc-600">{source.coverage}</p>
              </div>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${workspaceStatusClass(source.statusLabel)}`}
              >
                {displayStatusLabel(source.statusLabel)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
