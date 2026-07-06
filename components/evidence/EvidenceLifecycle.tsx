import type { ExplorerLifecycleStage } from "@/lib/evidence-explorer";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type EvidenceLifecycleProps = {
  stages: readonly ExplorerLifecycleStage[];
};

export default function EvidenceLifecycle({ stages }: EvidenceLifecycleProps) {
  return (
    <section className="space-y-4" aria-labelledby="evidence-lifecycle-heading">
      <div>
        <h2
          id="evidence-lifecycle-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Evidence Lifecycle
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          How sources and indicators progress from registration to verified evidence.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stages.map((stage) => (
          <Card key={stage.id}>
            <CardHeader title={stage.title} />
            <CardContent>
              <p className="text-sm text-zinc-400">{stage.description}</p>
              <dl className="mt-4 flex gap-6 text-xs">
                <div>
                  <dt className="text-zinc-500">Sources</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-zinc-200">
                    {stage.sourceCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Indicators</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-zinc-200">
                    {stage.indicatorCount}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
