import type { WorkspaceKnowledgeSummary } from "@/lib/research/workspace/workspace-explorer";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type WorkspaceKnowledgeSummaryProps = {
  summary: WorkspaceKnowledgeSummary;
};

export default function WorkspaceKnowledgeSummary({ summary }: WorkspaceKnowledgeSummaryProps) {
  return (
    <section aria-labelledby="workspace-knowledge-summary-heading" className="space-y-3">
      <h2 id="workspace-knowledge-summary-heading" className="text-sm font-semibold text-zinc-100">
        Knowledge Summary
      </h2>
      <div className={`${cbaiGlassCard} grid gap-4 p-4 sm:grid-cols-2`}>
        <div className="sm:col-span-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Topic</p>
          <p className="mt-1 text-sm font-medium text-zinc-200">{summary.topicName}</p>
          <p className="mt-1 text-xs text-zinc-500">{summary.description}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Domain</p>
          <p className="mt-1 text-xs text-zinc-400">{summary.domain}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Methods</p>
          <p className="mt-1 text-xs text-zinc-400">{summary.methods.join(" · ")}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Evidence types
          </p>
          <p className="mt-1 text-xs text-zinc-400">{summary.evidenceTypes.join(" · ")}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Open question categories
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {summary.openQuestionCategories.length > 0
              ? summary.openQuestionCategories.join(" · ")
              : "Generic categories — not connected yet"}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Future research objects
          </p>
          <p className="mt-1 text-xs text-zinc-500">{summary.futureObjects.join(" · ")}</p>
        </div>
      </div>
    </section>
  );
}
