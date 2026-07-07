"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { GatewaySearchResponse } from "@/lib/search-gateway";
import { buildEntityResultEntry } from "@/lib/search-intelligence-entry";
import { buildPlatformEntityHref } from "@/lib/global-search";
import { profileSectionHref } from "@/components/shared/entity-profile-path";
import type { Entity } from "@/lib/entity/entity.types";

type SearchGatewayResultsProps = {
  response: GatewaySearchResponse;
  query: string;
};

const OPENABLE_GROUP_IDS = new Set(["countries", "companies", "universities"]);

const SEARCH_EXAMPLES = [
  { label: "Country", query: "Japan" },
  { label: "Company", query: "Apple" },
  { label: "University", query: "Harvard University" },
] as const;

function resolveSingleEntityMatch(response: GatewaySearchResponse): Entity | null {
  const entities = response.groups
    .filter((group) => OPENABLE_GROUP_IDS.has(group.id))
    .flatMap((group) => group.entities.map((result) => result.entity));

  return entities.length === 1 ? entities[0] : null;
}

function collectEntityResults(response: GatewaySearchResponse) {
  return response.groups
    .filter((group) => OPENABLE_GROUP_IDS.has(group.id))
    .flatMap((group) => group.entities);
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
    return <SearchExamples />;
  }

  if (!response.hasResults) {
    return (
      <div className="space-y-4" role="status">
        <p className="text-sm text-zinc-300">
          No matching country, company, or university was found.
        </p>
        <SearchExamples />
      </div>
    );
  }

  if (singleEntity) {
    return <p className="text-sm text-zinc-500">Opening {singleEntity.name}…</p>;
  }

  const results = collectEntityResults(response);

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500">
        {results.length} result{results.length === 1 ? "" : "s"} · pick one to open
      </p>
      <ul className="space-y-2">
        {results.map((result) => {
          const entry = buildEntityResultEntry(result.entity, query);
          return (
            <li key={`${result.entity.type}-${result.entity.id}`}>
              <article className="rounded-lg bg-zinc-900/50 px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <h2 className="text-sm font-semibold text-zinc-100">{entry.name}</h2>
                  <span className="text-xs text-zinc-500">{entry.type}</span>
                  {entry.countryLabel ? (
                    <span className="text-xs text-zinc-600">· {entry.countryLabel}</span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-zinc-400">{entry.shortDescription}</p>
                <p className="mt-1 text-xs text-zinc-600">{entry.nextStep}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    href={entry.href}
                    className="inline-flex min-h-9 items-center rounded-lg bg-zinc-100 px-3.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-white"
                  >
                    Open profile →
                  </Link>
                  {entry.showCompare ? (
                    <Link
                      href={profileSectionHref(entry.href, "compare")}
                      className="text-xs text-cyan-400/90 hover:text-cyan-300"
                    >
                      Compare evidence
                    </Link>
                  ) : null}
                  {entry.showReports ? (
                    <Link
                      href={profileSectionHref(entry.href, "reports")}
                      className="text-xs text-cyan-400/90 hover:text-cyan-300"
                    >
                      Reports
                    </Link>
                  ) : null}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchExamples() {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Example searches">
      {SEARCH_EXAMPLES.map((example) => (
        <li key={example.query}>
          <Link
            href={`/search?q=${encodeURIComponent(example.query)}`}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-900"
          >
            <span>{example.query}</span>
            <span className="text-xs text-zinc-600">{example.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
