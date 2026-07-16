"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  universities,
  getUniversityCountries,
  getUniversityTypes,
} from "@/lib/universities";
import { getUniversityLinkedEntities } from "@/lib/universities.adapter";
import { buildUniversityUserJourney } from "@/lib/university-user-journey";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import UniversityFilters from "@/components/universities/UniversityFilters";
import UniversityList from "@/components/universities/UniversityList";
import UniversityRelationships from "@/components/universities/UniversityRelationships";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import EntityExploreShell from "@/components/shared/EntityExploreShell";
import { UniversityIntelligencePanel } from "@/components/universities/UniversityIntelligencePanel";
import EntityNotFoundNotice from "@/components/system/EntityNotFoundNotice";

export default function UniversitiesPageClient() {
  const { context, setUniversity, recordEntityView } = usePlatformContext();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("All");
  const [type, setType] = useState("All");
  const [fallbackId, setFallbackId] = useState(universities[0].id);
  const selectedId = context.university?.id ?? fallbackId;
  const requestedUniversityId = searchParams.get("university");
  const requestedUniversityNotFound =
    Boolean(requestedUniversityId) && !universities.some((u) => u.id === requestedUniversityId);

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

  const journey = useMemo(
    () =>
      buildUniversityUserJourney(
        selectedUniversity,
        getUniversityLinkedEntities(selectedUniversity),
      ),
    [selectedUniversity],
  );

  function handleSelectUniversity(universityId: string) {
    const university = universities.find((u) => u.id === universityId);
    if (!university) return;

    setFallbackId(university.id);
    setUniversity(university.id);
    recordEntityView({
      kind: "university",
      id: university.id,
      name: university.name,
      code: university.icon,
      countryName: university.country,
    });
  }

  return (
    <EntityExploreShell
      title={t("universities.title")}
      description={t("entities.universitiesDescription")}
      notFoundNotice={
        requestedUniversityNotFound && requestedUniversityId ? (
          <EntityNotFoundNotice
            requestedId={requestedUniversityId}
            entityLabel="university"
            fallbackName={selectedUniversity.name}
          />
        ) : null
      }
      filters={
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
      }
      list={
        <UniversityList
          universities={filtered}
          selectedId={selectedUniversity.id}
          onSelect={handleSelectUniversity}
          onClearFilters={() => {
            setSearch("");
            setCountry("All");
            setType("All");
          }}
          emptyMessage={t("entities.noMatchFilters")}
          clearFiltersLabel={t("entities.clearFilters")}
        />
      }
      detail={
        <>
          <UniversityIntelligencePanel journey={journey} university={selectedUniversity} />
          <EntityOptionalExploration>
            <UniversityRelationships profile={journey.profile} />
          </EntityOptionalExploration>
        </>
      }
    />
  );
}
