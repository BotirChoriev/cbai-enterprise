"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ROOM_TYPES,
  confirmCreateRoom,
  emptyRoomComposerDraft,
  getEmptySdnSnapshot,
  getSdnSnapshot,
  previewDebateToWork,
  consumeDebateToWorkIdempotency,
  refreshSynthesis,
  subscribeSdn,
  upsertEvidence,
  toReplicationPassport,
  type DeliberationEvidenceRecord,
  type RoomComposerDraft,
} from "@/lib/scientific-deliberation";
import { getSdnCopy } from "@/lib/i18n/platform-copy-scientific-deliberation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useOperationalObjectsOptional } from "@/components/operational-objects/OperationalObjectProvider";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondarySm,
  cbaiFocusRing,
  cbaiMineralPanel,
  cbaiSectionEyebrow,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

export default function ScientificDeliberationHome() {
  const { language } = useTranslation();
  const copy = getSdnCopy(language);
  const router = useRouter();
  const searchParams = useSearchParams();
  const operationalObjects = useOperationalObjectsOptional();
  const bundles = useSyncExternalStore(subscribeSdn, getSdnSnapshot, getEmptySdnSnapshot);

  const roomId = searchParams.get("room");
  const selected = useMemo(
    () => bundles.find((b) => b.room.id === roomId) ?? bundles[0] ?? null,
    [bundles, roomId],
  );

  const [navOpen, setNavOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(searchParams.get("view") === "create");
  const [composerStep, setComposerStep] = useState(0);
  const [draft, setDraft] = useState<RoomComposerDraft>(() => emptyRoomComposerDraft(language));
  const [status, setStatus] = useState<string | null>(null);
  const [evidenceStance, setEvidenceStance] = useState<"support" | "challenge" | "context">("support");
  const [evidenceText, setEvidenceText] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [workPreview, setWorkPreview] = useState<string | null>(null);

  function selectRoom(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("room", id);
    params.delete("view");
    router.replace(`/evidence?${params.toString()}`, { scroll: false });
    setNavOpen(false);
  }

  function openCreate() {
    setComposerOpen(true);
    setComposerStep(0);
    setDraft(emptyRoomComposerDraft(language));
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "create");
    router.replace(`/evidence?${params.toString()}`, { scroll: false });
  }

  function confirmRoom() {
    const created = confirmCreateRoom(draft);
    if (!created) {
      setStatus(copy.confirmBeforeCreate);
      return;
    }
    setComposerOpen(false);
    setStatus(null);
    selectRoom(created.room.id);
  }

  function addEvidence() {
    if (!selected?.claims[0]) {
      setStatus(copy.emptyRoom);
      return;
    }
    if (!sourceText.trim()) {
      setStatus(copy.confirmBeforeCreate);
      return;
    }
    const now = new Date().toISOString();
    const evidence: DeliberationEvidenceRecord = {
      id: `sdn-ev-${now.replace(/[:.]/g, "-")}`,
      roomId: selected.room.id,
      claimId: selected.claims[0].id,
      stance: evidenceStance,
      evidenceType: "user_supplied",
      authors: [],
      institutions: [],
      methodology: null,
      sampleSize: null,
      measurementUnits: null,
      geographicalCoverage: null,
      temporalCoverage: null,
      statisticalUncertainty: null,
      limitations: null,
      conflictsOfInterest: null,
      replicationStatus: null,
      linkedCounterEvidenceIds: [],
      originalSourceText: sourceText.trim(),
      cbaiInterpretation: evidenceText.trim() || null,
      humanConfirmationStatus: "confirmed",
      provenance: "user_confirmed_local",
      contentLocale: language,
      createdLocale: language,
      sourceLanguage: language,
      freshnessStatus: "unknown",
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    upsertEvidence(selected.room.id, evidence, { confirmed: true });
    setSourceText("");
    setEvidenceText("");
    setStatus(null);
  }

  function runSynthesis() {
    if (!selected) return;
    refreshSynthesis(selected.room.id);
  }

  function previewWork() {
    if (!selected) return;
    const preview = previewDebateToWork(selected, "evidence_request", language);
    setWorkPreview(preview.idempotencyKey);
    if (operationalObjects) {
      operationalObjects.openComposer(preview.draft, preview.inferredFields, "manual");
    }
  }

  function confirmWorkOnce() {
    if (!selected || !workPreview) return;
    const preview = previewDebateToWork(selected, "evidence_request", language);
    const ok = consumeDebateToWorkIdempotency(preview.idempotencyKey, true);
    setStatus(ok ? copy.exactlyOnce : `${copy.exactlyOnce} (duplicate blocked)`);
  }

  const support = selected?.evidence.filter((e) => e.stance === "support") ?? [];
  const challenge = selected?.evidence.filter((e) => e.stance === "challenge") ?? [];
  const contextEv = selected?.evidence.filter((e) => e.stance === "context") ?? [];

  return (
    <div className="space-y-4 pb-24" data-cbai-sdn-network="" data-cbai-voice-dock-clearance="">
      <p className={`${cbaiTextMuted} text-sm`}>{copy.honestyBanner}</p>
      <p className="text-xs text-amber-800 dark:text-amber-200" data-cbai-infrastructure-required="">
        {copy.infrastructureRequired}
      </p>
      <p className={`text-xs ${cbaiTextMuted}`}>{copy.localOnly}</p>

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
            onClick={openCreate}
          >
            {copy.primaryAction}
          </button>
          <button
            type="button"
            className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} min-h-11`}
            onClick={() => {
              document.querySelector<HTMLElement>("[data-cbai-add-evidence]")?.scrollIntoView({ behavior: "smooth" });
            }}
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
                <Link href="/my-work" className={`${cbaiFocusRing} block min-h-11 px-2 py-2 text-sm`}>
                  My Work
                </Link>
                <Link href="/research" className={`${cbaiFocusRing} block min-h-11 px-2 py-2 text-sm`}>
                  Research
                </Link>
                <button type="button" className={`${cbaiFocusRing} block w-full min-h-11 px-2 py-2 text-left text-sm`} onClick={previewWork}>
                  {copy.debateToWork}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {status ? (
        <p className="text-sm text-teal-800 dark:text-teal-200" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}

      {composerOpen ? (
        <section className={`${cbaiMineralPanel} space-y-3`} data-cbai-room-composer="">
          <h3 className="text-sm font-semibold">
            {copy.startRoom} — {copy.composerStep} {composerStep + 1}/3
          </h3>
          {composerStep === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs">
                {copy.composerTitle}
                <input
                  data-cbai-composer-title=""
                  className={`${cbaiFocusRing} mt-1 w-full min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2`}
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </label>
              <label className="block text-xs">
                {copy.roomTypes}
                <select
                  className={`${cbaiFocusRing} mt-1 w-full min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2`}
                  value={draft.roomType}
                  onChange={(e) => setDraft({ ...draft, roomType: e.target.value as RoomComposerDraft["roomType"] })}
                >
                  {ROOM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs sm:col-span-2">
                {copy.composerQuestion}
                <textarea
                  data-cbai-composer-question=""
                  className={`${cbaiFocusRing} mt-1 w-full min-h-20 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2`}
                  value={draft.scientificQuestion}
                  onChange={(e) => setDraft({ ...draft, scientificQuestion: e.target.value })}
                />
              </label>
              <label className="block text-xs sm:col-span-2">
                {copy.composerClaim}
                <textarea
                  data-cbai-composer-claim=""
                  className={`${cbaiFocusRing} mt-1 w-full min-h-20 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2`}
                  value={draft.mainClaim}
                  onChange={(e) => setDraft({ ...draft, mainClaim: e.target.value })}
                />
              </label>
            </div>
          ) : null}
          {composerStep === 1 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs">
                {copy.composerProof}
                <input
                  className={`${cbaiFocusRing} mt-1 w-full min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2`}
                  value={draft.proofStandard}
                  onChange={(e) => setDraft({ ...draft, proofStandard: e.target.value })}
                />
              </label>
              <label className="block text-xs">
                {copy.composerScope}
                <input
                  className={`${cbaiFocusRing} mt-1 w-full min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2`}
                  value={draft.scope}
                  onChange={(e) => setDraft({ ...draft, scope: e.target.value })}
                />
              </label>
              <label className="block text-xs">
                {copy.translationConsent}
                <input
                  type="checkbox"
                  className={`${cbaiFocusRing} ml-2`}
                  checked={draft.translationConsent}
                  onChange={(e) => setDraft({ ...draft, translationConsent: e.target.checked })}
                />
              </label>
              <label className="block text-xs">
                {copy.transcriptConsent}
                <input
                  type="checkbox"
                  className={`${cbaiFocusRing} ml-2`}
                  checked={draft.transcriptConsent}
                  onChange={(e) => setDraft({ ...draft, transcriptConsent: e.target.checked })}
                />
              </label>
              <p className={`text-xs sm:col-span-2 ${cbaiTextMuted}`}>{copy.multilingualNote}</p>
            </div>
          ) : null}
          {composerStep === 2 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs sm:col-span-2">
                {copy.composerApprover}
                <input
                  data-cbai-composer-approver=""
                  className={`${cbaiFocusRing} mt-1 w-full min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2`}
                  value={draft.finalHumanApprover}
                  onChange={(e) => setDraft({ ...draft, finalHumanApprover: e.target.value })}
                />
              </label>
              <label className="block text-xs sm:col-span-2">
                {copy.composerConflicts}
                <input
                  className={`${cbaiFocusRing} mt-1 w-full min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2`}
                  value={draft.conflictDisclosures}
                  onChange={(e) => setDraft({ ...draft, conflictDisclosures: e.target.value })}
                />
              </label>
              <p className="text-xs text-teal-800 dark:text-teal-200 sm:col-span-2">{copy.confirmBeforeCreate}</p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {composerStep > 0 ? (
              <button type="button" className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} min-h-11`} onClick={() => setComposerStep((s) => s - 1)}>
                {copy.composerBack}
              </button>
            ) : null}
            {composerStep < 2 ? (
              <button type="button" className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-4`} onClick={() => setComposerStep((s) => s + 1)}>
                {copy.composerNext}
              </button>
            ) : (
              <button type="button" className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-4`} data-cbai-composer-confirm="" onClick={confirmRoom}>
                {copy.confirmCreateRoom}
              </button>
            )}
            <button
              type="button"
              className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} min-h-11`}
              onClick={() => {
                setComposerOpen(false);
                router.replace("/evidence", { scroll: false });
              }}
            >
              {copy.composerCancel}
            </button>
          </div>
        </section>
      ) : null}

      <div className="flex gap-2 lg:hidden">
        <button type="button" className={`${cbaiFocusRing} min-h-11 rounded-lg border border-[var(--cbai-border)] px-3 text-sm`} aria-expanded={navOpen} onClick={() => setNavOpen((v) => !v)}>
          {navOpen ? copy.filtersClose : copy.filtersOpen}
        </button>
        <button type="button" className={`${cbaiFocusRing} min-h-11 rounded-lg border border-[var(--cbai-border)] px-3 text-sm`} aria-expanded={contextOpen} onClick={() => setContextOpen((v) => !v)}>
          {contextOpen ? copy.contextClose : copy.contextOpen}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)_minmax(12rem,16rem)]">
        <aside className={`${navOpen ? "block" : "hidden lg:block"} space-y-3`} data-cbai-sdn-navigator="">
          <div className={`${cbaiMineralPanel} space-y-3`}>
            <h3 className="text-sm font-semibold">{copy.navigator}</h3>
            <p className="text-xs font-medium">{copy.myDeliberations}</p>
            {bundles.length === 0 ? (
              <p className={`text-sm ${cbaiTextMuted}`} data-cbai-empty-room="">
                {copy.emptyRoom}
              </p>
            ) : (
              <ul className="max-h-64 space-y-1 overflow-y-auto" role="listbox" aria-label={copy.navigator}>
                {bundles.map((b) => (
                  <li key={b.room.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected?.room.id === b.room.id}
                      className={`${cbaiFocusRing} w-full rounded-md border px-2 py-2 text-left text-xs ${
                        selected?.room.id === b.room.id ? "border-teal-500/40 bg-teal-500/10" : "border-[var(--cbai-border)]"
                      }`}
                      onClick={() => selectRoom(b.room.id)}
                    >
                      <span className="font-medium">{b.room.title}</span>
                      <span className="mt-0.5 block text-[10px] text-[var(--cbai-text-muted)]">
                        {b.room.roomType} · {b.room.status} · {copy.localOnly}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs font-medium">{copy.roomTypes}</p>
            <ul className="flex flex-wrap gap-1">
              {ROOM_TYPES.slice(0, 4).map((t) => (
                <li key={t} className="rounded border border-[var(--cbai-border)] px-2 py-1 text-[10px]">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="min-w-0 space-y-4" data-cbai-argument-canvas="">
          {!selected ? (
            <section className={cbaiMineralPanel} data-cbai-empty-room="">
              <p className={`text-sm ${cbaiTextMuted}`}>{copy.emptyRoom}</p>
            </section>
          ) : (
            <>
              <section className={`${cbaiMineralPanel} space-y-2`}>
                <h3 className="text-base font-semibold">{selected.room.title}</h3>
                <p className={`text-sm ${cbaiTextMuted}`}>{selected.room.scientificQuestion}</p>
                <p className="text-xs text-[var(--cbai-text-muted)]">
                  {copy.claimStatus}: {selected.claims[0]?.status ?? copy.unknown} · {copy.localOnly}
                </p>
                <article className="rounded-lg border border-[var(--cbai-border)] p-3" data-cbai-primary-claim="">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-300">{copy.primaryClaim}</p>
                  <p className="mt-2 text-sm text-[var(--cbai-text-primary)]">{selected.claims[0]?.statement}</p>
                </article>
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                <div className={cbaiMineralPanel}>
                  <p className="text-xs font-semibold">{copy.support}</p>
                  {support.length === 0 ? (
                    <p className={`mt-2 text-sm ${cbaiTextMuted}`}>{copy.noVerifiedData}</p>
                  ) : (
                    support.map((e) => <EvidenceCard key={e.id} evidence={e} copy={copy} />)
                  )}
                </div>
                <div className={cbaiMineralPanel} data-cbai-counter-evidence="">
                  <p className="text-xs font-semibold">{copy.challenge}</p>
                  {challenge.length === 0 ? (
                    <p className={`mt-2 text-sm ${cbaiTextMuted}`}>{copy.noVerifiedData}</p>
                  ) : (
                    challenge.map((e) => <EvidenceCard key={e.id} evidence={e} copy={copy} />)
                  )}
                </div>
              </section>

              <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-contradiction-radar="">
                <h4 className="text-sm font-semibold">{copy.contradictionRadar}</h4>
                <p className={`text-sm ${cbaiTextMuted}`}>
                  {selected.contradictions.length
                    ? selected.contradictions.map((c) => c.explanation).join(" · ")
                    : copy.noVerifiedData}
                </p>
                <p className="text-xs text-[var(--cbai-text-muted)]">causationClaimed: false</p>
              </section>

              <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-methodology-clinic="">
                <h4 className="text-sm font-semibold">{copy.methodologyClinic}</h4>
                {selected.methodReviews.length === 0 ? (
                  <p className={`text-sm ${cbaiTextMuted}`}>{copy.noVerifiedData}</p>
                ) : (
                  selected.methodReviews.map((m) => (
                    <p key={m.id} className="text-sm">
                      {m.methodExamined} · {m.severity}
                    </p>
                  ))
                )}
              </section>

              <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-replication-passport="">
                <h4 className="text-sm font-semibold">{copy.replicationPassport}</h4>
                {selected.replications.length === 0 ? (
                  <p className={`text-sm ${cbaiTextMuted}`}>{copy.noVerifiedData}</p>
                ) : (
                  selected.replications.map((r) => {
                    const passport = toReplicationPassport(r);
                    return (
                      <p key={r.id} className="text-sm">
                        {passport.originalStudy} → {passport.resultRelation} · {passport.independentVerification}
                      </p>
                    );
                  })
                )}
              </section>

              <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-negative-results="">
                <h4 className="text-sm font-semibold">{copy.negativeResults}</h4>
                <p className={`text-sm ${cbaiTextMuted}`}>
                  {selected.replications.filter((r) => r.isNegativeOrInconclusive).length
                    ? "Inconclusive or non-matching replications listed with respectful scientific language."
                    : copy.noVerifiedData}
                </p>
              </section>

              <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-living-synthesis="">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold">{copy.livingSynthesis}</h4>
                  <button type="button" className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} min-h-11`} onClick={runSynthesis}>
                    {copy.refreshSynthesis}
                  </button>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-200">{copy.notFinalTruth}</p>
                {selected.synthesis ? (
                  <ul className="space-y-1 text-sm text-[var(--cbai-text-secondary)]">
                    <li>
                      {copy.support}: {selected.synthesis.wellSupported.join("; ") || copy.unknown}
                    </li>
                    <li>
                      {copy.claimStatus}: {selected.synthesis.conditional.join("; ") || copy.unknown}
                    </li>
                    <li>
                      {copy.challenge}: {selected.synthesis.disputed.join("; ") || copy.unknown}
                    </li>
                    <li>
                      {copy.unknown}: {selected.synthesis.unknown.join("; ")}
                    </li>
                    <li>
                      {copy.livingSynthesis} · v{selected.synthesis.version} · {selected.synthesis.humanApprovalStatus} ·{" "}
                      {selected.synthesis.evidenceCutoff}
                    </li>
                  </ul>
                ) : (
                  <p className={`text-sm ${cbaiTextMuted}`}>{copy.noVerifiedData}</p>
                )}
              </section>

              <section className={`${cbaiMineralPanel} space-y-3`} data-cbai-add-evidence="">
                <h4 className="text-sm font-semibold">{copy.addEvidence}</h4>
                <label className="block text-xs">
                  {copy.stance}
                  <select
                    className={`${cbaiFocusRing} mt-1 w-full min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2`}
                    value={evidenceStance}
                    onChange={(e) => setEvidenceStance(e.target.value as typeof evidenceStance)}
                  >
                    <option value="support">{copy.support}</option>
                    <option value="challenge">{copy.challenge}</option>
                    <option value="context">{copy.context}</option>
                  </select>
                </label>
                <label className="block text-xs">
                  {copy.officialSource}
                  <textarea
                    className={`${cbaiFocusRing} mt-1 w-full min-h-20 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2`}
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                  />
                </label>
                <label className="block text-xs">
                  {copy.cbaiInterpretation}
                  <textarea
                    className={`${cbaiFocusRing} mt-1 w-full min-h-16 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2`}
                    value={evidenceText}
                    onChange={(e) => setEvidenceText(e.target.value)}
                  />
                </label>
                <button type="button" className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-4`} onClick={addEvidence}>
                  {copy.confirmBeforeCreate}
                </button>
              </section>

              <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-debate-to-work="">
                <h4 className="text-sm font-semibold">{copy.debateToWork}</h4>
                <button type="button" className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} min-h-11`} onClick={previewWork}>
                  {copy.previewWork}
                </button>
                {workPreview ? (
                  <button type="button" className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-4`} onClick={confirmWorkOnce}>
                    {copy.confirmBeforeCreate}
                  </button>
                ) : null}
              </section>

              <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-multilingual="">
                <h4 className="text-sm font-semibold">{copy.multilingualNote}</h4>
                <p className={`text-sm ${cbaiTextMuted}`}>
                  {copy.translationConsent}: {String(selected.room.translationConsent)} · {copy.transcriptConsent}:{" "}
                  {String(selected.room.transcriptConsent)}
                </p>
              </section>
            </>
          )}
        </div>

        <aside
          className={`${contextOpen ? "block" : "hidden lg:block"} ${cbaiMineralPanel} space-y-3`}
          data-cbai-sdn-context-rail=""
        >
          <h3 className="text-sm font-semibold">{copy.contextRail}</h3>
          {selected ? (
            <>
              <p className="text-sm font-medium">{selected.room.title}</p>
              <p className={`text-xs ${cbaiTextMuted}`}>
                {copy.participants}: {selected.participants.map((p) => p.role).join(", ")}
              </p>
              <p className={`text-xs ${cbaiTextMuted}`}>
                {copy.roomRules}: visibility {selected.room.visibility}
              </p>
              <p className={`text-xs ${cbaiTextMuted}`}>
                {copy.evidenceCoverage}: {selected.evidence.length} · support {support.length} · challenge {challenge.length} ·
                context {contextEv.length}
              </p>
              <p className={`text-xs ${cbaiTextMuted}`}>
                {copy.conflicts}: {selected.room.conflictDisclosures}
              </p>
              <p className={`text-xs ${cbaiTextMuted}`}>
                {copy.nextHumanDecision}: {selected.checkpoints[0]?.label ?? copy.humanDecision}
              </p>
              <p className={`text-xs ${cbaiTextMuted}`}>{copy.voiceClearance}</p>
            </>
          ) : (
            <p className={`text-sm ${cbaiTextMuted}`}>{copy.emptyRoom}</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function EvidenceCard({
  evidence,
  copy,
}: {
  evidence: DeliberationEvidenceRecord;
  copy: ReturnType<typeof getSdnCopy>;
}) {
  return (
    <article className="mt-2 space-y-2 rounded-lg border border-[var(--cbai-border)] p-3" data-cbai-evidence-card="">
      <p className="text-[10px] uppercase tracking-wide text-[var(--cbai-text-muted)]">
        {evidence.stance === "support" ? copy.support : evidence.stance === "challenge" ? copy.challenge : copy.context} ·{" "}
        {evidence.humanConfirmationStatus}
      </p>
      <div className="rounded border-l-4 border-amber-600/50 bg-[var(--cbai-surface-muted)] p-2" data-cbai-official-source="">
        <p className="text-[10px] font-semibold uppercase text-amber-800 dark:text-amber-300">{copy.officialSource}</p>
        <p className="mt-1 text-xs text-[var(--cbai-text-primary)]" lang={evidence.sourceLanguage ?? undefined}>
          {evidence.originalSourceText || copy.unknown}
        </p>
      </div>
      <div className="rounded border-l-4 border-teal-600/50 p-2" data-cbai-cbai-interpretation="">
        <p className="text-[10px] font-semibold uppercase text-teal-800 dark:text-teal-300">{copy.cbaiInterpretation}</p>
        <p className="mt-1 text-xs text-[var(--cbai-text-secondary)]">{evidence.cbaiInterpretation || copy.unknown}</p>
      </div>
      <p className="text-[10px] text-[var(--cbai-text-muted)]">
        methodology: {evidence.methodology ?? copy.unknown} · sample: {evidence.sampleSize ?? copy.unknown} · units:{" "}
        {evidence.measurementUnits ?? copy.unknown}
      </p>
    </article>
  );
}
