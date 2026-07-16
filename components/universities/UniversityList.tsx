import type { University } from "@/lib/universities";
import UniversityCard from "@/components/universities/UniversityCard";
import EmptyState from "@/components/shared/EmptyState";

type UniversityListProps = {
  universities: University[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClearFilters?: () => void;
  emptyMessage: string;
  clearFiltersLabel: string;
};

export default function UniversityList({
  universities,
  selectedId,
  onSelect,
  onClearFilters,
  emptyMessage,
  clearFiltersLabel,
}: UniversityListProps) {
  if (universities.length === 0) {
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
      {universities.map((university) => (
        <UniversityCard
          key={university.id}
          university={university}
          isSelected={university.id === selectedId}
          onSelect={() => onSelect(university.id)}
        />
      ))}
    </div>
  );
}
