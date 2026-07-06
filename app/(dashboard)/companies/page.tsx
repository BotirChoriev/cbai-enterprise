"use client";

import { useMemo, useState } from "react";
import {
  companies,
  getCompanyCountries,
  getCompanyIndustries,
} from "@/lib/companies";
import {
  getCompanyRelationships,
  getCompanyLinkedEntities,
} from "@/lib/companies.adapter";
import { buildCompanyIntelligenceProfile } from "@/lib/companies.intelligence";
import CompanyFilters from "@/components/companies/CompanyFilters";
import CompanyList from "@/components/companies/CompanyList";
import CompanyRelationships from "@/components/companies/CompanyRelationships";
import { CompanyIntelligencePanel } from "@/components/companies/CompanyIntelligencePanel";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [country, setCountry] = useState("All");
  const [selectedId, setSelectedId] = useState(companies[0].id);

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

  const relationships = getCompanyRelationships(selectedCompany);
  const intelligenceProfile = buildCompanyIntelligenceProfile(
    selectedCompany,
    getCompanyLinkedEntities(selectedCompany),
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-500/5 via-violet-500/5 to-emerald-500/5"
        />
        <div className="relative">
          <p className="text-[10px] font-medium uppercase tracking-widest text-sky-400">
            CBAI Company Intelligence
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            Companies Intelligence
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Evidence-based company profiles from the local catalog. Scores,
            financials, and market narratives are withheld unless backed by
            connected evidence sources.
          </p>
        </div>
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
            onSelect={setSelectedId}
          />
        </div>

        <div className="space-y-6 xl:col-span-8">
          <CompanyIntelligencePanel
            profile={intelligenceProfile}
            name={selectedCompany.name}
            icon={selectedCompany.icon}
            country={selectedCompany.country}
            industry={selectedCompany.industry}
            founded={selectedCompany.founded}
          />
          <CompanyRelationships relationships={relationships} />
        </div>
      </div>
    </div>
  );
}
