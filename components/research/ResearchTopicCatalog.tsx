"use client";

import { useMemo, useState } from "react";
import ResearchDomainFilter from "@/components/research/ResearchDomainFilter";
import ResearchTopicCard from "@/components/research/ResearchTopicCard";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import {
  filterResearchTopics,
  getResearchTopicCountByDomain,
  RESEARCH_TOPICS,
  type ResearchDomainId,
} from "@/lib/research/research-topics";

type ResearchTopicCatalogProps = {
  initialQuery?: string;
};

export default function ResearchTopicCatalog({ initialQuery = "" }: ResearchTopicCatalogProps) {
  const [filterQuery, setFilterQuery] = useState(initialQuery);
  const [selectedDomain, setSelectedDomain] = useState<ResearchDomainId | "all">("all");

  const topicCounts = useMemo(() => getResearchTopicCountByDomain(RESEARCH_TOPICS), []);

  const filteredTopics = useMemo(
    () =>
      filterResearchTopics(RESEARCH_TOPICS, {
        query: filterQuery,
        domainId: selectedDomain,
      }),
    [filterQuery, selectedDomain],
  );

  return (
    <section aria-labelledby="research-catalog-heading" className="space-y-6">
      <div className="space-y-2">
        <p className={cbaiSectionEyebrow}>Research topics catalog</p>
        <h2 id="research-catalog-heading" className="text-2xl font-semibold text-zinc-50">
          Browse research domains and topics
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Structured read-only catalog with detail pages for each research topic. No live
          databases, publications, or researcher profiles are connected.
        </p>
      </div>

      <div className={`${cbaiGlassCard} space-y-4 p-4`}>
        <label htmlFor="catalog-filter" className="sr-only">
          Filter research topics
        </label>
        <input
          id="catalog-filter"
          type="search"
          value={filterQuery}
          onChange={(event) => setFilterQuery(event.target.value)}
          placeholder="Filter by topic, method, domain, or evidence type..."
          className="home-search-input w-full rounded-lg border border-zinc-800/80 bg-slate-950/70 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/30"
        />
        <ResearchDomainFilter
          selectedDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
          topicCounts={topicCounts}
        />
      </div>

      <p className="text-sm text-zinc-500">
        Showing {filteredTopics.length} of {RESEARCH_TOPICS.length} research topics
      </p>

      {filteredTopics.length === 0 ? (
        <div className={`${cbaiGlassCard} px-5 py-8 text-center`}>
          <p className="text-sm text-zinc-400">No research topics match your filter.</p>
          <p className="mt-1 text-xs text-zinc-600">Try a different domain or search term.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filteredTopics.map((topic) => (
            <li key={topic.topicId}>
              <ResearchTopicCard topic={topic} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
