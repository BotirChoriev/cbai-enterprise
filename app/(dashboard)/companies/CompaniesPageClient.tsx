"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  companies,
  getCompanyCountries,
  getCompanyIndustries,
} from "@/lib/companies";
import { getCompanyLinkedEntities } from "@/lib/companies.adapter";
import { buildCompanyUserJourney } from "@/lib/company-user-journey";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import CompanyFilters from "@/components/companies/CompanyFilters";
import CompanyList from "@/components/companies/CompanyList";
import CompanyRelationships from "@/components/companies/CompanyRelationships";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import EntityExploreShell from "@/components/shared/EntityExploreShell";
import { CompanyIntelligencePanel } from "@/components/companies/CompanyIntelligencePanel";
import EntityNotFoundNotice from "@/components/system/EntityNotFoundNotice";
import GlobalStatusStrip from "@/components/enterprise/GlobalStatusStrip";
import { buildGlobalStatus } from "@/lib/enterprise/global-status";

export default function CompaniesPageClient() {
  const { context, setCompany, recordEntityView } = usePlatformContext();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [country, setCountry] = useState("All");
  const [fallbackId, setFallbackId] = useState(companies[0].id);
  const selectedId = context.company?.id ?? fallbackId;
  const requestedCompanyId = searchParams.get("company");
  const requestedCompanyNotFound =
    Boolean(requestedCompanyId) && !companies.some((c) => c.id === requestedCompanyId);

  const industries = useMemo(() => getCompanyIndustries(), []);
  const countries = useMemo(() => getCompanyCountries(), []);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        search === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.icon.toLowerCase().includes(search.toLowerCase()) ||
        c.industry.toLowerCase().includes(search.toLowerCase());
      const matchesIndustry = industry === "All" || c.industry === industry;
      const matchesCountry = country === "All" || c.country === country;
      return matchesSearch && matchesIndustry && matchesCountry;
    });
  }, [search, industry, country]);

  const selectedCompany =
    companies.find((c) => c.id === selectedId) ?? filtered[0] ?? companies[0];

  const journey = useMemo(
    () => buildCompanyUserJourney(selectedCompany, getCompanyLinkedEntities(selectedCompany)),
    [selectedCompany],
  );

  function handleSelectCompany(companyId: string) {
    const company = companies.find((c) => c.id === companyId);
    if (!company) return;

    setFallbackId(company.id);
    setCompany(company.id);
    recordEntityView({
      kind: "company",
      id: company.id,
      name: company.name,
      code: company.icon,
      countryName: company.country,
    });
  }

  return (
    <EntityExploreShell
      title={t("companies.title")}
      description={t("entities.companiesDescription")}
      statusStrip={
        <GlobalStatusStrip
          compact
          status={buildGlobalStatus({
            ...journey.profile.coverage.evidenceCoverage,
            connectedSources: journey.profile.coverage.sources.filter((s) => s.statusLabel === "Connected").length,
            totalSources: journey.profile.coverage.sources.length,
          })}
        />
      }
      notFoundNotice={
        requestedCompanyNotFound && requestedCompanyId ? (
          <EntityNotFoundNotice
            requestedId={requestedCompanyId}
            entityLabel="company"
            fallbackName={selectedCompany.name}
          />
        ) : null
      }
      filters={
        <CompanyFilters
          search={search}
          industry={industry}
          country={country}
          industries={industries}
          countries={countries}
          onSearchChange={setSearch}
          onIndustryChange={setIndustry}
          onCountryChange={setCountry}
          resultCount={filtered.length}
        />
      }
      list={
        <CompanyList
          companies={filtered}
          selectedId={selectedCompany.id}
          onSelect={handleSelectCompany}
          onClearFilters={() => {
            setSearch("");
            setIndustry("All");
            setCountry("All");
          }}
          emptyMessage={t("entities.noMatchFilters")}
          clearFiltersLabel={t("entities.clearFilters")}
        />
      }
      detail={
        <>
          <CompanyIntelligencePanel journey={journey} company={selectedCompany} />
          <EntityOptionalExploration>
            <CompanyRelationships profile={journey.profile} />
          </EntityOptionalExploration>
        </>
      }
    />
  );
}
