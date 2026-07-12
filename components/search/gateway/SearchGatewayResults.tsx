"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { GatewaySearchResponse, SearchResultGroupId } from "@/lib/search-gateway";
import {
  buildEntityResultEntry,
  buildTopicResultEntry,
  type SearchResultEntry,
} from "@/lib/search-intelligence-entry";
import { profileSectionHref } from "@/components/shared/entity-profile-path";
import type { Entity } from "@/lib/entity/entity.types";
import TopicResultCard from "@/components/search/gateway/SearchResultCard";

type SearchGatewayResultsProps = {
  response: GatewaySearchResponse;
  query: string;
};

const OPENABLE_GROUP_IDS = new Set(["countries", "companies", "universities", "research_topics", "projects"]);
const TOPIC_GROUP_IDS = new Set<SearchResultGroupId>(["knowledge", "evidence", "future_modules"]);

const SEARCH_EXAMPLES = [
  { label: "Country", query: "Japan" },
  { label: "Company", query: "Apple" },
  { label: "University", query: "Harvard University" },
  { label: "Research Topic", query: "microbiology" },
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

function collectTopicGroups(response: GatewaySearchResponse) {
  return response.groups.filter(
    (group) => TOPIC_GROUP_IDS.has(group.id) && group.topics.length > 0,
  );
}

export default function SearchGatewayResults({
  response,
  query,
}: SearchGatewayResultsProps) {
  const singleEntity = useMemo(() => resolveSingleEntityMatch(response), [response]);

  if (!response.query) {
    return <SearchExamples />;
  }

  if (!response.hasResults) {
    return (
      <div className="space-y-4" role="status">
        <p className="text-sm text-zinc-300">
          No matching country, company, university, or research topic was found.
        </p>
        <SearchExamples />
      </div>
    );
  }

  const topicGroups = collectTopicGroups(response);

  if (singleEntity && topicGroups.length === 0) {
    const entry = buildEntityResultEntry(singleEntity, query);
    return <EntityMatchCard entry={entry} matchedLabel={`Matched: ${entry.name}`} />;
  }

  const results = collectEntityResults(response);

  return (
    <div className="space-y-6">
      {results.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">
            {results.length} profile{results.length === 1 ? "" : "s"} · pick one to open
          </p>
          <ul className="space-y-2">
            {results.map((result) => {
              const entry = buildEntityResultEntry(result.entity, query);
              return (
                <li key={`${result.entity.type}-${result.entity.id}`}>
                  <EntityMatchCard entry={entry} />
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {topicGroups.map((group) => (
        <div key={group.id} className="space-y-3">
          <p className="text-sm text-zinc-500">{group.label}</p>
          <ul className="space-y-2">
            {group.topics.map((topic) => (
              <li key={topic.id}>
                <TopicResultCard entry={buildTopicResultEntry(topic)} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

type EntityMatchCardProps = {
  entry: SearchResultEntry;
  matchedLabel?: string;
};

function EntityMatchCard({ entry, matchedLabel }: EntityMatchCardProps) {
  const showCountryInHeader = entry.type !== "Country" && entry.countryLabel;

  return (
    <article className="rounded-lg bg-zinc-900/50 px-4 py-3">
      {matchedLabel ? (
        <p className="text-sm font-medium text-zinc-200">{matchedLabel}</p>
      ) : (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2 className="text-sm font-semibold text-zinc-100">{entry.name}</h2>
          <span className="text-xs text-zinc-500">{entry.type}</span>
          {showCountryInHeader ? (
            <span className="text-xs text-zinc-600">· {entry.countryLabel}</span>
          ) : null}
        </div>
      )}

      {matchedLabel ? (
        <p className="mt-1 text-xs text-zinc-500">
          {entry.type}
          {showCountryInHeader ? ` · ${entry.countryLabel}` : ""}
        </p>
      ) : null}

      {entry.distinguishingFact ? (
        <p className="mt-1 text-xs text-zinc-400">{entry.distinguishingFact}</p>
      ) : null}

      <p className="mt-1 text-xs text-zinc-600">{entry.nextStep}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={entry.href}
          className="inline-flex min-h-9 items-center rounded-lg bg-zinc-100 px-3.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-white"
        >
          Open profile →
        </Link>
        {!matchedLabel && entry.showCompare ? (
          <Link
            href={profileSectionHref(entry.href, "compare")}
            className="inline-flex min-h-9 items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 text-xs font-medium text-cyan-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          >
            Compare →
          </Link>
        ) : null}
        {!matchedLabel && entry.showReports ? (
          <Link
            href={profileSectionHref(entry.href, "reports")}
            className="inline-flex min-h-9 items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 text-xs font-medium text-cyan-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          >
            Open reports →
          </Link>
        ) : null}
        {entry.createProjectHref ? (
          <Link
            href={entry.createProjectHref}
            className="inline-flex min-h-9 items-center rounded-lg border border-orange-500/30 bg-orange-500/10 px-3.5 text-xs font-medium text-orange-300 transition-colors hover:border-orange-500/50"
          >
            Create Project →
          </Link>
        ) : null}
      </div>
    </article>
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
