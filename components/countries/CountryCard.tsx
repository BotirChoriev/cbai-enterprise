import type { Country } from "@/lib/countries";
import {
  buildCountryIntelligenceProfile,
  resolveCountryListEvidenceLabel,
  countryEvidenceStatusClass,
} from "@/lib/countries.intelligence";
import { getCountryRelationships } from "@/lib/countries.adapter";

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
  const profile = buildCountryIntelligenceProfile(
    country,
    getCountryRelationships(country),
  );
  const evidenceLabel = resolveCountryListEvidenceLabel(profile);
  const evidenceClass = countryEvidenceStatusClass(
    profile.entityProfileConnected ? "connected" : "insufficient",
  );

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
            Selected
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs text-zinc-500">Capital: {country.capital}</p>
        <span
          className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${evidenceClass}`}
        >
          {evidenceLabel}
        </span>
      </div>
    </button>
  );
}
