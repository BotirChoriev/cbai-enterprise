"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { countries } from "@/lib/countries";
import { buildCountryProfile } from "@/lib/country-intelligence/profile";
import {
  buildCountryComparison,
  validateComparisonSelection,
} from "@/lib/country-intelligence/comparison";
import {
  COUNTRY_INTELLIGENCE_DOMAINS,
  type CountryIntelligenceDomainId,
} from "@/lib/country-intelligence/types";
import { DOMAIN_DEFINITIONS } from "@/lib/country-intelligence/domains";
import CountryFlagMark from "@/components/countries/CountryFlagMark";
import CreateLinkedWorkButton from "@/components/operational-objects/CreateLinkedWorkButton";
import IntelligencePageFrame from "@/components/shared/IntelligencePageFrame";
import {
  getCountryIntelligenceCopy,
  type CountryIntelligenceCopy,
} from "@/lib/i18n/platform-copy-country-intelligence";
import { COUNTRY_LOCALIZED_NAMES } from "@/lib/i18n/country-names";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondarySm,
  cbaiFocusRing,
  cbaiMineralPanel,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

function nameFor(id: string, english: string, language: string): string {
  const loc = COUNTRY_LOCALIZED_NAMES[id];
  if (!loc) return english;
  if (language === "uz") return loc.uz;
  if (language === "ru") return loc.ru;
  if (language === "tr") return loc.tr;
  return english;
}

function domainLabel(copy: CountryIntelligenceCopy, id: string): string {
  const def = DOMAIN_DEFINITIONS.find((d) => d.id === id);
  if (!def) return id;
  return (copy as Record<string, string>)[def.labelKey] ?? id;
}

export default function CountryCompareClient() {
  const { language } = useTranslation();
  const copy = getCountryIntelligenceCopy(language);
  const searchParams = useSearchParams();
  const initialIds = (searchParams.get("countries") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const initialDomain = searchParams.get("domain");

  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialIds.filter((id) => countries.some((c) => c.id === id)).slice(0, 4),
  );
  const [domainId, setDomainId] = useState<CountryIntelligenceDomainId>(
    initialDomain && (COUNTRY_INTELLIGENCE_DOMAINS as readonly string[]).includes(initialDomain)
      ? (initialDomain as CountryIntelligenceDomainId)
      : "education_research",
  );

  const profiles = useMemo(
    () =>
      selectedIds
        .map((id) => countries.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => buildCountryProfile(c!)),
    [selectedIds],
  );

  const selectionCheck = validateComparisonSelection(selectedIds);
  const comparison = useMemo(
    () =>
      buildCountryComparison(profiles, {
        countryIds: selectedIds,
        domainId,
        windowYears: 5,
      }),
    [profiles, selectedIds, domainId],
  );

  function toggle(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  const evidenceSummary = [
    copy.compareTitle,
    copy.rankingForbidden,
    `Domain: ${domainId}`,
    `Countries: ${selectedIds.join(", ") || "—"}`,
    comparison.eligibility.ok ? "Comparable" : comparison.eligibility.reason,
    ...comparison.coverageMatrix.map(
      (row) =>
        `${row.countryId}: value=${row.hasValue ? "yes" : "no"}; status=${row.evidenceStatus}; unit=${row.unit ?? "—"}`,
    ),
  ].join("\n");

  return (
    <IntelligencePageFrame
      title={copy.compareTitle}
      purpose={copy.comparePurpose}
      nextStep={copy.createComparativeStudy}
      evidenceStatus={copy.rankingForbidden}
      confirmationBoundary={copy.voiceDockClearance}
      primaryAction={
        <Link href="/countries" className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} min-h-11`}>
          {copy.title}
        </Link>
      }
    >
      <div className="mt-4 space-y-4 pb-24" data-cbai-country-compare="">
        <section className={`${cbaiMineralPanel} space-y-3`}>
          <h2 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
            {copy.compareNeedTwo} / {copy.compareMaxFour}
          </h2>
          <div className="flex flex-wrap gap-2">
            {countries.map((c) => {
              const selected = selectedIds.includes(c.id);
              const label = nameFor(c.id, c.name, language);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  aria-pressed={selected}
                  className={`${cbaiFocusRing} inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm ${
                    selected
                      ? "border-teal-500/40 bg-teal-500/10"
                      : "border-[var(--cbai-border)]"
                  }`}
                >
                  <CountryFlagMark isoAlpha2={c.code} displayName={label} size="sm" />
                  {label}
                </button>
              );
            })}
          </div>

          <label className="block text-xs text-[var(--cbai-text-secondary)]">
            {copy.indicatorDomain}
            <select
              className={`${cbaiFocusRing} mt-1 w-full max-w-md min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2 text-sm`}
              value={domainId}
              onChange={(e) => setDomainId(e.target.value as CountryIntelligenceDomainId)}
            >
              {COUNTRY_INTELLIGENCE_DOMAINS.map((id) => (
                <option key={id} value={id}>
                  {domainLabel(copy, id)}
                </option>
              ))}
            </select>
          </label>
        </section>

        {!selectionCheck.ok ? (
          <p className="text-sm text-amber-800 dark:text-amber-200" role="status">
            {selectionCheck.reason}
          </p>
        ) : null}

        {!comparison.eligibility.ok ? (
          <div
            className={`${cbaiMineralPanel} border-l-4 border-l-amber-600/60`}
            role="alert"
            data-cbai-incompatible-comparison=""
          >
            <p className="text-sm font-medium text-[var(--cbai-text-primary)]">
              {copy.incompatibleBlocked}
            </p>
            <p className={`mt-2 text-sm ${cbaiTextMuted}`}>{comparison.eligibility.reason}</p>
            {"alternatives" in comparison.eligibility && comparison.eligibility.alternatives ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--cbai-text-secondary)]">
                {comparison.eligibility.alternatives.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-teal-800 dark:text-teal-200">{copy.comparePurpose}</p>
        )}

        <p className={`text-sm ${cbaiTextMuted}`}>{comparison.rankingForbiddenNotice}</p>

        <section className={cbaiMineralPanel} aria-labelledby="cis-coverage-matrix">
          <h2 id="cis-coverage-matrix" className="text-sm font-semibold">
            {copy.coverageMatrix}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">{copy.coverageMatrix}</caption>
              <thead>
                <tr>
                  <th scope="col">{copy.title}</th>
                  <th scope="col">{copy.evidenceStatus}</th>
                  <th scope="col">Unit</th>
                  <th scope="col">{copy.noVerifiedData}</th>
                </tr>
              </thead>
              <tbody>
                {comparison.coverageMatrix.map((row) => {
                  const country = countries.find((c) => c.id === row.countryId);
                  const label = country
                    ? nameFor(country.id, country.name, language)
                    : row.countryId;
                  return (
                    <tr key={row.countryId}>
                      <td>{label}</td>
                      <td>{row.evidenceStatus}</td>
                      <td>{row.unit ?? "—"}</td>
                      <td>{row.hasValue ? "—" : copy.noVerifiedData}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
          {profiles.map((p) => {
            const label = nameFor(p.id, p.officialName, language);
            const slot = p.domainSlots.find((s) => s.domainId === domainId);
            return (
              <article key={p.id} className={cbaiMineralPanel}>
                <div className="flex items-center gap-2">
                  <CountryFlagMark isoAlpha2={p.isoAlpha2} displayName={label} size="sm" />
                  <h3 className="text-sm font-semibold">{label}</h3>
                </div>
                <p className={`mt-2 text-sm ${cbaiTextMuted}`}>
                  {slot?.latest?.value == null ? copy.noVerifiedData : String(slot.latest.value)}
                </p>
                <p className="text-xs text-[var(--cbai-text-muted)]">
                  {slot?.latest?.observationDate ?? copy.lastVerifiedUnknown}
                </p>
              </article>
            );
          })}
        </section>

        <section className={`${cbaiMineralPanel} space-y-3`} data-cbai-human-decision="">
          <h2 className="text-sm font-semibold">{copy.humanDecision}</h2>
          <p className={`text-sm ${cbaiTextMuted}`}>{copy.requiredHumanDecisions}</p>
          <div className="flex flex-wrap gap-2">
            {selectedIds[0] ? (
              <CreateLinkedWorkButton
                variant="country"
                country={{
                  countryId: selectedIds[0],
                  countryName:
                    countries.find((c) => c.id === selectedIds[0])?.name ?? selectedIds[0],
                  routePath: `/countries/compare?countries=${encodeURIComponent(selectedIds.join(","))}&domain=${domainId}`,
                }}
              />
            ) : null}
            <button
              type="button"
              className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-3 text-sm`}
              onClick={() => {
                void navigator.clipboard?.writeText(evidenceSummary);
              }}
            >
              {copy.exportEvidenceSummary}
            </button>
          </div>
        </section>
      </div>
    </IntelligencePageFrame>
  );
}
