import type { WorkspaceMethodologyPoint } from "@/lib/workspaces";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type WorkspaceMethodologyProps = {
  points: readonly WorkspaceMethodologyPoint[];
  heading?: string;
  description?: string;
};

export default function WorkspaceMethodology({
  points,
  heading = "Methodology",
  description = "Constitutional rules applied to this workspace.",
}: WorkspaceMethodologyProps) {
  return (
    <section className="space-y-4" aria-labelledby="workspace-methodology-heading">
      <div>
        <h2
          id="workspace-methodology-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          {heading}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {points.map((point) => (
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
