"use client";

import { useMemo, useState } from "react";
import type { CountryRegion } from "@/lib/countries";
import { countries } from "@/lib/countries";
import {
  toCountryEntity,
  getCountryRelationships,
  COUNTRY_METADATA_FIELDS,
} from "@/lib/countries.adapter";
import EntityLayout from "@/components/entity/EntityLayout";
import CountryFilters from "@/components/countries/CountryFilters";
import CountryCard from "@/components/countries/CountryCard";
import CountryRelationships from "@/components/countries/CountryRelationships";

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

  const selectedEntity = toCountryEntity(selectedCountry);
  const relationships = getCountryRelationships(selectedCountry);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-sky-500/5 to-violet-500/5"
        />
        <div className="relative">
          <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
            Global AI Operating System
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            Countries Intelligence
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Real-time geopolitical, economic, and AI readiness analysis across
            global markets.
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
          <EntityLayout
            entity={selectedEntity}
            metadataFields={COUNTRY_METADATA_FIELDS}
            showScoreCards
            aiConfidence={94.2}
          >
            <CountryRelationships
              relationships={relationships}
              businessOpportunities={selectedCountry.businessOpportunities}
            />
          </EntityLayout>
        </div>
      </div>
    </div>
  );
}
