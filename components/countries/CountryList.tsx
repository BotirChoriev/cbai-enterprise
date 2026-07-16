import type { Country } from "@/lib/countries";
import CountryCard from "@/components/countries/CountryCard";
import EmptyState from "@/components/shared/EmptyState";

type CountryListProps = {
  countries: Country[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClearFilters?: () => void;
  emptyMessage: string;
  clearFiltersLabel: string;
};

export default function CountryList({
  countries,
  selectedId,
  onSelect,
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
              className="inline-flex min-h-9 items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 text-xs font-medium text-teal-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              {clearFiltersLabel}
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {countries.map((country) => (
        <CountryCard
          key={country.id}
          country={country}
          isSelected={country.id === selectedId}
          onSelect={() => onSelect(country.id)}
        />
      ))}
    </div>
  );
}
