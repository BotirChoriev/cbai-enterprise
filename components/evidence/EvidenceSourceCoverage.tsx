"use client";

import type { ExplorerSourceRow } from "@/lib/evidence-explorer";
import { explorerStatusClass } from "@/lib/evidence-explorer";
import { userConnectionLabel } from "@/components/shared/user-facing-copy";
import { useTranslation } from "@/lib/i18n/use-translation";

type EvidenceSourceCoverageProps = {
  sources: readonly ExplorerSourceRow[];
};

export default function EvidenceSourceCoverage({ sources }: EvidenceSourceCoverageProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4" aria-labelledby="evidence-source-coverage-heading">
      <div>
        <h2
          id="evidence-source-coverage-heading"
          className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
        >
          {t("evidenceExplorer.sourceCoverageTitle")}
        </h2>
        <p className="mt-1 text-sm text-[var(--cbai-text-muted)]">
          {t("evidenceExplorer.sourceCoverageDescription")}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-workspace-solid)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--cbai-border-default)] text-[10px] font-medium uppercase tracking-wider text-[var(--cbai-text-muted)]">
              <th className="px-5 py-3 font-medium">{t("evidenceExplorer.tableSource")}</th>
              <th className="px-5 py-3 font-medium">{t("evidenceExplorer.tableOrganization")}</th>
              <th className="px-5 py-3 font-medium">{t("evidenceExplorer.tableCoverage")}</th>
              <th className="px-5 py-3 font-medium">{t("evidenceExplorer.tableRelatedItems")}</th>
              <th className="px-5 py-3 font-medium">{t("evidenceExplorer.tableSourceStatus")}</th>
              <th className="px-5 py-3 font-medium">{t("evidenceExplorer.tableVerification")}</th>
              <th className="px-5 py-3 font-medium">{t("evidenceExplorer.tableUpdate")}</th>
              <th className="px-5 py-3 font-medium">{t("evidenceExplorer.tableLicense")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--cbai-border-default)]">
            {sources.map((source) => (
              <tr key={source.id} className="align-top">
                <td className="px-5 py-4">
                  <p className="font-semibold text-[var(--cbai-text-primary)]">{source.name}</p>
                  <a
                    href={source.officialWebsite}
                    className="mt-0.5 text-xs text-[var(--cbai-accent-primary)] underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("evidenceExplorer.officialWebsite")}
                  </a>
                </td>
                <td className="px-5 py-4 text-[var(--cbai-text-secondary)]">{source.organization}</td>
                <td className="px-5 py-4 text-xs text-[var(--cbai-text-muted)]">{source.coverage}</td>
                <td className="px-5 py-4 text-[var(--cbai-text-secondary)]">
                  {source.supportedIndicatorCount}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${explorerStatusClass(source.connectionLabel)}`}
                  >
                    {userConnectionLabel(source.connectionLabel)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${explorerStatusClass(source.verificationLabel)}`}
                  >
                    {userConnectionLabel(source.verificationLabel)}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-[var(--cbai-text-muted)]">
                  {source.updateFrequency}
                </td>
                <td className="px-5 py-4 text-xs text-[var(--cbai-text-muted)]">{source.license}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
