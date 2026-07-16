import EntitySourceCoveragePanel from "@/components/shared/EntitySourceCoveragePanel";
import type { CompanySourceCoverageItem } from "@/lib/companies.coverage";

type CompanySourceCoverageProps = {
  sources: readonly CompanySourceCoverageItem[];
};

export default function CompanySourceCoverage({ sources }: CompanySourceCoverageProps) {
  return <EntitySourceCoveragePanel variant="company" sources={sources} />;
}
