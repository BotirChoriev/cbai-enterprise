import type { Company } from "@/lib/companies";
import type { CompanyIntelligenceProfile } from "@/lib/companies.intelligence";
import { getCompanyPipelineReadiness } from "@/lib/pipeline-readiness";
import CompanyCoveragePanel from "@/components/companies/CompanyCoveragePanel";
import CompanyIndicatorCoverage from "@/components/companies/CompanyIndicatorCoverage";
import CompanySourceCoverage from "@/components/companies/CompanySourceCoverage";
import CompanyMethodology from "@/components/companies/CompanyMethodology";
import CompanyTrustSection from "@/components/companies/CompanyTrustSection";
import { EntityPipelineReadinessSection } from "@/components/pipeline/PipelineReadinessPanel";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type CompanyIntelligencePanelProps = {
  profile: CompanyIntelligenceProfile;
  company: Company;
};

export function CompanyIntelligencePanel({ profile, company }: CompanyIntelligencePanelProps) {
  const { registryFacts, coverage } = profile;
  const pipelineReadiness = getCompanyPipelineReadiness(company);
  const sourceConnectedCount = coverage.sources.filter(
    (s) => s.statusLabel === "Connected",
  ).length;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
          Company Intelligence 2.0
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
          {registryFacts.name}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {registryFacts.icon} · {registryFacts.industry} · {registryFacts.country}
        </p>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Founded</dt>
            <dd className="mt-1 font-mono text-zinc-300">{registryFacts.founded}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Available information
            </dt>
            <dd className="mt-1 text-zinc-300">{registryFacts.sourceLabel}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Industry</dt>
            <dd className="mt-1 text-zinc-300">{registryFacts.industry}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Evidence source
            </dt>
            <dd className="mt-1 text-zinc-300">CBAI Local Registry</dd>
          </div>
        </dl>
      </div>

      <CompanyCoveragePanel
        summary={coverage.evidenceCoverage}
        sourceConnectedCount={sourceConnectedCount}
        totalSources={coverage.sources.length}
      />

      <CompanyIndicatorCoverage indicatorsByDomain={coverage.indicatorsByDomain} />

      <CompanySourceCoverage sources={coverage.sources} />

      <EntityPipelineReadinessSection model={pipelineReadiness} />

      <CompanyMethodology />

      <section className="space-y-4" aria-labelledby="company-persona-heading">
        <div>
          <h3
            id="company-persona-heading"
            className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
          >
            Persona Views
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            What each audience can use today — and what connects when evidence sources go live.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {profile.personas.map((persona) => (
            <Card key={persona.id}>
              <CardHeader title={persona.title} />
              <CardContent className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                    Available today
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">{persona.currentValue}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                    After sources connect
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">{persona.futureCapability}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <CompanyTrustSection
        pillars={profile.trustPillars}
        neutralityNotice={profile.neutralityNotice}
      />
    </div>
  );
}

export default CompanyIntelligencePanel;
