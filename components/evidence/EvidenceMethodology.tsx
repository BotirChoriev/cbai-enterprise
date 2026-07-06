import type { ExplorerMethodologyPoint } from "@/lib/evidence-explorer";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type EvidenceMethodologyProps = {
  points: readonly ExplorerMethodologyPoint[];
};

export default function EvidenceMethodology({ points }: EvidenceMethodologyProps) {
  return (
    <section className="space-y-4" aria-labelledby="evidence-methodology-heading">
      <div>
        <h2
          id="evidence-methodology-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Methodology
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Constitutional rules governing evidence before any evaluation appears on the
          platform.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {points.map((point) => (
          <Card key={point.id}>
            <CardHeader title={point.title} />
            <CardContent>
              <p className="text-sm text-zinc-400">{point.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
