"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { GatewaySearchResponse } from "@/lib/search-gateway";
import {
  SEARCH_GATEWAY,
  SEARCH_SUPPORTED_SUGGESTIONS,
} from "@/lib/search-gateway";
import {
  buildEntityResultEntry,
  buildTopicResultEntry,
} from "@/lib/search-intelligence-entry";
import { executeSearchIntelligence } from "@/lib/search-intelligence";
import SearchResultCard from "@/components/search/gateway/SearchResultCard";
import SearchIntelligenceDetail from "@/components/search/intelligence/SearchIntelligenceDetail";

type SearchGatewayResultsProps = {
  response: GatewaySearchResponse;
  query: string;
};

export default function SearchGatewayResults({
  response,
  query,
}: SearchGatewayResultsProps) {
  const intelligenceResponse = useMemo(() => executeSearchIntelligence(query), [query]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const selectedRecord =
    intelligenceResponse.matches.find(
      (match) => match.record.entityId === selectedEntityId,
    )?.record ?? null;

  if (!response.query) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-6 py-8">
        <p className="text-sm text-zinc-400">{SEARCH_GATEWAY.emptyPrompt}</p>
        <SupportedSearches />
      </div>
    );
  }

  if (!response.hasResults) {
    return (
      <div
        className="rounded-xl border border-dashed border-zinc-800 px-6 py-12 text-center"
        role="status"
      >
        <p className="text-base font-medium text-zinc-300">
          {SEARCH_GATEWAY.noResultsMessage}
        </p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-500">
          {SEARCH_GATEWAY.noResultsDetail}
        </p>
        <p className="mt-4 font-mono text-xs text-zinc-600">
          Query: &quot;{response.query}&quot;
        </p>
        <div className="mt-8">
          <SupportedSearches centered />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <p className="text-sm text-zinc-500">
        Results for{" "}
        <span className="font-medium text-zinc-300">
          &quot;{response.query}&quot;
        </span>
        {" · "}
        Alphabetical registry order — no relevance ranking displayed.
      </p>

      {response.groups.map((group) => (
        <section
          key={group.id}
          aria-labelledby={`search-group-${group.id}`}
          className="space-y-4"
        >
          <h2
            id={`search-group-${group.id}`}
            className="text-xs font-semibold uppercase tracking-widest text-zinc-500"
          >
            {group.label}
          </h2>

          <ul className="grid gap-4 lg:grid-cols-2">
            {group.entities.map((result) => {
              const entry = buildEntityResultEntry(result.entity);
              const intelligenceMatch = intelligenceResponse.matches.find(
                (match) => match.record.displayName === result.entity.name,
              );
              const entityId = intelligenceMatch?.record.entityId;

              return (
                <li key={`${result.entity.type}-${result.entity.id}`} className="space-y-2">
                  <SearchResultCard entry={entry} />
                  {entityId && (
                    <button
                      type="button"
                      onClick={() => setSelectedEntityId(entityId)}
                      className={`text-xs underline-offset-2 hover:underline ${
                        selectedEntityId === entityId
                          ? "text-cyan-300"
                          : "text-cyan-400"
                      }`}
                      aria-pressed={selectedEntityId === entityId}
                      aria-label={`Open navigation hub for ${result.entity.name}`}
                    >
                      Open navigation hub
                    </button>
                  )}
                </li>
              );
            })}
            {group.topics.map((topic) => {
              const entry = buildTopicResultEntry(topic);
              return (
                <li key={topic.id}>
                  <SearchResultCard entry={entry} />
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {selectedRecord && (
        <div id="search-intelligence-detail">
          <SearchIntelligenceDetail record={selectedRecord} />
        </div>
      )}
    </div>
  );
}

function SupportedSearches({ centered = false }: { centered?: boolean }) {
  return (
    <div className={centered ? "mx-auto max-w-xl" : "mt-6"}>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        {SEARCH_GATEWAY.supportedSearchesLabel}
      </p>
      <ul
        className={`mt-3 flex flex-wrap gap-2 ${centered ? "justify-center" : ""}`}
        aria-label="Supported searches"
      >
        {SEARCH_SUPPORTED_SUGGESTIONS.map((example) => (
          <li key={example}>
            <Link
              href={`/search?q=${encodeURIComponent(example)}`}
              className="inline-flex min-h-9 items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3.5 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              {example}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
