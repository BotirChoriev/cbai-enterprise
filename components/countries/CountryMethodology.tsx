import { COUNTRY_METHODOLOGY_POINTS } from "@/lib/countries.intelligence";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function CountryMethodology() {
  return (
    <section className="space-y-4" aria-labelledby="country-methodology-heading">
      <div>
        <h3
          id="country-methodology-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Methodology
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          How CBAI treats country intelligence — explain before evaluate.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {COUNTRY_METHODOLOGY_POINTS.map((point) => (
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
