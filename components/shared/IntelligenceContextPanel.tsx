import StatusBadge from "@/components/shared/StatusBadge";
import { resolveEntityDataStatus } from "@/components/shared/entity-profile-copy";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type IntelligenceContextPanelProps = {
  relatedEntityCount: number;
  evidenceConnectedCount: number;
  evidenceTotalCount: number;
  reportsCount: number;
  openQuestionsCount: number;
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-0.5 font-mono text-lg text-zinc-100">{value}</p>
    </div>
  );
}

/**
 * One reusable "Intelligence Context" summary (Release 4, Phase 6) — related entities, evidence
 * count, reports, open questions, and current status. Real numbers only, nothing decorative; the
 * deeper detail behind each number lives further down the same page.
 */
export default function IntelligenceContextPanel({
  relatedEntityCount,
  evidenceConnectedCount,
  evidenceTotalCount,
  reportsCount,
  openQuestionsCount,
}: IntelligenceContextPanelProps) {
  const status = resolveEntityDataStatus(evidenceConnectedCount, evidenceTotalCount);

  return (
    <section aria-labelledby="intelligence-context-heading" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <div className="flex items-center justify-between gap-3">
        <p className={cbaiSectionEyebrow} id="intelligence-context-heading">
          Intelligence Context
        </p>
        <StatusBadge status={status} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Related entities" value={relatedEntityCount} />
        <Stat label="Evidence" value={evidenceConnectedCount} />
        <Stat label="Reports" value={reportsCount} />
        <Stat label="Open questions" value={openQuestionsCount} />
      </div>
    </section>
  );
}
