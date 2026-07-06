import type { University } from "@/lib/universities";
import UniversityCard from "@/components/universities/UniversityCard";

type UniversityListProps = {
  universities: University[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function UniversityList({
  universities,
  selectedId,
  onSelect,
}: UniversityListProps) {
  if (universities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 px-5 py-12 text-center">
        <p className="text-sm text-zinc-500">
          No universities match your filters.
        </p>
      </div>
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
