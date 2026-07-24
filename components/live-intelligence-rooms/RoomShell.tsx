"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
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
  setRoomLifecycle,
  subscribeLiveRooms,
  toggleAgendaItem,
  updateLaboratory,
  updatePractice,
  upsertGlossaryTerm,
} from "@/lib/live-intelligence-rooms";

export default function RoomShell() {
  const search = useSearchParams();
  const searchId = search.get("id") ?? "";
  const windowId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("id") ?? ""
      : "";
  const roomId = searchId || windowId;
  const { language, t } = useTranslation();
  const copy = getDictionary(language).liveRooms;
  const { openComposer } = useOperationalObjects();
  const voice = useVoiceOperator();
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
  const [labObservation, setLabObservation] = useState("");
  const [practiceScenario, setPracticeScenario] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState("");

  const room = useSyncExternalStore(
    subscribeLiveRooms,
    () => (roomId ? getLiveRoomSnapshot(roomId) : null),
    () => null,
  );

  function reload() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cbai-live-rooms-changed"));
    }
  }

  const proposals = useMemo(
    () => (room ? proposeOperationalObjectsFromRoom(room) : []),
    [room],
  );

  if (!roomId || !room) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <h1 className="text-2xl font-semibold text-[color:var(--cbai-text-primary)]">{copy.missingRoom}</h1>
        <p className="text-sm text-[color:var(--cbai-text-secondary)]">{copy.missingRoomHint}</p>
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

  function goLive() {
    if (!consentChecked && !activeRoom.consent.acknowledgedAt) return;
    if (!activeRoom.consent.acknowledgedAt) acknowledgeRoomConsent(activeRoom.roomId);
    setRoomLifecycle(activeRoom.roomId, "live");
    reload();
  }

  function endLive() {
    setRoomLifecycle(activeRoom.roomId, "ended");
    voice.stopListening();
    reload();
  }

  function submitUtterance() {
    appendHostUtterance(activeRoom.roomId, utterance);
    setUtterance("");
    reload();
  }

  function addListener() {
    const readLocale = language === "uz" ? "en" : "uz";
    addSimulatedParticipant(activeRoom.roomId, {
      displayName: readLocale === "en" ? "EN listener (simulated)" : "UZ tinglovchi (simulyatsiya)",
      speakLocale: readLocale,
      readLocale,
      hearLocale: readLocale,
    });
    reload();
  }

  function addGlossary() {
    if (!glossaryTerm.trim()) return;
    upsertGlossaryTerm(activeRoom.roomId, {
      term: glossaryTerm.trim(),
      preferredTranslations: {},
      doNotTranslate,
      definition: doNotTranslate ? "Preserve original technical term until human approval." : undefined,
    });
    setGlossaryTerm("");
    reload();
  }

  const openQuestions = activeRoom.questions.filter((q) => !q.resolved);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link href="/rooms" className="text-sm text-[color:var(--cbai-accent-primary)]">
            ← {copy.backToList}
          </Link>
          <h1 className="text-2xl font-semibold text-[color:var(--cbai-text-primary)] sm:text-3xl">{activeRoom.title}</h1>
          <p className="text-sm text-[color:var(--cbai-text-secondary)]">{activeRoom.objective}</p>
          <p className="text-xs uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">
            {activeRoom.roomType} · {activeRoom.lifecycle === "live" ? copy.lifecycleLive : activeRoom.lifecycle === "ended" ? copy.lifecycleEnded : copy.lifecycleReady}
            {voice.micLive ? ` · ${copy.micLiveLabel}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeRoom.lifecycle !== "live" && activeRoom.lifecycle !== "ended" ? (
            <button
              type="button"
              onClick={goLive}
              disabled={!consentChecked && !activeRoom.consent.acknowledgedAt}
              className="rounded-xl bg-[color:var(--cbai-accent-primary)] px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
            >
              {copy.startLive}
            </button>
          ) : null}
          {activeRoom.lifecycle === "live" ? (
            <button
              type="button"
              onClick={endLive}
              className="rounded-xl border border-rose-400/60 px-4 py-2 text-sm font-semibold text-rose-300"
            >
              {copy.endSession}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => (voice.micLive ? voice.stopListening() : voice.openDock())}
            className="rounded-xl border border-[color:var(--cbai-border-subtle)] px-4 py-2 text-sm text-[color:var(--cbai-text-primary)]"
          >
            {voice.micLive ? t("voiceOperator.stopLiveListening") : t("voiceOperator.openDock")}
          </button>
        </div>
      </div>

      <p className="rounded-xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] px-4 py-3 text-sm text-[color:var(--cbai-text-secondary)]">
        {copy.multipartyNotice}. {copy.voiceHint}
      </p>

      {activeRoom.roomType === "laboratory" ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{copy.labSafety}</p>
      ) : null}
      {activeRoom.roomType === "practice" ? (
        <p className="rounded-xl border border-[color:var(--cbai-border-subtle)] px-4 py-3 text-sm text-[color:var(--cbai-text-secondary)]">
          {copy.practiceAiLabel}
        </p>
      ) : null}

      {!activeRoom.consent.acknowledgedAt ? (
        <section className="space-y-3 rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] p-4">
          <h2 className="text-sm font-semibold text-[color:var(--cbai-text-primary)]">{copy.consentTitle}</h2>
          <label className="flex items-start gap-2 text-sm text-[color:var(--cbai-text-secondary)]">
            <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} className="mt-1" />
            {copy.consentAcknowledge}
          </label>
          {!consentChecked ? <p className="text-xs text-amber-200">{copy.consentRequired}</p> : null}
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <section className="space-y-4 rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">
            {copy.transcript}
          </h2>
          <div className="space-y-3" aria-live="polite">
            {activeRoom.transcript.length === 0 ? (
              <p className="text-sm text-[color:var(--cbai-text-secondary)]">{copy.utterancePlaceholder}</p>
            ) : (
              activeRoom.transcript.map((turn) => {
                const translated = turn.translatedVariants[listenerLocale];
                return (
                  <article
                    key={turn.id}
                    className="rounded-xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] p-3"
                  >
                    <p className="text-xs text-[color:var(--cbai-text-secondary)]">
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
              className="min-w-0 flex-1 rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm text-[color:var(--cbai-text-primary)]"
              value={utterance}
              onChange={(e) => setUtterance(e.target.value)}
              placeholder={copy.utterancePlaceholder}
              aria-label={copy.addUtterance}
            />
            <button
              type="button"
              onClick={submitUtterance}
              className="rounded-lg border border-[color:var(--cbai-accent-primary)] px-3 py-2 text-sm text-[color:var(--cbai-accent-primary)]"
            >
              {copy.addUtterance}
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-[color:var(--cbai-text-primary)]">{copy.participants}</h2>
              <button type="button" onClick={addListener} className="text-xs text-[color:var(--cbai-accent-primary)]">
                {copy.addSimListener}
              </button>
            </div>
            <ul className="space-y-2">
              {activeRoom.participants.map((p) => (
                <li key={p.id} className="text-sm text-[color:var(--cbai-text-secondary)]">
                  <span className="font-medium text-[color:var(--cbai-text-primary)]">{p.displayName}</span>
                  {" · "}
                  {p.kind === "ai_simulated" ? "AI" : p.role}
                  {" · "}
                  speak {p.speakLocale} / read {p.readLocale}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] p-4">
            <h2 className="mb-3 text-sm font-semibold text-[color:var(--cbai-text-primary)]">{copy.glossary}</h2>
            <ul className="mb-3 space-y-1 text-sm text-[color:var(--cbai-text-secondary)]">
              {activeRoom.glossary.map((g) => (
                <li key={g.id}>
                  {g.term}
                  {g.doNotTranslate ? ` · ${copy.glossaryDoNotTranslate}` : ""}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2">
              <input
                className="rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                value={glossaryTerm}
                onChange={(e) => setGlossaryTerm(e.target.value)}
                placeholder={copy.glossaryTerm}
              />
              <label className="flex items-center gap-2 text-xs text-[color:var(--cbai-text-secondary)]">
                <input type="checkbox" checked={doNotTranslate} onChange={(e) => setDoNotTranslate(e.target.checked)} />
                {copy.glossaryDoNotTranslate}
              </label>
              <button type="button" onClick={addGlossary} className="text-sm text-[color:var(--cbai-accent-primary)]">
                {copy.glossaryAdd}
              </button>
            </div>
          </section>

          {activeRoom.lifecycle === "ended" || proposals.length > 0 ? (
            <section className="rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] p-4">
              <h2 className="text-sm font-semibold text-[color:var(--cbai-text-primary)]">{copy.proposalsTitle}</h2>
              <p className="mt-1 text-xs text-[color:var(--cbai-text-secondary)]">{copy.proposalsHint}</p>
              <ul className="mt-3 space-y-3">
                {proposals.map((proposal) => (
                  <li key={`${proposal.draft.type}-${proposal.draft.title}`} className="space-y-2">
                    <p className="text-sm text-[color:var(--cbai-text-primary)]">{proposal.draft.title}</p>
                    <p className="text-xs text-[color:var(--cbai-text-secondary)]">{proposal.reason}</p>
                    <button
                      type="button"
                      className="text-sm text-[color:var(--cbai-accent-primary)]"
                      onClick={() => {
                        openComposer(proposal.draft, ["title", "summary"], "manual");
                      }}
                    >
                      {copy.proposeOpen}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {activeRoom.lifecycle === "ended" ? (
            <section className="rounded-2xl border border-[color:var(--cbai-border-subtle)] p-4">
              <h2 className="text-sm font-semibold text-[color:var(--cbai-text-primary)]">{copy.postSummary}</h2>
              <p className="mt-2 text-sm text-[color:var(--cbai-text-secondary)]">
                {activeRoom.transcript.length} turns · {activeRoom.glossary.length} glossary · {activeRoom.participants.length} participants
              </p>
            </section>
          ) : null}
        </aside>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <details className="rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] p-4" open>
          <summary className="cursor-pointer text-sm font-semibold text-[color:var(--cbai-text-primary)]">
            {copy.agenda}
          </summary>
          <div className="mt-3 space-y-2">
            {activeRoom.agenda.length === 0 ? (
              <p className="text-sm text-[color:var(--cbai-text-secondary)]">{copy.emptyAgenda}</p>
            ) : (
              <ul className="space-y-1">
                {activeRoom.agenda.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => {
                        toggleAgendaItem(activeRoom.roomId, item.id);
                        reload();
                      }}
                      aria-label={item.title}
                    />
                    <span
                      className={
                        item.done
                          ? "text-[color:var(--cbai-text-secondary)] line-through"
                          : "text-[color:var(--cbai-text-primary)]"
                      }
                    >
                      {item.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                value={agendaTitle}
                onChange={(e) => setAgendaTitle(e.target.value)}
                placeholder={copy.addAgenda}
              />
              <button
                type="button"
                className="text-sm text-[color:var(--cbai-accent-primary)]"
                onClick={() => {
                  addAgendaItem(activeRoom.roomId, agendaTitle);
                  setAgendaTitle("");
                  reload();
                }}
              >
                {copy.addAgenda}
              </button>
            </div>
          </div>
        </details>

        <details className="rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[color:var(--cbai-text-primary)]">
            {copy.evidence}
          </summary>
          <div className="mt-3 space-y-2">
            {activeRoom.evidenceRefs.length === 0 ? (
              <p className="text-sm text-[color:var(--cbai-text-secondary)]">{copy.emptyEvidence}</p>
            ) : (
              <ul className="space-y-1 text-sm text-[color:var(--cbai-text-primary)]">
                {activeRoom.evidenceRefs.map((ref) => (
                  <li key={ref.id}>
                    {ref.href ? (
                      <a href={ref.href} className="text-[color:var(--cbai-accent-primary)]">
                        {ref.label}
                      </a>
                    ) : (
                      ref.label
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                value={evidenceLabel}
                onChange={(e) => setEvidenceLabel(e.target.value)}
                placeholder={copy.addEvidence}
              />
              <button
                type="button"
                className="text-sm text-[color:var(--cbai-accent-primary)]"
                onClick={() => {
                  addEvidenceRef(activeRoom.roomId, { label: evidenceLabel });
                  setEvidenceLabel("");
                  reload();
                }}
              >
                {copy.addEvidence}
              </button>
            </div>
          </div>
        </details>

        <details className="rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[color:var(--cbai-text-primary)]">
            {copy.clarificationQueue}
          </summary>
          <div className="mt-3 space-y-2">
            {openQuestions.length === 0 ? (
              <p className="text-sm text-[color:var(--cbai-text-secondary)]">{copy.questions}</p>
            ) : (
              <ul className="space-y-1 text-sm text-[color:var(--cbai-text-primary)]">
                {openQuestions.map((q) => (
                  <li key={q.id}>
                    {q.text}{" "}
                    <span className="text-xs text-[color:var(--cbai-text-secondary)]">({q.locale})</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder={copy.addQuestion}
              />
              <button
                type="button"
                className="text-sm text-[color:var(--cbai-accent-primary)]"
                onClick={() => {
                  addQuestion(activeRoom.roomId, questionText, language);
                  setQuestionText("");
                  reload();
                }}
              >
                {copy.addQuestion}
              </button>
            </div>
          </div>
        </details>

        <details className="rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[color:var(--cbai-text-primary)]">
            {copy.decisions}
          </summary>
          <div className="mt-3 space-y-2">
            <ul className="space-y-2">
              {activeRoom.decisions.map((d) => (
                <li
                  key={d.id}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    !d.confirmed && d.requiresHumanConfirmation
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
                      : "border-[color:var(--cbai-border-subtle)] text-[color:var(--cbai-text-primary)]"
                  }`}
                >
                  {d.text}
                  {!d.confirmed && d.requiresHumanConfirmation ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <p className="text-xs font-medium">{copy.decisionNeedsConfirm}</p>
                      <button
                        type="button"
                        className="rounded-lg border border-amber-400/50 px-2 py-1 text-xs font-semibold text-amber-100"
                        onClick={() => {
                          confirmDecision(activeRoom.roomId, d.id);
                          reload();
                        }}
                      >
                        {copy.confirmDecision}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-[color:var(--cbai-accent-primary)]">{copy.decisionConfirmed}</p>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                value={decisionText}
                onChange={(e) => setDecisionText(e.target.value)}
                placeholder={copy.addDecision}
              />
              <button
                type="button"
                className="text-sm text-[color:var(--cbai-accent-primary)]"
                onClick={() => {
                  addDecision(activeRoom.roomId, decisionText);
                  setDecisionText("");
                  reload();
                }}
              >
                {copy.addDecision}
              </button>
            </div>
          </div>
        </details>

        {activeRoom.roomType === "laboratory" && activeRoom.laboratory ? (
          <details
            className="rounded-2xl border border-amber-500/30 bg-[color:var(--cbai-surface-solid)] p-4 lg:col-span-2"
            open
          >
            <summary className="cursor-pointer text-sm font-semibold text-[color:var(--cbai-text-primary)]">
              {copy.typeLab}
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-[color:var(--cbai-text-secondary)]">{copy.labHypothesis}</span>
                <textarea
                  className="min-h-[64px] w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                  value={labHypothesis || activeRoom.laboratory.hypothesis || ""}
                  onChange={(e) => setLabHypothesis(e.target.value)}
                  onBlur={() => {
                    updateLaboratory(activeRoom.roomId, {
                      hypothesis: (labHypothesis || activeRoom.laboratory?.hypothesis || "").trim() || null,
                    });
                    reload();
                  }}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[color:var(--cbai-text-secondary)]">{copy.labMethod}</span>
                <textarea
                  className="min-h-[64px] w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                  value={labMethod || activeRoom.laboratory.method || ""}
                  onChange={(e) => setLabMethod(e.target.value)}
                  onBlur={() => {
                    updateLaboratory(activeRoom.roomId, {
                      method: (labMethod || activeRoom.laboratory?.method || "").trim() || null,
                    });
                    reload();
                  }}
                />
              </label>
              <div className="space-y-2 sm:col-span-2">
                <p className="text-sm text-[color:var(--cbai-text-secondary)]">{copy.labObservations}</p>
                <ul className="space-y-1 text-sm text-[color:var(--cbai-text-primary)]">
                  {(activeRoom.laboratory.observations ?? []).map((obs, i) => (
                    <li key={`${obs}-${i}`}>{obs}</li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input
                    className="min-w-0 flex-1 rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                    value={labObservation}
                    onChange={(e) => setLabObservation(e.target.value)}
                    placeholder={copy.labObservations}
                  />
                  <button
                    type="button"
                    className="text-sm text-[color:var(--cbai-accent-primary)]"
                    onClick={() => {
                      const next = labObservation.trim();
                      if (!next) return;
                      updateLaboratory(activeRoom.roomId, {
                        observations: [...(activeRoom.laboratory?.observations ?? []), next],
                      });
                      setLabObservation("");
                      reload();
                    }}
                  >
                    {copy.addAgenda}
                  </button>
                </div>
              </div>
            </div>
          </details>
        ) : null}

        {activeRoom.roomType === "practice" && activeRoom.practice ? (
          <details
            className="rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] p-4 lg:col-span-2"
            open
          >
            <summary className="cursor-pointer text-sm font-semibold text-[color:var(--cbai-text-primary)]">
              {copy.typePractice}
            </summary>
            <p className="mt-2 text-xs text-[color:var(--cbai-text-secondary)]">{copy.practiceAiLabel}</p>
            <div className="mt-3 space-y-3">
              <label className="block space-y-1 text-sm">
                <span className="text-[color:var(--cbai-text-secondary)]">{copy.practiceScenario}</span>
                <textarea
                  className="min-h-[72px] w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                  value={practiceScenario || activeRoom.practice.scenario || ""}
                  onChange={(e) => setPracticeScenario(e.target.value)}
                  onBlur={() => {
                    updatePractice(activeRoom.roomId, {
                      scenario: (practiceScenario || activeRoom.practice?.scenario || "").trim() || null,
                    });
                    reload();
                  }}
                />
              </label>
              <div className="space-y-2">
                <p className="text-sm text-[color:var(--cbai-text-secondary)]">{copy.practiceFeedback}</p>
                <ul className="space-y-1 text-sm text-[color:var(--cbai-text-primary)]">
                  {(activeRoom.practice.feedbackNotes ?? []).map((note, i) => (
                    <li key={`${note}-${i}`}>{note}</li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input
                    className="min-w-0 flex-1 rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-sm"
                    value={practiceFeedback}
                    onChange={(e) => setPracticeFeedback(e.target.value)}
                    placeholder={copy.practiceFeedback}
                  />
                  <button
                    type="button"
                    className="text-sm text-[color:var(--cbai-accent-primary)]"
                    onClick={() => {
                      const next = practiceFeedback.trim();
                      if (!next) return;
                      updatePractice(activeRoom.roomId, {
                        feedbackNotes: [...(activeRoom.practice?.feedbackNotes ?? []), next],
                      });
                      setPracticeFeedback("");
                      reload();
                    }}
                  >
                    {copy.addAgenda}
                  </button>
                </div>
              </div>
            </div>
          </details>
        ) : null}

        <details
          className="rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] p-4 lg:col-span-2"
          open={activeRoom.roomType === "collaboration"}
        >
          <summary className="cursor-pointer text-sm font-semibold text-[color:var(--cbai-text-primary)]">
            {copy.linkedEntities}
          </summary>
          <div className="mt-3 space-y-3">
            {activeRoom.relatedEntities.length === 0 ? (
              <p className="text-sm text-[color:var(--cbai-text-secondary)]">{copy.noLinkedEntities}</p>
            ) : (
              <ul className="flex flex-wrap gap-2 text-sm">
                {activeRoom.relatedEntities.map((e) => (
                  <li
                    key={`${e.kind}-${e.id}`}
                    className="rounded-full border border-[color:var(--cbai-border-subtle)] px-3 py-1 text-[color:var(--cbai-text-primary)]"
                  >
                    {e.kind}: {e.name}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/graph" className="text-[color:var(--cbai-accent-primary)]">
                /graph
              </Link>
              <Link href="/my-work" className="text-[color:var(--cbai-accent-primary)]">
                /my-work
              </Link>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
