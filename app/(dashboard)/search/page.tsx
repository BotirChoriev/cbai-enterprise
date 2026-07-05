"use client";

import { useMemo, useState } from "react";
import {
  searchEntities,
  generateSearchInsight,
  DEFAULT_SEARCH_FILTERS,
  getAllEntities,
  type SearchFilters,
} from "@/lib/global-search";
import GlobalSearchBox from "@/components/search/GlobalSearchBox";
import SearchFiltersPanel from "@/components/search/SearchFilters";
import SearchResults from "@/components/search/SearchResults";
import SearchInsightPanel from "@/components/search/SearchInsightPanel";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);

  const totalEntities = useMemo(() => getAllEntities().length, []);

  const results = useMemo(
    () => searchEntities(query, filters),
    [query, filters],
  );

  const insight = useMemo(
    () => generateSearchInsight(query, results, filters),
    [query, results, filters],
  );

  return (
    <div className="space-y-6">
      <GlobalSearchBox
        query={query}
        onQueryChange={setQuery}
        resultCount={totalEntities}
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-3">
          <SearchFiltersPanel filters={filters} onChange={setFilters} />
        </div>

        <div className="xl:col-span-6">
          <SearchResults results={results} query={query} />
        </div>

        <div className="xl:col-span-3">
          <SearchInsightPanel insight={insight} />
        </div>
      </div>
    </div>
  );
}
