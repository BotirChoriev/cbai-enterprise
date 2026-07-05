"use client";

import { useMemo, useState } from "react";
import {
  universities,
  getUniversityCountries,
  getUniversityTypes,
} from "@/lib/universities";
import {
  toUniversityEntity,
  UNIVERSITY_METADATA_FIELDS,
} from "@/lib/universities.adapter";
import EntityLayout from "@/components/entity/EntityLayout";
import UniversityFilters from "@/components/universities/UniversityFilters";
import UniversityList from "@/components/universities/UniversityList";
import UniversityRelationships from "@/components/universities/UniversityRelationships";

export default function UniversitiesPage() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("All");
  const [type, setType] = useState("All");
  const [selectedId, setSelectedId] = useState(universities[0].id);

  const countries = useMemo(() => getUniversityCountries(), []);
  const types = useMemo(() => getUniversityTypes(), []);

  const filtered = useMemo(() => {
    return universities.filter((u) => {
      const matchesSearch =
        search === "" ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.icon.toLowerCase().includes(search.toLowerCase()) ||
        u.city.toLowerCase().includes(search.toLowerCase());
      const matchesCountry = country === "All" || u.country === country;
      const matchesType = type === "All" || u.type === type;
      return matchesSearch && matchesCountry && matchesType;
    });
  }, [search, country, type]);

  const selectedUniversity =
    universities.find((u) => u.id === selectedId) ??
    filtered[0] ??
    universities[0];

  const selectedEntity = toUniversityEntity(selectedUniversity);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-cyan-500/5"
        />
        <div className="relative">
          <p className="text-[10px] font-medium uppercase tracking-widest text-violet-400">
            Global AI Operating System
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            Universities Intelligence
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Academic research profiles, AI readiness, and institutional
            relationships across global universities.
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
          <EntityLayout
            entity={selectedEntity}
            metadataFields={UNIVERSITY_METADATA_FIELDS}
            showScoreCards
            aiConfidence={95.4}
          >
            <UniversityRelationships
              relationships={selectedUniversity.relationships}
              researchAreas={selectedUniversity.researchAreas}
            />
          </EntityLayout>
        </div>
      </div>
    </div>
  );
}
