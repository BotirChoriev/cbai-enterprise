"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CountryRegion } from "@/lib/countries";
import { countries } from "@/lib/countries";
import { getCountryRelationships } from "@/lib/countries.adapter";
import { buildCountryUserJourney } from "@/lib/country-user-journey";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import CountryFilters from "@/components/countries/CountryFilters";
import CountryList from "@/components/countries/CountryList";
import CountryRelationships from "@/components/countries/CountryRelationships";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import EntityExploreShell from "@/components/shared/EntityExploreShell";
import { CountryIntelligencePanel } from "@/components/countries/CountryIntelligencePanel";
import WorldIntelligenceMap from "@/components/countries/WorldIntelligenceMap";
import EntityNotFoundNotice from "@/components/system/EntityNotFoundNotice";
import { cbaiDisclosurePanel, cbaiDisclosureSummary } from "@/components/brand/brand-classes";

export default function CountriesPageClient() {
  const { context, setCountry, recordEntityView } = usePlatformContext();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<CountryRegion | "All">("All");
  const [fallbackId, setFallbackId] = useState(countries[0].id);
  const selectedId = context.country?.id ?? fallbackId;
  const searchQuery = context.searchQuery;
  const requestedCountryId = searchParams.get("country");
  const requestedCountryNotFound =
    Boolean(requestedCountryId) && !countries.some((c) => c.id === requestedCountryId);

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
    <EntityExploreShell
      title={t("countries.title")}
      description={t("entities.countriesDescription")}
      notFoundNotice={
        requestedCountryNotFound && requestedCountryId ? (
          <EntityNotFoundNotice
            requestedId={requestedCountryId}
            entityLabel="country"
            fallbackName={selectedCountry.name}
          />
        ) : null
      }
      beforeGrid={
        <details className={cbaiDisclosurePanel} open={!context.country}>
          <summary className={cbaiDisclosureSummary}>
            {context.country
              ? t("entities.worldMapShowing", { name: context.country.name })
              : t("entities.worldMapTitle")}
          </summary>
          <div className="border-t border-zinc-800 px-4 py-4">
            <WorldIntelligenceMap />
          </div>
        </details>
      }
      filters={
        <CountryFilters
          search={search}
          region={region}
          onSearchChange={setSearch}
          onRegionChange={setRegion}
          resultCount={filtered.length}
        />
      }
      list={
        <CountryList
          countries={filtered}
          selectedId={selectedCountry.id}
          onSelect={handleSelectCountry}
          onClearFilters={() => {
            setSearch("");
            setRegion("All");
          }}
          emptyMessage={t("entities.noMatchFilters")}
          clearFiltersLabel={t("entities.clearFilters")}
        />
      }
      detail={
        <>
          <CountryIntelligencePanel
            journey={journey}
            country={selectedCountry}
            searchQuery={searchQuery || undefined}
          />
          <EntityOptionalExploration>
            <CountryRelationships profile={journey.profile} />
          </EntityOptionalExploration>
        </>
      }
    />
  );
}
