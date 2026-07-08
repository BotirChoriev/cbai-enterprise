import type { ResearchNotebook } from "@/lib/research/notebook/notebook-types";

type ResearchNotebookEvidenceProps = {
  notebook: ResearchNotebook;
};

export default function ResearchNotebookEvidence({ notebook }: ResearchNotebookEvidenceProps) {
  const methodsSection = notebook.summarySections.find(
    (section) => section.sectionId === "methods_to_review",
  );

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Evidence focus
      </h4>

      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          Evidence types to connect
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {notebook.evidenceFocus.map((evidence) => (
            <li
              key={evidence}
              className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2 py-0.5 text-[11px] text-zinc-400"
            >
              {evidence}
            </li>
          ))}
        </ul>
      </div>

      {methodsSection && methodsSection.items.length > 0 ? (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Methods to review
          </p>
          <p className="mt-1 text-xs text-zinc-500">{methodsSection.items.join(" · ")}</p>
        </div>
      ) : null}

      {notebook.graphConnections.length > 0 ? (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Catalog graph connections
          </p>
          <ul className="mt-2 space-y-1">
            {notebook.graphConnections.slice(0, 4).map((connection) => (
              <li key={`${connection.label}:${connection.connectionType}`} className="text-[11px] text-zinc-500">
                {connection.label}{" "}
                <span className="text-zinc-600">({connection.connectionType})</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
