import type { Country } from "@/lib/countries";
import { getCountryTimelineModel } from "@/lib/timeline";
import TimelineReadinessPanel from "@/components/timeline/TimelineReadinessPanel";
import TimelineCoverage from "@/components/timeline/TimelineCoverage";
import TimelineEvidenceGap from "@/components/timeline/TimelineEvidenceGap";
import TimelineSources from "@/components/timeline/TimelineSources";
import TimelineMethodology from "@/components/timeline/TimelineMethodology";
import TimelineHumanReview from "@/components/timeline/TimelineHumanReview";

type CountryTimelineSectionProps = {
  country: Country;
};

export default function CountryTimelineSection({ country }: CountryTimelineSectionProps) {
  const model = getCountryTimelineModel(country);

  return (
    <div className="space-y-8">
      <TimelineReadinessPanel model={model} />
      <TimelineCoverage model={model} />
      <TimelineEvidenceGap model={model} />
      <TimelineSources model={model} />
      <TimelineMethodology model={model} />
      <TimelineHumanReview model={model} />
    </div>
  );
}
