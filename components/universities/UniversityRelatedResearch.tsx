import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import type { University } from "@/lib/universities";

type UniversityRelatedResearchProps = {
  university: University;
};

/**
 * Mirrors CountryRelatedResearch.tsx's honesty, for the same reason: no real signal links a
 * university to a research topic anywhere in this catalog — University carries no subject-matter
 * field (only type/city/country), and no research topic references a university. Rather than
 * fabricate a match (or silently omit the section, which would be less honest than Country's own
 * page), this states the same real limitation plainly.
 */
export default function UniversityRelatedResearch({ university }: UniversityRelatedResearchProps) {
  return (
    <section aria-labelledby="university-related-research-heading" className="space-y-2">
      <p className={cbaiSectionEyebrow} id="university-related-research-heading">
        Research Topics
      </p>
      <p className="text-sm text-zinc-500">
        No research topics are connected to {university.name} in the current catalog — no
        verified link between universities and research topics exists yet.
      </p>
    </section>
  );
}
