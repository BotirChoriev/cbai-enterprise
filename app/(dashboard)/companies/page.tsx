"use client";

import { useMemo, useState } from "react";
import {
  companies,
  getCompanyCountries,
  getCompanyIndustries,
} from "@/lib/companies";
import { getCompanyLinkedEntities } from "@/lib/companies.adapter";
import { buildCompanyUserJourney } from "@/lib/company-user-journey";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import CompanyFilters from "@/components/companies/CompanyFilters";
import CompanyList from "@/components/companies/CompanyList";
import CompanyRelationships from "@/components/companies/CompanyRelationships";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import { CompanyIntelligencePanel } from "@/components/companies/CompanyIntelligencePanel";

export default function CompaniesPage() {
  const { context, setCompany, recordEntityView } = usePlatformContext();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [country, setCountry] = useState("All");
  const [fallbackId, setFallbackId] = useState(companies[0].id);
  const selectedId = context.company?.id ?? fallbackId;

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
      <div className="rounded-xl border border-cyan-500/10 bg-slate-950/50 px-6 py-5 backdrop-blur-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Companies</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-500">
          Overview, available information, missing information, and reports for each company.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-4">
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
