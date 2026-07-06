"use client";

import { useMemo, useState } from "react";
import {
  universities,
  getUniversityCountries,
  getUniversityTypes,
} from "@/lib/universities";
import {
  getUniversityRelationships,
  getUniversityLinkedEntities,
} from "@/lib/universities.adapter";
import { buildUniversityIntelligenceProfile } from "@/lib/universities.intelligence";
import UniversityFilters from "@/components/universities/UniversityFilters";
import UniversityList from "@/components/universities/UniversityList";
import UniversityRelationships from "@/components/universities/UniversityRelationships";
import { UniversityIntelligencePanel } from "@/components/universities/UniversityIntelligencePanel";

export default function UniversitiesPage() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("All");
  const [type, setType] = useState("All");
  const [selectedId, setSelectedId] = useState(universities[0].id);

  const countries = useMemo(() => getUniversityCountries(), []);
  const types = useMemo(() => getUniversityTypes(), []);

  const filtered = useMemo(() => {
    return universities.filter((university) => {
      const normalizedSearch = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        university.name.toLowerCase().includes(normalizedSearch) ||
        university.icon.toLowerCase().includes(normalizedSearch) ||
        university.city.toLowerCase().includes(normalizedSearch) ||
        university.country.toLowerCase().includes(normalizedSearch) ||
        university.type.toLowerCase().includes(normalizedSearch);
      const matchesCountry = country === "All" || university.country === country;
      const matchesType = type === "All" || university.type === type;
      return matchesSearch && matchesCountry && matchesType;
    });
  }, [search, country, type]);

  const selectedUniversity =
    universities.find((university) => university.id === selectedId) ??
    filtered[0] ??
    universities[0];

  const relationships = getUniversityRelationships(selectedUniversity);
  const intelligenceProfile = buildUniversityIntelligenceProfile(
    selectedUniversity,
    getUniversityLinkedEntities(selectedUniversity),
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-cyan-500/5"
        />
        <div className="relative">
          <p className="text-[10px] font-medium uppercase tracking-widest text-violet-400">
            CBAI University Intelligence
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            Universities Intelligence
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Evidence-based university profiles from the local registry. Rankings,
            scores, and research narratives are withheld unless backed by
            connected evidence sources.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-4">
          <UniversityFilters
            search={search}
            country={country}
            type={type}
            countries={countries}
            types={types}
            onSearchChange={setSearch}
            onCountryChange={setCountry}
            onTypeChange={setType}
            resultCount={filtered.length}
          />
          <UniversityList
            universities={filtered}
            selectedId={selectedUniversity.id}
            onSelect={setSelectedId}
          />
        </div>

        <div className="space-y-6 xl:col-span-8">
          <UniversityIntelligencePanel
            profile={intelligenceProfile}
            name={selectedUniversity.name}
            icon={selectedUniversity.icon}
            country={selectedUniversity.country}
            city={selectedUniversity.city}
            type={selectedUniversity.type}
            founded={selectedUniversity.founded}
            website={selectedUniversity.website}
          />
          <UniversityRelationships relationships={relationships} />
        </div>
      </div>
    </div>
  );
}
