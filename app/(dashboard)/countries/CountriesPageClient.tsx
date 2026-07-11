"use client";

import { useMemo, useState } from "react";
import type { CountryRegion } from "@/lib/countries";
import { countries } from "@/lib/countries";
import { getCountryRelationships } from "@/lib/countries.adapter";
import { buildCountryUserJourney } from "@/lib/country-user-journey";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import CountryFilters from "@/components/countries/CountryFilters";
import CountryCard from "@/components/countries/CountryCard";
import CountryRelationships from "@/components/countries/CountryRelationships";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import { CountryIntelligencePanel } from "@/components/countries/CountryIntelligencePanel";

export default function CountriesPageClient() {
  const { context, setCountry, recordEntityView } = usePlatformContext();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<CountryRegion | "All">("All");
  const [fallbackId, setFallbackId] = useState(countries[0].id);
  const selectedId = context.country?.id ?? fallbackId;
  const searchQuery = context.searchQuery;

  const filtered = useMemo(() => {
    return countries.filter((country) => {
      const matchesSearch =
        search === "" ||
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.code.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = region === "All" || country.region === region;
      return matchesSearch && matchesRegion;
    });
  }, [search, region]);

  const selectedCountry =
    countries.find((country) => country.id === selectedId) ?? filtered[0] ?? countries[0];

  const journey = useMemo(() => {
    const relationships = getCountryRelationships(selectedCountry);
    return buildCountryUserJourney(selectedCountry, relationships);
  }, [selectedCountry]);

  function handleSelectCountry(countryId: string) {
    const country = countries.find((item) => item.id === countryId);
    if (!country) return;

    setFallbackId(country.id);
    setCountry(country.id);
    recordEntityView({
      kind: "country",
      id: country.id,
      name: country.name,
      code: country.code,
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-cyan-500/10 bg-slate-950/50 px-6 py-5 backdrop-blur-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Countries</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-500">
          Overview, available information, missing information, and reports for each country.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-4">
          <CountryFilters
            search={search}
            region={region}
            onSearchChange={setSearch}
            onRegionChange={setRegion}
            resultCount={filtered.length}
          />
          <div className="space-y-2">
            {filtered.length > 0 ? (
              filtered.map((country) => (
                <CountryCard
                  key={country.id}
                  country={country}
                  isSelected={selectedCountry.id === country.id}
                  onSelect={() => handleSelectCountry(country.id)}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 px-5 py-12 text-center">
                <p className="text-sm text-zinc-500">No countries match your filters.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8 xl:col-span-8">
          <CountryIntelligencePanel
            journey={journey}
            country={selectedCountry}
            searchQuery={searchQuery || undefined}
          />
          <EntityOptionalExploration>
            <CountryRelationships profile={journey.profile} />
          </EntityOptionalExploration>
        </div>
      </div>
    </div>
  );
}
