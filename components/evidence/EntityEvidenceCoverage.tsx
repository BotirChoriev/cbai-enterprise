"use client";

import Link from "next/link";
import type { ExplorerEntityModule } from "@/lib/evidence-explorer";
import { useTranslation } from "@/lib/i18n/use-translation";

type EntityEvidenceCoverageProps = {
  entityModules: readonly ExplorerEntityModule[];
};

export default function EntityEvidenceCoverage({
  entityModules,
}: EntityEvidenceCoverageProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4" aria-labelledby="entity-evidence-coverage-heading">
      <div>
        <h2
          id="entity-evidence-coverage-heading"
          className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
        >
          {t("evidenceExplorer.entityCoverageTitle")}
        </h2>
        <p className="mt-1 text-sm text-[var(--cbai-text-muted)]">
          {t("evidenceExplorer.entityCoverageDescription")}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {entityModules.map((module) => (
          <div
            key={module.entityType}
            className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-workspace-solid)] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">{module.label}</h3>
                <p className="mt-0.5 text-xs text-[var(--cbai-text-muted)]">
                  {module.registryAvailable
                    ? t("evidenceExplorer.profilesAvailableCount", {
                        count: String(module.registryCount),
                      })
                    : t("evidenceExplorer.noProfilesYet")}
                </p>
              </div>
              <Link
                href={module.route}
                className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-3 text-xs font-medium text-[var(--cbai-accent-primary)] transition-colors hover:border-[var(--cbai-border-active)] hover:bg-[var(--cbai-surface-hover)]"
              >
                {t("evidenceExplorer.openProfile")} →
              </Link>
            </div>

            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--cbai-text-muted)]">{t("evidenceExplorer.informationConnected")}</dt>
                <dd className="font-medium text-[var(--cbai-text-secondary)]">
                  {module.indicatorsConnected} / {module.indicatorTotal}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--cbai-text-muted)]">{t("evidenceExplorer.sourcesConnected")}</dt>
                <dd className="font-medium text-[var(--cbai-text-secondary)]">
                  {module.connectedSourceCount} / {module.totalSourceCount}
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--cbai-text-muted)]">
                {t("evidenceExplorer.missingInformation")}
              </p>
              {module.missingEvidenceCategories.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {module.missingEvidenceCategories.map((category) => (
                    <li key={category} className="text-xs text-[var(--cbai-text-secondary)]">
                      {category}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-[var(--cbai-text-muted)]">
                  {t("evidenceExplorer.noMissingInformation")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
