import Link from "next/link";
import type { SearchResultEntry } from "@/lib/search-intelligence-entry";
import { isUnavailableRoute } from "@/lib/search-intelligence-entry";
import StatusBadge from "@/components/shared/StatusBadge";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import type { ProductStatus } from "@/lib/product-status";

const cardShell = "rounded-lg bg-zinc-900/50 px-4 py-3 transition-colors hover:bg-zinc-900/80";
const cardStatic = "rounded-lg bg-zinc-950/50 px-4 py-3";

const EVIDENCE_STATUS_TO_PRODUCT_STATUS: Record<SearchResultEntry["evidenceStatus"], ProductStatus> = {
  "Available now": "live",
  "Evidence connected": "partial",
  "Evidence unavailable": "not_connected",
};

type SearchResultCardProps = {
  entry: SearchResultEntry;
};

/**
 * Universal Search result card (Platform Completion mission, Phase 5) — every result now shows
 * type, summary, a real action (Open / Save / Add to Project), and coverage, not just a bare
 * "Open profile" link. `createProjectHref`/`entityRef` were already computed by
 * lib/search-intelligence-entry.ts but never rendered here — no new data, just real, existing
 * data finally surfaced. "Related entities per result" was deliberately left out: computing a
 * relationship set for every row of a results list is real added cost for a list that can be long;
 * related entities remain one click away on the entity's own profile.
 */
export default function SearchResultCard({ entry }: SearchResultCardProps) {
  const disabled = !entry.linked || isUnavailableRoute(entry.route);

  return (
    <div className={disabled ? cardStatic : cardShell}>
      {disabled ? (
        <>
          <p className="text-sm font-semibold text-zinc-100">{entry.name}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {entry.type}
            {entry.countryLabel ? ` · ${entry.countryLabel}` : ""}
          </p>
          <p className="mt-1 text-xs text-zinc-400">{entry.shortDescription}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={EVIDENCE_STATUS_TO_PRODUCT_STATUS[entry.evidenceStatus]} />
            <span className="text-xs text-zinc-500">{entry.nextStep}</span>
          </div>
        </>
      ) : (
        <>
          <Link href={entry.href} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400">
            <p className="text-sm font-semibold text-zinc-100">{entry.name}</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {entry.type}
              {entry.countryLabel ? ` · ${entry.countryLabel}` : ""}
            </p>
            <p className="mt-1 text-xs text-zinc-400">{entry.shortDescription}</p>
            {entry.coverageLabel ? <p className="mt-1 text-[11px] text-zinc-600">{entry.coverageLabel}</p> : null}
            <p className="mt-2 text-xs font-semibold text-cyan-400/90 group-hover:text-cyan-300">
              Open profile →
            </p>
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {entry.entityRef ? <SaveToWorkspaceButton entity={entry.entityRef} className="!px-2.5 !py-1 !text-[11px]" /> : null}
            {entry.createProjectHref ? (
              <Link
                href={entry.createProjectHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300 transition-colors hover:border-cyan-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                + Add to Project
              </Link>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
