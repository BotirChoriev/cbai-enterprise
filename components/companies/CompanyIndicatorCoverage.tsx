import type { CompanyCoverageProfile } from "@/lib/companies.coverage";
import IndicatorCoverageDashboard from "@/components/enterprise/IndicatorCoverageDashboard";

type CompanyIndicatorCoverageProps = {
  evidenceCoverage: CompanyCoverageProfile["evidenceCoverage"];
  indicatorsByDomain: CompanyCoverageProfile["indicatorsByDomain"];
  sources?: CompanyCoverageProfile["sources"];
};

export default function CompanyIndicatorCoverage({
  evidenceCoverage,
  indicatorsByDomain,
  sources,
}: CompanyIndicatorCoverageProps) {
  return (
    <IndicatorCoverageDashboard
      evidenceCoverage={evidenceCoverage}
      indicatorsByDomain={indicatorsByDomain}
      sources={sources}
      title="Company Indicator Dashboard"
      description="Available, planned, and missing company indicators — connected values only when an official source is linked."
    />
  );
}
