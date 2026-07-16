import EntitySourceCoveragePanel from "@/components/shared/EntitySourceCoveragePanel";
import type { CountrySourceCoverageItem } from "@/lib/countries.coverage";

type CountrySourceCoverageProps = {
  sources: readonly CountrySourceCoverageItem[];
};

export default function CountrySourceCoverage({ sources }: CountrySourceCoverageProps) {
  return <EntitySourceCoveragePanel variant="country" sources={sources} />;
}
