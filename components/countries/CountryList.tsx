import type { Country } from "@/lib/countries";
import CountryCard from "@/components/countries/CountryCard";
import EmptyState from "@/components/shared/EmptyState";

type CountryListProps = {
  countries: Country[];
  selectedId: string;
  onSelect: (id: string) => void;
  comparisonIds?: readonly string[];
  onToggleComparison?: (id: string) => void;
  onClearFilters?: () => void;
  emptyMessage: string;
  clearFiltersLabel: string;
};

export default function CountryList({
  countries,
  selectedId,
  onSelect,
  comparisonIds = [],
  onToggleComparison,
  onClearFilters,
  emptyMessage,
  clearFiltersLabel,
}: CountryListProps) {
  if (countries.length === 0) {
    return (
      <EmptyState
        variant="dashed"
        message={emptyMessage}
        action={
          onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex min-h-11 items-center rounded-lg border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-3.5 text-xs font-medium text-teal-700 transition-colors hover:border-teal-500/40 dark:text-teal-300"
            >
              {clearFiltersLabel}
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-1 xl:grid-cols-1" data-cbai-country-directory="">
      {countries.map((country) => (
        <CountryCard
          key={country.id}
          country={country}
          isSelected={country.id === selectedId}
          onSelect={() => onSelect(country.id)}
          comparisonSelected={comparisonIds.includes(country.id)}
          onToggleComparison={
            onToggleComparison ? () => onToggleComparison(country.id) : undefined
          }
        />
      ))}
    </div>
  );
}
