import Link from "next/link";
import type { WorkspaceEntityLink } from "@/lib/workspaces";

type WorkspaceEntityLinksProps = {
  links: readonly WorkspaceEntityLink[];
};

export default function WorkspaceEntityLinks({ links }: WorkspaceEntityLinksProps) {
  return (
    <section className="space-y-4" aria-labelledby="workspace-entity-links-heading">
      <div>
        <h2
          id="workspace-entity-links-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Entity Links
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Navigate to entity intelligence routes — registry facts and coverage status only.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {links.map((link) => (
          <div
            key={link.id}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-zinc-100">{link.label}</h3>
              <Link
                href={link.route}
                className="shrink-0 text-xs text-cyan-400 underline-offset-2 hover:underline"
              >
                Open
              </Link>
            </div>
            <p className="mt-2 text-sm text-zinc-400">{link.description}</p>
            <p className="mt-3 text-xs text-zinc-600">
              {link.registryCount} entit{link.registryCount === 1 ? "y" : "ies"} in registry
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
