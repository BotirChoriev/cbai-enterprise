import type { WorkspaceTrustPillar } from "@/lib/workspaces";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type WorkspaceTrustProps = {
  pillars: readonly WorkspaceTrustPillar[];
};

export default function WorkspaceTrust({ pillars }: WorkspaceTrustProps) {
  return (
    <section className="space-y-4" aria-labelledby="workspace-trust-heading">
      <div>
        <h2
          id="workspace-trust-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Trust
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Constitutional principles governing this workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <Card key={pillar.id}>
            <CardHeader title={pillar.title} />
            <CardContent>
              <p className="text-sm text-zinc-400">{pillar.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
