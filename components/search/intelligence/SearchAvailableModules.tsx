import Link from "next/link";
import { getSearchNavigationHub } from "@/lib/search-intelligence";
import type { SearchIntelligenceRecord } from "@/lib/search-intelligence";

type SearchAvailableModulesProps = {
  record: SearchIntelligenceRecord;
};

export default function SearchAvailableModules({ record }: SearchAvailableModulesProps) {
  const hubLinks = getSearchNavigationHub(record);

  return (
    <section className="space-y-4" aria-labelledby="search-available-modules-heading">
      <div>
        <h3
          id="search-available-modules-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Available Modules
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Platform navigation hub — direct links to declared modules and explorers.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hubLinks.map((module) => (
          <li key={module.moduleId}>
            {module.available ? (
              <Link
                href={module.href}
                className="block rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 transition-colors hover:border-zinc-600 hover:bg-zinc-900/60"
              >
                <ModuleContent module={module} linked />
              </Link>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50 px-4 py-3 opacity-70">
                <ModuleContent module={module} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ModuleContent({
  module,
  linked = false,
}: {
  module: {
    label: string;
    description: string;
    href: string;
    available: boolean;
  };
  linked?: boolean;
}) {
  return (
    <>
      <p
        className={`text-sm font-medium ${linked ? "text-teal-400" : "text-zinc-400"}`}
      >
        {module.label}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{module.description}</p>
      {linked && (
        <p className="mt-2 font-mono text-[10px] text-zinc-600">{module.href}</p>
      )}
    </>
  );
}
