import type { ReasoningPersona, ReasoningTrustLimit } from "@/lib/reasoning-explorer";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type ReasoningPersonasSectionProps = {
  personas: readonly ReasoningPersona[];
};

export function ReasoningPersonasSection({ personas }: ReasoningPersonasSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="reasoning-personas-heading">
      <div>
        <h2
          id="reasoning-personas-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Personas
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          What each audience can understand on this page — not what CBAI concludes for them.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => (
          <Card key={persona.id}>
            <CardHeader title={persona.title} description="What can I understand here?" />
            <CardContent>
              <p className="text-sm text-zinc-400">{persona.understandAnswer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

type ReasoningTrustLimitsProps = {
  limits: readonly ReasoningTrustLimit[];
};

export function ReasoningTrustLimits({ limits }: ReasoningTrustLimitsProps) {
  return (
    <section className="space-y-4" aria-labelledby="reasoning-trust-heading">
      <div>
        <h2
          id="reasoning-trust-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Trust / Limits
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Boundaries of the Reasoning Explorer — architectural transparency only.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {limits.map((limit) => (
          <Card key={limit.id}>
            <CardHeader title={limit.title} />
            <CardContent>
              <p className="text-sm text-zinc-400">{limit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
