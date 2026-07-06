import { COMPANY_METHODOLOGY_POINTS } from "@/lib/companies.intelligence";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function CompanyMethodology() {
  return (
    <section className="space-y-4" aria-labelledby="company-methodology-heading">
      <div>
        <h3
          id="company-methodology-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Methodology
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          How CBAI treats company intelligence — explain before evaluate.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {COMPANY_METHODOLOGY_POINTS.map((point) => (
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
