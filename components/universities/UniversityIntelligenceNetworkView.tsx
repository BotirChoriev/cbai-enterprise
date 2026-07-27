"use client";

import { useId, useMemo, useState } from "react";
import type { University } from "@/lib/universities";
import {
  buildUniversityNetworkProfile,
  countryFlagEmojiForUniversity,
  buildEmptyFiveYearTimeline,
  timelineTableRows,
  listOpportunityRadar,
  runAcademicMatch,
  buildProjectPresentationCard,
  attemptPresentationCommunication,
  exportPresentationPlainText,
} from "@/lib/university-intelligence";
import type { UniversityTabId } from "@/lib/university-intelligence/types";
import UniversityLogoMark from "@/components/universities/UniversityLogoMark";
import CreateLinkedWorkButton from "@/components/operational-objects/CreateLinkedWorkButton";
import EvidenceConnectAction from "@/components/evidence/EvidenceConnectAction";
import AddToMissionButton from "@/components/mission/MissionOperatingActions";
import CreateProjectFromEntityButton from "@/components/project/CreateProjectFromEntityButton";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import {
  getUniversityIntelligenceCopy,
  type UniversityIntelligenceCopy,
} from "@/lib/i18n/platform-copy-university-intelligence";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondarySm,
  cbaiFocusRing,
  cbaiMineralPanel,
  cbaiSectionEyebrow,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

const TABS: readonly UniversityTabId[] = [
  "overview",
  "research_areas",
  "academics",
  "faculties",
  "laboratories",
  "projects",
  "publications",
  "patents",
  "presentations",
  "opportunities",
  "collaboration",
  "evidence",
];

function tabLabel(copy: UniversityIntelligenceCopy, id: UniversityTabId): string {
  const map: Record<UniversityTabId, keyof UniversityIntelligenceCopy> = {
    overview: "tabOverview",
    research_areas: "tabResearchAreas",
    academics: "tabAcademics",
    faculties: "tabFaculties",
    laboratories: "tabLaboratories",
    projects: "tabProjects",
    publications: "tabPublications",
    patents: "tabPatents",
    presentations: "tabPresentations",
    opportunities: "tabOpportunities",
    collaboration: "tabCollaboration",
    evidence: "tabEvidence",
  };
  return copy[map[id]];
}

function metricLabel(copy: UniversityIntelligenceCopy, labelKey: string): string {
  return (copy as Record<string, string>)[labelKey] ?? labelKey;
}

type Props = {
  readonly university: University;
  readonly initialTab?: UniversityTabId | null;
  readonly matchCountries?: readonly string[] | null;
};

export default function UniversityIntelligenceNetworkView({
  university,
  initialTab,
  matchCountries,
}: Props) {
  const { language, t } = useTranslation();
  const copy = getUniversityIntelligenceCopy(language);
  const profile = useMemo(() => buildUniversityNetworkProfile(university), [university]);
  const [tab, setTab] = useState<UniversityTabId>(
    initialTab && TABS.includes(initialTab) ? initialTab : "overview",
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [commMessage, setCommMessage] = useState<string | null>(null);
  const tabsId = useId();

  const timeline = useMemo(() => buildEmptyFiveYearTimeline(), []);
  const tableRows = timelineTableRows(timeline);
  const radar = listOpportunityRadar(university.id);
  const flag = countryFlagEmojiForUniversity(profile);

  const match = useMemo(
    () =>
      runAcademicMatch({
        projectTheme: "water purification",
        researchQuestion: "How can water purification methods be shared across laboratories?",
        geographyCountryIds: matchCountries?.length ? [...matchCountries] : profile.linkedCountryId ? [profile.linkedCountryId] : [],
        languages: [language],
      }),
    [matchCountries, profile.linkedCountryId, language],
  );

  const presentation = useMemo(
    () =>
      buildProjectPresentationCard({
        title: "Water purification project presentation",
        researcherName: "",
        affiliation: university.name,
        problem: "",
        scientificQuestion: "",
        methodology: "",
        contentLocale: language,
        targetUniversityIds: match.options.slice(0, 2).map((o) => o.universityId),
        selectedCommunicationLanguage: language,
      }),
    [university.name, language, match.options],
  );

  function emptyTabBody(title: string) {
    return (
      <div className={`${cbaiMineralPanel} space-y-2`} data-cbai-missing-tab="">
        <h4 className="text-sm font-semibold text-[var(--cbai-text-primary)]">{title}</h4>
        <p className={`text-sm ${cbaiTextMuted}`}>{copy.noVerifiedData}</p>
        <p className="text-xs text-[var(--cbai-text-secondary)]">{copy.missingMatters}</p>
        <p className="text-xs text-[var(--cbai-text-muted)]">
          {copy.notConnected} — {copy.requestEvidence}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-cbai-university-intelligence="">
      <p className={`${cbaiTextMuted} text-sm`}>{copy.honestyBanner}</p>

      {/* Identity header */}
      <header className={`${cbaiMineralPanel} space-y-3`} data-cbai-university-identity="">
        <p className={cbaiSectionEyebrow}>{copy.identityHeader}</p>
        <div className="flex flex-wrap items-start gap-4">
          <UniversityLogoMark
            abbreviation={profile.identity.abbreviation}
            officialName={profile.identity.officialName}
            logo={profile.identity.logo}
            size="lg"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-xl font-semibold text-[var(--cbai-text-primary)] sm:text-2xl">
              <span lang="en">{profile.identity.officialName}</span>
            </h2>
            <p className="text-sm text-[var(--cbai-text-secondary)]">
              {flag ? <span aria-hidden="true">{flag} </span> : null}
              {profile.identity.city} · {profile.identity.countryName} · {profile.identity.universityType}
            </p>
            <p className={`${cbaiTextMuted} text-xs`}>
              {copy.establishedYear}: {profile.identity.establishedYear ?? "—"} · {copy.verifiedDomain}:{" "}
              {profile.identity.verifiedDomains[0] ?? copy.notConnected} · {copy.dataCoverage}:{" "}
              {profile.identity.dataCoverage}
            </p>
            <p className={`${cbaiTextMuted} text-xs`}>
              {profile.identity.lastVerifiedAt ?? copy.lastVerifiedUnknown}
            </p>
            {!profile.identity.logo.isOfficialAsset ? (
              <p className="text-xs text-[var(--cbai-text-muted)]">{copy.neutralMonogram}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-4`}
              data-cbai-primary-action=""
              onClick={() => setTab("opportunities")}
            >
              {copy.primaryAction}
            </button>
            <button
              type="button"
              className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} min-h-11`}
              onClick={() => setTab("collaboration")}
            >
              {copy.secondaryAction}
            </button>
            <div className="relative">
              <button
                type="button"
                className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} min-h-11`}
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((v) => !v)}
              >
                {copy.moreActions}
              </button>
              {moreOpen ? (
                <div
                  className="absolute right-0 z-20 mt-1 min-w-[14rem] rounded-lg border border-[var(--cbai-border)] bg-[var(--cbai-surface)] p-2 shadow-lg"
                  role="menu"
                >
                  <CreateLinkedWorkButton
                    variant="university"
                    compact
                    university={{
                      universityId: university.id,
                      universityName: university.name,
                      routePath: `/universities?university=${encodeURIComponent(university.id)}`,
                    }}
                  />
                  <EvidenceConnectAction
                    category={t("operationalObject.linkedEvidenceOfficialSources")}
                    relatedEntityName={university.name}
                    relatedEntityKind="university"
                    relatedEntityId={university.id}
                    compact
                  />
                  <AddToMissionButton
                    entity={{
                      kind: "university",
                      id: university.id,
                      name: university.name,
                      code: university.icon,
                      countryName: university.country,
                    }}
                    compact
                  />
                  <CreateProjectFromEntityButton
                    entity={{
                      kind: "university",
                      id: university.id,
                      name: university.name,
                      code: university.icon,
                      countryName: university.country,
                    }}
                  />
                  <SaveToWorkspaceButton
                    entity={{
                      kind: "university",
                      id: university.id,
                      name: university.name,
                      code: university.icon,
                      countryName: university.country,
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Snapshot */}
      <section className="space-y-2" aria-labelledby="uis-snapshot">
        <h3 id="uis-snapshot" className="text-base font-semibold text-[var(--cbai-text-primary)]">
          {copy.snapshot}
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {profile.snapshot.metrics.map((m) => (
            <div key={m.key} className={`${cbaiMineralPanel} min-h-[4.5rem]`}>
              <p className="text-xs font-medium text-[var(--cbai-text-muted)]">
                {metricLabel(copy, m.labelKey)}
              </p>
              <p className="mt-1 text-sm text-[var(--cbai-text-primary)]">
                {m.value == null ? copy.noVerifiedData : String(m.value)}
              </p>
              <p className={`${cbaiTextMuted} text-[10px]`}>
                {m.verificationState} · {m.coverageLimitation}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <div className="space-y-3">
        <div
          role="tablist"
          aria-label={copy.title}
          id={tabsId}
          className="flex gap-1 overflow-x-auto pb-1"
        >
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`${cbaiFocusRing} min-h-11 shrink-0 rounded-md border px-3 text-xs ${
                tab === id
                  ? "border-teal-500/40 bg-teal-500/10 text-teal-800 dark:text-teal-200"
                  : "border-[var(--cbai-border)] text-[var(--cbai-text-secondary)]"
              }`}
              onClick={() => setTab(id)}
            >
              {tabLabel(copy, id)}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="space-y-4">
          {tab === "overview" ? (
            <>
              <section className={`${cbaiMineralPanel} space-y-2`} aria-labelledby="uis-five">
                <h3 id="uis-five" className="text-sm font-semibold">
                  {copy.fiveYear}
                </h3>
                <p className={`text-sm ${cbaiTextMuted}`}>{copy.noVerifiedData}</p>
                <details>
                  <summary className={`${cbaiFocusRing} cursor-pointer text-sm`}>{copy.chartTableAlt}</summary>
                  <table className="mt-2 min-w-full text-left text-sm">
                    <caption className="sr-only">{copy.fiveYear}</caption>
                    <thead>
                      <tr>
                        <th scope="col">Year</th>
                        <th scope="col">{copy.metricPublications}</th>
                        <th scope="col">{copy.metricProjects}</th>
                        <th scope="col">Class</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((r) => (
                        <tr key={r.year}>
                          <td>{r.year}</td>
                          <td>{r.publications}</td>
                          <td>{r.projects}</td>
                          <td>
                            {r.classification === "official_future_plan"
                              ? copy.officialFuturePlan
                              : r.classification === "cbai_scenario"
                                ? copy.cbaiScenario
                                : copy.observedHistorical}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </section>
              <div className="grid gap-3 lg:grid-cols-2">
                <article className={`${cbaiMineralPanel} border-l-4 border-l-amber-600/50`} data-cbai-official-source="">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                    {copy.officialSource}
                  </h4>
                  <p className={`mt-2 text-sm ${cbaiTextMuted}`}>
                    {profile.identity.officialWebsite ?? copy.noVerifiedData}
                  </p>
                </article>
                <article className={`${cbaiMineralPanel} border-l-4 border-l-teal-600/50`} data-cbai-cbai-analysis="">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-300">
                    {copy.cbaiAnalysis}
                  </h4>
                  <p className={`mt-2 text-sm ${cbaiTextMuted}`}>{copy.honestyBanner}</p>
                </article>
              </div>
            </>
          ) : null}

          {tab === "faculties" || tab === "laboratories" || tab === "academics" || tab === "projects" || tab === "publications" || tab === "patents" || tab === "research_areas" || tab === "presentations" || tab === "evidence"
            ? emptyTabBody(tabLabel(copy, tab))
            : null}

          {tab === "opportunities" ? (
            <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-opportunity-radar="">
              <h3 className="text-sm font-semibold">{copy.opportunityRadar}</h3>
              <p className={`text-sm ${cbaiTextMuted}`}>{radar.honestyNotice}</p>
              <p className="text-sm text-[var(--cbai-text-secondary)]">{copy.opportunityEmpty}</p>
              <p className="text-xs text-[var(--cbai-text-muted)]">
                status: {radar.status} · active: {radar.activeCount}
              </p>
            </section>
          ) : null}

          {tab === "collaboration" ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--cbai-text-secondary)]">{copy.neverRankPeople}</p>
              <section className={`${cbaiMineralPanel} space-y-3`} data-cbai-academic-match="">
                <h3 className="text-sm font-semibold">{copy.matchTitle}</h3>
                <p className={`text-sm ${cbaiTextMuted}`}>{match.honestyNotice}</p>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                  {match.rankingForbiddenNotice}
                </p>
                <ul className="space-y-3">
                  {match.options.map((opt) => (
                    <li key={opt.universityId} className="rounded-lg border border-[var(--cbai-border)] p-3">
                      <p className="text-sm font-medium text-[var(--cbai-text-primary)]">
                        {opt.rankAmongResults}. <span lang="en">{opt.universityName}</span> · {opt.countryName}
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[var(--cbai-text-secondary)]">
                        {opt.whyMatches.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                      <p className={`${cbaiTextMuted} mt-2 text-xs`}>
                        {copy.notConnected}: {opt.missingInformation[0]}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={`${cbaiMineralPanel} space-y-3`} data-cbai-presentation-card="">
                <h3 className="text-sm font-semibold">{copy.presentationTitle}</h3>
                <p className="text-xs text-teal-700 dark:text-teal-300">{copy.presentationDraft}</p>
                <p className="text-sm text-[var(--cbai-text-primary)]">{presentation.title}</p>
                <p className={`text-sm ${cbaiTextMuted}`}>
                  {copy.providerNotConnected}: {presentation.disclosure.provider}
                </p>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={confirmSend}
                    onChange={(e) => setConfirmSend(e.target.checked)}
                    className={cbaiFocusRing}
                  />
                  {copy.confirmBeforeSend}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-3 text-sm`}
                    onClick={() => {
                      const result = attemptPresentationCommunication(presentation, confirmSend);
                      setCommMessage(result.message);
                    }}
                  >
                    {copy.confirmBeforeSend}
                  </button>
                  <button
                    type="button"
                    className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} min-h-11`}
                    onClick={() => {
                      void navigator.clipboard?.writeText(exportPresentationPlainText(presentation));
                      setCommMessage(copy.exportDraft);
                    }}
                  >
                    {copy.exportDraft}
                  </button>
                </div>
                {commMessage ? (
                  <p className="text-sm text-amber-800 dark:text-amber-200" role="status" data-cbai-provider-state="">
                    {commMessage}
                  </p>
                ) : null}
              </section>
            </div>
          ) : null}
        </div>
      </div>

      <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-human-decision="">
        <h3 className="text-sm font-semibold">{copy.humanDecision}</h3>
        <p className={`text-sm ${cbaiTextMuted}`}>{copy.meetingConsent}</p>
        <p className="text-xs text-[var(--cbai-text-muted)]">{copy.voiceClearance}</p>
      </section>
    </div>
  );
}
