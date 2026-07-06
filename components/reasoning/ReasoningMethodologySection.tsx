import type {
  ReasoningMethodologyPoint,
  ReasoningTracePrinciple,
} from "@/lib/reasoning-explorer";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type ReasoningMethodologySectionProps = {
  methodology: readonly ReasoningMethodologyPoint[];
};

export function ReasoningMethodologySection({
  methodology,
}: ReasoningMethodologySectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="reasoning-methodology-heading">
      <div>
        <h2
          id="reasoning-methodology-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Methodology Before Metrics
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Constitutional rules applied before any reasoning output becomes a metric.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {methodology.map((point) => (
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

type ReasoningTracePrinciplesProps = {
  principles: readonly ReasoningTracePrinciple[];
};

export function ReasoningTracePrinciples({ principles }: ReasoningTracePrinciplesProps) {
  return (
    <section className="space-y-4" aria-labelledby="reasoning-trace-heading">
      <div>
        <h2
          id="reasoning-trace-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Trace Principles
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          User-facing reasoning trace concepts — auditable, attributed, and transparent.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {principles.map((principle) => (
          <Card key={principle.id}>
            <CardHeader title={principle.title} />
            <CardContent>
              <p className="text-sm text-zinc-400">{principle.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
