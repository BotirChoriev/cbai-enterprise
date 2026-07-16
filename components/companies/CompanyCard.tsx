import type { Company } from "@/lib/companies";
import { getCompanyLinkedEntities } from "@/lib/companies.adapter";
import {
  buildCompanyIntelligenceProfile,
  resolveCompanyListEvidenceLabel,
  companyEvidenceStatusClass,
} from "@/lib/companies.intelligence";

type CompanyCardProps = {
  company: Company;
  isSelected: boolean;
  onSelect: () => void;
};

export default function CompanyCard({
  company,
  isSelected,
  onSelect,
}: CompanyCardProps) {
  const profile = buildCompanyIntelligenceProfile(
    company,
    getCompanyLinkedEntities(company),
  );
  const evidenceLabel = resolveCompanyListEvidenceLabel(profile);
  const evidenceClass = companyEvidenceStatusClass(
    profile.referenceConnected ? "connected" : "insufficient",
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        isSelected
          ? "border-teal-500/40 bg-teal-500/5 ring-1 ring-teal-500/20"
          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 font-mono text-[10px] font-bold text-teal-400">
            {company.icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-50">{company.name}</p>
            <p className="text-[10px] text-zinc-500">
              {company.industry} · {company.country}
            </p>
          </div>
        </div>
        {isSelected ? (
          <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-400">
            Selected
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs text-zinc-500">Founded {company.founded}</p>
        <span
          className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${evidenceClass}`}
        >
          {evidenceLabel}
        </span>
      </div>
    </button>
  );
}
