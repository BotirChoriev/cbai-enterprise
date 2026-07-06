import type { University } from "@/lib/universities";
import type { UniversityIntelligenceProfile } from "@/lib/universities.intelligence";
import { getUniversityPipelineReadiness } from "@/lib/pipeline-readiness";
import UniversityCoveragePanel from "@/components/universities/UniversityCoveragePanel";
import EvidenceGapPanel from "@/components/evidence-gap/EvidenceGapPanel";
import { getUniversityEvidenceGaps } from "@/lib/evidence-gap";
import EvidenceComparisonPanel from "@/components/evidence-comparison/EvidenceComparisonPanel";
import { getUniversityEvidenceComparison } from "@/lib/evidence-comparison";
import UniversityIndicatorCoverage from "@/components/universities/UniversityIndicatorCoverage";
import UniversitySourceCoverage from "@/components/universities/UniversitySourceCoverage";
import UniversityMethodology from "@/components/universities/UniversityMethodology";
import UniversityTrustSection from "@/components/universities/UniversityTrustSection";
import { EntityPipelineReadinessSection } from "@/components/pipeline/PipelineReadinessPanel";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type UniversityIntelligencePanelProps = {
  profile: UniversityIntelligenceProfile;
  university: University;
};

export function UniversityIntelligencePanel({
  profile,
  university,
}: UniversityIntelligencePanelProps) {
  const { registryFacts, coverage } = profile;
  const pipelineReadiness = getUniversityPipelineReadiness(university);
  const evidenceGaps = getUniversityEvidenceGaps(university);
  const evidenceComparison = getUniversityEvidenceComparison(university);
  const sourceConnectedCount = coverage.sources.filter(
    (s) => s.statusLabel === "Connected",
  ).length;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
          University Intelligence 2.0
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
          {registryFacts.name}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {registryFacts.icon} · {registryFacts.type} · {registryFacts.city},{" "}
          {registryFacts.country}
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
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Official website
            </dt>
            <dd className="mt-1 text-zinc-300">
              {registryFacts.website ? (
                <a
                  href={registryFacts.website}
                  className="text-cyan-400 underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {registryFacts.website}
                </a>
              ) : (
                registryFacts.websiteLabel
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Evidence source
            </dt>
            <dd className="mt-1 text-zinc-300">CBAI Local Registry</dd>
          </div>
        </dl>
      </div>

      <UniversityCoveragePanel
        summary={coverage.evidenceCoverage}
        sourceConnectedCount={sourceConnectedCount}
        totalSources={coverage.sources.length}
      />

      <EvidenceGapPanel profile={evidenceGaps} />

      <EvidenceComparisonPanel
        entityType="university"
        leftLegacyId={university.id}
        initialModel={evidenceComparison}
      />

      <UniversityIndicatorCoverage indicatorsByDomain={coverage.indicatorsByDomain} />

      <UniversitySourceCoverage sources={coverage.sources} />

      <EntityPipelineReadinessSection model={pipelineReadiness} />

      <UniversityMethodology />

      <section className="space-y-4" aria-labelledby="university-persona-heading">
        <div>
          <h3
            id="university-persona-heading"
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

      <UniversityTrustSection
        pillars={profile.trustPillars}
        neutralityNotice={profile.neutralityNotice}
      />
    </div>
  );
}

export default UniversityIntelligencePanel;
