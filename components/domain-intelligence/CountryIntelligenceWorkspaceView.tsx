"use client";

import Link from "next/link";
import type { CountryIntelligenceWorkspace } from "@/lib/domain-intelligence/country-workspace";
import CreateLinkedWorkButton from "@/components/operational-objects/CreateLinkedWorkButton";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiFocusRing, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type Props = {
  readonly workspace: CountryIntelligenceWorkspace;
};

export default function CountryIntelligenceWorkspaceView({ workspace }: Props) {
  const { t } = useTranslation();
  const { executive, indicators, institutions, relationships } = workspace;
  const sampleIndicators = indicators.slice(0, 6);

  return (
    <section
      aria-label={t("domainIntelligence.workspaceTitle")}
      className="space-y-6"
    >
      <div className={`${cbaiGlassCard} space-y-3 p-5`}>
        <p className={cbaiSectionEyebrow}>{t("domainIntelligence.workspaceTitle")}</p>
        <p className="text-sm text-[var(--cbai-text-secondary)]">{t("domainIntelligence.honestyBanner")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
              {t("domainIntelligence.executiveOrientation")}
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-[var(--cbai-text-secondary)]">
              <li>
                {executive.identity.name} ({executive.identity.code}) — {executive.identity.capital},{" "}
                {executive.identity.region}
              </li>
              <li>{executive.identity.government}</li>
              {executive.identity.officialWebsite ? (
                <li>
                  <a
                    href={executive.identity.officialWebsite}
                    className={`text-teal-400 hover:text-teal-300 ${cbaiFocusRing}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {executive.identity.officialWebsite}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
              {t("domainIntelligence.dataAvailability")}
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-[var(--cbai-text-secondary)]">
              <li>
                Universities: {executive.dataAvailability.relatedUniversities} · Companies:{" "}
                {executive.dataAvailability.relatedCompanies}
              </li>
              <li>
                Indicators defined: {executive.dataAvailability.indicatorsDefined} · Connected sources:{" "}
                {executive.dataAvailability.indicatorsConnected}
              </li>
              <li>{t("domainIntelligence.lastVerificationUnknown")}</li>
            </ul>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
            {t("domainIntelligence.activeQuestions")}
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--cbai-text-secondary)]">
            {executive.activeQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--cbai-border-subtle)] pt-3">
          <p className="text-sm text-[var(--cbai-text-primary)]">
            <span className="font-medium">{t("domainIntelligence.primaryNextAction")}: </span>
            {executive.primaryNextAction.label}
          </p>
          <CreateLinkedWorkButton
            variant="country"
            country={{
              countryId: workspace.country.id,
              countryName: workspace.country.name,
              routePath: `/countries?country=${encodeURIComponent(workspace.country.id)}`,
            }}
            compact
          />
          <Link
            href={`/research?domain=country&country=${workspace.country.id}`}
            className={`text-xs text-teal-400 hover:text-teal-300 ${cbaiFocusRing}`}
          >
            {t("domainIntelligence.viewAcademic")}
          </Link>
        </div>
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-5`}>
        <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
          {t("domainIntelligence.keyIndicators")}
        </h3>
        <p className="text-xs text-[var(--cbai-text-muted)]">{executive.dataAvailability.honestyNotice}</p>
        <ul className="space-y-3">
          {sampleIndicators.map((slot) => (
            <li
              key={slot.indicatorId}
              className="rounded-lg border border-[var(--cbai-border-subtle)] px-3 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-[var(--cbai-text-primary)]">{slot.indicatorTitle}</p>
                <span className="text-[10px] uppercase tracking-wider text-[var(--cbai-text-muted)]">
                  {slot.domainTitle} · {slot.statusLabel}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">
                {t("domainIntelligence.fiveYearComparison")}: {t("domainIntelligence.trendUnavailable")}
              </p>
              <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">
                {t("domainIntelligence.currentUnavailable")}
              </p>
              <details className="mt-2">
                <summary className={`cursor-pointer text-xs text-teal-400/90 ${cbaiFocusRing}`}>
                  {t("domainIntelligence.knowledgeGaps")}
                </summary>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-[var(--cbai-text-secondary)]">
                  {slot.temporal.knowledgeGaps.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
        {indicators.length > sampleIndicators.length ? (
          <p className="text-xs text-[var(--cbai-text-muted)]">
            +{indicators.length - sampleIndicators.length} more indicator definitions (same honest empty
            temporal state).
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`${cbaiGlassCard} space-y-2 p-5`}>
          <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
            {t("domainIntelligence.institutionsActors")}
          </h3>
          <p className="text-xs text-[var(--cbai-text-muted)]">{institutions.notice}</p>
          <ul className="space-y-1 text-sm text-[var(--cbai-text-secondary)]">
            {institutions.universities.map((u) => (
              <li key={u.id}>
                <Link href={`/universities?university=${u.id}`} className={`text-teal-400 hover:text-teal-300 ${cbaiFocusRing}`}>
                  {u.name}
                </Link>
                <span className="text-[var(--cbai-text-muted)]"> — {u.city}</span>
              </li>
            ))}
            {institutions.universities.length === 0 ? (
              <li>{t("domainIntelligence.materialUnknown")}</li>
            ) : null}
          </ul>
        </div>
        <div className={`${cbaiGlassCard} space-y-2 p-5`}>
          <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
            {t("domainIntelligence.officialPlanVsScenario")}
          </h3>
          <p className="text-xs text-[var(--cbai-text-secondary)]">{t("domainIntelligence.officialPlansEmpty")}</p>
          <p className="text-xs text-[var(--cbai-text-secondary)]">{t("domainIntelligence.scenariosEmpty")}</p>
          <h3 className="pt-2 text-sm font-semibold text-[var(--cbai-text-primary)]">
            {t("domainIntelligence.lawsPolicies")}
          </h3>
          <p className="text-xs text-[var(--cbai-text-secondary)]">{workspace.lawsAndPolicies.notice}</p>
        </div>
      </div>

      <div className={`${cbaiGlassCard} space-y-2 p-5`}>
        <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
          {t("domainIntelligence.researchLandscape")}
        </h3>
        <p className="text-xs text-[var(--cbai-text-muted)]">{workspace.researchLandscape.notice}</p>
        <h3 className="pt-2 text-sm font-semibold text-[var(--cbai-text-primary)]">
          {t("domainIntelligence.graphRelationships")}
        </h3>
        <ul className="space-y-1 text-xs text-[var(--cbai-text-secondary)]">
          {relationships.map((rel) => (
            <li key={rel.id}>
              {rel.fromLabel} — {rel.kind} → {rel.toLabel}{" "}
              <span className="text-[var(--cbai-text-muted)]">({rel.confidence})</span>
            </li>
          ))}
          {relationships.length === 0 ? <li>{t("domainIntelligence.materialUnknown")}</li> : null}
        </ul>
      </div>

      <div className={`${cbaiGlassCard} space-y-2 p-5`}>
        <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
          {t("domainIntelligence.operationalActions")}
        </h3>
        <p className="text-xs text-[var(--cbai-text-muted)]">
          {t("domainIntelligence.recommendedWorkCard")} — confirmation required before create.
        </p>
        <CreateLinkedWorkButton
          variant="country"
          country={{
            countryId: workspace.country.id,
            countryName: workspace.country.name,
            routePath: `/countries?country=${encodeURIComponent(workspace.country.id)}`,
          }}
        />
      </div>
    </section>
  );
}
