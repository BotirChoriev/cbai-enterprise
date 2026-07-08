import type { ResearchNotebook } from "@/lib/research/notebook/notebook-types";
import { NOTEBOOK_STATUS_LABELS } from "@/lib/research/notebook/notebook-types";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type ResearchNotebookSummaryProps = {
  notebook: ResearchNotebook;
};

export default function ResearchNotebookSummary({ notebook }: ResearchNotebookSummaryProps) {
  const overview = notebook.summarySections.find(
    (section) => section.sectionId === "topic_overview",
  );
  const catalogInfo = notebook.summarySections.find(
    (section) => section.sectionId === "available_catalog_information",
  );

  return (
    <div className={`${cbaiGlassCard} space-y-3 p-4`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-cyan-400/90">
            {notebook.domain}
          </p>
          <h3 className="text-base font-semibold text-zinc-100">{notebook.topicName}</h3>
        </div>
        <span className="rounded-md border border-zinc-700 bg-zinc-900/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          {NOTEBOOK_STATUS_LABELS[notebook.status]}
        </span>
      </div>

      {overview ? (
        <p className="text-sm leading-relaxed text-zinc-400">{overview.content}</p>
      ) : null}

      {catalogInfo ? (
        <ul className="space-y-1">
          {catalogInfo.items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-zinc-500">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400/80" />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
