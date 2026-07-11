import Link from "next/link";
import type { SearchResultEntry } from "@/lib/search-intelligence-entry";
import { isUnavailableRoute } from "@/lib/search-intelligence-entry";
import StatusBadge from "@/components/shared/StatusBadge";
import type { ProductStatus } from "@/lib/product-status";

const cardLink =
  "group block rounded-lg bg-zinc-900/50 px-4 py-3 transition-colors hover:bg-zinc-900/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400";

const cardStatic = "rounded-lg bg-zinc-950/50 px-4 py-3";

const EVIDENCE_STATUS_TO_PRODUCT_STATUS: Record<SearchResultEntry["evidenceStatus"], ProductStatus> = {
  "Available now": "live",
  "Evidence connected": "partial",
  "Evidence unavailable": "not_connected",
};

type SearchResultCardProps = {
  entry: SearchResultEntry;
};

export default function SearchResultCard({ entry }: SearchResultCardProps) {
  const disabled = !entry.linked || isUnavailableRoute(entry.route);

  const content = (
    <>
      <p className="text-sm font-semibold text-zinc-100">{entry.name}</p>
      <p className="mt-0.5 text-xs text-zinc-500">
        {entry.type}
        {entry.countryLabel ? ` · ${entry.countryLabel}` : ""}
      </p>
      <p className="mt-1 text-xs text-zinc-400">{entry.shortDescription}</p>
      {!disabled ? (
        <p className="mt-2 text-xs font-semibold text-cyan-400/90 group-hover:text-cyan-300">
          Open profile →
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={EVIDENCE_STATUS_TO_PRODUCT_STATUS[entry.evidenceStatus]} />
          <span className="text-xs text-zinc-500">{entry.nextStep}</span>
        </div>
      )}
    </>
  );

  if (disabled) {
    return <div className={cardStatic}>{content}</div>;
  }

  return (
    <Link href={entry.href} className={cardLink}>
      {content}
    </Link>
  );
}
