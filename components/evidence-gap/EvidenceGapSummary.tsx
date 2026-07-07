import type { EntityEvidenceGapProfile } from "@/lib/evidence-gap";

type EvidenceGapSummaryProps = {
  profile: EntityEvidenceGapProfile;
};

function CountStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

export default function EvidenceGapSummary({ profile }: EvidenceGapSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CountStat label="Available now" value={profile.availableCount} />
        <CountStat label="Not yet available" value={profile.plannedCount} />
        <CountStat label="Missing" value={profile.missingCount} />
        <CountStat label="Unavailable" value={profile.blockedCount} />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Total applicable topics
            </dt>
            <dd className="mt-1 font-mono text-zinc-200">{profile.totalIndicators}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Transparency policy</dt>
            <dd className="mt-1 text-zinc-400">
              Counts only — no fake percentages or predictions
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">
          Human review required
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Gap information describes connection posture only — not government failure, hidden data,
          or recommendations. Human oversight is mandatory before decision use.
        </p>
      </div>
    </div>
  );
}
