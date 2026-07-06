import type { EntityEvidenceGapProfile } from "@/lib/evidence-gap";
import { getNonAvailableGaps } from "@/lib/evidence-gap";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type EvidenceGapMethodologyProps = {
  profile: EntityEvidenceGapProfile;
};

export default function EvidenceGapMethodology({ profile }: EvidenceGapMethodologyProps) {
  const gaps = getNonAvailableGaps(profile).slice(0, 4);

  if (gaps.length === 0) return null;

  return (
    <section className="space-y-4" aria-labelledby="evidence-gap-methodology-heading">
      <div>
        <h4
          id="evidence-gap-methodology-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Methodology References
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Required evidence and methodology for indicators with gaps — explain before evaluate.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {gaps.map((gap) => (
          <Card key={gap.gapId}>
            <CardHeader title={gap.indicatorTitle} />
            <CardContent className="space-y-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                  Methodology
                </p>
                <p className="mt-1 text-sm text-zinc-400">{gap.requiredMethodology}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                  Required evidence
                </p>
                <p className="mt-1 text-xs text-zinc-500">{gap.requiredEvidence}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
