import Link from "next/link";
import type { SearchResult } from "@/lib/global-search";
import { getEntityHref } from "@/lib/global-search";
import { getEntityTypeLabel, getScoreColor, getEntityInitials } from "@/lib/entity/entity.helpers";
import { entityTypeAccents } from "@/lib/entity/entity.icons";
import EntityIcon from "@/components/entity/EntityIcon";
import { entityTypeIconPaths } from "@/lib/entity/entity.icons";
import type { SearchableEntityType } from "@/lib/global-search";

type SearchResultsProps = {
  results: SearchResult[];
  query: string;
};

export default function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-600">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-zinc-400">No results found</p>
        <p className="mt-1 text-xs text-zinc-600">
          {query
            ? `No entities matched "${query}" with current filters.`
            : "Adjust filters or enter a search query."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">
        {results.length} {results.length === 1 ? "result" : "results"}
        {query && (
          <>
            {" "}
            for <span className="font-mono text-zinc-400">&quot;{query}&quot;</span>
          </>
        )}
      </p>

      {results.map((result) => (
        <SearchResultCard key={`${result.entity.type}-${result.entity.id}`} result={result} />
      ))}
    </div>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const { entity, relevanceScore, matchReasons } = result;
  const type = entity.type as SearchableEntityType;
  const accent = entityTypeAccents[type];
  const initials = getEntityInitials(entity);
  const href = getEntityHref(entity);

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/70"
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${accent}`}
        >
          {initials}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-50 group-hover:text-sky-300">
              {entity.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${accent}`}
            >
              <EntityIcon path={entityTypeIconPaths[type]} className="h-2.5 w-2.5" />
              {getEntityTypeLabel(type)}
            </span>
            <span className="font-mono text-[10px] text-zinc-600">
              relevance {relevanceScore}
            </span>
          </div>

          {entity.subtitle && (
            <p className="mt-0.5 text-xs text-zinc-500">{entity.subtitle}</p>
          )}

          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
            {entity.overview}
          </p>

          {matchReasons.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {matchReasons.map((reason) => (
                <span
                  key={`${reason.field}-${reason.snippet}`}
                  className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[10px] text-zinc-500"
                >
                  {reason.field}: {reason.snippet}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="hidden shrink-0 grid-cols-3 gap-3 sm:grid">
          <ScoreCell label="AI" value={entity.scores.aiScore} />
          <ScoreCell label="Invest" value={entity.scores.investmentScore} />
          <ScoreCell label="Risk" value={entity.scores.riskScore} inverted />
        </div>
      </div>
    </Link>
  );
}

function ScoreCell({
  label,
  value,
  inverted = false,
}: {
  label: string;
  value: number;
  inverted?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="text-[9px] uppercase tracking-wider text-zinc-600">{label}</p>
      <p className={`text-xs font-semibold ${getScoreColor(value, inverted)}`}>
        {value}
      </p>
    </div>
  );
}
