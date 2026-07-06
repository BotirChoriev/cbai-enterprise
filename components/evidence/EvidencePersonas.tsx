import type { ExplorerPersona } from "@/lib/evidence-explorer";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type EvidencePersonasProps = {
  personas: readonly ExplorerPersona[];
};

export default function EvidencePersonas({ personas }: EvidencePersonasProps) {
  return (
    <section className="space-y-4" aria-labelledby="evidence-personas-heading">
      <div>
        <h2
          id="evidence-personas-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Personas
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          What each audience can verify on this page — not what CBAI evaluates yet.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => (
          <Card key={persona.id}>
            <CardHeader title={persona.title} description="What can I verify here?" />
            <CardContent>
              <p className="text-sm text-zinc-400">{persona.verifyAnswer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
