"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { countries } from "@/lib/countries";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getUpdatesCopy } from "@/lib/i18n/platform-copy-updates";
import { getProvenanceCopy } from "@/lib/i18n/platform-copy-provenance";
import {
  describeUpdateCapability,
  formatCountryTime,
  type CountryWatch,
  type VerifiedChangeEventType,
  type VerifiedChangeNotification,
} from "@/lib/notifications/verified-change-model";
import {
  IANA_TZDB_SOURCE_URL,
  findCountryTimeZone,
  isResolvableTimeZone,
} from "@/lib/notifications/country-timezones";
import {
  addWatch,
  listVerifiedChangeEvents,
  listWatches,
  markVerifiedChangeRead,
  removeWatch,
} from "@/lib/notifications/watch-store";
import { FreshnessBadge, SourceBadge, LastVerified } from "@/components/provenance/SourceProvenance";
import {
  cbaiBtnSecondarySm,
  cbaiEmptyDashed,
  cbaiLinkAction,
  cbaiPageHeader,
  cbaiPanelPadding,
  cbaiSectionEyebrow,
  cbaiSectionTitle,
  cbaiSurfaceSolid,
  cbaiTextBody,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

const EVENT_LABELS: Record<VerifiedChangeEventType, Record<string, string>> = {
  new_verified_source: {
    en: "New verified source",
    uz: "Yangi tasdiqlangan manba",
    ru: "Новый проверенный источник",
    tr: "Yeni doğrulanmış kaynak",
  },
  indicator_updated: {
    en: "Indicator updated",
    uz: "Koʻrsatkich yangilandi",
    ru: "Показатель обновлён",
    tr: "Gösterge güncellendi",
  },
  source_became_stale: {
    en: "Source became stale",
    uz: "Manba eskirdi",
    ru: "Источник устарел",
    tr: "Kaynak güncelliğini yitirdi",
  },
  contradiction_detected: {
    en: "Contradiction detected",
    uz: "Qarama-qarshilik aniqlandi",
    ru: "Обнаружено противоречие",
    tr: "Çelişki tespit edildi",
  },
  report_ready: {
    en: "Report ready",
    uz: "Hisobot tayyor",
    ru: "Отчёт готов",
    tr: "Rapor hazır",
  },
  evidence_coverage_changed: {
    en: "Evidence coverage changed",
    uz: "Dalillar qamrovi oʻzgardi",
    ru: "Покрытие доказательствами изменилось",
    tr: "Kanıt kapsamı değişti",
  },
  human_review_required: {
    en: "Human review required",
    uz: "Inson koʻrigi talab qilinadi",
    ru: "Требуется проверка человеком",
    tr: "İnsan incelemesi gerekli",
  },
};

function eventLabel(type: VerifiedChangeEventType, language: string): string {
  return EVENT_LABELS[type][language] ?? EVENT_LABELS[type].en!;
}

/**
 * Global Updates, country clocks and verified-change watches.
 *
 * The verified-update list renders only events a real detection run recorded.
 * No licensed news feed is connected in this build, so the channel legend states
 * which lanes are unavailable instead of showing sample items.
 */
export default function GlobalUpdatesClient() {
  const { t, language } = useTranslation();
  const copy = getUpdatesCopy(language);
  const provenanceCopy = getProvenanceCopy(language);
  const [watches, setWatches] = useState<readonly CountryWatch[]>([]);
  const [events, setEvents] = useState<readonly VerifiedChangeNotification[]>([]);
  const [now, setNow] = useState<Date | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);

  const reload = useCallback(() => {
    setWatches(listWatches());
    setEvents(listVerifiedChangeEvents());
  }, []);

  /**
   * localStorage and the wall clock are external systems, so both are read from
   * asynchronous callbacks rather than synchronously during the effect body.
   * `now` stays null until the first client tick, which also keeps the rendered
   * clock out of the server-rendered HTML.
   */
  useEffect(() => {
    const tick = () => {
      reload();
      setNow(new Date());
    };
    const firstTick = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 30_000);
    return () => {
      window.clearTimeout(firstTick);
      window.clearInterval(timer);
    };
  }, [reload]);

  const capability = useMemo(
    () =>
      describeUpdateCapability({
        licensedFeedConfigured: false,
        pollingIntervalMinutes: null,
      }),
    [],
  );

  const capabilityText =
    capability === "licensed_feed"
      ? copy.capabilityLicensed
      : capability === "scheduled_polling"
        ? copy.capabilityScheduled
        : copy.capabilityManualOnly;

  const watchedCountryIds = useMemo(
    () => new Set(watches.filter((item) => item.targetType === "country").map((item) => item.targetId)),
    [watches],
  );

  const onToggleWatch = useCallback(
    (countryId: string, countryName: string) => {
      const existing = watches.find(
        (item) => item.targetType === "country" && item.targetId === countryId,
      );
      if (existing) removeWatch(existing.id);
      else
        addWatch({
          targetType: "country",
          targetId: countryId,
          targetLabel: countryName,
          contentLocale: language,
          pollingIntervalMinutes: null,
        });
      reload();
    },
    [language, reload, watches],
  );

  const onRefresh = useCallback(() => {
    reload();
    setLastCheckedAt(new Date().toISOString());
  }, [reload]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <header className={cbaiPageHeader}>
        <p className={cbaiSectionEyebrow}>CBAI</p>
        <h1 className="cbai-display text-2xl font-semibold tracking-tight text-[color:var(--cbai-text-primary)] sm:text-3xl">
          {copy.pageTitle}
        </h1>
        <p className={`max-w-3xl ${cbaiTextBody}`}>{copy.pageDescription}</p>
      </header>

      <section
        aria-labelledby="updates-capability"
        className={`${cbaiSurfaceSolid} ${cbaiPanelPadding}`}
        data-update-capability={capability}
      >
        <h2 id="updates-capability" className={cbaiSectionTitle}>
          {copy.capabilityHeading}
        </h2>
        <p className={`mt-2 ${cbaiTextBody}`}>{capabilityText}</p>
        <p className={`mt-2 ${cbaiTextMuted}`}>{copy.capabilityRequirement}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            className={cbaiBtnSecondarySm}
          >
            {copy.refresh}
          </button>
          <span className={cbaiTextMuted}>
            {copy.lastChecked}:{" "}
            {lastCheckedAt
              ? new Intl.DateTimeFormat(language, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(lastCheckedAt))
              : copy.neverChecked}
          </span>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2 text-[11px]">
          {[
            { key: "official", label: copy.channelOfficial, available: true },
            { key: "licensed_news", label: copy.channelLicensedNews, available: false },
            { key: "user_item", label: copy.channelUserItem, available: true },
            { key: "ai_summary", label: copy.channelAiSummary, available: true },
            { key: "system_alert", label: copy.channelSystemAlert, available: true },
          ].map((lane) => (
            <li
              key={lane.key}
              data-update-channel={lane.key}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--cbai-border-default)] px-3 py-1 text-[var(--cbai-text-secondary)]"
            >
              {lane.label}
              {lane.available ? null : (
                <span className="text-[var(--cbai-text-muted)]">· {copy.channelUnavailable}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="updates-clocks" className="mt-6">
        <h2 id="updates-clocks" className={cbaiSectionTitle}>
          {copy.clocksHeading}
        </h2>
        <p className={`mt-1 ${cbaiTextBody}`}>{copy.clocksDescription}</p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {countries.map((country) => {
            const zone = findCountryTimeZone(country.id);
            const resolvable = zone ? isResolvableTimeZone(zone.capitalTimeZone) : false;
            const clock =
              zone && resolvable && now ? formatCountryTime(zone.capitalTimeZone, language, now) : null;
            const watched = watchedCountryIds.has(country.id);
            return (
              <li
                key={country.id}
                data-country-clock={country.id}
                className={`${cbaiSurfaceSolid} ${cbaiPanelPadding}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {/* Official country and capital names are shown exactly as registered. */}
                    <p className="text-sm font-medium text-[var(--cbai-text-primary)]">{country.name}</p>
                    <p className={cbaiTextMuted}>
                      {copy.clocksCapitalNote} · {country.capital}
                    </p>
                  </div>
                  {watched ? (
                    <span className="inline-flex rounded-full border border-emerald-500/30 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                      {copy.watching}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 font-mono text-sm text-[var(--cbai-text-primary)]" suppressHydrationWarning>
                  {clock ?? (zone ? copy.clocksUnavailable : provenanceCopy.unavailable)}
                </p>
                {zone?.multipleZones ? (
                  <p className="mt-1 text-[11px] text-[var(--cbai-text-muted)]">{copy.clocksMultipleZones}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleWatch(country.id, country.name)}
                    className={cbaiBtnSecondarySm}
                  >
                    {watched ? copy.removeWatch : copy.addWatch}
                  </button>
                  <Link
                    href={`/countries?country=${country.id}`}
                    className={`inline-flex min-h-11 items-center underline underline-offset-4 ${cbaiLinkAction}`}
                  >
                    {t("navigation.countries")}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
        <p className={`mt-3 ${cbaiTextMuted}`}>
          {copy.clocksSource} ·{" "}
          <a
            className="underline underline-offset-4"
            href={IANA_TZDB_SOURCE_URL}
            target="_blank"
            rel="noreferrer"
          >
            iana.org/time-zones
          </a>
        </p>
      </section>

      <section aria-labelledby="updates-watches" className="mt-8">
        <h2 id="updates-watches" className={cbaiSectionTitle}>
          {copy.watchesHeading}
        </h2>
        <p className={`mt-1 ${cbaiTextBody}`}>{copy.watchesDescription}</p>
        {watches.length === 0 ? (
          <p className={`mt-3 ${cbaiEmptyDashed} ${cbaiTextMuted}`}>
            {copy.watchesEmpty}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {watches.map((watch) => (
              <li
                key={watch.id}
                data-watch-id={watch.id}
                className={`flex flex-wrap items-center justify-between gap-3 ${cbaiSurfaceSolid} px-4 py-3`}
              >
                <div>
                  <p className="text-sm text-[var(--cbai-text-primary)]">{watch.targetLabel}</p>
                  <p className={cbaiTextMuted}>
                    {watch.targetType === "country"
                      ? copy.watchTargetCountry
                      : watch.targetType === "indicator"
                        ? copy.watchTargetIndicator
                        : watch.targetType === "evidence_source"
                          ? copy.watchTargetSource
                          : watch.targetType === "project"
                            ? copy.watchTargetProject
                            : watch.targetType === "report"
                              ? copy.watchTargetReport
                              : copy.watchTargetPublication}
                    {" · "}
                    {watch.pollingDisclosure === "manual_refresh"
                      ? copy.capabilityManualOnly
                      : copy.capabilityScheduled}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeWatch(watch.id);
                    reload();
                  }}
                  className={cbaiBtnSecondarySm}
                >
                  {copy.removeWatch}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="updates-feed" className="mt-8">
        <h2 id="updates-feed" className={cbaiSectionTitle}>
          {copy.feedHeading}
        </h2>
        <p className={`mt-1 ${cbaiTextBody}`}>{copy.feedDescription}</p>
        {events.length === 0 ? (
          <div
            data-updates-feed="empty"
            className={`mt-3 ${cbaiEmptyDashed}`}
          >
            <p className="text-sm font-medium text-[var(--cbai-text-primary)]">{copy.feedEmpty}</p>
            <p className={`mt-2 ${cbaiTextBody}`}>{copy.feedEmptyDetail}</p>
          </div>
        ) : (
          <ul className="mt-3 space-y-3" data-updates-feed="populated">
            {events.map((event) => (
              <li
                key={event.id}
                className={`${cbaiSurfaceSolid} ${cbaiPanelPadding}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <SourceBadge kind={event.source.materialKind} />
                  <FreshnessBadge status={event.source.freshness.freshnessStatus} />
                  <span className={cbaiTextMuted}>
                    {eventLabel(event.eventType, language)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-[var(--cbai-text-primary)]">{event.title}</p>
                <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--cbai-text-muted)]">{copy.eventWhatChanged}</dt>
                    <dd className="text-[var(--cbai-text-secondary)]">{event.whatChanged}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--cbai-text-muted)]">{copy.eventPreviousValue}</dt>
                    <dd className="text-[var(--cbai-text-secondary)]">
                      {event.oldVerifiedValue ?? provenanceCopy.unavailable}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--cbai-text-muted)]">{copy.eventNewValue}</dt>
                    <dd className="text-[var(--cbai-text-secondary)]">
                      {event.newVerifiedValue ?? provenanceCopy.unavailable}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--cbai-text-muted)]">{copy.eventEffectiveAt}</dt>
                    <dd className="text-[var(--cbai-text-secondary)]">
                      {event.effectiveAt ?? provenanceCopy.dateUnavailable}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--cbai-text-muted)]">{copy.eventDetectedAt}</dt>
                    <dd className="text-[var(--cbai-text-secondary)]">{event.detectedAt}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--cbai-text-muted)]">{provenanceCopy.source}</dt>
                    <dd className="text-[var(--cbai-text-secondary)]">
                      {event.source.sourceOrganization} — {event.source.sourceTitle}
                    </dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <LastVerified value={event.source.freshness.verifiedAt} />
                  {event.supportingEvidenceUrl ? (
                    // Evidence links can point at an official external document, so this is a
                    // plain anchor rather than a typed internal route.
                    <a
                      href={event.supportingEvidenceUrl}
                      className={`inline-flex min-h-11 items-center underline underline-offset-4 ${cbaiLinkAction}`}
                    >
                      {copy.eventEvidence}
                    </a>
                  ) : null}
                  {event.readAt ? (
                    <span className={cbaiTextMuted}>{copy.eventRead}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        markVerifiedChangeRead(event.id);
                        reload();
                      }}
                      className={cbaiBtnSecondarySm}
                    >
                      {copy.eventMarkRead}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className={`mt-4 ${cbaiTextMuted}`}>{copy.notAdvice}</p>
      </section>
    </div>
  );
}
