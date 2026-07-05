"use client";

import type { DecisionNode, DecisionOutcome } from "@/lib/reasoning/reasoning.types";

type DecisionTreeProps = {
  tree: DecisionNode | null;
  visible: boolean;
};

const OUTCOME_STYLES: Record<
  DecisionOutcome,
  { border: string; bg: string; text: string; dot: string }
> = {
  selected: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  rejected: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    text: "text-red-400",
    dot: "bg-red-400",
  },
  neutral: {
    border: "border-zinc-700",
    bg: "bg-zinc-900/50",
    text: "text-zinc-400",
    dot: "bg-zinc-500",
  },
};

export default function DecisionTree({ tree, visible }: DecisionTreeProps) {
  if (!visible || !tree) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="text-sm font-semibold text-zinc-50">Decision Tree</h3>
        <p className="mt-2 text-xs text-zinc-500">
          Decision paths appear after the Decision stage completes.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-50">Decision Tree</h3>
        <p className="text-[10px] text-zinc-600">
          Evaluated reasoning paths and outcomes
        </p>
      </div>

      <div className="overflow-x-auto p-4">
        <DecisionNodeView node={tree} depth={0} />
      </div>
    </div>
  );
}

function DecisionNodeView({
  node,
  depth,
}: {
  node: DecisionNode;
  depth: number;
}) {
  const outcome = node.outcome ?? "neutral";
  const styles = OUTCOME_STYLES[outcome];

  return (
    <div className={depth > 0 ? "ml-4 border-l border-zinc-800 pl-4" : ""}>
      <div
        className={`mb-2 rounded-lg border px-3 py-2.5 ${styles.border} ${styles.bg}`}
      >
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`} />
          <span className={`text-xs font-medium ${styles.text}`}>
            {node.label}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">{node.description}</p>
      </div>

      {node.children?.map((child) => (
        <DecisionNodeView key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}
