import { SEARCH_FUTURE_CAPABILITIES } from "@/lib/search-gateway";

export default function SearchFutureReady() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2" aria-label="Future search capabilities">
      {SEARCH_FUTURE_CAPABILITIES.map((capability) => (
        <li
          key={capability.id}
          className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-200">
              {capability.label}
            </h3>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              {capability.status}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            {capability.note}
          </p>
        </li>
      ))}
    </ul>
  );
}
