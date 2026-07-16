import type { ResearchEvidence } from "@/lib/research/evidence/evidence-model";
import type { EvidenceStatus, EvidenceStrength } from "@/lib/research/evidence/evidence-types";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const NOT_YET = "Not yet";

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
      return "border-teal-500/25 bg-teal-500/5 text-teal-300";
    case "conclusive":
      return "border-emerald-500/25 bg-emerald-500/5 text-emerald-300";
  }
}

const TIMELINE_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function formatTimelineDate(value: string | undefined): string {
  if (!value) {
    return NOT_YET;
  }
  return TIMELINE_DATE_FORMAT.format(new Date(value));
}

type ResearchEvidenceWorkspaceProps = {
  evidence: ResearchEvidence;
};

export default function ResearchEvidenceWorkspace({
  evidence,
}: ResearchEvidenceWorkspaceProps) {
  return (
    <section aria-labelledby="research-evidence-workspace-heading" className="space-y-4">
      <header className="space-y-2">
        <p className={cbaiSectionEyebrow}>Research Evidence</p>
        <h2
          id="research-evidence-workspace-heading"
          className="text-xl font-semibold tracking-tight text-zinc-100"
        >
          {evidence.title}
        </h2>
      </header>

      <article className={`${cbaiGlassCard} space-y-4 p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-sm text-zinc-400">{evidence.summary}</p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <span
              className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${statusAccent(evidence.status)}`}
            >
              {STATUS_LABELS[evidence.status]}
            </span>
            <span
              className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${strengthAccent(evidence.strength)}`}
            >
              {STRENGTH_LABELS[evidence.strength]}
            </span>
          </div>
        </div>
      </article>

      <section aria-label="Source information" className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Source</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Source type
            </dt>
            <dd className="mt-1 text-sm text-zinc-200">{evidence.sourceType}</dd>
          </div>
          <div className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Source ID
            </dt>
            <dd className="mt-1 text-sm text-zinc-200">{evidence.sourceId}</dd>
          </div>
        </dl>
      </section>

      <section aria-label="Evidence metadata" className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Metadata</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Evidence ID
            </dt>
            <dd className="mt-1 text-sm text-zinc-200">{evidence.id}</dd>
          </div>
          <div className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Research topic ID
            </dt>
            <dd className="mt-1 text-sm text-zinc-200">{evidence.researchTopicId}</dd>
          </div>
        </dl>
      </section>

      <section aria-label="Evidence timeline" className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Timeline</p>
        <ol className="space-y-2">
          <li className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
            <span className="text-sm font-medium text-zinc-200">Created</span>
            <span className="text-xs text-zinc-500">{formatTimelineDate(evidence.createdAt)}</span>
          </li>
          <li className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
            <span className="text-sm font-medium text-zinc-200">Last updated</span>
            <span className="text-xs text-zinc-500">{formatTimelineDate(evidence.updatedAt)}</span>
          </li>
        </ol>
        <p className="text-xs text-zinc-500">
          A full change history is not connected yet — only creation and last-update timestamps
          are available.
        </p>
      </section>
    </section>
  );
}
