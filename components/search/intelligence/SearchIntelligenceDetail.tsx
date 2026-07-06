"use client";

import type { SearchIntelligenceRecord } from "@/lib/search-intelligence";
import SearchResultOverview from "@/components/search/intelligence/SearchResultOverview";
import SearchAvailableModules from "@/components/search/intelligence/SearchAvailableModules";
import SearchOfficialSources from "@/components/search/intelligence/SearchOfficialSources";
import SearchRelatedEvidence from "@/components/search/intelligence/SearchRelatedEvidence";
import SearchLimitations from "@/components/search/intelligence/SearchLimitations";

type SearchIntelligenceDetailProps = {
  record: SearchIntelligenceRecord;
};

export default function SearchIntelligenceDetail({ record }: SearchIntelligenceDetailProps) {
  return (
    <div className="space-y-10 rounded-xl border border-zinc-800 bg-zinc-950/40 px-6 py-8">
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-lg font-semibold text-zinc-100">{record.displayName}</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Search intelligence profile — platform navigation hub for this registry entity.
        </p>
      </div>

      <SearchResultOverview record={record} />
      <SearchAvailableModules record={record} />
      <SearchRelatedEvidence record={record} />
      <SearchOfficialSources record={record} />
      <SearchLimitations record={record} />
    </div>
  );
}
