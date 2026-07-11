import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { getRelatedCompaniesForTopic } from "@/lib/company-research";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchRelatedCompaniesProps = {
  topic: ResearchTopic;
};

/** Real companies related by subject matter (industry keyword match) — closes the Company → Research → Company loop. */
export default function ResearchRelatedCompanies({ topic }: ResearchRelatedCompaniesProps) {
  const matches = getRelatedCompaniesForTopic(topic);

  if (matches.length === 0) return null;

  return (
    <section aria-labelledby="research-related-companies-heading" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <div>
        <p className={cbaiSectionEyebrow} id="research-related-companies-heading">
          Related Companies
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          Companies related by subject matter to this topic&apos;s domain — not a sponsorship or
          funding claim.
        </p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {matches.map((match) => (
          <li key={match.company.id}>
            <Link
              href={`/companies?company=${match.company.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-cyan-500/30 hover:text-cyan-300"
            >
              {match.company.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
