"use client";

import type { SearchFilters, EntityTypeFilter } from "@/lib/global-search";
import {
  DEFAULT_SEARCH_FILTERS,
  SEARCHABLE_ENTITY_TYPES,
  getEntityCounts,
} from "@/lib/global-search";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";

type SearchFiltersProps = {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
};

const counts = getEntityCounts();

export default function SearchFiltersPanel({
  filters,
  onChange,
}: SearchFiltersProps) {
  function update(partial: Partial<SearchFilters>) {
    onChange({ ...filters, ...partial });
  }

  function reset() {
    onChange(DEFAULT_SEARCH_FILTERS);
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-50">Filters</h3>
        <button
          type="button"
          onClick={reset}
          className="text-[10px] font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
          Reset
        </button>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Entity Type
        </p>
        <div className="space-y-1">
          <FilterOption
            label="All Entities"
            count={counts.all}
            active={filters.entityType === "all"}
            onClick={() => update({ entityType: "all" })}
          />
          {SEARCHABLE_ENTITY_TYPES.map((type) => (
            <FilterOption
              key={type}
              label={getEntityTypeLabel(type)}
              count={counts[type]}
              active={filters.entityType === type}
              onClick={() => update({ entityType: type as EntityTypeFilter })}
            />
          ))}
        </div>
      </div>

      <ScoreSlider
        label="Min AI Score"
        value={filters.minAiScore}
        onChange={(v) => update({ minAiScore: v })}
        color="text-sky-400"
      />

      <ScoreSlider
        label="Min Investment Score"
        value={filters.minInvestmentScore}
        onChange={(v) => update({ minInvestmentScore: v })}
        color="text-emerald-400"
      />

      <ScoreSlider
        label="Max Risk Score"
        value={filters.maxRiskScore}
        onChange={(v) => update({ maxRiskScore: v })}
        color="text-amber-400"
        inverted
      />
    </div>
  );
}

function FilterOption({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        active
          ? "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
      }`}
    >
      <span>{label}</span>
      <span className="font-mono text-[10px] text-zinc-600">{count}</span>
    </button>
  );
}

function ScoreSlider({
  label,
  value,
  onChange,
  color,
  inverted = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  inverted?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          {label}
        </p>
        <span className={`font-mono text-xs font-semibold ${color}`}>
          {inverted ? `≤ ${value}` : `≥ ${value}`}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-sky-500"
      />
    </div>
  );
}
