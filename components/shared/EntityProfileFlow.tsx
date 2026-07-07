import { PROFILE_FLOW_STEPS } from "@/components/shared/entity-profile-path";

type EntityProfileFlowProps = {
  entityName: string;
  searchQuery?: string;
};

export default function EntityProfileFlow({
  entityName,
  searchQuery,
}: EntityProfileFlowProps) {
  return (
    <nav
      aria-label="Review steps"
      className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-4 sm:px-5"
    >
      <p className="text-sm text-zinc-400">
        <span className="text-zinc-200">{entityName}</span>
        {searchQuery ? (
          <>
            {" "}
            · from &quot;{searchQuery}&quot;
          </>
        ) : null}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Scroll through five steps — or tap a step to jump.
      </p>
      <ol className="mt-3 -mx-1 flex gap-2 overflow-x-auto pb-1">
        {PROFILE_FLOW_STEPS.map((step, index) => (
          <li key={step.id} className="shrink-0">
            <a
              href={`#${step.id}`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
            >
              <span className="font-mono text-[10px] text-zinc-600">{index + 1}</span>
              {step.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
