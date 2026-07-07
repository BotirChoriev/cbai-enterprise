"use client";

import type { ComparisonCandidate } from "@/lib/evidence-comparison";

type EvidenceComparisonSelectorProps = {
  leftLegacyId: string;
  candidates: readonly ComparisonCandidate[];
  selectedLegacyId: string | null;
  onSelect: (legacyId: string) => void;
  disabled?: boolean;
};

export default function EvidenceComparisonSelector({
  candidates,
  selectedLegacyId,
  onSelect,
  disabled = false,
}: EvidenceComparisonSelectorProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
      <label htmlFor="comparison-target-select" className="block text-sm font-medium text-zinc-300">
        Compare with
      </label>
      <p className="mt-1 text-xs text-zinc-500">
        Select another profile of the same type to compare.
      </p>
      <select
        id="comparison-target-select"
        value={selectedLegacyId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled || candidates.length === 0}
        className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {candidates.map((candidate) => (
          <option key={candidate.entityId} value={candidate.legacyId}>
            {candidate.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
