"use client";

import { useMemo, useState } from "react";
import type { CountryRegion } from "@/lib/countries";
import { countries } from "@/lib/countries";
import { getCountryRelationships } from "@/lib/countries.adapter";
import { buildCountryIntelligenceProfile } from "@/lib/countries.intelligence";
import CountryFilters from "@/components/countries/CountryFilters";
import CountryCard from "@/components/countries/CountryCard";
import CountryRelationships from "@/components/countries/CountryRelationships";
import { CountryIntelligencePanel } from "@/components/countries/CountryIntelligencePanel";

export default function CountriesPage() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<CountryRegion | "All">("All");
  const [selectedId, setSelectedId] = useState(countries[0].id);

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      const matchesSearch =
        search === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = region === "All" || c.region === region;
      return matchesSearch && matchesRegion;
    });
  }, [search, region]);

  const selectedCountry =
    countries.find((c) => c.id === selectedId) ?? filtered[0] ?? countries[0];

  const relationships = getCountryRelationships(selectedCountry);
  const intelligenceProfile = buildCountryIntelligenceProfile(
    selectedCountry,
    relationships,
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-sky-500/5 to-violet-500/5"
        />
        <div className="relative">
          <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
            CBAI Country Intelligence
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            Countries Intelligence
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Evidence-based country registry profiles. Scores and narratives are
            withheld unless backed by connected local evidence sources.
          </p>
        </div>
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
                  onSelect={() => setSelectedId(country.id)}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 px-5 py-12 text-center">
                <p className="text-sm text-zinc-500">
                  No countries match your filters.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 xl:col-span-8">
          <CountryIntelligencePanel
            profile={intelligenceProfile}
            countryName={selectedCountry.name}
            countryCode={selectedCountry.code}
            capital={selectedCountry.capital}
            region={selectedCountry.region}
            government={selectedCountry.government}
          />
          <CountryRelationships relationships={relationships} />
        </div>
      </div>
    </div>
  );
}
