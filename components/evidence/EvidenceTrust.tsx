import type { ExplorerTrustPillar } from "@/lib/evidence-explorer";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type EvidenceTrustProps = {
  pillars: readonly ExplorerTrustPillar[];
};

export default function EvidenceTrust({ pillars }: EvidenceTrustProps) {
  return (
    <section className="space-y-4" aria-labelledby="evidence-trust-heading">
      <div>
        <h2
          id="evidence-trust-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Trust Principles
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          How the Evidence Explorer upholds CBAI constitutional standards.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <Card key={pillar.id}>
            <CardHeader title={pillar.title} />
            <CardContent>
              <p className="text-sm text-zinc-400">{pillar.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
