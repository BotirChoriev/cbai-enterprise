import Link from "next/link";
import type { ResearchGraphNode } from "@/lib/research/graph/research-graph-types";
import {
  RESEARCH_GRAPH_NODE_TYPE_LABELS,
  RESEARCH_GRAPH_STATUS_LABELS,
} from "@/lib/research/graph/research-graph-types";

function statusClass(status: ResearchGraphNode["status"]): string {
  switch (status) {
    case "catalog_available":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "not_connected_yet":
      return "border-zinc-700 bg-zinc-900/60 text-zinc-400";
    case "future_workspace":
      return "border-cyan-500/25 bg-cyan-500/5 text-cyan-300";
  }
}

type ResearchGraphNodeCardProps = {
  node: ResearchGraphNode;
  focused?: boolean;
  compact?: boolean;
};

export default function ResearchGraphNodeCard({
  node,
  focused = false,
  compact = false,
}: ResearchGraphNodeCardProps) {
  const content = (
    <div
      className={`rounded-lg border px-3 py-2 ${statusClass(node.status)} ${
        focused ? "ring-1 ring-cyan-400/40" : ""
      } ${compact ? "text-xs" : "text-sm"}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {RESEARCH_GRAPH_NODE_TYPE_LABELS[node.nodeType]}
      </p>
      <p className={`mt-0.5 font-medium text-zinc-100 ${compact ? "text-xs" : "text-sm"}`}>
        {node.label}
      </p>
      {!compact ? (
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500">
          {node.description}
        </p>
      ) : null}
      <p className="mt-1 text-[10px] text-zinc-600">
        {RESEARCH_GRAPH_STATUS_LABELS[node.status]}
      </p>
    </div>
  );

  if (node.href) {
    return (
      <Link href={node.href} className="block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
