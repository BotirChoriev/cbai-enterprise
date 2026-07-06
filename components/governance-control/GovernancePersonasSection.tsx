import type { GovernancePersona, GovernanceLimit } from "@/lib/governance-control-center";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type GovernancePersonasSectionProps = {
  personas: readonly GovernancePersona[];
};

export function GovernancePersonasSection({ personas }: GovernancePersonasSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="governance-personas-heading">
      <div>
        <h2
          id="governance-personas-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Personas
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          How constitutional governance protects each audience.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => (
          <Card key={persona.id}>
            <CardHeader title={persona.title} />
            <CardContent>
              <p className="text-sm text-zinc-400">{persona.protectionAnswer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

type GovernanceLimitsSectionProps = {
  limits: readonly GovernanceLimit[];
};

export function GovernanceLimitsSection({ limits }: GovernanceLimitsSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="governance-limits-heading">
      <div>
        <h2
          id="governance-limits-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Limits
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          What this control center does not do — by constitutional design.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
