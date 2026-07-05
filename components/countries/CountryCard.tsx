import type { Country } from "@/lib/countries";
import {
  getScoreColor,
  getScoreBarColor,
} from "@/lib/entity/entity.helpers";

type CountryCardProps = {
  country: Country;
  isSelected: boolean;
  onSelect: () => void;
};

export default function CountryCard({
  country,
  isSelected,
  onSelect,
}: CountryCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        isSelected
          ? "border-sky-500/40 bg-sky-500/5 ring-1 ring-sky-500/20"
          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 font-mono text-xs font-bold text-zinc-300">
            {country.code}
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-50">{country.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
              {country.region}
            </p>
          </div>
        </div>
        {isSelected && (
          <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400">
            Active
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            AI Ready
          </p>
          <p
            className={`mt-0.5 text-sm font-semibold ${getScoreColor(country.aiReadiness)}`}
          >
            {country.aiReadiness}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            Invest
          </p>
          <p
            className={`mt-0.5 text-sm font-semibold ${getScoreColor(country.investmentScore)}`}
          >
            {country.investmentScore}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            Risk
          </p>
          <p
            className={`mt-0.5 text-sm font-semibold ${getScoreColor(country.riskScore, true)}`}
          >
            {country.riskScore}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full ${getScoreBarColor(country.aiReadiness)}`}
            style={{ width: `${country.aiReadiness}%` }}
          />
        </div>
      </div>
    </button>
  );
}
