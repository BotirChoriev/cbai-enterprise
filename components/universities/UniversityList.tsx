import type { University } from "@/lib/universities";
import { getScoreColor } from "@/lib/entity/entity.helpers";

type UniversityListProps = {
  universities: University[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function UniversityList({
  universities,
  selectedId,
  onSelect,
}: UniversityListProps) {
  if (universities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 px-5 py-12 text-center">
        <p className="text-sm text-zinc-500">
          No universities match your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {universities.map((university) => {
        const isSelected = university.id === selectedId;
        return (
          <button
            key={university.id}
            type="button"
            onClick={() => onSelect(university.id)}
            className={`w-full rounded-xl border p-3.5 text-left transition-all ${
              isSelected
                ? "border-violet-500/40 bg-violet-500/5 ring-1 ring-violet-500/20"
                : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 font-mono text-[10px] font-bold text-violet-400">
                {university.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-50">
                  {university.name}
                </p>
                <p className="truncate text-[10px] text-zinc-500">
                  {university.type} · {university.country}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-zinc-600">
                #{university.ranking}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <ScorePill label="AI" value={university.aiReadiness} />
              <ScorePill label="Invest" value={university.investmentScore} />
              <ScorePill label="Risk" value={university.riskScore} inverted />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ScorePill({
  label,
  value,
  inverted = false,
}: {
  label: string;
  value: number;
  inverted?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="text-[9px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p
        className={`text-xs font-semibold ${getScoreColor(value, inverted)}`}
      >
        {value}
      </p>
    </div>
  );
}
