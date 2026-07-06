type EntityProfileFlowProps = {
  entityName: string;
  searchQuery?: string;
};

const FLOW_STEPS = [
  "Overview",
  "Evidence",
  "Missing Evidence",
  "Decision Package",
  "Reports",
] as const;

export default function EntityProfileFlow({
  entityName,
  searchQuery,
}: EntityProfileFlowProps) {
  return (
    <nav
      aria-label="Profile review flow"
      className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-5 py-4"
    >
      <p className="text-sm text-zinc-400">
        {searchQuery ? (
          <>
            Review for <span className="text-zinc-200">{entityName}</span> from search &quot;
            {searchQuery}&quot;
          </>
        ) : (
          <>
            Review for <span className="text-zinc-200">{entityName}</span>
          </>
        )}
      </p>
      <ol className="mt-3 flex flex-wrap gap-2">
        {FLOW_STEPS.map((step, index) => (
          <li
            key={step}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-[11px] text-zinc-500"
          >
            <span className="font-mono text-zinc-600">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </nav>
  );
}
