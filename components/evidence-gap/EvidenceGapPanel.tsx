import type { EntityEvidenceGapProfile } from "@/lib/evidence-gap";
import { getNonAvailableGaps } from "@/lib/evidence-gap";
import EvidenceGapSummary from "@/components/evidence-gap/EvidenceGapSummary";
import EvidenceGapCard from "@/components/evidence-gap/EvidenceGapCard";
import EvidenceGapSources from "@/components/evidence-gap/EvidenceGapSources";
import EvidenceGapMethodology from "@/components/evidence-gap/EvidenceGapMethodology";

type EvidenceGapPanelProps = {
  profile: EntityEvidenceGapProfile;
};

export default function EvidenceGapPanel({ profile }: EvidenceGapPanelProps) {
  const nonAvailable = getNonAvailableGaps(profile);

  return (
    <section className="space-y-6" aria-labelledby="evidence-gaps-heading">
      <div>
        <h3
          id="evidence-gaps-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Evidence Gaps
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          What evidence exists, what is missing, and why — derived from official source and
          connector registries only.
        </p>
      </div>

      <EvidenceGapSummary profile={profile} />

      {nonAvailable.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-6 text-center">
          <p className="text-sm text-zinc-400">All applicable indicators have connected evidence.</p>
        </div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {nonAvailable.map((gap) => (
            <li key={gap.gapId}>
              <EvidenceGapCard gap={gap} />
            </li>
          ))}
        </ul>
      )}

      <EvidenceGapSources profile={profile} />
      <EvidenceGapMethodology profile={profile} />
    </section>
  );
}
