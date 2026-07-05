import type { Company } from "@/lib/companies";
import { getScoreColor } from "@/lib/entity/entity.helpers";

type CompanyListProps = {
  companies: Company[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function CompanyList({
  companies,
  selectedId,
  onSelect,
}: CompanyListProps) {
  if (companies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 px-5 py-12 text-center">
        <p className="text-sm text-zinc-500">No companies match your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {companies.map((company) => {
        const isSelected = company.id === selectedId;
        return (
          <button
            key={company.id}
            type="button"
            onClick={() => onSelect(company.id)}
            className={`w-full rounded-xl border p-3.5 text-left transition-all ${
              isSelected
                ? "border-sky-500/40 bg-sky-500/5 ring-1 ring-sky-500/20"
                : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 font-mono text-[10px] font-bold text-sky-400">
                {company.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-50">
                  {company.name}
                </p>
                <p className="truncate text-[10px] text-zinc-500">
                  {company.industry} · {company.country}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <ScorePill
                label="AI"
                value={company.aiReadiness}
              />
              <ScorePill
                label="Invest"
                value={company.investmentScore}
              />
              <ScorePill
                label="Risk"
                value={company.riskScore}
                inverted
              />
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
