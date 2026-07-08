import type { ResearchNotebook } from "@/lib/research/notebook/notebook-types";
import {
  NOTEBOOK_CATALOG_ONLY_NOTICE,
  NOTEBOOK_HUMAN_REVIEW_NOTICE,
} from "@/lib/research/notebook/notebook-types";

type ResearchNotebookLimitationsProps = {
  notebook: ResearchNotebook;
};

export default function ResearchNotebookLimitations({
  notebook,
}: ResearchNotebookLimitationsProps) {
  const futureSection = notebook.summarySections.find(
    (section) => section.sectionId === "future_workspace_support",
  );

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Limitations
      </h4>

      <ul className="space-y-1.5">
        {notebook.limitations.slice(0, 5).map((limitation) => (
          <li key={limitation} className="flex items-start gap-2 text-[11px] text-zinc-500">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
            {limitation}
          </li>
        ))}
      </ul>

      {futureSection ? (
        <div className="border-t border-zinc-800/80 pt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Future workspace support
          </p>
          <p className="mt-1 text-xs text-zinc-500">{futureSection.content}</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {notebook.futureWorkspaceSupport.slice(0, 6).map((item) => (
              <li
                key={item}
                className="rounded-md border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-600"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-[11px] text-zinc-600">
        <p>{NOTEBOOK_CATALOG_ONLY_NOTICE}</p>
        <p className="mt-1">{NOTEBOOK_HUMAN_REVIEW_NOTICE}</p>
      </div>
    </div>
  );
}
