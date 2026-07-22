"use client";

import type { ReasoningDomainEvidenceRow } from "@/lib/reasoning-explorer";
import { reasoningStatusClass } from "@/lib/reasoning-explorer";
import { userConnectionLabel } from "@/components/shared/user-facing-copy";
import { useTranslation } from "@/lib/i18n/use-translation";

type ReasoningEvidenceIndicatorMapProps = {
  domains: readonly ReasoningDomainEvidenceRow[];
};

export default function ReasoningEvidenceIndicatorMap({
  domains,
}: ReasoningEvidenceIndicatorMapProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4" aria-labelledby="reasoning-evidence-map-heading">
      <div>
        <h2
          id="reasoning-evidence-map-heading"
          className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
        >
          {t("reasoningPage.relatedInformationHeading")}
        </h2>
        <p className="mt-1 text-sm text-[var(--cbai-text-secondary)]">
          {t("reasoningPage.relatedInformationLead")}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--cbai-border-subtle)] bg-[var(--cbai-surface-muted)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--cbai-border-subtle)] text-[10px] font-medium uppercase tracking-wider text-[var(--cbai-text-muted)]">
              <th className="px-5 py-3 font-medium">{t("reasoningPage.tableDomain")}</th>
              <th className="px-5 py-3 font-medium">{t("reasoningPage.tableTopics")}</th>
              <th className="px-5 py-3 font-medium">{t("reasoningPage.tableConnected")}</th>
              <th className="px-5 py-3 font-medium">{t("reasoningPage.tableEvidenceNeeds")}</th>
              <th className="px-5 py-3 font-medium">{t("reasoningPage.tableStatus")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--cbai-border-subtle)]">
            {domains.map((domain) => (
              <tr key={domain.domainId}>
                <td className="px-5 py-4 font-semibold text-[var(--cbai-text-primary)]">{domain.domainTitle}</td>
                <td className="px-5 py-4 text-[var(--cbai-text-secondary)]">{domain.indicatorCount}</td>
                <td className="px-5 py-4 text-[var(--cbai-text-secondary)]">{domain.connectedCount}</td>
                <td className="px-5 py-4 text-xs text-[var(--cbai-text-muted)]">{domain.evidenceNeedsSummary}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${reasoningStatusClass(domain.statusLabel)}`}
                  >
                    {userConnectionLabel(domain.statusLabel)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
