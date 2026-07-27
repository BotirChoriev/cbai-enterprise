"use client";

import Link from "next/link";
import type { Company } from "@/lib/companies";
import { getRelatedResearchTopics } from "@/lib/company-research";
import { getResearchTopicPath } from "@/lib/research/research-topics";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";
import { localizeIndustryLabel, localizeResearchDomainLabel } from "@/lib/i18n/entity-domain-labels";
import { localizeResearchTopic } from "@/lib/i18n/research-catalog-locale";

type CompanyRelatedResearchProps = {
  company: Company;
};

/** Real research topics related by subject matter (industry keyword match) — never a claimed partnership. */
export default function CompanyRelatedResearch({ company }: CompanyRelatedResearchProps) {
  const { t, language } = useTranslation();
  const matches = getRelatedResearchTopics(company);
  const industryLabel = localizeIndustryLabel(company.industry, language);

  if (matches.length === 0) {
    return (
      <section aria-labelledby="company-related-research-heading" className="space-y-2">
        <p className={cbaiSectionEyebrow} id="company-related-research-heading">
          {t("reportsCommon.relatedCompanies")}
        </p>
        <p className="text-sm text-[var(--cbai-text-muted)]">
          {t("entityUi.relatedResearchEmpty", { industry: industryLabel })}
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="company-related-research-heading" className="space-y-2">
      <p className={cbaiSectionEyebrow} id="company-related-research-heading">
        {t("reportsCommon.relatedCompanies")}
      </p>
      <p className="text-xs text-[var(--cbai-text-muted)]">
        {t("entityUi.relatedResearchNote", { name: company.name, industry: industryLabel })}
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {matches.map((match) => {
          const localized = localizeResearchTopic(match.topic, language);
          return (
            <li key={match.topic.topicId}>
              <Link
                href={getResearchTopicPath(match.topic.topicId)}
                className="block rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-3 py-2.5 transition-colors hover:border-[var(--cbai-border-active)]"
              >
                <p className="text-sm font-medium text-[var(--cbai-text-primary)]">{localized.topicName}</p>
                <p className="mt-0.5 text-xs text-[var(--cbai-text-muted)]">
                  {localizeResearchDomainLabel(match.topic.domain, language)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
