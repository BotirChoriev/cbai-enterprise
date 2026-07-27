"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { CountryProfile } from "@/lib/country-intelligence/types";
import { DOMAIN_DEFINITIONS } from "@/lib/country-intelligence/domains";
import {
  buildHistoryChartSegments,
  historyTableRows,
  type HistoryWindow,
} from "@/lib/country-intelligence/history";
import CountryFlagMark from "@/components/countries/CountryFlagMark";
import CreateLinkedWorkButton from "@/components/operational-objects/CreateLinkedWorkButton";
import {
  fillCountryCopy,
  getCountryIntelligenceCopy,
  type CountryIntelligenceCopy,
} from "@/lib/i18n/platform-copy-country-intelligence";
import { useTranslation } from "@/lib/i18n/use-translation";
import { COUNTRY_LOCALIZED_NAMES } from "@/lib/i18n/country-names";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondarySm,
  cbaiFocusRing,
  cbaiMineralPanel,
  cbaiSectionEyebrow,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

function displayNameFor(profile: CountryProfile, language: string): string {
  const loc = COUNTRY_LOCALIZED_NAMES[profile.id];
  if (!loc) return profile.officialName;
  if (language === "uz") return loc.uz;
  if (language === "ru") return loc.ru;
  if (language === "tr") return loc.tr;
  return profile.officialName;
}

function domainLabel(copy: CountryIntelligenceCopy, domainId: string): string {
  const def = DOMAIN_DEFINITIONS.find((d) => d.id === domainId);
  if (!def) return domainId;
  return (copy as Record<string, string>)[def.labelKey] ?? domainId;
}

function domainOverview(copy: CountryIntelligenceCopy, domainId: string): string {
  const def = DOMAIN_DEFINITIONS.find((d) => d.id === domainId);
  if (!def) return "";
  return (copy as Record<string, string>)[def.overviewKey] ?? "";
}

type Props = {
  readonly profile: CountryProfile;
  readonly initialDomainId?: string | null;
  readonly initialSection?: string | null;
  readonly historyYears?: string | null;
};

export default function CountryIntelligenceProfileView({
  profile,
  initialDomainId,
  initialSection,
  historyYears,
}: Props) {
  const { language } = useTranslation();
  const copy = getCountryIntelligenceCopy(language);
  const name = displayNameFor(profile, language);
  const [domainId, setDomainId] = useState(
    initialDomainId && profile.domainSlots.some((s) => s.domainId === initialDomainId)
      ? initialDomainId
      : profile.domainSlots[0]?.domainId ?? "rule_of_law",
  );
  const [windowYears, setWindowYears] = useState<HistoryWindow>(
    historyYears === "10" ? 10 : historyYears === "20" ? 20 : historyYears === "all" ? "all" : 5,
  );
  const historyHeadingId = useId();
  const activeSlot = profile.domainSlots.find((s) => s.domainId === domainId) ?? profile.domainSlots[0];
  const observations = activeSlot?.series?.observations ?? [];
  const segments = buildHistoryChartSegments(observations);
  const tableRows = historyTableRows(observations);

  return (
    <div className="space-y-6" data-cbai-country-intelligence-profile="">
      <p className={`${cbaiTextMuted} text-sm`} data-cbai-honesty-banner="">
        {copy.honestyBanner}
      </p>

      {/* 1. Identity header */}
      <header className={`${cbaiMineralPanel} space-y-4`} data-cbai-country-identity="">
        <p className={cbaiSectionEyebrow}>{copy.identityHeader}</p>
        <div className="flex flex-wrap items-start gap-4">
          <CountryFlagMark isoAlpha2={profile.isoAlpha2} displayName={name} size="lg" />
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--cbai-text-primary)] sm:text-2xl">
              {name}
            </h2>
            <p className={cbaiTextMuted}>
              {copy.officialName}: <span lang="en">{profile.officialName}</span>
            </p>
            <p className="text-sm text-[var(--cbai-text-secondary)]">
              {copy.isoCode} {profile.isoAlpha2}/{profile.isoAlpha3} · {copy.capital}: {profile.capital} ·{" "}
              {copy.region}: {profile.region}
            </p>
            <p className="text-sm text-[var(--cbai-text-secondary)]">
              {copy.governmentForm}: {profile.governmentForm.label}
            </p>
            <p className={`${cbaiTextMuted} text-xs`}>
              {profile.lastVerifiedDate
                ? profile.lastVerifiedDate
                : copy.lastVerifiedUnknown}{" "}
              · {copy.profileCompleteness}: {profile.profileCompleteness} · {copy.sourceCoverage}:{" "}
              {profile.sourceCoverageSummary.connected}/
              {profile.sourceCoverageSummary.availableNotConnected +
                profile.sourceCoverageSummary.connected +
                profile.sourceCoverageSummary.notAvailable}
            </p>
            {!profile.emblem.available ? (
              <p className={`${cbaiTextMuted} text-xs`}>{copy.emblemUnavailable}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/countries/compare?countries=${encodeURIComponent(profile.id)}`}
              className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-4`}
              data-cbai-primary-action=""
            >
              {copy.primaryCompare}
            </Link>
            <CreateLinkedWorkButton
              variant="country"
              compact
              country={{
                countryId: profile.id,
                countryName: profile.officialName,
                routePath: `/countries?country=${encodeURIComponent(profile.id)}`,
              }}
            />
            <button type="button" className={`${cbaiBtnSecondarySm} min-h-11`} disabled title={copy.noVerifiedData}>
              {copy.save}
            </button>
            <button type="button" className={`${cbaiBtnSecondarySm} min-h-11`} disabled title={copy.noVerifiedData}>
              {copy.share}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Executive domain cards */}
      <section className="space-y-3" aria-labelledby="cis-executive">
        <h3 id="cis-executive" className="text-base font-semibold text-[var(--cbai-text-primary)]">
          {copy.executiveState}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {profile.domainSlots.map((slot) => {
            const label = domainLabel(copy, slot.domainId);
            const valueText =
              slot.latest?.value == null ? copy.noVerifiedData : String(slot.latest.value);
            const direction = slot.hasComparableHistory
              ? copy.directionStable
              : copy.directionUnavailable;
            return (
              <button
                key={slot.domainId}
                type="button"
                onClick={() => setDomainId(slot.domainId)}
                className={`${cbaiMineralPanel} ${cbaiFocusRing} min-h-[7.5rem] text-left transition ${
                  domainId === slot.domainId ? "ring-1 ring-teal-500/40" : ""
                }`}
                aria-pressed={domainId === slot.domainId}
              >
                <p className="text-sm font-medium text-[var(--cbai-text-primary)]">{label}</p>
                <p className="mt-2 text-sm text-[var(--cbai-text-secondary)]">{valueText}</p>
                <p className={`${cbaiTextMuted} mt-1 text-xs`}>
                  {slot.latest?.observationDate ?? "—"} · {direction}
                </p>
                <p className={`${cbaiTextMuted} text-xs`}>
                  {copy.evidenceStatus}: {slot.latest?.evidenceStatus ?? "not_available"} ·{" "}
                  {copy.sourceCount}: {slot.sourceCount}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Five-year history */}
      <section className={`${cbaiMineralPanel} space-y-3`} aria-labelledby={historyHeadingId}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id={historyHeadingId} className="text-base font-semibold text-[var(--cbai-text-primary)]">
            {copy.fiveYearHistory}
          </h3>
          <div className="flex flex-wrap gap-1" role="group" aria-label={copy.fiveYearHistory}>
            {(
              [
                [5, copy.historyWindow5],
                [10, copy.historyWindow10],
                [20, copy.historyWindow20],
                ["all", copy.historyWindowAll],
              ] as const
            ).map(([w, label]) => (
              <button
                key={String(w)}
                type="button"
                className={`${cbaiBtnSecondarySm} min-h-11 ${windowYears === w ? "ring-1 ring-teal-500/40" : ""}`}
                aria-pressed={windowYears === w}
                onClick={() => setWindowYears(w)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className={cbaiTextMuted}>{domainOverview(copy, domainId)}</p>
        {segments.length === 0 ? (
          <p className="text-sm text-[var(--cbai-text-secondary)]" data-cbai-missing-data="">
            {copy.noVerifiedData}
          </p>
        ) : (
          <ul className="space-y-1 text-sm text-[var(--cbai-text-secondary)]">
            {segments.map((seg, i) => {
              if (seg.kind === "point") {
                return (
                  <li key={`p-${seg.year}-${i}`}>
                    {seg.year}: {String(seg.value)}
                  </li>
                );
              }
              if (seg.kind === "gap") {
                return (
                  <li key={`g-${seg.fromYear}-${i}`}>
                    {copy.gapLabel}: {seg.fromYear}–{seg.toYear} — {seg.reason}
                  </li>
                );
              }
              return (
                <li key={`m-${seg.year}-${i}`}>
                  {copy.methodologyBreak} ({seg.year}): {seg.note}
                </li>
              );
            })}
          </ul>
        )}
        <details className="rounded-lg border border-[var(--cbai-border)] p-3">
          <summary className={`${cbaiFocusRing} cursor-pointer text-sm font-medium`}>
            {copy.chartTableAlt}
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">
                {domainLabel(copy, domainId)} — {copy.fiveYearHistory}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Year</th>
                  <th scope="col">Value</th>
                  <th scope="col">Status</th>
                  <th scope="col">Source</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={5}>{copy.noVerifiedData}</td>
                  </tr>
                ) : (
                  tableRows.map((row) => (
                    <tr key={row.year}>
                      <td>{row.year}</td>
                      <td>{row.value}</td>
                      <td>{row.status}</td>
                      <td>{row.source}</td>
                      <td>{row.notes || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      {/* 4. Then / Now / Next */}
      <section className="space-y-3" aria-labelledby="cis-tnn">
        <h3 id="cis-tnn" className="text-base font-semibold text-[var(--cbai-text-primary)]">
          {copy.thenNowNext}
        </h3>
        <div className="grid gap-3 lg:grid-cols-3">
          <article className={cbaiMineralPanel} data-cbai-then="">
            <h4 className="text-sm font-semibold text-[var(--cbai-text-primary)]">{copy.thenLabel}</h4>
            <p className={`mt-2 text-sm ${cbaiTextMuted}`}>
              {profile.thenNowNext.then.summary || copy.noVerifiedData}
            </p>
            {profile.thenNowNext.then.baselineYear ? (
              <p className="mt-1 text-xs text-[var(--cbai-text-secondary)]">
                {profile.thenNowNext.then.baselineYear}
              </p>
            ) : null}
          </article>
          <article className={cbaiMineralPanel} data-cbai-now="">
            <h4 className="text-sm font-semibold text-[var(--cbai-text-primary)]">{copy.nowLabel}</h4>
            <p className={`mt-2 text-sm ${cbaiTextMuted}`}>
              {profile.thenNowNext.now.summary || copy.honestyBanner}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[var(--cbai-text-secondary)]">
              {(profile.thenNowNext.now.uncertainties.length
                ? profile.thenNowNext.now.uncertainties
                : [copy.noVerifiedData]
              ).map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </article>
          <article className={cbaiMineralPanel} data-cbai-next="">
            <h4 className="text-sm font-semibold text-[var(--cbai-text-primary)]">{copy.nextLabel}</h4>
            <p className="mt-2 text-xs font-medium text-teal-600 dark:text-teal-400">
              {copy.officialPlanNotForecast}
            </p>
            <p className="text-xs font-medium text-teal-600 dark:text-teal-400">
              {copy.scenarioNotPrediction}
            </p>
            <p className={`mt-2 text-sm ${cbaiTextMuted}`}>
              {profile.thenNowNext.next.notice || copy.noVerifiedData}
            </p>
          </article>
        </div>
      </section>

      {/* 5. Causes */}
      <section
        className={`${cbaiMineralPanel} space-y-3`}
        aria-labelledby="cis-causes"
        id={initialSection === "causes" ? "causes" : undefined}
        data-cbai-causes=""
      >
        <h3 id="cis-causes" className="text-base font-semibold text-[var(--cbai-text-primary)]">
          {copy.whyChanged}
        </h3>
        {profile.causes.map((cause) => (
          <div key={cause.id} className="rounded-lg border border-[var(--cbai-border)] p-3">
            <p className="text-sm text-[var(--cbai-text-primary)]">
              {cause.statement || copy.causeInsufficient}
            </p>
            <p className={`${cbaiTextMuted} mt-1 text-xs`}>
              {cause.classification === "directly_supported"
                ? copy.causeDirect
                : cause.classification === "plausible_association"
                  ? copy.causePlausible
                  : cause.classification === "disputed"
                    ? copy.causeDisputed
                    : copy.causeInsufficient}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[var(--cbai-text-secondary)]">
              {(cause.limitations.length ? cause.limitations : [copy.honestyBanner]).map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* 6–7. Official vs CBAI + domain deep dive */}
      <section className="grid gap-3 lg:grid-cols-2" aria-label={copy.domainDeepDive}>
        <article className={`${cbaiMineralPanel} border-l-4 border-l-amber-600/50`} data-cbai-official-source="">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
            {copy.officialSource}
          </h3>
          <p className={`mt-2 text-sm ${cbaiTextMuted}`}>{copy.noVerifiedData}</p>
          <p className="mt-2 text-xs text-[var(--cbai-text-secondary)]">
            Organization · official title (source language) · observation · publication date · URL ·
            methodology — shown only when connected.
          </p>
        </article>
        <article className={`${cbaiMineralPanel} border-l-4 border-l-teal-600/50`} data-cbai-cbai-explanation="">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-300">
            {copy.cbaiExplanation}
          </h3>
          <p className={`mt-2 text-sm ${cbaiTextMuted}`}>{domainOverview(copy, domainId)}</p>
          <p className="mt-2 text-xs text-[var(--cbai-text-secondary)]">
            Localized summary · evidence references · uncertainty · alternatives — not a final human
            judgment.
          </p>
        </article>
      </section>

      {/* 8. Human decision */}
      <section className={`${cbaiMineralPanel} space-y-3`} data-cbai-human-decision="">
        <h3 className="text-base font-semibold text-[var(--cbai-text-primary)]">{copy.humanDecision}</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cbai-text-muted)]">
              {copy.supported}
            </p>
            <p className={`mt-1 text-sm ${cbaiTextMuted}`}>
              Registry identity for {name} ({profile.isoAlpha2}).
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cbai-text-muted)]">
              {copy.uncertain}
            </p>
            <p className={`mt-1 text-sm ${cbaiTextMuted}`}>
              All indicator values, trends, and causal claims until sources connect.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cbai-text-muted)]">
              {copy.missing}
            </p>
            <p className={`mt-1 text-sm ${cbaiTextMuted}`}>{copy.noVerifiedData}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className={`${cbaiTextMuted} w-full text-xs`}>{copy.nextWorkOptions}</span>
          <CreateLinkedWorkButton
            variant="country"
            country={{
              countryId: profile.id,
              countryName: profile.officialName,
              routePath: `/countries?country=${encodeURIComponent(profile.id)}&domain=${domainId}`,
            }}
          />
        </div>
        <p className="text-xs text-[var(--cbai-text-muted)]" data-cbai-human-boundary="">
          {copy.requiredHumanDecisions}: {fillCountryCopy(copy.selectedCount, { count: "0" }).replace("0", "—")}{" "}
          — CBAI provides evidence and structures; the human decides.
        </p>
      </section>

      {profile.id === "uzbekistan" ? (
        <p className={`${cbaiTextMuted} text-xs`} data-cbai-uz-reference="">
          {copy.uzbekistanReference}
        </p>
      ) : null}
    </div>
  );
}
