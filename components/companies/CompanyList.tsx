import type { Company } from "@/lib/companies";
import CompanyCard from "@/components/companies/CompanyCard";
import EmptyState from "@/components/shared/EmptyState";

type CompanyListProps = {
  companies: Company[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClearFilters?: () => void;
};

export default function CompanyList({
  companies,
  selectedId,
  onSelect,
  onClearFilters,
}: CompanyListProps) {
  if (companies.length === 0) {
    return (
      <EmptyState
        variant="dashed"
        message="No companies match your filters."
        action={
          onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex min-h-9 items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 text-xs font-medium text-cyan-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              Clear filters
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          isSelected={company.id === selectedId}
          onSelect={() => onSelect(company.id)}
        />
      ))}
    </div>
  );
}
