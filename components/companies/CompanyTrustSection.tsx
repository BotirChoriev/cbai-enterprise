import type { CompanyTrustPillar } from "@/lib/companies.intelligence";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type CompanyTrustSectionProps = {
  pillars: readonly CompanyTrustPillar[];
  neutralityNotice: string;
};

function TrustPillarCard({ pillar }: { pillar: CompanyTrustPillar }) {
  return (
    <Card>
      <CardHeader title={pillar.title} />
      <CardContent>
        <p className="text-sm text-zinc-400">{pillar.description}</p>
      </CardContent>
    </Card>
  );
}

export default function CompanyTrustSection({
  pillars,
  neutralityNotice,
}: CompanyTrustSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="company-trust-heading">
      <div>
        <h3
          id="company-trust-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Trust
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Constitutional principles applied to company intelligence.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Commercial Neutrality Notice"
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
