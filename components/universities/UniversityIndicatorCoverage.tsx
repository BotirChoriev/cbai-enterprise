import type { UniversityCoverageProfile } from "@/lib/universities.coverage";
import IndicatorCoverageDashboard from "@/components/enterprise/IndicatorCoverageDashboard";

type UniversityIndicatorCoverageProps = {
  evidenceCoverage: UniversityCoverageProfile["evidenceCoverage"];
  indicatorsByDomain: UniversityCoverageProfile["indicatorsByDomain"];
  sources?: UniversityCoverageProfile["sources"];
};

export default function UniversityIndicatorCoverage({
  evidenceCoverage,
  indicatorsByDomain,
  sources,
}: UniversityIndicatorCoverageProps) {
  return (
    <IndicatorCoverageDashboard
      evidenceCoverage={evidenceCoverage}
      indicatorsByDomain={indicatorsByDomain}
      sources={sources}
      title="University Indicator Dashboard"
      description="Available, planned, and missing university indicators — no league tables or invented research scores."
    />
  );
}
