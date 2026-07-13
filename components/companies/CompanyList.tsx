import type { Company } from "@/lib/companies";
import CompanyCard from "@/components/companies/CompanyCard";
import EmptyState from "@/components/shared/EmptyState";

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
    return <EmptyState variant="dashed" message="No companies match your filters." />;
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
