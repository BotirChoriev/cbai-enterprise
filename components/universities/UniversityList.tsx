import type { University } from "@/lib/universities";
import UniversityCard from "@/components/universities/UniversityCard";
import EmptyState from "@/components/shared/EmptyState";

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
    return <EmptyState variant="dashed" message="No universities match your filters." />;
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
