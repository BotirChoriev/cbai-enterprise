"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RESEARCH_DOMAINS, RESEARCH_TOPICS } from "@/lib/research/research-topics";
import {
  buildGriGraphProjection,
  buildControlCabinetDraft,
  buildResearchMeetingDraft,
  getResearchIntelligenceProfile,
  listLibraryBridge,
  listResearchOpportunityRadar,
  runResearchMatch,
} from "@/lib/global-research-intelligence";
import { getGriCopy } from "@/lib/i18n/platform-copy-global-research-intelligence";
import { useTranslation } from "@/lib/i18n/use-translation";
import CreateLinkedWorkButton from "@/components/operational-objects/CreateLinkedWorkButton";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondarySm,
  cbaiFocusRing,
  cbaiMineralPanel,
  cbaiSectionEyebrow,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";
import ResearchTopicCatalog from "@/components/research/ResearchTopicCatalog";

type CanvasView =
  | "intelligence"
  | "opportunities"
  | "match"
  | "library"
  | "cabinet"
  | "lifecycle"
  | "meeting"
  | "map"
  | "scientist"
  | "center"
  | "laboratory"
  | "evidence";

const VALID_VIEWS: readonly CanvasView[] = [
  "intelligence",
  "opportunities",
  "match",
  "library",
  "cabinet",
  "lifecycle",
  "meeting",
  "map",
  "scientist",
  "center",
  "laboratory",
  "evidence",
];

function parseView(raw: string | null): CanvasView {
  return raw && (VALID_VIEWS as readonly string[]).includes(raw) ? (raw as CanvasView) : "intelligence";
}

export default function ResearchIntelligenceNetworkHome() {
  const { language, t } = useTranslation();
  const copy = getGriCopy(language);
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = parseView(searchParams.get("view"));
  const [domainId, setDomainId] = useState<string>("all");
  const [selectedTopicId, setSelectedTopicId] = useState(RESEARCH_TOPICS[0]?.topicId ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [matchHint, setMatchHint] = useState("water purification");

  const topics = useMemo(() => {
    if (domainId === "all") return RESEARCH_TOPICS;
    return RESEARCH_TOPICS.filter((topicRow) => topicRow.domainId === domainId);
  }, [domainId]);

  const profile = useMemo(
    () => getResearchIntelligenceProfile(selectedTopicId) ?? getResearchIntelligenceProfile(RESEARCH_TOPICS[0]!.topicId)!,
    [selectedTopicId],
  );

  const graph = useMemo(() => buildGriGraphProjection(10), []);
  const radar = useMemo(() => listResearchOpportunityRadar(), []);
  const library = useMemo(() => listLibraryBridge(selectedTopicId), [selectedTopicId]);
  const match = useMemo(
    () => runResearchMatch({ topicHint: matchHint, methodologyHint: null, geographyCountryIds: [] }),
    [matchHint],
  );
  const cabinet = useMemo(
    () =>
      buildControlCabinetDraft({
        projectTitle: profile.officialIdentity.officialName,
        researchQuestion: "",
        contentLocale: language,
      }),
    [profile.officialIdentity.officialName, language],
  );
  const meeting = useMemo(() => buildResearchMeetingDraft(), []);

  function setViewAndUrl(next: CanvasView) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.replace(`/research?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-4 pb-24" data-cbai-gri-network="" data-cbai-voice-dock-clearance="">
      <p className={`${cbaiTextMuted} text-sm`}>{copy.honestyBanner}</p>

      <div className={`${cbaiMineralPanel} flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <p className={cbaiSectionEyebrow}>Intelligence OS</p>
          <h2 className="text-lg font-semibold text-[var(--cbai-text-primary)]">{copy.title}</h2>
          <p className={`text-sm ${cbaiTextMuted}`}>{copy.oneSentence}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-4`}
            data-cbai-primary-action=""
            onClick={() => setViewAndUrl("opportunities")}
          >
            {copy.primaryAction}
          </button>
          <button
            type="button"
            className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} min-h-11`}
            onClick={() => setViewAndUrl("cabinet")}
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
              <div className="absolute right-0 z-20 mt-1 min-w-[14rem] space-y-1 rounded-lg border border-[var(--cbai-border)] bg-[var(--cbai-surface)] p-2 shadow-lg">
                <Link href="/research/canvas" className={`${cbaiFocusRing} block min-h-11 px-2 py-2 text-sm`}>
                  Research Canvas
                </Link>
                <Link href="/research/workspace" className={`${cbaiFocusRing} block min-h-11 px-2 py-2 text-sm`}>
                  Research Workspace
                </Link>
                <Link href="/scientific-documents" className={`${cbaiFocusRing} block min-h-11 px-2 py-2 text-sm`}>
                  Scientific documents
                </Link>
                <Link href="/my-work" className={`${cbaiFocusRing} block min-h-11 px-2 py-2 text-sm`}>
                  My Work
                </Link>
                <CreateLinkedWorkButton
                  variant="research"
                  compact
                  research={{
                    topicId: selectedTopicId,
                    topicName: profile.officialIdentity.officialName,
                    routePath: `/research/${encodeURIComponent(selectedTopicId)}`,
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <p className={`text-xs ${cbaiTextMuted}`}>
        {copy.firstFiveMinutes}{" "}
        <Link href="/" className="text-teal-700 underline dark:text-teal-300">
          Home
        </Link>
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)_minmax(12rem,16rem)]">
        {/* Navigator */}
        <aside className="space-y-3" data-cbai-gri-navigator="">
          <div className="flex md:hidden">
            <button
              type="button"
              className={`${cbaiFocusRing} min-h-11 rounded-lg border border-[var(--cbai-border)] px-3 text-sm`}
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((v) => !v)}
            >
              {filtersOpen ? copy.filtersClose : copy.filtersOpen}
            </button>
          </div>
          <div className={`${filtersOpen ? "block" : "hidden md:block"} ${cbaiMineralPanel} space-y-3`}>
            <h3 className="text-sm font-semibold">{copy.navigator}</h3>
            <label className="block text-xs text-[var(--cbai-text-secondary)]">
              {copy.domains}
              <select
                className={`${cbaiFocusRing} mt-1 w-full min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2 text-sm`}
                value={domainId}
                onChange={(e) => setDomainId(e.target.value)}
              >
                <option value="all">{copy.allDomains}</option>
                {RESEARCH_DOMAINS.map((d) => (
                  <option key={d.domainId} value={d.domainId}>
                    {d.domainName}
                  </option>
                ))}
              </select>
            </label>
            <div className="max-h-72 space-y-1 overflow-y-auto" role="listbox" aria-label={copy.navigator}>
              {topics.slice(0, 40).map((topic) => (
                <button
                  key={topic.topicId}
                  type="button"
                  role="option"
                  aria-selected={selectedTopicId === topic.topicId}
                  className={`${cbaiFocusRing} w-full rounded-md border px-2 py-2 text-left text-xs ${
                    selectedTopicId === topic.topicId
                      ? "border-teal-500/40 bg-teal-500/10"
                      : "border-[var(--cbai-border)]"
                  }`}
                  onClick={() => setSelectedTopicId(topic.topicId)}
                >
                  <span lang="en">{topic.topicName}</span>
                  <span className="mt-0.5 block text-[10px] text-[var(--cbai-text-muted)]">{topic.domain}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  ["intelligence", copy.canvas],
                  ["map", copy.map],
                  ["opportunities", copy.opportunities],
                  ["match", copy.match],
                  ["library", copy.library],
                  ["cabinet", copy.cabinet],
                  ["lifecycle", copy.lifecycle],
                  ["meeting", copy.meeting],
                  ["scientist", copy.scientistProfile],
                  ["center", copy.centerProfile],
                  ["laboratory", copy.laboratoryProfile],
                  ["evidence", copy.evidenceComparison],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`${cbaiFocusRing} min-h-11 rounded-md border px-2 text-[11px] ${
                    view === id ? "border-teal-500/40 text-teal-700 dark:text-teal-300" : "border-[var(--cbai-border)]"
                  }`}
                  onClick={() => setViewAndUrl(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <div className="min-w-0 space-y-4" data-cbai-gri-canvas="">
          {view === "intelligence" || view === "map" ? (
            <>
              <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-gri-map="">
                <h3 className="text-sm font-semibold">{copy.map}</h3>
                <p className={`text-sm ${cbaiTextMuted}`}>{graph.honestyNotice}</p>
                <p className="text-xs text-[var(--cbai-text-secondary)]">
                  nodes: {graph.nodes.length} · edges: {graph.edges.length}
                </p>
                <details>
                  <summary className={`${cbaiFocusRing} cursor-pointer text-sm`}>{copy.graphListFallback}</summary>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-[var(--cbai-text-secondary)]">
                    {graph.listFallback.slice(0, 30).map((row) => (
                      <li key={row.label + row.detail}>
                        <span lang="en">{row.label}</span> — {row.detail}
                      </li>
                    ))}
                  </ul>
                </details>
              </section>

              <section className={`${cbaiMineralPanel} space-y-3`} data-cbai-gri-profile="">
                <h3 className="text-base font-semibold text-[var(--cbai-text-primary)]">
                  <span lang="en">{profile.officialIdentity.officialName}</span>
                </h3>
                <p className={`text-sm ${cbaiTextMuted}`}>
                  {profile.officialIdentity.domainName} · {copy.lifecycle}: {profile.lifecycleState}
                </p>
                <div className="grid gap-3 lg:grid-cols-2">
                  <article className="rounded-lg border border-l-4 border-[var(--cbai-border)] border-l-amber-600/50 p-3" data-cbai-official-source="">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                      {copy.officialSource}
                    </h4>
                    <p className={`mt-2 text-sm ${cbaiTextMuted}`}>
                      {profile.officialSources[0] ?? copy.noVerifiedData}
                    </p>
                  </article>
                  <article className="rounded-lg border border-l-4 border-[var(--cbai-border)] border-l-teal-600/50 p-3" data-cbai-cbai-synthesis="">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-300">
                      {copy.cbaiSynthesis}
                    </h4>
                    <p className={`mt-2 text-sm ${cbaiTextMuted}`}>
                      {profile.layers.cbaiSynthesis[0] ?? copy.honestyBanner}
                    </p>
                  </article>
                </div>
                <p className="text-sm text-[var(--cbai-text-secondary)]">
                  {copy.missingKnowledge}: {profile.missingInformation.slice(0, 4).join(", ")}
                </p>
                <p className="text-sm text-[var(--cbai-text-secondary)]">
                  {copy.replication}: {profile.replicationStatus}
                </p>
                <Link
                  href={`/research/${encodeURIComponent(selectedTopicId)}`}
                  className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} inline-flex min-h-11 items-center`}
                >
                  {copy.openTopic}
                </Link>
              </section>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className={cbaiMineralPanel}>
                  <p className="text-xs font-semibold">{copy.activeResearch}</p>
                  <p className={`mt-2 text-sm ${cbaiTextMuted}`}>{copy.noVerifiedData}</p>
                </div>
                <div className={cbaiMineralPanel}>
                  <p className="text-xs font-semibold">{copy.completedResearch}</p>
                  <p className={`mt-2 text-sm ${cbaiTextMuted}`}>{copy.noVerifiedData}</p>
                </div>
                <div className={cbaiMineralPanel} data-cbai-stopped-research="">
                  <p className="text-xs font-semibold">{copy.stoppedResearch}</p>
                  <p className={`mt-2 text-sm ${cbaiTextMuted}`}>
                    {copy.noVerifiedData} — reasons only when sourced
                  </p>
                </div>
              </div>
            </>
          ) : null}

          {view === "opportunities" ? (
            <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-opportunity-radar="">
              <h3 className="text-sm font-semibold">{copy.opportunities}</h3>
              <p className={`text-sm ${cbaiTextMuted}`}>{radar.honestyNotice}</p>
              <p className="text-sm">{copy.noVerifiedData}</p>
              <p className="text-xs text-[var(--cbai-text-muted)]">
                status: {radar.status} · active: {radar.activeCount}
              </p>
            </section>
          ) : null}

          {view === "match" ? (
            <section className={`${cbaiMineralPanel} space-y-3`} data-cbai-research-match="">
              <h3 className="text-sm font-semibold">{copy.match}</h3>
              <label className="block text-xs">
                {copy.topicHint}
                <input
                  className={`${cbaiFocusRing} mt-1 w-full min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2 text-sm`}
                  value={matchHint}
                  onChange={(e) => setMatchHint(e.target.value)}
                />
              </label>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{match.rankingForbiddenNotice}</p>
              <p className={`text-sm ${cbaiTextMuted}`}>{match.honestyNotice}</p>
              <ul className="space-y-3">
                {match.options.map((opt) => (
                  <li key={opt.topicId + String(opt.rankAmongResults)} className="rounded-lg border border-[var(--cbai-border)] p-3">
                    <p className="text-sm font-medium">
                      {opt.rankAmongResults}. <span lang="en">{opt.topicName}</span>
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[var(--cbai-text-secondary)]">
                      {opt.whyMatches.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                    <p className={`${cbaiTextMuted} mt-2 text-xs`}>
                      {copy.unknown}: {opt.unknown[0]}
                    </p>
                    <p className="text-xs text-[var(--cbai-text-muted)]">{opt.whoApprovesNext}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {view === "library" ? (
            <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-library-bridge="">
              <h3 className="text-sm font-semibold">{copy.library}</h3>
              <p className={`text-sm ${cbaiTextMuted}`}>{library.honestyNotice}</p>
              <ul className="space-y-1 text-sm text-[var(--cbai-text-secondary)]">
                {library.adapters.map((a) => (
                  <li key={a.id}>
                    {a.name}: {a.status}
                  </li>
                ))}
              </ul>
              <p className="text-sm">{copy.noVerifiedData}</p>
            </section>
          ) : null}

          {view === "cabinet" ? (
            <section className={`${cbaiMineralPanel} space-y-3`} data-cbai-control-cabinet="">
              <h3 className="text-sm font-semibold">{copy.cabinet}</h3>
              <p className="text-xs text-teal-700 dark:text-teal-300">{copy.confirmBeforeCreate}</p>
              <p className="text-sm text-[var(--cbai-text-primary)]">{cabinet.projectTitle}</p>
              <p className={`text-sm ${cbaiTextMuted}`}>
                {copy.unknown}: {cabinet.missingInformation.join(", ")}
              </p>
              <p className="text-xs text-[var(--cbai-text-muted)]">
                inferred: {cabinet.inferredFields.join(", ") || "—"} · version {cabinet.version}
              </p>
              <CreateLinkedWorkButton
                variant="research"
                research={{
                  topicId: selectedTopicId,
                  topicName: profile.officialIdentity.officialName,
                  routePath: `/research?view=cabinet&topic=${encodeURIComponent(selectedTopicId)}`,
                }}
              />
            </section>
          ) : null}

          {view === "lifecycle" ? (
            <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-lifecycle="">
              <h3 className="text-sm font-semibold">{copy.lifecycle}</h3>
              <p className={`text-sm ${cbaiTextMuted}`}>
                Catalog topics default to lifecycle state “idea”. Stopped/cancelled/inconclusive reasons appear only when a source supports them — never inferred blame.
              </p>
              <p className="text-sm">{copy.stoppedResearch}: {copy.noVerifiedData}</p>
            </section>
          ) : null}

          {view === "meeting" ? (
            <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-research-meeting="">
              <h3 className="text-sm font-semibold">{copy.meeting}</h3>
              <p className={`text-sm ${cbaiTextMuted}`}>{meeting.honestyNotice}</p>
              <p className="text-sm text-[var(--cbai-text-secondary)]">{copy.meetingConsent}</p>
              <p className="text-xs text-amber-800 dark:text-amber-200">{copy.interpretationNotClaimed}</p>
            </section>
          ) : null}

          {view === "scientist" ? (
            <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-scientist-profile="">
              <h3 className="text-sm font-semibold">{copy.scientistProfile}</h3>
              <p className={`text-sm ${cbaiTextMuted}`}>{copy.entityNotConnected}</p>
              <p className="text-xs text-[var(--cbai-text-muted)]">{copy.noVerifiedData}</p>
            </section>
          ) : null}

          {view === "center" ? (
            <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-center-profile="">
              <h3 className="text-sm font-semibold">{copy.centerProfile}</h3>
              <p className={`text-sm ${cbaiTextMuted}`}>{copy.entityNotConnected}</p>
              <p className="text-xs text-[var(--cbai-text-muted)]">{copy.noVerifiedData}</p>
            </section>
          ) : null}

          {view === "laboratory" ? (
            <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-laboratory-profile="">
              <h3 className="text-sm font-semibold">{copy.laboratoryProfile}</h3>
              <p className={`text-sm ${cbaiTextMuted}`}>{copy.entityNotConnected}</p>
              <p className="text-xs text-[var(--cbai-text-muted)]">{copy.noVerifiedData}</p>
            </section>
          ) : null}

          {view === "evidence" ? (
            <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-evidence-comparison="">
              <h3 className="text-sm font-semibold">{copy.evidenceComparison}</h3>
              <p className={`text-sm ${cbaiTextMuted}`}>{copy.contradictions}: {copy.noVerifiedData}</p>
              <Link href="/evidence" className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} inline-flex min-h-11 items-center`}>
                Evidence workspace
              </Link>
            </section>
          ) : null}

          <details className={cbaiMineralPanel}>
            <summary className={`${cbaiFocusRing} cursor-pointer text-sm font-medium`}>
              {copy.catalogLegacy}
            </summary>
            <div className="mt-3">
              <ResearchTopicCatalog />
            </div>
          </details>
        </div>

        {/* Context rail */}
        <aside className={`${cbaiMineralPanel} space-y-3 max-lg:hidden`} data-cbai-gri-context-rail="">
          <h3 className="text-sm font-semibold">{copy.contextRail}</h3>
          <p className="text-sm">
            <span lang="en">{profile.officialIdentity.officialName}</span>
          </p>
          <p className={`${cbaiTextMuted} text-xs`}>
            {copy.evidenceStatus}: {profile.replicationStatus}
          </p>
          <p className={`${cbaiTextMuted} text-xs`}>
            {copy.humanDecision}: {profile.humanDecisionCheckpoints[0]}
          </p>
          <p className={`${cbaiTextMuted} text-xs`}>{copy.voiceClearance}</p>
          <p className="text-xs text-[var(--cbai-text-muted)]">
            {t("researchHome.statusLabel")}
          </p>
        </aside>
      </div>
    </div>
  );
}
