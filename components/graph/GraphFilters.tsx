"use client";

import type { GraphNodeFilter, GraphStats } from "@/lib/graph/graph.types";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";

type GraphFiltersProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: GraphNodeFilter;
  onTypeFilterChange: (filter: GraphNodeFilter) => void;
  stats: GraphStats;
  onClearSelection: () => void;
  hasSelection: boolean;
};

const TYPE_OPTIONS: { value: GraphNodeFilter; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "country", label: "Countries" },
  { value: "company", label: "Companies" },
  { value: "university", label: "Universities" },
];

export default function GraphFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  stats,
  onClearSelection,
  hasSelection,
}: GraphFiltersProps) {
  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-50">Graph Controls</h3>
        {hasSelection && (
          <button
            type="button"
            onClick={onClearSelection}
            className="text-[10px] font-medium text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Clear
          </button>
        )}
      </div>

      <div>
        <label
          htmlFor="graph-search"
          className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-zinc-600"
        >
          Search Nodes
        </label>
        <input
          id="graph-search"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search entities…"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
        />
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Node Type
        </p>
        <div className="space-y-1">
          {TYPE_OPTIONS.map((opt) => {
            const count =
              opt.value === "all"
                ? stats.totalNodes
                : opt.value === "country"
                  ? stats.countryCount
                  : opt.value === "company"
                    ? stats.companyCount
                    : stats.universityCount;
            const active = typeFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onTypeFilterChange(opt.value)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                  active
                    ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/30"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <span>
                  {opt.value === "all"
                    ? opt.label
                    : getEntityTypeLabel(opt.value)}
                </span>
                <span className="font-mono text-[10px] text-zinc-600">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Entity Statistics
        </p>
        <dl className="grid grid-cols-2 gap-2">
          <StatItem label="Nodes" value={stats.totalNodes} />
          <StatItem label="Edges" value={stats.totalEdges} />
          <StatItem label="Countries" value={stats.countryCount} />
          <StatItem label="Companies" value={stats.companyCount} />
          <StatItem label="Universities" value={stats.universityCount} />
          <StatItem
            label="Avg Links"
            value={
              stats.totalNodes > 0
                ? Math.round((stats.totalEdges * 2) / stats.totalNodes)
                : 0
            }
          />
        </dl>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-zinc-900/60 px-2.5 py-2">
      <dt className="text-[9px] uppercase tracking-wider text-zinc-600">
        {label}
      </dt>
      <dd className="font-mono text-sm font-semibold text-zinc-200">
        {value}
      </dd>
    </div>
  );
}
