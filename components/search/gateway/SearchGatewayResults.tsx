"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { GatewaySearchResponse } from "@/lib/search-gateway";
import {
  SEARCH_GATEWAY,
  SEARCH_SUPPORTED_SUGGESTIONS,
} from "@/lib/search-gateway";
import { buildEntityResultEntry, buildTopicResultEntry } from "@/lib/search-intelligence-entry";
import { buildPlatformEntityHref } from "@/lib/global-search";
import type { Entity } from "@/lib/entity/entity.types";

type SearchGatewayResultsProps = {
  response: GatewaySearchResponse;
  query: string;
};

const OPENABLE_GROUP_IDS = new Set(["countries", "companies", "universities"]);

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
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-6 py-8">
        <p className="text-sm text-zinc-300">Type a country, company, or university name.</p>
        <p className="mt-1 text-sm text-zinc-500">{SEARCH_GATEWAY.emptyPrompt}</p>
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
        <div className="mt-8">
          <SupportedSearches centered />
        </div>
      </div>
    );
  }

  if (singleEntity) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-6 py-8">
        <p className="text-sm text-zinc-400">Opening {singleEntity.name}…</p>
      </div>
    );
  }

  const entityGroups = response.groups.filter((group) => OPENABLE_GROUP_IDS.has(group.id));
  const moduleGroups = response.groups.filter(
    (group) =>
      (group.id === "knowledge" || group.id === "evidence") &&
      group.topics.some((topic) => topic.connected && topic.href),
  );

  return (
    <div className="space-y-10">
      <p className="text-sm text-zinc-500">
        {entityGroups.reduce((n, g) => n + g.entities.length, 0)} profiles match{" "}
        <span className="font-medium text-zinc-300">&quot;{response.query}&quot;</span>
        {" — "}
        select one to review evidence, decision package, and reports.
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

          <ul className="grid gap-4 lg:grid-cols-2">
            {group.entities.map((result) => {
              const entry = buildEntityResultEntry(result.entity, query);
              return (
                <li key={`${result.entity.type}-${result.entity.id}`}>
                  <Link
                    href={entry.href}
                    className="group block rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-cyan-500/30 hover:bg-zinc-900/70"
                  >
                    <EntityResultContent entry={entry} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {moduleGroups.map((group) => (
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
            {group.topics
              .filter((topic) => topic.connected && topic.href)
              .map((topic) => {
                const entry = buildTopicResultEntry(topic);
                return (
                  <li key={topic.id}>
                    <Link
                      href={entry.href}
                      className="group block rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-cyan-500/30 hover:bg-zinc-900/70"
                    >
                      <p className="text-sm font-semibold text-zinc-100 group-hover:text-cyan-300">
                        {entry.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">{entry.type}</p>
                      <p className="mt-2 text-sm text-zinc-400">{entry.availableInformation}</p>
                      <p className="mt-3 text-xs text-cyan-500/80">Open module →</p>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function EntityResultContent({
  entry,
}: {
  entry: ReturnType<typeof buildEntityResultEntry>;
}) {
  return (
    <>
      <p className="text-sm font-semibold text-zinc-100 group-hover:text-cyan-300">
        {entry.name}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{entry.type}</p>
      <p className="mt-2 text-sm text-zinc-400">{entry.availableInformation}</p>
      <p className="mt-3 text-xs text-cyan-500/80">Open profile →</p>
    </>
  );
}

function SupportedSearches({ centered = false }: { centered?: boolean }) {
  return (
    <div className={centered ? "mx-auto max-w-xl" : "mt-6"}>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Try these examples
      </p>
      <ul
        className={`mt-3 flex flex-wrap gap-2 ${centered ? "justify-center" : ""}`}
        aria-label="Example searches"
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
