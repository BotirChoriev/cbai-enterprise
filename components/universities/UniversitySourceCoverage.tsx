import EntitySourceCoveragePanel from "@/components/shared/EntitySourceCoveragePanel";
import type { UniversitySourceCoverageItem } from "@/lib/universities.coverage";

type UniversitySourceCoverageProps = {
  sources: readonly UniversitySourceCoverageItem[];
};

export default function UniversitySourceCoverage({ sources }: UniversitySourceCoverageProps) {
  return <EntitySourceCoveragePanel variant="university" sources={sources} />;
}
