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
import EntityPageHeader from "@/components/shared/EntityPageHeader";
import MissionOperatingContextBar from "@/components/mission/MissionOperatingContextBar";
import { CompanyIntelligencePanel } from "@/components/companies/CompanyIntelligencePanel";
import ContextualOperatorBanner from "@/components/assistant/ContextualOperatorBanner";
import EntityNotFoundNotice from "@/components/system/EntityNotFoundNotice";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";

export default function CompaniesPageClient() {
  const { context, setCompany, recordEntityView } = usePlatformContext();
  const { t } = useTranslation();
  const disclosure = useProgressiveDisclosure();
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
    <div className="space-y-6">
      <EntityPageHeader title={t("companies.title")} description={t("entities.companiesDescription")} />
      <MissionOperatingContextBar variant="compact" />

      {requestedCompanyNotFound && requestedCompanyId ? (
        <EntityNotFoundNotice
          requestedId={requestedCompanyId}
          entityLabel="company"
          fallbackName={selectedCompany.name}
        />
      ) : null}

      {disclosure.level === "expert" ? <ContextualOperatorBanner /> : null}

      <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
        <div className="space-y-4 xl:sticky xl:top-6 xl:col-span-4 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
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
        </div>

        <div className="space-y-8 xl:col-span-8">
          <CompanyIntelligencePanel journey={journey} company={selectedCompany} />
          <EntityOptionalExploration>
            <CompanyRelationships profile={journey.profile} />
          </EntityOptionalExploration>
        </div>
      </div>
    </div>
  );
}
