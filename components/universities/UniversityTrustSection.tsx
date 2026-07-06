import type { UniversityTrustPillar } from "@/lib/universities.intelligence";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type UniversityTrustSectionProps = {
  pillars: readonly UniversityTrustPillar[];
  neutralityNotice: string;
};

function TrustPillarCard({ pillar }: { pillar: UniversityTrustPillar }) {
  return (
    <Card>
      <CardHeader title={pillar.title} />
      <CardContent>
        <p className="text-sm text-zinc-400">{pillar.description}</p>
      </CardContent>
    </Card>
  );
}

export default function UniversityTrustSection({
  pillars,
  neutralityNotice,
}: UniversityTrustSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="university-trust-heading">
      <div>
        <h3
          id="university-trust-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Trust
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Constitutional principles applied to university intelligence.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Institutional Neutrality Notice"
          description="CBAI Constitution compliance"
        />
        <CardContent>
          <p className="text-sm text-zinc-400">{neutralityNotice}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <TrustPillarCard key={pillar.id} pillar={pillar} />
        ))}
      </div>
    </section>
  );
}
