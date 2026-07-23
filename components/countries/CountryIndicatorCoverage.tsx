import type { CountryCoverageProfile } from "@/lib/countries.coverage";
import IndicatorCoverageDashboard from "@/components/enterprise/IndicatorCoverageDashboard";

type CountryIndicatorCoverageProps = {
  evidenceCoverage: CountryCoverageProfile["evidenceCoverage"];
  indicatorsByDomain: CountryCoverageProfile["indicatorsByDomain"];
  sources?: CountryCoverageProfile["sources"];
};

export default function CountryIndicatorCoverage({
  evidenceCoverage,
  indicatorsByDomain,
  sources,
}: CountryIndicatorCoverageProps) {
  return (
    <IndicatorCoverageDashboard
      evidenceCoverage={evidenceCoverage}
      indicatorsByDomain={indicatorsByDomain}
      sources={sources}
      title="Country Indicator Dashboard"
      description="Available, planned, and missing country indicators with source status — no invented values."
    />
  );
}
