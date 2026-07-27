"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { getLcrCopy, roomTypeLabel } from "@/lib/i18n/platform-copy-live-collaboration";
import { useOperationalObjects } from "@/components/operational-objects/OperationalObjectProvider";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import {
  acknowledgeRoomConsent,
  addAgendaItem,
  addDecision,
  addEvidenceRef,
  addQuestion,
  addSimulatedParticipant,
  appendHostUtterance,
  confirmDecision,
  getLiveRoomSnapshot,
  proposeOperationalObjectsFromRoom,
  probeMicrophonePreview,
  releaseMediaStream,
  setRoomLifecycle,
  subscribeLiveRooms,
  toggleAgendaItem,
  updateLaboratory,
  updatePractice,
  upsertGlossaryTerm,
  BROWSER_DEVICE_CAPABILITIES,
  PROFESSIONAL_INTEGRATIONS,
  participantPublicView,
} from "@/lib/live-intelligence-rooms";
import { cbaiBtnPrimary, cbaiBtnSecondarySm, cbaiFocusRing, cbaiTextMuted } from "@/components/brand/brand-classes";

type NavId =
  | "agenda"
  | "participants"
  | "presentations"
  | "evidence"
  | "questions"
  | "discussion"
  | "translation"
  | "decisions"
  | "actions"
  | "files";

export default function RoomShell() {
  const search = useSearchParams();
  const router = useRouter();
  const searchId = search.get("id") ?? "";
  const windowId =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("id") ?? "" : "";
  const roomId = searchId || windowId;
  const { language, t } = useTranslation();
  const copy = getDictionary(language).liveRooms;
  const lcr = getLcrCopy(language);
  const { openComposer } = useOperationalObjects();
  const voice = useVoiceOperator();
  const localPreviewRef = useRef<MediaStream | null>(null);
  const [nav, setNav] = useState<NavId>("discussion");
  const [utterance, setUtterance] = useState("");
  const [glossaryTerm, setGlossaryTerm] = useState("");
  const [doNotTranslate, setDoNotTranslate] = useState(true);
  const [consentChecked, setConsentChecked] = useState(false);
  const [agendaTitle, setAgendaTitle] = useState("");
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [decisionText, setDecisionText] = useState("");
  const [labHypothesis, setLabHypothesis] = useState("");
  const [labMethod, setLabMethod] = useState("");
  const [practiceScenario, setPracticeScenario] = useState("");
  const [goLivePending, setGoLivePending] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [deviceNote, setDeviceNote] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const room = useSyncExternalStore(
    subscribeLiveRooms,
    () => (roomId ? getLiveRoomSnapshot(roomId) : null),
    () => null,
  );

  function releaseAllLocalMedia() {
    releaseMediaStream(localPreviewRef.current);
    localPreviewRef.current = null;
    voice.stopListening();
  }

  useEffect(() => {
    return () => {
      releaseAllLocalMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- release on unmount only
  }, []);

  function reload() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cbai-live-rooms-changed"));
    }
  }

  const proposals = useMemo(() => (room ? proposeOperationalObjectsFromRoom(room) : []), [room]);

  if (!roomId || !room) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <h1 className="cbai-display text-2xl font-semibold text-[color:var(--cbai-text-primary)]">{copy.missingRoom}</h1>
        <p className={`text-sm ${cbaiTextMuted}`}>{copy.missingRoomHint}</p>
        <Link href="/rooms" className="text-[color:var(--cbai-accent-primary)]">
          {copy.backToList}
        </Link>
      </div>
    );
  }

  const activeRoom = room;
  const listenerLocale =
    activeRoom.participants.find((p) => p.kind === "ai_simulated")?.readLocale ||
    activeRoom.participants.find((p) => p.id !== activeRoom.hostParticipantId)?.readLocale ||
    language;
  const currentAgenda = activeRoom.agenda.find((a) => !a.done) ?? activeRoom.agenda[0];
  const speaker =
    activeRoom.participants.find((p) => p.id === activeRoom.activeSpeakerParticipantId) ??
    activeRoom.participants[0];
  const openQuestions = activeRoom.questions.filter((q) => !q.resolved);

  async function goLive() {
    if (goLivePending) return;
    if (!consentChecked && !activeRoom.consent.acknowledgedAt) return;
    setGoLivePending(true);
    try {
      if (!activeRoom.consent.acknowledgedAt) acknowledgeRoomConsent(activeRoom.roomId);
      setRoomLifecycle(activeRoom.roomId, "live");
      reload();
      if (!voice.micLive) await voice.startListening();
    } finally {
      setGoLivePending(false);
    }
  }

  function endLive() {
    setRoomLifecycle(activeRoom.roomId, "ended");
    releaseAllLocalMedia();
    reload();
  }

  function leaveRoom() {
    releaseAllLocalMedia();
    router.push("/rooms");
  }

  async function runMicPreflight() {
    const handle = await probeMicrophonePreview();
    releaseMediaStream(localPreviewRef.current);
    localPreviewRef.current = handle.stream;
    setDeviceNote(
      handle.permission === "granted"
        ? `${lcr.devicePreflight}: mic ok`
        : `${lcr.devicePreflight}: ${handle.error ?? handle.permission}`,
    );
  }

  const navItems: { id: NavId; label: string }[] = [
    { id: "agenda", label: lcr.navAgenda },
    { id: "participants", label: lcr.navParticipants },
    { id: "presentations", label: lcr.navPresentations },
    { id: "evidence", label: lcr.navEvidence },
    { id: "questions", label: lcr.navQuestions },
    { id: "discussion", label: lcr.navDiscussion },
    { id: "translation", label: lcr.navTranslation },
    { id: "decisions", label: lcr.navDecisions },
    { id: "actions", label: lcr.navActions },
    { id: "files", label: lcr.navFiles },
  ];

  return (
    <div
      className="mx-auto flex min-h-[70vh] max-w-[1600px] flex-col gap-3 px-3 py-4 sm:px-5 pb-28"
      data-cbai-voice-dock-clearance=""
      data-cbai-room-shell=""
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Link href="/rooms" className={`text-sm text-[color:var(--cbai-accent-primary)] ${cbaiFocusRing}`}>
            ← {copy.backToList}
          </Link>
          <h1 className="cbai-display text-2xl font-semibold text-[color:var(--cbai-text-primary)] sm:text-3xl">
            {activeRoom.title}
          </h1>
          <p className={`text-sm ${cbaiTextMuted}`}>{activeRoom.purpose || activeRoom.objective}</p>
          <p
            className="text-xs uppercase tracking-wider text-[color:var(--cbai-text-secondary)]"
            data-cbai-room-mic={voice.micLive ? "live" : "idle"}
          >
            {roomTypeLabel(lcr, activeRoom.roomType)} · {activeRoom.attendanceMode} ·{" "}
            {activeRoom.access.accessMode} · {activeRoom.schedule.timezone} ·{" "}
            {activeRoom.lifecycle === "live"
              ? copy.lifecycleLive
              : activeRoom.lifecycle === "ended"
                ? copy.lifecycleEnded
                : copy.lifecycleReady}
            {goLivePending ? ` · ${t("operationalObject.roomConnecting")}` : ""}
            {voice.micLive ? ` · ${copy.micLiveLabel}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeRoom.lifecycle !== "live" && activeRoom.lifecycle !== "ended" ? (
            <button
              type="button"
              onClick={() => void goLive()}
              disabled={goLivePending || (!consentChecked && !activeRoom.consent.acknowledgedAt)}
              className={`${cbaiBtnPrimary} min-h-11 disabled:opacity-40 ${cbaiFocusRing}`}
              data-cbai-room-go-live=""
            >
              {copy.startLive}
            </button>
          ) : null}
          {activeRoom.lifecycle === "live" ? (
            <button
              type="button"
              onClick={endLive}
              className={`min-h-11 rounded-xl border border-rose-400/60 px-4 py-2 text-sm font-semibold text-rose-300 ${cbaiFocusRing}`}
            >
              {copy.endSession}
            </button>
          ) : null}
        </div>
      </header>

      <p className={`rounded-xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] px-4 py-3 text-sm ${cbaiTextMuted}`}>
        {lcr.multipartyHonest} {lcr.leaveReleasesDevices}
      </p>

      {!activeRoom.consent.acknowledgedAt ? (
        <section className="space-y-3 rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] p-4">
          <h2 className="text-sm font-semibold text-[color:var(--cbai-text-primary)]">{copy.consentTitle}</h2>
          <label className="flex min-h-11 items-start gap-2 text-sm text-[color:var(--cbai-text-secondary)]">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-1"
            />
            {copy.consentAcknowledge}
          </label>
          {!consentChecked ? <p className="text-xs text-amber-200">{copy.consentRequired}</p> : null}
        </section>
      ) : null}

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        <nav
          aria-label={lcr.navAgenda}
          className="rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] p-3"
          data-cbai-session-navigator=""
        >
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setNav(item.id)}
                  className={`flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm ${cbaiFocusRing} ${
                    nav === item.id
                      ? "bg-[color:var(--cbai-surface-glass)] text-[color:var(--cbai-accent-primary)]"
                      : "text-[color:var(--cbai-text-secondary)]"
                  }`}
                  aria-current={nav === item.id ? "page" : undefined}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main
          className="space-y-4 rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] p-4"
          data-cbai-live-stage=""
          aria-label={lcr.stageTitle}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">
            {lcr.stageTitle}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-dashed border-[color:var(--cbai-border-subtle)] p-4 text-sm text-[color:var(--cbai-text-secondary)]">
              {lcr.stagePlaceholderVideo}
            </div>
            <div className="rounded-xl border border-dashed border-[color:var(--cbai-border-subtle)] p-4 text-sm text-[color:var(--cbai-text-secondary)]">
              {lcr.stagePlaceholderScreen}
            </div>
            <div className="rounded-xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">
                {lcr.stagePresenter}
              </p>
              <p className="mt-2 text-[color:var(--cbai-text-primary)]">{speaker?.displayName ?? "—"}</p>
            </div>
          </div>

          {nav === "discussion" || nav === "translation" ? (
            <section aria-labelledby="transcript-heading" className="space-y-3">
              <h3 id="transcript-heading" className="text-sm font-semibold text-[color:var(--cbai-text-primary)]">
                {copy.transcript}
              </h3>
              <div className="space-y-3" aria-live="polite">
                {activeRoom.transcript.length === 0 ? (
                  <p className={`text-sm ${cbaiTextMuted}`}>{copy.utterancePlaceholder}</p>
                ) : (
                  activeRoom.transcript.map((turn) => {
                    const translated = turn.translatedVariants[listenerLocale];
                    return (
                      <article
                        key={turn.id}
                        className="rounded-xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] p-3"
                      >
                        <p className={`text-xs ${cbaiTextMuted}`}>
                          {copy.originalLabel} · {turn.originalLocale} · {turn.translationStatus}
                        </p>
                        <p className="mt-1 text-[color:var(--cbai-text-primary)]">{turn.originalText}</p>
                        {translated && translated !== turn.originalText ? (
                          <p className="mt-2 text-sm text-[color:var(--cbai-accent-primary)]">
                            {copy.translatedLabel} ({listenerLocale}): {translated}
                          </p>
                        ) : null}
                        {turn.translationUncertainty ? (
                          <p className="mt-2 text-sm text-amber-200">
                            {copy.uncertaintyLabel}: {turn.translationUncertainty}
                          </p>
                        ) : null}
                      </article>
                    );
                  })
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm text-[color:var(--cbai-text-primary)]"
                  value={utterance}
                  onChange={(e) => setUtterance(e.target.value)}
                  placeholder={copy.utterancePlaceholder}
                  aria-label={copy.addUtterance}
                />
                <button
                  type="button"
                  onClick={() => {
                    appendHostUtterance(activeRoom.roomId, utterance);
                    setUtterance("");
                    reload();
                  }}
                  className={`${cbaiBtnSecondarySm} min-h-11 ${cbaiFocusRing}`}
                >
                  {copy.addUtterance}
                </button>
              </div>
            </section>
          ) : null}

          {nav === "agenda" ? (
            <section className="space-y-2">
              {activeRoom.agenda.length === 0 ? (
                <p className={`text-sm ${cbaiTextMuted}`}>{copy.emptyAgenda}</p>
              ) : (
                <ul className="space-y-1">
                  {activeRoom.agenda.map((item) => (
                    <li key={item.id} className="flex min-h-11 items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => {
                          toggleAgendaItem(activeRoom.roomId, item.id);
                          reload();
                        }}
                        aria-label={item.title}
                      />
                      <span className={item.done ? "line-through opacity-70" : ""}>{item.title}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <input
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                  value={agendaTitle}
                  onChange={(e) => setAgendaTitle(e.target.value)}
                  placeholder={copy.addAgenda}
                />
                <button
                  type="button"
                  className={`text-sm text-[color:var(--cbai-accent-primary)] ${cbaiFocusRing}`}
                  onClick={() => {
                    addAgendaItem(activeRoom.roomId, agendaTitle);
                    setAgendaTitle("");
                    reload();
                  }}
                >
                  {copy.addAgenda}
                </button>
              </div>
            </section>
          ) : null}

          {nav === "participants" ? (
            <section className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  const readLocale = language === "uz" ? "en" : "uz";
                  addSimulatedParticipant(activeRoom.roomId, {
                    displayName: readLocale === "en" ? "EN listener (simulated)" : "UZ tinglovchi (simulyatsiya)",
                    speakLocale: readLocale,
                    readLocale,
                    hearLocale: readLocale,
                  });
                  reload();
                }}
                className={`${cbaiBtnSecondarySm} min-h-11 ${cbaiFocusRing}`}
              >
                {copy.addSimListener}
              </button>
              <ul className="space-y-2">
                {activeRoom.participants.map((p) => {
                  const pub = participantPublicView(p);
                  return (
                    <li key={p.id} className="text-sm text-[color:var(--cbai-text-secondary)]">
                      <span className="font-medium text-[color:var(--cbai-text-primary)]">{pub.displayName}</span>
                      {" · "}
                      {pub.role}
                      {" · "}
                      {pub.identityProvenance === "ai_simulated"
                        ? lcr.identitySimulated
                        : pub.identityProvenance === "invited_guest"
                          ? lcr.identityGuest
                          : lcr.identityUnverified}
                      {" · "}
                      speak {p.speakLocale} / read {p.readLocale}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {nav === "evidence" || nav === "presentations" ? (
            <section className="space-y-3" data-cbai-evidence-stage="">
              <p className={`text-sm ${cbaiTextMuted}`}>{lcr.stageEvidence}</p>
              {activeRoom.evidenceRefs.length === 0 ? (
                <p className={`text-sm ${cbaiTextMuted}`}>{copy.emptyEvidence}</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {activeRoom.evidenceRefs.map((ref) => (
                    <li key={ref.id}>{ref.label}</li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <input
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                  value={evidenceLabel}
                  onChange={(e) => setEvidenceLabel(e.target.value)}
                  placeholder={copy.addEvidence}
                />
                <button
                  type="button"
                  className={`text-sm text-[color:var(--cbai-accent-primary)] ${cbaiFocusRing}`}
                  onClick={() => {
                    addEvidenceRef(activeRoom.roomId, { label: evidenceLabel });
                    setEvidenceLabel("");
                    reload();
                  }}
                >
                  {copy.addEvidence}
                </button>
              </div>
              {activeRoom.presentationMaterials.length > 0 ? (
                <ul className="space-y-2">
                  {activeRoom.presentationMaterials.map((m) => (
                    <li
                      key={m.id}
                      className="rounded-lg border border-[color:var(--cbai-border-subtle)] p-3 text-sm"
                      data-cbai-material-provenance=""
                    >
                      <p className="font-medium text-[color:var(--cbai-text-primary)]">{m.originalTitle}</p>
                      <p className={cbaiTextMuted}>
                        {m.fileOrSource} · {m.verificationStatus} · {m.confidentiality} · v{m.version}
                      </p>
                      {m.cbaiAnalysisSeparate ? (
                        <p className="mt-1 text-xs text-[color:var(--cbai-accent-primary)]">CBAI analysis separate</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          {nav === "questions" ? (
            <section className="space-y-2">
              <ul className="space-y-1 text-sm">
                {openQuestions.map((q) => (
                  <li key={q.id}>{q.text}</li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder={copy.addQuestion}
                />
                <button
                  type="button"
                  className={`text-sm text-[color:var(--cbai-accent-primary)] ${cbaiFocusRing}`}
                  onClick={() => {
                    addQuestion(activeRoom.roomId, questionText, language);
                    setQuestionText("");
                    reload();
                  }}
                >
                  {copy.addQuestion}
                </button>
              </div>
            </section>
          ) : null}

          {nav === "decisions" || nav === "actions" ? (
            <section className="space-y-3">
              <ul className="space-y-2">
                {activeRoom.decisions.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <span>{d.text}</span>
                    {d.confirmed ? (
                      <span className="text-teal-300">{copy.decisionConfirmed}</span>
                    ) : (
                      <button
                        type="button"
                        className={`text-[color:var(--cbai-accent-primary)] ${cbaiFocusRing}`}
                        onClick={() => {
                          confirmDecision(activeRoom.roomId, d.id);
                          reload();
                        }}
                      >
                        {copy.confirmDecision}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                  value={decisionText}
                  onChange={(e) => setDecisionText(e.target.value)}
                  placeholder={copy.addDecision}
                />
                <button
                  type="button"
                  className={`text-sm text-[color:var(--cbai-accent-primary)] ${cbaiFocusRing}`}
                  onClick={() => {
                    addDecision(activeRoom.roomId, decisionText);
                    setDecisionText("");
                    reload();
                  }}
                >
                  {copy.addDecision}
                </button>
              </div>
              <ul className={`space-y-1 text-sm ${cbaiTextMuted}`}>
                {activeRoom.actionItems.map((a) => (
                  <li key={a.id}>{a.text}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {nav === "files" ? (
            <section className="space-y-2 text-sm">
              <p className={cbaiTextMuted}>{lcr.devicePreflight}</p>
              <button type="button" className={`${cbaiBtnSecondarySm} min-h-11 ${cbaiFocusRing}`} onClick={() => void runMicPreflight()}>
                {lcr.controlMic}
              </button>
              {deviceNote ? <p role="status">{deviceNote}</p> : null}
              <ul className="space-y-1">
                {BROWSER_DEVICE_CAPABILITIES.map((c) => (
                  <li key={c.id} className={cbaiTextMuted}>
                    {c.id} · {c.stage}
                  </li>
                ))}
                {PROFESSIONAL_INTEGRATIONS.map((c) => (
                  <li key={c.id} className={cbaiTextMuted}>
                    {c.id} · {lcr.deviceUnavailable}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {(activeRoom.roomType === "laboratory" || activeRoom.roomType === "live_laboratory") &&
          nav === "discussion" ? (
            <section className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
              <p>{copy.labSafety}</p>
              <input
                className="min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2"
                placeholder={copy.labHypothesis}
                value={labHypothesis}
                onChange={(e) => setLabHypothesis(e.target.value)}
                onBlur={() => {
                  updateLaboratory(activeRoom.roomId, { hypothesis: labHypothesis });
                  reload();
                }}
              />
              <input
                className="min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2"
                placeholder={copy.labMethod}
                value={labMethod}
                onChange={(e) => setLabMethod(e.target.value)}
                onBlur={() => {
                  updateLaboratory(activeRoom.roomId, { method: labMethod });
                  reload();
                }}
              />
            </section>
          ) : null}

          {activeRoom.roomType === "practice" && nav === "discussion" ? (
            <section className="space-y-2 text-sm">
              <p className={cbaiTextMuted}>{copy.practiceAiLabel}</p>
              <input
                className="min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2"
                placeholder={copy.practiceScenario}
                value={practiceScenario}
                onChange={(e) => setPracticeScenario(e.target.value)}
                onBlur={() => {
                  updatePractice(activeRoom.roomId, { scenario: practiceScenario });
                  reload();
                }}
              />
            </section>
          ) : null}
        </main>

        <aside
          className="space-y-3 rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] p-4"
          data-cbai-intelligence-rail=""
          aria-label={lcr.railPurpose}
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">{lcr.railPurpose}</p>
            <p className="mt-1 text-sm text-[color:var(--cbai-text-primary)]">
              {activeRoom.purpose || activeRoom.objective || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">{lcr.railAgenda}</p>
            <p className="mt-1 text-sm">{currentAgenda?.title ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">{lcr.railSpeaker}</p>
            <p className="mt-1 text-sm">{speaker?.displayName ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">{lcr.railQuestions}</p>
            <p className="mt-1 text-sm">{openQuestions[0]?.text ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">{lcr.railApproval}</p>
            <p className="mt-1 text-sm">
              {activeRoom.participants.find((p) => p.role === "human_approver")?.displayName ??
                activeRoom.humanApprovalState}
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">
              {copy.glossary}
            </p>
            <ul className={`mb-2 space-y-1 text-sm ${cbaiTextMuted}`}>
              {activeRoom.glossary.map((g) => (
                <li key={g.id}>
                  {g.term}
                  {g.doNotTranslate ? ` · ${copy.glossaryDoNotTranslate}` : ""}
                </li>
              ))}
            </ul>
            <input
              className="min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
              value={glossaryTerm}
              onChange={(e) => setGlossaryTerm(e.target.value)}
              placeholder={copy.glossaryTerm}
            />
            <label className="mt-2 flex min-h-11 items-center gap-2 text-xs text-[color:var(--cbai-text-secondary)]">
              <input type="checkbox" checked={doNotTranslate} onChange={(e) => setDoNotTranslate(e.target.checked)} />
              {copy.glossaryDoNotTranslate}
            </label>
            <button
              type="button"
              className={`mt-2 text-sm text-[color:var(--cbai-accent-primary)] ${cbaiFocusRing}`}
              onClick={() => {
                if (!glossaryTerm.trim()) return;
                upsertGlossaryTerm(activeRoom.roomId, {
                  term: glossaryTerm.trim(),
                  preferredTranslations: {},
                  doNotTranslate,
                  definition: doNotTranslate
                    ? "Preserve original technical term until human approval."
                    : undefined,
                });
                setGlossaryTerm("");
                reload();
              }}
            >
              {copy.glossaryAdd}
            </button>
          </div>

          {activeRoom.lifecycle === "ended" || proposals.length > 0 ? (
            <section className="space-y-2 border-t border-[color:var(--cbai-border-subtle)] pt-3">
              <h3 className="text-sm font-semibold text-[color:var(--cbai-text-primary)]">{copy.proposalsTitle}</h3>
              <p className={`text-xs ${cbaiTextMuted}`}>{copy.proposalsHint}</p>
              <ul className="space-y-2">
                {proposals.slice(0, 6).map((proposal) => (
                  <li key={`${proposal.catalogKey}-${proposal.draft.title}`}>
                    <p className="text-sm text-[color:var(--cbai-text-primary)]">{proposal.draft.title}</p>
                    <button
                      type="button"
                      className={`text-sm text-[color:var(--cbai-accent-primary)] ${cbaiFocusRing}`}
                      onClick={() => openComposer(proposal.draft, ["title", "summary"], "manual")}
                    >
                      {copy.proposeOpen}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)]/95 px-3 py-2 backdrop-blur"
        data-cbai-room-controls=""
        role="toolbar"
        aria-label="Room controls"
      >
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-2 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`min-h-11 min-w-11 rounded-lg border border-[color:var(--cbai-border-subtle)] px-3 text-sm ${cbaiFocusRing}`}
              aria-label={lcr.controlMic}
              onClick={() => void (voice.micLive ? voice.stopListening() : voice.startListening())}
            >
              {lcr.controlMic}
            </button>
            <button
              type="button"
              className={`min-h-11 min-w-11 rounded-lg border border-[color:var(--cbai-border-subtle)] px-3 text-sm opacity-70 ${cbaiFocusRing}`}
              aria-label={lcr.controlCamera}
              title={lcr.deviceUnavailable}
            >
              {lcr.controlCamera}
            </button>
            <button
              type="button"
              className={`min-h-11 min-w-11 rounded-lg border border-[color:var(--cbai-border-subtle)] px-3 text-sm opacity-70 ${cbaiFocusRing}`}
              aria-label={lcr.controlShare}
              title={lcr.stagePlaceholderScreen}
            >
              {lcr.controlShare}
            </button>
            <button
              type="button"
              className={`min-h-11 min-w-11 rounded-lg border px-3 text-sm ${cbaiFocusRing} ${
                handRaised ? "border-teal-400 text-teal-300" : "border-[color:var(--cbai-border-subtle)]"
              }`}
              aria-pressed={handRaised}
              aria-label={lcr.controlHand}
              onClick={() => setHandRaised((v) => !v)}
            >
              {lcr.controlHand}
            </button>
            <button
              type="button"
              className={`min-h-11 min-w-11 rounded-lg border border-[color:var(--cbai-border-subtle)] px-3 text-sm ${cbaiFocusRing}`}
              aria-label={lcr.controlTranslation}
              onClick={() => setNav("translation")}
            >
              {lcr.controlTranslation}
            </button>
            <button
              type="button"
              className={`min-h-11 min-w-11 rounded-lg border border-[color:var(--cbai-border-subtle)] px-3 text-sm ${cbaiFocusRing}`}
              aria-label={lcr.controlMore}
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
            >
              {lcr.controlMore}
            </button>
          </div>
          <button
            type="button"
            className={`min-h-11 rounded-lg border border-rose-400/50 px-4 text-sm text-rose-200 ${cbaiFocusRing}`}
            aria-label={lcr.controlLeave}
            onClick={leaveRoom}
            data-cbai-leave-room=""
          >
            {lcr.controlLeave}
          </button>
        </div>
        {moreOpen ? (
          <p className={`mx-auto mt-2 max-w-[1600px] text-xs ${cbaiTextMuted}`} role="status">
            {lcr.humanDecides} · {activeRoom.recordingState} · {activeRoom.transcriptState}
          </p>
        ) : null}
      </div>
    </div>
  );
}
