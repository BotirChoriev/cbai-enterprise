import type { CountryTrustPillar } from "@/lib/countries.intelligence";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type CountryTrustSectionProps = {
  pillars: readonly CountryTrustPillar[];
  neutralityNotice: string;
};

function TrustPillarCard({ pillar }: { pillar: CountryTrustPillar }) {
  return (
    <Card>
      <CardHeader title={pillar.title} />
      <CardContent>
        <p className="text-sm text-zinc-400">{pillar.description}</p>
      </CardContent>
    </Card>
  );
}

export default function CountryTrustSection({
  pillars,
  neutralityNotice,
}: CountryTrustSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="country-trust-heading">
      <div>
        <h3
          id="country-trust-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Trust
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Constitutional principles applied to country intelligence.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Political Neutrality Notice"
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
