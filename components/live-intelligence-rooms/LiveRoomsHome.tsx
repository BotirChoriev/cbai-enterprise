"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getLcrCopy, roomTypeLabel } from "@/lib/i18n/platform-copy-live-collaboration";
import {
  WIZARD_PRIMARY_TYPES,
  buildCreateInputFromWizard,
  canAdvanceWizard,
  createEmptyWizardState,
  createLiveRoomFromWizard,
  getEmptyLiveRoomsSnapshot,
  listLiveRooms,
  subscribeLiveRooms,
  validateWizardStep,
  type RoomCreateWizardState,
  type WizardStepId,
} from "@/lib/live-intelligence-rooms";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondarySm,
  cbaiFocusRing,
  cbaiMineralPanel,
  cbaiSectionEyebrow,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";
import IntelligenceStatusRail from "@/components/shared/IntelligenceStatusRail";

const STEP_META: { id: WizardStepId; labelKey: keyof ReturnType<typeof getLcrCopy> }[] = [
  { id: 1, labelKey: "stepPurpose" },
  { id: 2, labelKey: "stepPeople" },
  { id: 3, labelKey: "stepTimeAccess" },
  { id: 4, labelKey: "stepMaterialsConsent" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0 space-y-1 text-sm">
      <span className="text-[color:var(--cbai-text-secondary)]">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] px-3 py-2 text-[color:var(--cbai-text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cbai-accent-primary)]";

export default function LiveRoomsHome() {
  const router = useRouter();
  const { language } = useTranslation();
  const copy = getLcrCopy(language);
  const rooms = useSyncExternalStore(subscribeLiveRooms, listLiveRooms, getEmptyLiveRoomsSnapshot);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [joinHintOpen, setJoinHintOpen] = useState(false);
  const [state, setState] = useState<RoomCreateWizardState>(() => createEmptyWizardState(language));
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const locales = useMemo(() => ["en", "uz", "ru", "tr"] as const, []);

  function patch( partial: Partial<RoomCreateWizardState>) {
    setState((prev) => ({ ...prev, ...partial }));
    setErrorKey(null);
  }

  function goNext() {
    const v = validateWizardStep(state, state.step);
    if (!v.ok) {
      setErrorKey("validationRequired");
      return;
    }
    if (state.step < 4) patch({ step: (state.step + 1) as WizardStepId });
  }

  function goBack() {
    if (state.step > 1) patch({ step: (state.step - 1) as WizardStepId });
    else setWizardOpen(false);
  }

  function onConfirmCreate() {
    if (creating) return;
    const built = buildCreateInputFromWizard(state, { createdLocale: language, sourceRoute: "/rooms" });
    if ("error" in built) {
      setErrorKey(built.error === "review_unconfirmed" ? "validationRequired" : "createError");
      return;
    }
    setCreating(true);
    try {
      const room = createLiveRoomFromWizard(built);
      router.push(`/rooms/session?id=${encodeURIComponent(room.roomId)}`);
    } catch {
      setErrorKey("createError");
      setCreating(false);
    }
  }

  return (
    <div
      className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 pb-24"
      data-cbai-voice-dock-clearance=""
      data-cbai-live-collaboration-rooms=""
    >
      <header className={`${cbaiMineralPanel} space-y-3 p-5 sm:p-6`}>
        <p className={cbaiSectionEyebrow}>{copy.brand}</p>
        <h1 className="cbai-display text-3xl font-semibold tracking-tight text-[color:var(--cbai-text-primary)] sm:text-4xl">
          {copy.title}
        </h1>
        <p className={`max-w-3xl text-base ${cbaiTextMuted}`}>{copy.oneSentence}</p>
        <p className={`max-w-3xl text-sm ${cbaiTextMuted}`}>{copy.multipartyHonest}</p>
        <p className="text-xs text-[color:var(--cbai-text-muted)]">{copy.humanDecides}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            className={`${cbaiBtnPrimary} min-h-11 min-w-11 ${cbaiFocusRing}`}
            onClick={() => {
              setState(createEmptyWizardState(language));
              setWizardOpen(true);
              setErrorKey(null);
            }}
            data-cbai-lcr-primary=""
          >
            {copy.primaryAction}
          </button>
          <a href="#room-list" className={`${cbaiBtnSecondarySm} min-h-11 inline-flex items-center ${cbaiFocusRing}`}>
            {copy.secondaryOpenList}
          </a>
          <button
            type="button"
            className={`${cbaiBtnSecondarySm} min-h-11 ${cbaiFocusRing}`}
            onClick={() => setJoinHintOpen((v) => !v)}
          >
            {copy.secondaryJoinLink}
          </button>
        </div>
        {joinHintOpen ? (
          <p className={`text-sm ${cbaiTextMuted}`} role="status">
            {copy.access_link}: <code className="text-xs">/rooms/session?id=…</code> · {copy.phoneNotRequired} ·{" "}
            {copy.emailDeliveryUnavailable} · {copy.smsUnavailable}
          </p>
        ) : null}
        <IntelligenceStatusRail
          context={
            rooms.length > 0
              ? `${rooms.length} ${language === "uz" ? "ta hamkorlik xonasi" : "collaboration rooms"}`
              : language === "uz"
                ? "Yangi hamkorlik xonasini oching"
                : "Open a new collaboration room"
          }
          evidence={
            language === "uz"
              ? "Materiallar, e’tirozlar va qarorlar bitta xonada"
              : "Materials, objections, and decisions stay in one room"
          }
          unknown={
            language === "uz"
              ? "Taklif qilinmagan ishtirokchilar va yetishmagan materiallar ko‘rinadi"
              : "Missing participants and materials remain visible"
          }
          humanBoundary={copy.humanDecides}
          compact
        />
      </header>

      {wizardOpen ? (
        <section
          aria-labelledby="lcr-wizard-heading"
          className="space-y-5 rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] p-5"
          data-cbai-lcr-wizard=""
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="lcr-wizard-heading" className="text-lg font-semibold text-[color:var(--cbai-text-primary)]">
                {copy.primaryAction}
              </h2>
              <p className={`text-sm ${cbaiTextMuted}`}>
                {STEP_META.find((s) => s.id === state.step)
                  ? copy[STEP_META.find((s) => s.id === state.step)!.labelKey]
                  : ""}
              </p>
            </div>
            <ol className="flex flex-wrap gap-2" aria-label="Wizard steps">
              {STEP_META.map((s) => (
                <li key={s.id}>
                  <span
                    className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-xs font-medium ${
                      state.step === s.id
                        ? "border-[color:var(--cbai-accent-primary)] text-[color:var(--cbai-accent-primary)]"
                        : "border-[color:var(--cbai-border-subtle)] text-[color:var(--cbai-text-secondary)]"
                    }`}
                    aria-current={state.step === s.id ? "step" : undefined}
                  >
                    {s.id}. {copy[s.labelKey]}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {state.step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2" data-cbai-wizard-step="1">
              <Field label={copy.fieldTitle}>
                <input className={inputClass} value={state.title} onChange={(e) => patch({ title: e.target.value })} required />
              </Field>
              <Field label={copy.fieldTopic}>
                <input className={inputClass} value={state.topicDomain} onChange={(e) => patch({ topicDomain: e.target.value })} />
              </Field>
              <fieldset className="sm:col-span-2 space-y-2">
                <legend className={`text-sm ${cbaiTextMuted}`}>{copy.fieldRoomType}</legend>
                <div className="flex flex-wrap gap-2">
                  {WIZARD_PRIMARY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        patch({
                          roomType: type,
                          publicSessionEnabled: type === "public_presentation",
                          attendanceMode: type === "hybrid_meeting" ? "hybrid" : state.attendanceMode,
                        })
                      }
                      className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm ${cbaiFocusRing} ${
                        state.roomType === type
                          ? "border-[color:var(--cbai-accent-primary)] text-[color:var(--cbai-accent-primary)]"
                          : "border-[color:var(--cbai-border-subtle)] text-[color:var(--cbai-text-secondary)]"
                      }`}
                      aria-pressed={state.roomType === type}
                      data-cbai-room-type={type}
                    >
                      {roomTypeLabel(copy, type)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Field label={copy.fieldPurpose}>
                <textarea
                  className={`${inputClass} min-h-[88px]`}
                  value={state.purpose}
                  onChange={(e) => patch({ purpose: e.target.value })}
                  required
                />
              </Field>
              <Field label={copy.fieldOutcome}>
                <textarea
                  className={`${inputClass} min-h-[88px]`}
                  value={state.expectedOutcome}
                  onChange={(e) => patch({ expectedOutcome: e.target.value })}
                  required
                />
              </Field>
            </div>
          ) : null}

          {state.step === 2 ? (
            <div className="grid gap-4 sm:grid-cols-2" data-cbai-wizard-step="2">
              <Field label={copy.fieldHost}>
                <input
                  className={inputClass}
                  value={state.hostDisplayName}
                  onChange={(e) => patch({ hostDisplayName: e.target.value })}
                  required
                />
              </Field>
              <Field label={copy.fieldModerator}>
                <input
                  className={inputClass}
                  value={state.moderatorDisplayName}
                  onChange={(e) => patch({ moderatorDisplayName: e.target.value })}
                />
              </Field>
              <Field label={copy.fieldPresenters}>
                <input
                  className={inputClass}
                  value={state.presenterDisplayNames}
                  onChange={(e) => patch({ presenterDisplayNames: e.target.value })}
                />
              </Field>
              <Field label={copy.fieldApprover}>
                <input
                  className={inputClass}
                  value={state.approverDisplayName}
                  onChange={(e) => patch({ approverDisplayName: e.target.value })}
                  required
                />
              </Field>
              <Field label={copy.fieldObservers}>
                <input
                  className={inputClass}
                  value={state.observerNote}
                  onChange={(e) => patch({ observerNote: e.target.value })}
                />
              </Field>
              <p className={`sm:col-span-2 text-sm ${cbaiTextMuted}`}>
                {copy.phoneNotRequired} · {copy.identityUnverified}
              </p>
            </div>
          ) : null}

          {state.step === 3 ? (
            <div className="grid gap-4 sm:grid-cols-2" data-cbai-wizard-step="3">
              <label className="flex min-h-11 items-center gap-2 text-sm text-[color:var(--cbai-text-secondary)]">
                <input
                  type="checkbox"
                  checked={state.startNow}
                  onChange={(e) => patch({ startNow: e.target.checked })}
                />
                {copy.fieldStartNow}
              </label>
              {!state.startNow ? (
                <>
                  <Field label={copy.fieldSchedule}>
                    <input
                      type="datetime-local"
                      className={inputClass}
                      value={state.scheduledStart}
                      onChange={(e) => patch({ scheduledStart: e.target.value })}
                    />
                  </Field>
                  <Field label={`${copy.fieldSchedule} (end)`}>
                    <input
                      type="datetime-local"
                      className={inputClass}
                      value={state.scheduledEnd}
                      onChange={(e) => patch({ scheduledEnd: e.target.value })}
                    />
                  </Field>
                </>
              ) : null}
              <Field label={copy.fieldTimezone}>
                <input className={inputClass} value={state.timezone} onChange={(e) => patch({ timezone: e.target.value })} />
              </Field>
              <Field label={copy.fieldRecurrence}>
                <select
                  className={inputClass}
                  value={state.recurrence}
                  onChange={(e) =>
                    patch({ recurrence: e.target.value as RoomCreateWizardState["recurrence"] })
                  }
                >
                  <option value="none">none</option>
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                </select>
              </Field>
              <Field label={copy.fieldAttendance}>
                <select
                  className={inputClass}
                  value={state.attendanceMode}
                  onChange={(e) =>
                    patch({ attendanceMode: e.target.value as RoomCreateWizardState["attendanceMode"] })
                  }
                >
                  <option value="online">{copy.attendance_online}</option>
                  <option value="offline">{copy.attendance_offline}</option>
                  <option value="hybrid">{copy.attendance_hybrid}</option>
                </select>
              </Field>
              <Field label={copy.fieldAccess}>
                <select
                  className={inputClass}
                  value={state.accessMode}
                  onChange={(e) => patch({ accessMode: e.target.value as RoomCreateWizardState["accessMode"] })}
                >
                  <option value="private">{copy.access_private}</option>
                  <option value="invite">{copy.access_invite}</option>
                  <option value="link">{copy.access_link}</option>
                  <option value="public">{copy.access_public}</option>
                </select>
              </Field>
              <Field label={copy.fieldGuest}>
                <select
                  className={inputClass}
                  value={state.guestPolicy}
                  onChange={(e) => patch({ guestPolicy: e.target.value as RoomCreateWizardState["guestPolicy"] })}
                >
                  <option value="none">none</option>
                  <option value="display_name">display_name</option>
                  <option value="moderated">moderated</option>
                  <option value="open_observer">open_observer</option>
                </select>
              </Field>
              <label className="flex min-h-11 items-center gap-2 text-sm text-[color:var(--cbai-text-secondary)]">
                <input
                  type="checkbox"
                  checked={state.waitingRoom}
                  onChange={(e) => patch({ waitingRoom: e.target.checked })}
                />
                {copy.fieldWaiting}
              </label>
              <Field label={copy.fieldLimit}>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={state.participantLimit}
                  onChange={(e) => patch({ participantLimit: e.target.value })}
                />
              </Field>
              {(
                [
                  [copy.fieldSpeak, "speakLocale"],
                  [copy.fieldRead, "readLocale"],
                  [copy.fieldHear, "hearLocale"],
                ] as const
              ).map(([label, key]) => (
                <Field key={key} label={label}>
                  <select
                    className={inputClass}
                    value={state[key]}
                    onChange={(e) => patch({ [key]: e.target.value })}
                  >
                    {locales.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>
          ) : null}

          {state.step === 4 ? (
            <div className="space-y-4" data-cbai-wizard-step="4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={copy.fieldMaterialTitle}>
                  <input
                    className={inputClass}
                    value={state.materialTitle}
                    onChange={(e) => patch({ materialTitle: e.target.value })}
                  />
                </Field>
                <Field label={copy.fieldMaterialSource}>
                  <input
                    className={inputClass}
                    value={state.materialSource}
                    onChange={(e) => patch({ materialSource: e.target.value })}
                  />
                </Field>
                <Field label={copy.fieldConfidentiality}>
                  <select
                    className={inputClass}
                    value={state.confidentiality}
                    onChange={(e) =>
                      patch({ confidentiality: e.target.value as RoomCreateWizardState["confidentiality"] })
                    }
                  >
                    <option value="open">open</option>
                    <option value="internal">internal</option>
                    <option value="confidential">confidential</option>
                    <option value="restricted">restricted</option>
                  </select>
                </Field>
                <Field label={copy.fieldIp}>
                  <select
                    className={inputClass}
                    value={state.intellectualPropertyStatus}
                    onChange={(e) =>
                      patch({
                        intellectualPropertyStatus: e.target
                          .value as RoomCreateWizardState["intellectualPropertyStatus"],
                      })
                    }
                  >
                    <option value="not_claimed">not_claimed</option>
                    <option value="shared_under_review">shared_under_review</option>
                    <option value="institution_owned">institution_owned</option>
                    <option value="unknown">unknown</option>
                  </select>
                </Field>
              </div>
              <div className="space-y-2 rounded-xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] p-4">
                <label className="flex min-h-11 items-start gap-2 text-sm text-[color:var(--cbai-text-secondary)]">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={state.recordingAllowed}
                    onChange={(e) => patch({ recordingAllowed: e.target.checked })}
                  />
                  {copy.fieldRecording}
                </label>
                <label className="flex min-h-11 items-start gap-2 text-sm text-[color:var(--cbai-text-secondary)]">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={state.transcriptRetainAllowed}
                    onChange={(e) => patch({ transcriptRetainAllowed: e.target.checked })}
                  />
                  {copy.fieldTranscript}
                </label>
                <label className="flex min-h-11 items-start gap-2 text-sm text-[color:var(--cbai-text-secondary)]">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={state.translationAudioAllowed}
                    onChange={(e) => patch({ translationAudioAllowed: e.target.checked })}
                  />
                  {copy.fieldTranslationAudio}
                </label>
                <label className="flex min-h-11 items-start gap-2 text-sm text-[color:var(--cbai-text-secondary)]">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={state.publicSessionEnabled}
                    onChange={(e) => patch({ publicSessionEnabled: e.target.checked })}
                  />
                  {copy.fieldPublicSession}
                </label>
                {state.publicSessionEnabled ? (
                  <p className={`text-sm ${cbaiTextMuted}`}>{copy.publicHostingUnavailable}</p>
                ) : null}
              </div>

              <aside
                className="space-y-2 rounded-xl border border-[color:var(--cbai-accent-primary)]/40 bg-[color:var(--cbai-surface-glass)] p-4"
                data-cbai-lcr-review=""
                aria-labelledby="lcr-review-heading"
              >
                <h3 id="lcr-review-heading" className="text-sm font-semibold text-[color:var(--cbai-text-primary)]">
                  {copy.reviewHeading}
                </h3>
                <ul className={`space-y-1 text-sm ${cbaiTextMuted}`}>
                  <li>
                    <strong className="text-[color:var(--cbai-text-secondary)]">{copy.reviewWillCreate}:</strong>{" "}
                    {state.title || "—"} · {roomTypeLabel(copy, state.roomType)}
                  </li>
                  <li>
                    <strong className="text-[color:var(--cbai-text-secondary)]">{copy.reviewWhoJoins}:</strong>{" "}
                    {copy[`access_${state.accessMode}` as keyof typeof copy]} ·{" "}
                    {copy[`attendance_${state.attendanceMode}` as keyof typeof copy]}
                  </li>
                  <li>
                    <strong className="text-[color:var(--cbai-text-secondary)]">{copy.reviewWhatVisible}:</strong>{" "}
                    {state.confidentiality}
                  </li>
                  <li>
                    <strong className="text-[color:var(--cbai-text-secondary)]">{copy.reviewMediaStored}:</strong>{" "}
                    recording={String(state.recordingAllowed)}; transcript={String(state.transcriptRetainAllowed)};
                    translationAudio={String(state.translationAudioAllowed)}
                  </li>
                  <li>
                    <strong className="text-[color:var(--cbai-text-secondary)]">{copy.reviewUnknown}:</strong>{" "}
                    multiparty A/V, email/SMS delivery, public hosting
                  </li>
                  <li>
                    <strong className="text-[color:var(--cbai-text-secondary)]">{copy.reviewApprover}:</strong>{" "}
                    {state.approverDisplayName || "—"}
                  </li>
                </ul>
                <label className="flex min-h-11 items-start gap-2 pt-2 text-sm text-[color:var(--cbai-text-primary)]">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={state.confirmedReview}
                    onChange={(e) => patch({ confirmedReview: e.target.checked })}
                    data-cbai-lcr-confirm-review=""
                  />
                  {copy.confirmReviewCheckbox}
                </label>
              </aside>
            </div>
          ) : null}

          {errorKey ? (
            <p className="text-sm text-amber-200" role="alert">
              {errorKey === "validationRequired" ? copy.validationRequired : copy.createError}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 border-t border-[color:var(--cbai-border-subtle)] pt-4">
            <button type="button" className={`${cbaiBtnSecondarySm} min-h-11 ${cbaiFocusRing}`} onClick={goBack}>
              {copy.back}
            </button>
            {state.step < 4 ? (
              <button
                type="button"
                className={`${cbaiBtnPrimary} min-h-11 ${cbaiFocusRing}`}
                onClick={goNext}
                disabled={!canAdvanceWizard(state) && state.step !== 4}
              >
                {copy.next}
              </button>
            ) : (
              <button
                type="button"
                className={`${cbaiBtnPrimary} min-h-11 ${cbaiFocusRing}`}
                onClick={onConfirmCreate}
                disabled={!state.confirmedReview || creating}
                data-cbai-lcr-confirm-create=""
              >
                {copy.confirmCreate}
              </button>
            )}
          </div>
        </section>
      ) : null}

      <section id="room-list" aria-labelledby="room-list-heading" className="space-y-4">
        <h2 id="room-list-heading" className="text-lg font-semibold text-[color:var(--cbai-text-primary)]">
          {copy.secondaryOpenList}
        </h2>
        {rooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[color:var(--cbai-border-subtle)] p-8 text-center">
            <p className="font-medium text-[color:var(--cbai-text-primary)]">{copy.emptyTitle}</p>
            <p className={`mt-2 text-sm ${cbaiTextMuted}`}>{copy.emptyBody}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {rooms.map((room) => (
              <li
                key={room.roomId}
                className="flex flex-col gap-3 rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-[color:var(--cbai-text-primary)]">{room.title}</p>
                  <p className={`text-sm ${cbaiTextMuted}`}>
                    {roomTypeLabel(copy, room.roomType)} · {room.attendanceMode} · {room.access.accessMode} ·{" "}
                    {room.schedule.timezone}
                  </p>
                </div>
                <Link
                  href={`/rooms/session?id=${encodeURIComponent(room.roomId)}`}
                  className={`${cbaiBtnSecondarySm} min-h-11 inline-flex items-center justify-center ${cbaiFocusRing}`}
                >
                  {copy.openRoom}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
