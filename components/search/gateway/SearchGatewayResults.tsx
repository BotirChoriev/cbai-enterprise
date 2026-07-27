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
import { getEntityDetailHref } from "@/lib/global-search";
import type { Entity } from "@/lib/entity/entity.types";
import TopicResultCard from "@/components/search/gateway/SearchResultCard";
import AddToMissionButton from "@/components/mission/MissionOperatingActions";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import VoiceSummaryButton from "@/components/shared/VoiceSummaryButton";
import EmptyState from "@/components/shared/EmptyState";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useContextualHref } from "@/lib/context/use-contextual-href";
import { cbaiLinkMuted, cbaiMineralPanel, cbaiProminentAction } from "@/components/brand/brand-classes";

type SearchGatewayResultsProps = {
  response: GatewaySearchResponse;
  query: string;
};

const OPENABLE_GROUP_IDS = new Set(["countries", "companies", "universities", "research_topics", "projects"]);
const TOPIC_GROUP_IDS = new Set<SearchResultGroupId>(["knowledge", "evidence", "future_modules"]);

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

export default function SearchGatewayResults({ response, query }: SearchGatewayResultsProps) {
  const { t } = useTranslation();
  const singleEntity = useMemo(() => resolveSingleEntityMatch(response), [response]);

  if (!response.query) {
    return <SearchExamples />;
  }

  if (!response.hasResults) {
    return (
      <EmptyState
        variant="section"
        message={t("search.notInRegistry", { query: response.query })}
        action={
          <>
            <p className="text-xs text-zinc-500">{t("search.noResultsHint")}</p>
            {response.closestMatches.length > 0 ? (
              <div className="mt-3 space-y-2 text-left">
                <p className="text-xs font-medium text-zinc-400">{t("search.closestMatchesHeading")}</p>
                <ul className="space-y-1.5">
                  {response.closestMatches.map((match) => (
                    <li key={match.entity.id} className="rounded-md border border-zinc-800/80 px-3 py-2 text-sm">
                      <Link href={getEntityDetailHref(match.entity)} className={cbaiLinkMuted}>
                        {match.entity.name}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-zinc-600">{t("search.closestMatchNote")}</p>
                      {match.matchReasons[0] ? (
                        <p className="text-[11px] text-zinc-500">
                          {t("search.matchReasonLabel")}: {match.matchReasons[0].snippet}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/research" className={cbaiProminentAction}>
                {t("search.createResearchRequest")}
              </Link>
              <Link href="/evidence" className={cbaiLinkMuted}>
                {t("search.connectSourceAction")}
              </Link>
            </div>
            <p className="mt-4 text-[11px] text-zinc-600">{t("search.examplesAreNotResults")}</p>
            <SearchExamples />
          </>
        }
      />
    );
  }

  const topicGroups = collectTopicGroups(response);

  if (singleEntity && topicGroups.length === 0) {
    const entry = buildEntityResultEntry(singleEntity, query);
    return (
      <EntityMatchCard
        entry={entry}
        matchedLabel={t("search.matched", { name: entry.name })}
        prominent
      />
    );
  }

  const results = collectEntityResults(response);

  if (results.length === 0 && topicGroups.length === 0) {
    return (
      <div className="space-y-4" role="status">
        <p className="text-sm text-zinc-300">{t("search.noOpenableResults", { query: response.query })}</p>
        <p className="text-xs text-zinc-500">{t("search.noResultsHint")}</p>
        <SearchExamples />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.length > 0 ? (
        <div className="space-y-3">
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
  prominent?: boolean;
};

function EntityMatchCard({ entry, matchedLabel, prominent = false }: EntityMatchCardProps) {
  const { t } = useTranslation();
  const { recordEntityView, context } = usePlatformContext();
  const { entityProfileHref, contextualHref } = useContextualHref();
  const disclosure = useProgressiveDisclosure();
  const showSecondary = disclosure.level === "expert";
  const showCountryInHeader = entry.type !== "Country" && entry.countryLabel;

  const profileHref = useMemo(
    () => entityProfileHref(entry.href),
    [entityProfileHref, entry.href],
  );

  function handleOpenProfile() {
    if (entry.entityRef) recordEntityView(entry.entityRef);
  }

  return (
    <article className={cbaiMineralPanel}>
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

      {entry.coverageLabel ? (
        <p className="mt-1 text-xs text-teal-400/80">{entry.coverageLabel}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={profileHref}
          onClick={handleOpenProfile}
          className={
            prominent
              ? `${cbaiProminentAction} w-full justify-between`
              : `${cbaiProminentAction} gap-1.5`
          }
        >
          {t("search.openProfile")}
          <span aria-hidden="true">→</span>
        </Link>
        {entry.entityRef ? <AddToMissionButton entity={entry.entityRef} compact /> : null}
      </div>

      {showSecondary ? (
        <details className="mt-3 group">
          <summary className={cbaiLinkMuted}>{t("zeroLearningCurve.advancedDetails")}</summary>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {entry.showCompare ? (
              <Link href={profileSectionHref(profileHref, "compare")} className={cbaiLinkMuted}>
                {t("search.compareArrow")}
              </Link>
            ) : null}
            {entry.showReports ? (
              <Link href={contextualHref("/reports", context)} className={cbaiLinkMuted}>
                {t("search.openReportsArrow")}
              </Link>
            ) : null}
            {entry.createProjectHref ? (
              <Link href={entry.createProjectHref} className={cbaiLinkMuted}>
                {t("search.createProjectArrow")}
              </Link>
            ) : null}
            {entry.entityRef ? <SaveToWorkspaceButton entity={entry.entityRef} /> : null}
            <VoiceSummaryButton
              text={[entry.name, entry.type, entry.distinguishingFact, entry.coverageLabel]
                .filter(Boolean)
                .join(". ")}
            />
          </div>
        </details>
      ) : null}
    </article>
  );
}

function SearchExamples() {
  const { t } = useTranslation();
  const examples = [
    { label: t("search.exampleCountry"), query: "Japan" },
    { label: t("search.exampleCompany"), query: "Apple" },
    { label: t("search.exampleUniversity"), query: "Harvard University" },
    { label: t("search.exampleResearch"), query: "microbiology" },
  ] as const;

  return (
    <ul className="flex flex-wrap gap-2" aria-label={t("search.exampleSearchesAria")}>
      {examples.map((example) => (
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
