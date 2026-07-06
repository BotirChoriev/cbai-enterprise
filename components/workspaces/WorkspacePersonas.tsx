import type { WorkspacePersona } from "@/lib/workspaces";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type WorkspacePersonasProps = {
  personas: readonly WorkspacePersona[];
  question?: string;
};

export default function WorkspacePersonas({
  personas,
  question = "What can I explore here?",
}: WorkspacePersonasProps) {
  return (
    <section className="space-y-4" aria-labelledby="workspace-personas-heading">
      <div>
        <h2
          id="workspace-personas-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Personas
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          How each audience uses this evidence-readiness workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => (
          <Card key={persona.id}>
            <CardHeader title={persona.title} description={question} />
            <CardContent>
              <p className="text-sm text-zinc-400">{persona.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
