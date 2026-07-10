import type { ResearchEvidence } from "@/lib/research/evidence/evidence-model";
import type { EvidenceStatus, EvidenceStrength } from "@/lib/research/evidence/evidence-types";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const STATUS_LABELS: Record<EvidenceStatus, string> = {
  draft: "Draft",
  verified: "Verified",
  disputed: "Disputed",
  deprecated: "Deprecated",
  archived: "Archived",
};

function statusAccent(status: EvidenceStatus): string {
  switch (status) {
    case "draft":
      return "border-zinc-700 bg-zinc-900/40 text-zinc-400";
    case "verified":
      return "border-emerald-500/25 bg-emerald-500/5 text-emerald-300";
    case "disputed":
      return "border-amber-500/25 bg-amber-500/5 text-amber-300";
    case "deprecated":
      return "border-orange-500/25 bg-orange-500/5 text-orange-300";
    case "archived":
      return "border-zinc-700 bg-zinc-900/40 text-zinc-500";
  }
}

const STRENGTH_LABELS: Record<EvidenceStrength, string> = {
  weak: "Weak",
  moderate: "Moderate",
  strong: "Strong",
  conclusive: "Conclusive",
};

function strengthAccent(strength: EvidenceStrength): string {
  switch (strength) {
    case "weak":
      return "border-zinc-700 bg-zinc-900/40 text-zinc-400";
    case "moderate":
      return "border-amber-500/25 bg-amber-500/5 text-amber-300";
    case "strong":
      return "border-cyan-500/25 bg-cyan-500/5 text-cyan-300";
    case "conclusive":
      return "border-emerald-500/25 bg-emerald-500/5 text-emerald-300";
  }
}

const CREATED_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function formatCreatedDate(value: string): string {
  return CREATED_DATE_FORMAT.format(new Date(value));
}

type EvidenceNavigationExplorerProps = {
  evidence: readonly ResearchEvidence[];
};

export default function EvidenceNavigationExplorer({
  evidence,
}: EvidenceNavigationExplorerProps) {
  return (
    <section aria-labelledby="evidence-explorer-heading" className="space-y-4">
      <div className="space-y-2">
        <p className={cbaiSectionEyebrow}>Evidence Explorer</p>
        <h2
          id="evidence-explorer-heading"
          className="text-xl font-semibold tracking-tight text-zinc-100"
        >
          Browse research evidence
        </h2>
        <p className="max-w-3xl text-sm text-zinc-500">
          Static list of catalog evidence records. Search, filtering, and sorting are not
          connected yet.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`${cbaiGlassCard} space-y-1 p-3`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Search</p>
          <p className="text-xs text-zinc-500">Not connected yet.</p>
        </div>
        <div className={`${cbaiGlassCard} space-y-1 p-3`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Filter</p>
          <p className="text-xs text-zinc-500">Not connected yet.</p>
        </div>
        <div className={`${cbaiGlassCard} space-y-1 p-3`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Sort</p>
          <p className="text-xs text-zinc-500">Not connected yet.</p>
        </div>
      </div>

      {evidence.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {evidence.map((item) => (
            <li key={item.id} className={`${cbaiGlassCard} space-y-3 p-4`}>
              <h3 className="text-sm font-semibold text-zinc-100">{item.title}</h3>
              <p className="text-xs text-zinc-500">
                {item.sourceType} · {item.sourceId}
              </p>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${statusAccent(item.status)}`}
                >
                  {STATUS_LABELS[item.status]}
                </span>
                <span
                  className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${strengthAccent(item.strength)}`}
                >
                  {STRENGTH_LABELS[item.strength]}
                </span>
              </div>
              <p className="text-[11px] text-zinc-600">Created {formatCreatedDate(item.createdAt)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={`${cbaiGlassCard} p-4 text-xs text-zinc-500`}>
          No evidence records to display.
        </p>
      )}
    </section>
  );
}
