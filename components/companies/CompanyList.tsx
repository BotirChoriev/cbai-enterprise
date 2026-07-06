import type { Company } from "@/lib/companies";
import CompanyCard from "@/components/companies/CompanyCard";

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
