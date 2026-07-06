import type { University } from "@/lib/universities";
import { getUniversityLinkedEntities } from "@/lib/universities.adapter";
import {
  buildUniversityIntelligenceProfile,
  resolveUniversityListEvidenceLabel,
  universityEvidenceStatusClass,
} from "@/lib/universities.intelligence";

type UniversityCardProps = {
  university: University;
  isSelected: boolean;
  onSelect: () => void;
};

export default function UniversityCard({
  university,
  isSelected,
  onSelect,
}: UniversityCardProps) {
  const profile = buildUniversityIntelligenceProfile(
    university,
    getUniversityLinkedEntities(university),
  );
  const evidenceLabel = resolveUniversityListEvidenceLabel(profile);
  const evidenceClass = universityEvidenceStatusClass(
    profile.referenceConnected ? "connected" : "insufficient",
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        isSelected
          ? "border-cyan-500/40 bg-cyan-500/5 ring-1 ring-cyan-500/20"
          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 font-mono text-[10px] font-bold text-cyan-400">
            {university.icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-50">{university.name}</p>
            <p className="text-[10px] text-zinc-500">
              {university.type} · {university.country}
            </p>
          </div>
        </div>
        {isSelected ? (
          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
            Selected
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs text-zinc-500">{university.city}</p>
        <span
          className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${evidenceClass}`}
        >
          {evidenceLabel}
        </span>
      </div>
    </button>
  );
}
