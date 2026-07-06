import type { Country } from "@/lib/countries";
import type { CountryIntelligenceProfile } from "@/lib/countries.intelligence";
import { getCountryPipelineReadiness } from "@/lib/pipeline-readiness";
import CountryCoveragePanel from "@/components/countries/CountryCoveragePanel";
import CountryIndicatorCoverage from "@/components/countries/CountryIndicatorCoverage";
import CountrySourceCoverage from "@/components/countries/CountrySourceCoverage";
import CountryMethodology from "@/components/countries/CountryMethodology";
import CountryTrustSection from "@/components/countries/CountryTrustSection";
import { EntityPipelineReadinessSection } from "@/components/pipeline/PipelineReadinessPanel";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type CountryIntelligencePanelProps = {
  profile: CountryIntelligenceProfile;
  country: Country;
};

export function CountryIntelligencePanel({ profile, country }: CountryIntelligencePanelProps) {
  const { registryFacts, coverage } = profile;
  const pipelineReadiness = getCountryPipelineReadiness(country);
  const sourceConnectedCount = coverage.sources.filter(
    (s) => s.statusLabel === "Connected",
  ).length;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
          Country Intelligence 2.0
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
          {registryFacts.name}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {registryFacts.code} · {registryFacts.capital} · {registryFacts.region}
        </p>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Government form
            </dt>
            <dd className="mt-1 text-zinc-300">{registryFacts.government}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Available information
            </dt>
            <dd className="mt-1 text-zinc-300">{registryFacts.sourceLabel}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Country code
            </dt>
            <dd className="mt-1 font-mono text-zinc-300">{registryFacts.code}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Evidence source
            </dt>
            <dd className="mt-1 text-zinc-300">CBAI Local Registry</dd>
          </div>
        </dl>
      </div>

      <CountryCoveragePanel
        summary={coverage.evidenceCoverage}
        sourceConnectedCount={sourceConnectedCount}
        totalSources={coverage.sources.length}
      />

      <CountryIndicatorCoverage indicatorsByDomain={coverage.indicatorsByDomain} />

      <CountrySourceCoverage sources={coverage.sources} />

      <EntityPipelineReadinessSection model={pipelineReadiness} />

      <CountryMethodology />

      <section className="space-y-4" aria-labelledby="country-persona-heading">
        <div>
          <h3
            id="country-persona-heading"
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

      <CountryTrustSection
        pillars={profile.trustPillars}
        neutralityNotice={profile.neutralityNotice}
      />
    </div>
  );
}

export default CountryIntelligencePanel;
