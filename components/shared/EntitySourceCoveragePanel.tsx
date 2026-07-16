"use client";

import type { CountrySourceCoverageItem } from "@/lib/countries.coverage";
import type { CompanySourceCoverageItem } from "@/lib/companies.coverage";
import type { UniversitySourceCoverageItem } from "@/lib/universities.coverage";
import { coverageStatusClass } from "@/lib/countries.coverage";
import { cbaiGlassCard } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type SourceItem = CountrySourceCoverageItem | CompanySourceCoverageItem | UniversitySourceCoverageItem;

type EntitySourceCoveragePanelProps = {
  variant: "country" | "company" | "university";
  sources: readonly SourceItem[];
};

function EvidenceField({ label, value, href }: { label: string; value: string; href?: string | null }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</dt>
      <dd className="mt-0.5 text-xs text-zinc-300">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-teal-400 underline-offset-2 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export default function EntitySourceCoveragePanel({ variant, sources }: EntitySourceCoveragePanelProps) {
  const { t } = useTranslation();

  const headingKey =
    variant === "country"
      ? "sourceCoverage.countryHeading"
      : variant === "company"
        ? "sourceCoverage.companyHeading"
        : "sourceCoverage.universityHeading";
  const descriptionKey =
    variant === "country"
      ? "sourceCoverage.countryDescription"
      : variant === "company"
        ? "sourceCoverage.companyDescription"
        : "sourceCoverage.universityDescription";
  const headingId = `${variant}-source-coverage-heading`;

  return (
    <section className="space-y-4" aria-labelledby={headingId}>
      <div>
        <h3 id={headingId} className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          {t(headingKey)}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">{t(descriptionKey)}</p>
      </div>

      <div className={`${cbaiGlassCard} overflow-hidden`}>
        <ul className="divide-y divide-zinc-800">
          {sources.map((source) => (
            <li key={source.id} className="space-y-3 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-100">{source.name}</p>
                  {source.supportedIndicatorCount > 0 ? (
                    <p className="mt-1 text-xs text-zinc-600">
                      {t("sourceCoverage.supportedIndicators", {
                        count: String(source.supportedIndicatorCount),
                        plural: source.supportedIndicatorCount === 1 ? "" : "s",
                      })}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 self-start rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${coverageStatusClass(source.statusLabel)}`}
                >
                  {source.statusLabel}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 border-t border-zinc-800/80 pt-3 sm:grid-cols-3">
                <EvidenceField label={t("sourceCoverage.publisher")} value={source.organization} />
                <EvidenceField label={t("entityUi.publicationDate")} value={t("entityUi.notAvailable")} />
                <EvidenceField label={t("sourceCoverage.confidence")} value={t("entityUi.notAssessed")} />
                <EvidenceField label={t("sourceCoverage.citation")} value={t("entityUi.notAvailable")} />
                <EvidenceField
                  label={t("entityUi.openSourceLink")}
                  value={source.officialWebsite ? t("entityUi.officialWebsite") : t("entityUi.notConnected")}
                  href={source.officialWebsite}
                />
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
