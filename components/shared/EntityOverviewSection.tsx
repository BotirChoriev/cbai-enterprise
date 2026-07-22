"use client";

import EntityProfileSection from "@/components/shared/EntityProfileSection";
import ShareButton from "@/components/shared/ShareButton";
import { useTranslation } from "@/lib/i18n/use-translation";
import { translateOfficialInformationLabel } from "@/lib/i18n/entity-ui-translation";
import { getDictionary } from "@/lib/i18n/translate";

export type EntityOverviewFacts = {
  label: string;
  value: string;
  /** Real external link, e.g. an official website — rendered as a real <a>, never a bare label. */
  href?: string;
};

type EntityOverviewSectionProps = {
  name: string;
  entityType: string;
  country: string | null;
  region?: string | null;
  subtitle?: string;
  availableInformation: string;
  facts?: readonly EntityOverviewFacts[];
  /** False when the page's own hero already showed this exact name as its heading — avoids a
   * literal name-shown-twice-in-a-row (Research topic pages, whose ResearchTopicHero already
   * renders a full h1/domain/status/description above this section). Default true preserves the
   * existing Country/Company/University behavior, where this is the only place the name appears. */
  showName?: boolean;
};

export default function EntityOverviewSection({
  name,
  entityType,
  country,
  region = null,
  subtitle,
  availableInformation,
  facts = [],
  showName = true,
}: EntityOverviewSectionProps) {
  const { t, language } = useTranslation();
  const dictionary = getDictionary(language);

  return (
    <EntityProfileSection
      id="overview"
      title={t("filters.overview")}
      nextStep={{ label: `${t("entityIntelligence.availableInformation")} →`, href: "#evidence" }}
    >
      <div className="rounded-lg border border-teal-500/10 bg-[var(--surface)]/80 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          {showName ? (
            <div>
              <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl">{name}</h2>
              {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
            </div>
          ) : (
            <div />
          )}
          <ShareButton className="shrink-0" />
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">{t("graphUi.entityType")}</dt>
            <dd className="mt-0.5 text-slate-200">{entityType}</dd>
          </div>
          {country ? (
            <div>
              <dt className="text-xs text-slate-500">{t("filters.country")}</dt>
              <dd className="mt-0.5 text-slate-200">{country}</dd>
            </div>
          ) : null}
          {region ? (
            <div>
              <dt className="text-xs text-slate-500">{t("filters.region")}</dt>
              <dd className="mt-0.5 text-slate-200">{region}</dd>
            </div>
          ) : null}
          <div className={country || region ? "sm:col-span-2" : ""}>
            <dt className="text-xs text-slate-500">{t("entityIntelligence.availableInformation")}</dt>
            <dd className="mt-0.5 text-slate-200">
              {translateOfficialInformationLabel(dictionary, availableInformation)}
            </dd>
          </div>
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-slate-500">{fact.label}</dt>
              <dd className="mt-0.5 text-slate-200">
                {fact.href ? (
                  <a
                    href={fact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-300 underline-offset-2 hover:text-teal-200 hover:underline"
                  >
                    {fact.value}
                  </a>
                ) : (
                  fact.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </EntityProfileSection>
  );
}
