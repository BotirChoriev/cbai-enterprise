"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { GatewaySearchResponse } from "@/lib/search-gateway";
import { SEARCH_GATEWAY, SEARCH_SUPPORTED_SUGGESTIONS } from "@/lib/search-gateway";
import { buildEntityResultEntry } from "@/lib/search-intelligence-entry";
import { buildPlatformEntityHref } from "@/lib/global-search";
import { profileSectionHref } from "@/components/shared/entity-profile-path";
import type { Entity } from "@/lib/entity/entity.types";

type SearchGatewayResultsProps = {
  response: GatewaySearchResponse;
  query: string;
};

const OPENABLE_GROUP_IDS = new Set(["countries", "companies", "universities"]);

const actionClass =
  "inline-flex min-h-9 flex-1 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100 sm:flex-none sm:px-4 sm:text-sm";

const actionPrimaryClass =
  "inline-flex min-h-9 flex-1 items-center justify-center rounded-lg bg-zinc-100 px-3 text-xs font-semibold text-zinc-900 transition-colors hover:bg-white sm:flex-none sm:px-4 sm:text-sm";

function resolveSingleEntityMatch(response: GatewaySearchResponse): Entity | null {
  const entities = response.groups
    .filter((group) => OPENABLE_GROUP_IDS.has(group.id))
    .flatMap((group) => group.entities.map((result) => result.entity));

  return entities.length === 1 ? entities[0] : null;
}

export default function SearchGatewayResults({
  response,
  query,
}: SearchGatewayResultsProps) {
  const router = useRouter();
  const singleEntity = useMemo(() => resolveSingleEntityMatch(response), [response]);

  useEffect(() => {
    if (!singleEntity) return;
    router.replace(buildPlatformEntityHref(singleEntity, { searchQuery: query }));
  }, [singleEntity, query, router]);

  if (!response.query) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-8 sm:px-6">
        <p className="text-sm text-zinc-300">Type a name above to find a profile.</p>
        <SupportedSearches />
      </div>
    );
  }

  if (!response.hasResults) {
    return (
      <div
        className="rounded-xl border border-dashed border-zinc-800 px-4 py-12 text-center sm:px-6"
        role="status"
      >
        <p className="text-base font-medium text-zinc-300">{SEARCH_GATEWAY.noResultsMessage}</p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-500">
          {SEARCH_GATEWAY.noResultsDetail}
        </p>
        <div className="mt-8">
          <SupportedSearches centered />
        </div>
      </div>
    );
  }

  if (singleEntity) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-8 sm:px-6">
        <p className="text-sm text-zinc-400">Opening {singleEntity.name}…</p>
      </div>
    );
  }

  const entityGroups = response.groups.filter((group) => OPENABLE_GROUP_IDS.has(group.id));
  const matchCount = entityGroups.reduce((n, g) => n + g.entities.length, 0);

  return (
    <div className="space-y-8">
      <p className="text-sm text-zinc-500">
        {matchCount} profile{matchCount === 1 ? "" : "s"} match &quot;{response.query}&quot;
      </p>

      {entityGroups.map((group) => (
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

          <ul className="grid gap-4">
            {group.entities.map((result) => {
              const entry = buildEntityResultEntry(result.entity, query);
              return (
                <li key={`${result.entity.type}-${result.entity.id}`}>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5">
                    <p className="text-sm font-semibold text-zinc-100">{entry.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{entry.type}</p>
                    <p className="mt-2 text-sm text-zinc-400">{entry.availableInformation}</p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <Link href={entry.href} className={actionPrimaryClass}>
                        Open profile
                      </Link>
                      <Link
                        href={profileSectionHref(entry.href, "compare")}
                        className={actionClass}
                      >
                        Compare evidence
                      </Link>
                      <Link
                        href={profileSectionHref(entry.href, "reports")}
                        className={actionClass}
                      >
                        View report readiness
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function SupportedSearches({ centered = false }: { centered?: boolean }) {
  return (
    <div className={centered ? "mx-auto max-w-xl" : "mt-6"}>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Examples</p>
      <ul
        className={`mt-3 flex flex-wrap gap-2 ${centered ? "justify-center" : ""}`}
        aria-label="Example searches"
      >
        {SEARCH_SUPPORTED_SUGGESTIONS.map((example) => (
          <li key={example}>
            <Link
              href={`/search?q=${encodeURIComponent(example)}`}
              className="inline-flex min-h-9 items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3.5 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-900"
            >
              {example}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
