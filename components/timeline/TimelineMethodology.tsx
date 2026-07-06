import type { CountryTimelineModel } from "@/lib/timeline";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type TimelineMethodologyProps = {
  model: CountryTimelineModel;
};

export default function TimelineMethodology({ model }: TimelineMethodologyProps) {
  const references = model.methodologyReferences.slice(0, 6);

  return (
    <section className="space-y-4" aria-labelledby="timeline-methodology-heading">
      <div>
        <h4
          id="timeline-methodology-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Methodology References
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Indicator methodology disclosure — required before any time-series evaluation.
        </p>
      </div>

      {references.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 px-5 py-4 text-sm text-zinc-500">
          No methodology references resolved for this timeline.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {references.map((ref) => (
            <Card key={ref.indicatorId}>
              <CardHeader title={ref.indicatorTitle} />
              <CardContent className="space-y-2">
                <p className="text-sm text-zinc-400">{ref.whyItExists}</p>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                    Required evidence
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{ref.requiredEvidence}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                    Missing evidence
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{ref.missingEvidence}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {model.methodologyReferences.length > references.length && (
        <p className="text-xs text-zinc-600">
          Showing {references.length} of {model.methodologyReferences.length} methodology
          references.
        </p>
      )}
    </section>
  );
}
