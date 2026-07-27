"use client";

import type { ResearchDomainId } from "@/lib/research/research-topics";
import { RESEARCH_DOMAINS } from "@/lib/research/research-topics";
import { useTranslation } from "@/lib/i18n/use-translation";
import { localizeResearchDomainLabel } from "@/lib/i18n/entity-domain-labels";

type ResearchDomainFilterProps = {
  selectedDomain: ResearchDomainId | "all";
  onSelectDomain: (domainId: ResearchDomainId | "all") => void;
  topicCounts: Record<ResearchDomainId, number>;
};

export default function ResearchDomainFilter({
  selectedDomain,
  onSelectDomain,
  topicCounts,
}: ResearchDomainFilterProps) {
  const { t, language } = useTranslation();
  const totalCount = Object.values(topicCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--cbai-accent-primary)]">
        {t("researchCatalog.filterByDomain")}
      </p>
      <ul className="flex flex-wrap gap-2">
        <li>
          <button
            type="button"
            onClick={() => onSelectDomain("all")}
            className={`min-h-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedDomain === "all"
                ? "border-[var(--cbai-border-active)] bg-[var(--cbai-accent-subtle)] text-[var(--cbai-accent-primary)]"
                : "border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] text-[var(--cbai-text-muted)] hover:border-[var(--cbai-border-active)] hover:text-[var(--cbai-text-primary)]"
            }`}
          >
            {t("researchCatalog.allDomains")}
            <span className="ml-1.5 text-xs text-[var(--cbai-text-muted)]">({totalCount})</span>
          </button>
        </li>
        {RESEARCH_DOMAINS.map((domain) => (
          <li key={domain.domainId}>
            <button
              type="button"
              onClick={() => onSelectDomain(domain.domainId)}
              className={`min-h-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedDomain === domain.domainId
                  ? "border-[var(--cbai-border-active)] bg-[var(--cbai-accent-subtle)] text-[var(--cbai-accent-primary)]"
                  : "border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] text-[var(--cbai-text-muted)] hover:border-[var(--cbai-border-active)] hover:text-[var(--cbai-text-primary)]"
              }`}
            >
              {localizeResearchDomainLabel(domain.domainName, language)}
              <span className="ml-1.5 text-xs text-[var(--cbai-text-muted)]">
                ({topicCounts[domain.domainId] ?? 0})
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
