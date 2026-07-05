"use client";

import type { EvidenceItem } from "@/lib/reasoning/reasoning.types";
import { getEntityTypeLabel, getScoreColor } from "@/lib/entity/entity.helpers";
import { entityTypeIconPaths } from "@/lib/entity/entity.icons";
import EntityIcon from "@/components/entity/EntityIcon";

type EvidencePanelProps = {
  evidence: EvidenceItem[];
  visible: boolean;
};

const SOURCE_LABELS: Record<EvidenceItem["source"], string> = {
  search: "Global Search",
  "knowledge-graph": "Knowledge Graph",
  "entity-profile": "Entity Profile",
};

const SOURCE_COLORS: Record<EvidenceItem["source"], string> = {
  search: "#38bdf8",
  "knowledge-graph": "#a78bfa",
  "entity-profile": "#34d399",
};

export default function EvidencePanel({ evidence, visible }: EvidencePanelProps) {
  if (!visible || evidence.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="text-sm font-semibold text-zinc-50">Evidence</h3>
        <p className="mt-2 text-xs text-zinc-500">
          Evidence cards appear after the Evidence pipeline stage completes.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-50">Evidence</h3>
        <p className="text-[10px] text-zinc-600">
          {evidence.length} items ranked by relevance
        </p>
      </div>

      <div className="max-h-[400px] space-y-2 overflow-y-auto p-3">
        {evidence.map((item) => (
          <EvidenceCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function EvidenceCard({ item }: { item: EvidenceItem }) {
  const sourceColor = SOURCE_COLORS[item.source];
  const iconPath =
    item.entity.icon ?? entityTypeIconPaths[item.entity.type];

  return (
    <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700">
      <div className="flex items-start gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ color: sourceColor, backgroundColor: `${sourceColor}18` }}
        >
          <EntityIcon path={iconPath} className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-xs font-medium text-zinc-200">
              {item.entity.name}
            </span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
              style={{
                color: sourceColor,
                backgroundColor: `${sourceColor}18`,
              }}
            >
              {SOURCE_LABELS[item.source]}
            </span>
            {item.relationshipLabel && (
              <span className="text-[9px] text-zinc-600">
                {item.relationshipLabel}
              </span>
            )}
          </div>

          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
            {item.excerpt}
          </p>

          <div className="mt-2 flex items-center gap-3">
            <span className="text-[9px] text-zinc-600">
              {getEntityTypeLabel(item.entity.type)}
            </span>
            <span
              className="font-mono text-[10px] font-medium"
              style={{ color: getScoreColor(item.relevance) }}
            >
              {item.relevance}% relevant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
