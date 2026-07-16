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
import EntityPageHeader from "@/components/shared/EntityPageHeader";
import { CountryIntelligencePanel } from "@/components/countries/CountryIntelligencePanel";
import WorldIntelligenceMap from "@/components/countries/WorldIntelligenceMap";
import ContextualOperatorBanner from "@/components/assistant/ContextualOperatorBanner";
import EntityNotFoundNotice from "@/components/system/EntityNotFoundNotice";

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
    <div className="space-y-6">
      <EntityPageHeader title={t("countries.title")} description={t("entities.countriesDescription")} />

      {requestedCountryNotFound && requestedCountryId ? (
        <EntityNotFoundNotice
          requestedId={requestedCountryId}
          entityLabel="country"
          fallbackName={selectedCountry.name}
        />
      ) : null}

      <ContextualOperatorBanner />

      <details className="scroll-mt-6 rounded-lg border border-zinc-800/60 bg-zinc-950/50" open={!context.country}>
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-zinc-500 marker:content-none [&::-webkit-details-marker]:hidden">
          {context.country
            ? t("entities.worldMapShowing", { name: context.country.name })
            : t("entities.worldMapTitle")}
        </summary>
        <div className="border-t border-zinc-800 px-4 py-4">
          <WorldIntelligenceMap />
        </div>
      </details>

      <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
        <div className="space-y-4 xl:sticky xl:top-6 xl:col-span-4 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
          <CountryFilters
            search={search}
            region={region}
            onSearchChange={setSearch}
            onRegionChange={setRegion}
            resultCount={filtered.length}
          />
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
