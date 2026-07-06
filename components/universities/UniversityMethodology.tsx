import { UNIVERSITY_METHODOLOGY_POINTS } from "@/lib/universities.intelligence";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function UniversityMethodology() {
  return (
    <section className="space-y-4" aria-labelledby="university-methodology-heading">
      <div>
        <h3
          id="university-methodology-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Methodology
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          How CBAI treats university intelligence — explain before evaluate.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {UNIVERSITY_METHODOLOGY_POINTS.map((point) => (
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
