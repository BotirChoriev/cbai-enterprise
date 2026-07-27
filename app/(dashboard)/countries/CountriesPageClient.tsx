"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CountryRegion } from "@/lib/countries";
import { countries } from "@/lib/countries";
import { getCountryRelationships } from "@/lib/countries.adapter";
import { buildCountryUserJourney } from "@/lib/country-user-journey";
import { buildCountryProfile } from "@/lib/country-intelligence/profile";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  fillCountryCopy,
  getCountryIntelligenceCopy,
} from "@/lib/i18n/platform-copy-country-intelligence";
import CountryFilters, {
  type CoverageFilter,
  type FreshnessFilter,
} from "@/components/countries/CountryFilters";
import CountryList from "@/components/countries/CountryList";
import CountryRelationships from "@/components/countries/CountryRelationships";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import { CountryIntelligencePanel } from "@/components/countries/CountryIntelligencePanel";
import CountryIntelligenceProfileView from "@/components/countries/CountryIntelligenceProfileView";
import WorldIntelligenceMap from "@/components/countries/WorldIntelligenceMap";
import EntityNotFoundNotice from "@/components/system/EntityNotFoundNotice";
import IntelligencePageFrame from "@/components/shared/IntelligencePageFrame";
import CreateLinkedWorkButton from "@/components/operational-objects/CreateLinkedWorkButton";
import {
  cbaiBtnPrimary,
  cbaiDisclosurePanel,
  cbaiDisclosureSummary,
  cbaiFocusRing,
  cbaiMineralPanel,
} from "@/components/brand/brand-classes";
import type { CountryIntelligenceDomainId } from "@/lib/country-intelligence/types";
import { COUNTRY_INTELLIGENCE_DOMAINS } from "@/lib/country-intelligence/types";

export default function CountriesPageClient() {
  const { context, setCountry, recordEntityView } = usePlatformContext();
  const { t, language } = useTranslation();
  const cis = getCountryIntelligenceCopy(language);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<CountryRegion | "All">("All");
  const [coverage, setCoverage] = useState<CoverageFilter>("all");
  const [freshness, setFreshness] = useState<FreshnessFilter>("all");
  const [domain, setDomain] = useState<"all" | CountryIntelligenceDomainId>("all");
  const [comparisonOnly, setComparisonOnly] = useState(false);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fallbackId, setFallbackId] = useState(countries[0].id);
  const selectedId = context.country?.id ?? fallbackId;
  const searchQuery = context.searchQuery;
  const requestedCountryId = searchParams.get("country");
  const viewParam = searchParams.get("view");
  const domainParam = searchParams.get("domain");
  const sectionParam = searchParams.get("section");
  const historyParam = searchParams.get("history");
  const requestedCountryNotFound =
    Boolean(requestedCountryId) && !countries.some((c) => c.id === requestedCountryId);

  const filtered = useMemo(() => {
    return countries.filter((country) => {
      const profile = buildCountryProfile(country);
      const matchesSearch =
        search === "" ||
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.code.toLowerCase().includes(search.toLowerCase()) ||
        country.capital.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = region === "All" || country.region === region;
      const matchesCoverage =
        coverage === "all" || profile.profileCompleteness === coverage;
      const matchesFreshness = freshness === "all" || profile.dataFreshness === freshness;
      const matchesDomain =
        domain === "all" || profile.domainSlots.some((s) => s.domainId === domain);
      const matchesComparison =
        !comparisonOnly || comparisonIds.includes(country.id) || comparisonIds.length < 4;
      return (
        matchesSearch &&
        matchesRegion &&
        matchesCoverage &&
        matchesFreshness &&
        matchesDomain &&
        matchesComparison
      );
    });
  }, [search, region, coverage, freshness, domain, comparisonOnly, comparisonIds]);

  const selectedCountry =
    countries.find((country) => country.id === selectedId) ?? filtered[0] ?? countries[0];
  const selectedProfile = buildCountryProfile(selectedCountry);

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

  function toggleComparison(id: string) {
    setComparisonIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  const compareHref =
    comparisonIds.length >= 2
      ? `/countries/compare?countries=${encodeURIComponent(comparisonIds.join(","))}`
      : `/countries/compare`;

  const initialDomain =
    domainParam && (COUNTRY_INTELLIGENCE_DOMAINS as readonly string[]).includes(domainParam)
      ? (domainParam as CountryIntelligenceDomainId)
      : null;

  return (
    <IntelligencePageFrame
      title={cis.title}
      purpose={cis.oneSentence}
      contextLabel={selectedCountry.name}
      nextStep={cis.openIntelligenceProfile}
      evidenceStatus={cis.honestyBanner}
      knownUnknown={cis.noVerifiedData}
      confirmationBoundary={cis.voiceDockClearance}
      showOperator={false}
      primaryAction={
        <Link href={compareHref} className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-4`}>
          {cis.compareCountries}
        </Link>
      }
    >
      <div className="mt-4 space-y-4 pb-24" data-cbai-voice-dock-clearance="">
        <div className={`${cbaiMineralPanel} flex flex-wrap items-center justify-between gap-3`}>
          <p className="text-sm text-[var(--cbai-text-secondary)]">{cis.oneSentence}</p>
          <CreateLinkedWorkButton
            variant="country"
            compact
            country={{
              countryId: selectedCountry.id,
              countryName: selectedCountry.name,
              routePath: `/countries?country=${encodeURIComponent(selectedCountry.id)}`,
            }}
          />
          {comparisonIds.length > 0 ? (
            <p className="w-full text-xs text-[var(--cbai-text-muted)]">
              {fillCountryCopy(cis.selectedCount, { count: String(comparisonIds.length) })}
            </p>
          ) : null}
        </div>

        {requestedCountryNotFound && requestedCountryId ? (
          <EntityNotFoundNotice
            requestedId={requestedCountryId}
            entityLabel="country"
            fallbackName={selectedCountry.name}
          />
        ) : null}

        <details className={cbaiDisclosurePanel} open={!context.country}>
          <summary className={cbaiDisclosureSummary}>
            {context.country
              ? t("entities.worldMapShowing", { name: context.country.name })
              : t("entities.worldMapTitle")}
          </summary>
          <div className="border-t border-[var(--cbai-border)] px-4 py-4">
            <WorldIntelligenceMap />
          </div>
        </details>

        <div className="grid gap-4 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
          <aside className="space-y-3">
            <CountryFilters
              search={search}
              region={region}
              coverage={coverage}
              freshness={freshness}
              domain={domain}
              comparisonOnly={comparisonOnly}
              onSearchChange={setSearch}
              onRegionChange={setRegion}
              onCoverageChange={setCoverage}
              onFreshnessChange={setFreshness}
              onDomainChange={setDomain}
              onComparisonOnlyChange={setComparisonOnly}
              resultCount={filtered.length}
              mobileOpen={filtersOpen}
              onMobileOpenChange={setFiltersOpen}
            />
            <CountryList
              countries={filtered}
              selectedId={selectedCountry.id}
              onSelect={handleSelectCountry}
              comparisonIds={comparisonIds}
              onToggleComparison={toggleComparison}
              onClearFilters={() => {
                setSearch("");
                setRegion("All");
                setCoverage("all");
                setFreshness("all");
                setDomain("all");
                setComparisonOnly(false);
              }}
              emptyMessage={cis.emptyDirectory}
              clearFiltersLabel={t("entities.clearFilters")}
            />
          </aside>

          <div className="min-w-0 space-y-6">
            <CountryIntelligenceProfileView
              profile={selectedProfile}
              initialDomainId={initialDomain}
              initialSection={sectionParam}
              historyYears={historyParam}
            />

            {viewParam === "legacy" || viewParam === "intelligence" ? (
              <details className={cbaiDisclosurePanel}>
                <summary className={cbaiDisclosureSummary}>Legacy evidence panels</summary>
                <div className="space-y-6 border-t border-[var(--cbai-border)] p-4">
                  <CountryIntelligencePanel
                    journey={journey}
                    country={selectedCountry}
                    searchQuery={searchQuery || undefined}
                  />
                  <EntityOptionalExploration>
                    <CountryRelationships profile={journey.profile} />
                  </EntityOptionalExploration>
                </div>
              </details>
            ) : (
              <EntityOptionalExploration>
                <CountryIntelligencePanel
                  journey={journey}
                  country={selectedCountry}
                  searchQuery={searchQuery || undefined}
                />
                <CountryRelationships profile={journey.profile} />
              </EntityOptionalExploration>
            )}
          </div>
        </div>
      </div>
    </IntelligencePageFrame>
  );
}
