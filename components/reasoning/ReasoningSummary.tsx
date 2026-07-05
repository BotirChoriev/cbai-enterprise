"use client";

import type { ReasoningSummary, ReasoningResult } from "@/lib/reasoning/reasoning.types";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";
import { getEntityHref } from "@/lib/global-search";
import { entityTypeIconPaths } from "@/lib/entity/entity.icons";
import EntityIcon from "@/components/entity/EntityIcon";
import Link from "next/link";

type ReasoningSummaryProps = {
  summary: ReasoningSummary | null;
  finalAnswer: string;
  result: ReasoningResult | null;
  visible: boolean;
};

export default function ReasoningSummaryPanel({
  summary,
  finalAnswer,
  result,
  visible,
}: ReasoningSummaryProps) {
  if (!visible || !summary || !result) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="text-sm font-semibold text-zinc-50">Reasoning Summary</h3>
        <p className="mt-2 text-xs text-zinc-500">
          Final answer and summary appear when reasoning completes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-zinc-950 p-5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-violet-400">
          Final Answer
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-200">
          {finalAnswer}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="text-sm font-semibold text-zinc-50">{summary.headline}</h3>

        {summary.keyFindings.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
              Key Findings
            </p>
            <ul className="space-y-1">
              {summary.keyFindings.map((finding) => (
                <li
                  key={finding}
                  className="flex items-start gap-2 text-xs text-zinc-400"
                >
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-sky-400" />
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        {summary.recommendedActions.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
              Recommended Actions
            </p>
            <ul className="space-y-1">
              {summary.recommendedActions.map((action) => (
                <li
                  key={action}
                  className="flex items-start gap-2 text-xs text-zinc-400"
                >
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {summary.caveats.length > 0 && (
          <div className="mt-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
            {summary.caveats.map((caveat) => (
              <p key={caveat} className="text-[10px] text-zinc-600">
                {caveat}
              </p>
            ))}
          </div>
        )}
      </div>

      {result.sourceEntities.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
            Source Entities ({result.sourceEntities.length})
          </p>
          <div className="space-y-1.5">
            {result.sourceEntities.map((entity) => {
              const iconPath =
                entity.icon ?? entityTypeIconPaths[entity.type];
              return (
                <Link
                  key={entity.id}
                  href={`${getEntityHref(entity)}?id=${entity.id}`}
                  className="flex items-center gap-2 rounded-lg bg-zinc-900/60 px-2.5 py-2 transition-colors hover:bg-zinc-900"
                >
                  <EntityIcon path={iconPath} className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="truncate text-xs text-zinc-300">
                    {entity.name}
                  </span>
                  <span className="ml-auto text-[9px] text-zinc-600">
                    {getEntityTypeLabel(entity.type)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {result.graphConnections.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
            Graph Paths ({result.graphConnections.length})
          </p>
          <div className="space-y-1">
            {result.graphConnections.slice(0, 5).map((conn) => (
              <p
                key={`${conn.fromEntity}-${conn.toEntity}-${conn.edgeType}`}
                className="font-mono text-[10px] text-zinc-500"
              >
                {conn.fromEntity}{" "}
                <span className="text-violet-400">—{conn.label}→</span>{" "}
                {conn.toEntity}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
