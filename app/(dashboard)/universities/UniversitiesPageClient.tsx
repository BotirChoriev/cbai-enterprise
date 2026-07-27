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
import { countries } from "@/lib/countries";
import { namesMatch } from "@/lib/name-match";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getUniversityIntelligenceCopy } from "@/lib/i18n/platform-copy-university-intelligence";
import type { UniversityTabId } from "@/lib/university-intelligence/types";
import UniversityFilters from "@/components/universities/UniversityFilters";
import UniversityList from "@/components/universities/UniversityList";
import UniversityRelationships from "@/components/universities/UniversityRelationships";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import { UniversityIntelligencePanel } from "@/components/universities/UniversityIntelligencePanel";
import UniversityIntelligenceNetworkView from "@/components/universities/UniversityIntelligenceNetworkView";
import EntityNotFoundNotice from "@/components/system/EntityNotFoundNotice";
import IntelligencePageFrame from "@/components/shared/IntelligencePageFrame";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondarySm,
  cbaiFocusRing,
  cbaiMineralPanel,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";
import { buildUniversityNetworkProfile } from "@/lib/university-intelligence";

const TAB_IDS: readonly UniversityTabId[] = [
  "overview",
  "research_areas",
  "academics",
  "faculties",
  "laboratories",
  "projects",
  "publications",
  "patents",
  "presentations",
  "opportunities",
  "collaboration",
  "evidence",
];

export default function UniversitiesPageClient() {
  const { context, setUniversity, recordEntityView } = usePlatformContext();
  const { t, language } = useTranslation();
  const copy = getUniversityIntelligenceCopy(language);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [country, setCountry] = useState("All");
  const [type, setType] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fallbackId, setFallbackId] = useState(universities[0].id);
  const selectedId = context.university?.id ?? fallbackId;
  const requestedUniversityId = searchParams.get("university");
  const tabParam = searchParams.get("tab");
  const countriesParam = searchParams.get("countries");
  const requestedUniversityNotFound =
    Boolean(requestedUniversityId) && !universities.some((u) => u.id === requestedUniversityId);

  const countryList = useMemo(() => getUniversityCountries(), []);
  const types = useMemo(() => getUniversityTypes(), []);

  const matchCountryIds = useMemo(() => {
    if (!countriesParam) return null;
    return countriesParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [countriesParam]);

  // Apply ?countries= filter to directory when present (voice / match deep-link).
  const countryFilterFromParams = useMemo(() => {
    if (!matchCountryIds?.length) return null;
    const names = matchCountryIds
      .map((id) => countries.find((c) => c.id === id)?.name)
      .filter(Boolean) as string[];
    return names;
  }, [matchCountryIds]);

  const filtered = useMemo(() => {
    return universities.filter((university) => {
      const normalizedSearch = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        university.name.toLowerCase().includes(normalizedSearch) ||
        university.icon.toLowerCase().includes(normalizedSearch) ||
        university.city.toLowerCase().includes(normalizedSearch) ||
        university.country.toLowerCase().includes(normalizedSearch) ||
        university.type.toLowerCase().includes(normalizedSearch) ||
        (university.aliases ?? []).some((a) => a.toLowerCase().includes(normalizedSearch));
      const matchesCountry =
        country === "All" || university.country === country;
      const matchesType = type === "All" || university.type === type;
      const matchesParamCountries =
        !countryFilterFromParams?.length ||
        countryFilterFromParams.some((n) => namesMatch(n, university.country));
      return matchesSearch && matchesCountry && matchesType && matchesParamCountries;
    });
  }, [search, country, type, countryFilterFromParams]);

  const selectedUniversity =
    universities.find((university) => university.id === selectedId) ??
    filtered[0] ??
    universities[0];

  const network = buildUniversityNetworkProfile(selectedUniversity);

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

  const initialTab =
    tabParam && (TAB_IDS as readonly string[]).includes(tabParam)
      ? (tabParam as UniversityTabId)
      : null;

  return (
    <IntelligencePageFrame
      title={copy.title}
      purpose={copy.oneSentence}
      contextLabel={selectedUniversity.name}
      nextStep={copy.primaryAction}
      evidenceStatus={copy.honestyBanner}
      knownUnknown={copy.noVerifiedData}
      confirmationBoundary={copy.voiceClearance}
      showOperator={false}
      primaryAction={
        <button
          type="button"
          className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-4`}
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.set("university", selectedUniversity.id);
            url.searchParams.set("tab", "opportunities");
            window.history.replaceState({}, "", url.toString());
            handleSelectUniversity(selectedUniversity.id);
          }}
        >
          {copy.primaryAction}
        </button>
      }
    >
      <div className="mt-4 space-y-4 pb-24" data-cbai-voice-dock-clearance="">
        {requestedUniversityNotFound && requestedUniversityId ? (
          <EntityNotFoundNotice
            requestedId={requestedUniversityId}
            entityLabel="university"
            fallbackName={selectedUniversity.name}
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(15rem,20rem)_minmax(0,1fr)_minmax(12rem,16rem)]">
          {/* Navigator */}
          <aside className="space-y-3" data-cbai-uni-navigator="">
            <div className="mb-1 flex md:hidden">
              <button
                type="button"
                className={`${cbaiFocusRing} min-h-11 rounded-lg border border-[var(--cbai-border)] px-3 text-sm`}
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen((v) => !v)}
              >
                {filtersOpen ? copy.filtersClose : copy.filtersOpen}
              </button>
            </div>
            <div className={filtersOpen ? "block" : "hidden md:block"}>
              <UniversityFilters
                search={search}
                country={country}
                type={type}
                countries={countryList}
                types={types}
                onSearchChange={setSearch}
                onCountryChange={setCountry}
                onTypeChange={setType}
                resultCount={filtered.length}
              />
            </div>
            <UniversityList
              universities={filtered}
              selectedId={selectedUniversity.id}
              onSelect={handleSelectUniversity}
              onClearFilters={() => {
                setSearch("");
                setCountry("All");
                setType("All");
              }}
              emptyMessage={copy.emptyDirectory}
              clearFiltersLabel={t("entities.clearFilters")}
            />
          </aside>

          {/* Canvas */}
          <div className="min-w-0 space-y-4" data-cbai-uni-canvas="">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} min-h-11`}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("tab", "collaboration");
                  window.history.replaceState({}, "", url.toString());
                }}
              >
                {copy.secondaryAction}
              </button>
            </div>
            <UniversityIntelligenceNetworkView
              key={`${selectedUniversity.id}:${initialTab ?? "overview"}`}
              university={selectedUniversity}
              initialTab={initialTab}
              matchCountries={matchCountryIds}
            />
            <EntityOptionalExploration>
              <UniversityIntelligencePanel journey={journey} university={selectedUniversity} />
              <UniversityRelationships profile={journey.profile} />
            </EntityOptionalExploration>
          </div>

          {/* Context rail */}
          <aside className={`${cbaiMineralPanel} space-y-3 max-lg:hidden`} data-cbai-uni-context-rail="">
            <h2 className="text-sm font-semibold text-[var(--cbai-text-primary)]">{copy.contextRail}</h2>
            <p className="text-sm text-[var(--cbai-text-secondary)]">
              <span lang="en">{selectedUniversity.name}</span>
            </p>
            <p className={`${cbaiTextMuted} text-xs`}>
              {copy.activeAcademics}: {copy.noVerifiedData}
            </p>
            <p className={`${cbaiTextMuted} text-xs`}>
              {copy.activeProjects}: {copy.noVerifiedData}
            </p>
            <p className={`${cbaiTextMuted} text-xs`}>
              {copy.openOpportunities}: {copy.noVerifiedData}
            </p>
            <p className={`${cbaiTextMuted} text-xs`}>
              {copy.sourceFreshness}: {network.snapshot.freshness}
            </p>
            <p className={`${cbaiTextMuted} text-xs`}>
              {copy.linkedWork}: {copy.notConnected}
            </p>
            <p className="text-xs text-[var(--cbai-text-muted)]">{copy.voiceClearance}</p>
            <a
              href={`/graph?focus=university:${encodeURIComponent(selectedUniversity.id)}`}
              className={`${cbaiFocusRing} inline-flex min-h-11 items-center text-xs font-medium text-teal-800 dark:text-teal-200`}
            >
              {copy.graphFallback}
            </a>
          </aside>
        </div>
      </div>
    </IntelligencePageFrame>
  );
}
