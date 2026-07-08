import {
  RESEARCH_GRAPH_NODE_TYPE_LABELS,
  RESEARCH_GRAPH_STATUS_LABELS,
  type ResearchGraphNodeType,
  type ResearchGraphStatus,
} from "@/lib/research/graph/research-graph-types";

const NODE_TYPES: ResearchGraphNodeType[] = [
  "research_topic",
  "domain",
  "method",
  "evidence_type",
  "future_object",
];

const STATUSES: ResearchGraphStatus[] = [
  "catalog_available",
  "not_connected_yet",
  "future_workspace",
];

function statusDotClass(status: ResearchGraphStatus): string {
  switch (status) {
    case "catalog_available":
      return "bg-emerald-400";
    case "not_connected_yet":
      return "bg-zinc-500";
    case "future_workspace":
      return "bg-cyan-400";
  }
}

export default function ResearchGraphLegend() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Node types</p>
        <ul className="mt-2 space-y-1">
          {NODE_TYPES.map((nodeType) => (
            <li key={nodeType} className="text-xs text-zinc-500">
              {RESEARCH_GRAPH_NODE_TYPE_LABELS[nodeType]}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Status</p>
        <ul className="mt-2 space-y-1.5">
          {STATUSES.map((status) => (
            <li key={status} className="flex items-center gap-2 text-xs text-zinc-500">
              <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(status)}`} />
              {RESEARCH_GRAPH_STATUS_LABELS[status]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
