import Link from "next/link";
import type { Company } from "@/lib/companies";
import { getRelatedResearchTopics } from "@/lib/company-research";
import { getResearchTopicPath } from "@/lib/research/research-topics";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type CompanyRelatedResearchProps = {
  company: Company;
};

/** Real research topics related by subject matter (industry keyword match) — never a claimed partnership. */
export default function CompanyRelatedResearch({ company }: CompanyRelatedResearchProps) {
  const matches = getRelatedResearchTopics(company);

  if (matches.length === 0) {
    return (
      <section aria-labelledby="company-related-research-heading" className="space-y-2">
        <p className={cbaiSectionEyebrow} id="company-related-research-heading">
          Related Research
        </p>
        <p className="text-sm text-zinc-500">
          No research topics share subject matter with {company.industry} in the current catalog.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="company-related-research-heading" className="space-y-2">
      <p className={cbaiSectionEyebrow} id="company-related-research-heading">
        Related Research
      </p>
      <p className="text-xs text-zinc-600">
        Topics related by subject matter to {company.name}&apos;s {company.industry} industry
        classification — not a sponsorship, funding, or institutional claim.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {matches.map((match) => (
          <li key={match.topic.topicId}>
            <Link
              href={getResearchTopicPath(match.topic.topicId)}
              className="block rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 transition-colors hover:border-cyan-500/30 hover:bg-zinc-900"
            >
              <p className="text-sm font-medium text-zinc-100">{match.topic.topicName}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{match.topic.domain}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
