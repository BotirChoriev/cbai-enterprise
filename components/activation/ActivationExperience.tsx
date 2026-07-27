"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getActivationCopy } from "@/lib/i18n/platform-copy-activation";
import LanguageSelector from "@/components/i18n/LanguageSelector";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useOperationalObjects } from "@/components/operational-objects/OperationalObjectProvider";
import {
  ACTIVATION_ROLES,
  adaptiveClarifications,
  detectActivationRole,
  type ActivationRole,
} from "@/lib/activation/role-workspace-engine";
import {
  buildStarterWorkCard,
  starterCardToOperationalDraft,
  type ActivationMaterial,
  type StarterWorkCard,
} from "@/lib/activation/starter-work-card";
import { buildManufacturingExample } from "@/lib/activation/manufacturing-example";
import StarterWorkCardPreview from "@/components/activation/StarterWorkCardPreview";

type ActivationStep = "choices" | "voice" | "describe" | "refine" | "card";

type ActivationExperienceProps = {
  /** "hero" for first-time visitors; "compact" adds a resume strip and folds the flow. */
  readonly variant: "hero" | "compact";
};

/**
 * Adaptive Intelligence Workspace activation (Phases 1–5).
 *
 * Exactly three first-screen choices: start with voice, start by typing, or
 * view a ready-made example. No registration, no questionnaire. Voice and
 * typed input converge on the same Operational Object draft + confirmation
 * pipeline; nothing is persisted until the user confirms in the canonical
 * composer.
 */
export default function ActivationExperience({ variant }: ActivationExperienceProps) {
  const { language } = useTranslation();
  const copy = getActivationCopy(language);
  const vo = useVoiceOperator();
  const objects = useOperationalObjects();
  const pathname = usePathname();

  const [step, setStep] = useState<ActivationStep>("choices");
  const [statement, setStatement] = useState("");
  const [roleChoice, setRoleChoice] = useState<ActivationRole | null>(null);
  const [outcome, setOutcome] = useState("");
  const [problem, setProblem] = useState("");
  const [constraints, setConstraints] = useState("");
  const [materials, setMaterials] = useState<ActivationMaterial[]>([]);
  const [materialNote, setMaterialNote] = useState("");
  const [materialLink, setMaterialLink] = useState("");
  const [card, setCard] = useState<StarterWorkCard | null>(null);
  const [exampleMode, setExampleMode] = useState(false);

  const detection = useMemo(() => detectActivationRole(statement), [statement]);
  const effectiveRole = roleChoice ?? detection.role;

  const openQuestions = useMemo(
    () =>
      adaptiveClarifications({
        text: statement,
        role: effectiveRole,
        outcome: outcome || null,
        problem: problem || null,
        materialsCount: materials.length,
        constraints: constraints || null,
      }),
    [statement, effectiveRole, outcome, problem, materials.length, constraints],
  );

  function buildCard(source: StarterWorkCard["source"]) {
    const built = buildStarterWorkCard({
      text: statement,
      locale: language,
      source,
      route: pathname,
      roleOverride: roleChoice ?? undefined,
      outcome: outcome || null,
      problem: problem || null,
      constraints: constraints || null,
      materials,
    });
    setCard(built);
    setExampleMode(false);
    setStep("card");
  }

  function openExample() {
    setCard(buildManufacturingExample(language));
    setExampleMode(true);
    setStep("card");
  }

  function confirmCard() {
    if (!card) return;
    const draft = starterCardToOperationalDraft(card);
    objects.openComposer(draft, card.assumptions, card.source);
  }

  function addMaterial(origin: ActivationMaterial["origin"], value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setMaterials((current) => [...current, { origin, value: trimmed }]);
  }

  const choices = (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-1">
        <button
          type="button"
          data-activation-choice="voice"
          disabled={vo.dockOpen}
          onClick={() => {
            vo.openDock();
            setStep("voice");
          }}
          className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-teal-400/50 bg-teal-600/90 px-4 py-3 text-left transition-colors hover:bg-teal-500/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-200 disabled:cursor-default disabled:opacity-60"
        >
          <span>
            <span className="block text-sm font-semibold text-slate-950">{copy.chooseVoice}</span>
            <span className="mt-0.5 block text-xs text-slate-900/80">{copy.chooseVoiceHint}</span>
          </span>
          <svg className="h-5 w-5 shrink-0 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        </button>
        <button
          type="button"
          data-activation-choice="type"
          onClick={() => setStep("describe")}
          className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-teal-500/25 bg-[#0d1a30]/80 px-4 py-2.5 text-left transition-colors hover:border-teal-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
        >
          <span>
            <span className="block text-sm font-medium text-slate-50">{copy.chooseType}</span>
            <span className="mt-0.5 block text-xs text-slate-400">{copy.chooseTypeHint}</span>
          </span>
        </button>
        <button
          type="button"
          data-activation-choice="example"
          onClick={openExample}
          className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-teal-500/25 bg-[#0d1a30]/80 px-4 py-2.5 text-left transition-colors hover:border-teal-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
        >
          <span>
            <span className="block text-sm font-medium text-slate-50">{copy.chooseExample}</span>
            <span className="mt-0.5 block text-xs text-slate-400">{copy.chooseExampleHint}</span>
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <section
      aria-labelledby="activation-heading"
      data-activation-experience={variant}
      className="w-full min-w-0 rounded-2xl border border-teal-500/25 bg-[#0a1528]/90 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 id="activation-heading" className="cbai-display text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
            {copy.valueStatement}
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{copy.purposeLine}</p>
        </div>
        <div className="shrink-0">
          <LanguageSelector compact />
        </div>
      </div>

      {variant === "compact" && step === "choices" ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-950/25 px-3 py-2.5" data-activation-resume="1">
          <p className="text-sm font-medium text-slate-50">{copy.resumeHeading}</p>
          <Link href="/my-work" className="text-sm font-medium text-teal-200 hover:text-teal-100">
            {copy.resumeCta}
          </Link>
        </div>
      ) : null}

      <div className="mt-4">
        {step === "choices" ? choices : null}

        {step === "voice" ? (
          <div className="space-y-3" data-activation-voice-intro="1">
            <p className="rounded-xl border border-teal-500/20 bg-[#0d1a30]/80 px-4 py-3 text-sm leading-relaxed text-slate-100">
              {copy.operatorIntro}
            </p>
            <p className="text-xs text-slate-400">{copy.voiceFallbackNote}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStep("describe")}
                className="inline-flex min-h-11 items-center rounded-lg border border-teal-500/25 px-4 py-2 text-sm text-slate-200 hover:border-teal-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
              >
                {copy.chooseType}
              </button>
              <button
                type="button"
                onClick={() => setStep("choices")}
                className="inline-flex min-h-11 items-center rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
              >
                {copy.backCta}
              </button>
            </div>
          </div>
        ) : null}

        {step === "describe" ? (
          <div className="space-y-3">
            <label htmlFor="activation-statement" className="block text-sm font-medium text-slate-100">
              {copy.describeLabel}
            </label>
            <textarea
              id="activation-statement"
              value={statement}
              onChange={(event) => setStatement(event.target.value)}
              rows={3}
              placeholder={copy.describePlaceholder}
              className="w-full rounded-xl border border-teal-500/25 bg-[#0d1a30]/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                data-activation-interpret="1"
                onClick={() => setStep("refine")}
                disabled={!statement.trim()}
                className="inline-flex min-h-11 items-center rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-200"
              >
                {copy.interpretCta}
              </button>
              <button
                type="button"
                onClick={() => setStep("choices")}
                className="inline-flex min-h-11 items-center rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
              >
                {copy.backCta}
              </button>
            </div>
          </div>
        ) : null}

        {step === "refine" ? (
          <div className="space-y-4" data-activation-refine="1">
            <div>
              <p className="text-sm font-medium text-slate-100">{copy.roleHeading}</p>
              <p className="mt-0.5 text-xs text-slate-400">{copy.roleNotSilo}</p>
              <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={copy.roleHeading}>
                {ACTIVATION_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={effectiveRole === role}
                    onClick={() => setRoleChoice(role)}
                    className={`min-h-9 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300 ${
                      effectiveRole === role
                        ? "border-teal-400/60 bg-teal-900/50 text-teal-100"
                        : "border-teal-500/20 text-slate-300 hover:border-teal-400/40"
                    }`}
                  >
                    {copy.roles[role]}
                  </button>
                ))}
              </div>
              {!roleChoice && detection.confidence === "explicit" ? (
                <p className="mt-1.5 text-[11px] text-sky-200/90">{copy.badgeInferred}</p>
              ) : null}
            </div>

            {openQuestions.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-slate-100">{copy.clarifyHeading}</p>
                <p className="mt-0.5 text-xs text-slate-400">{copy.clarifyHint}</p>
                <div className="mt-2 space-y-2.5">
                  {openQuestions.includes("outcome") ? (
                    <div>
                      <label htmlFor="activation-outcome" className="block text-xs text-slate-300">
                        {copy.clarifications.outcome}
                      </label>
                      <input
                        id="activation-outcome"
                        value={outcome}
                        onChange={(event) => setOutcome(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-teal-500/25 bg-[#0d1a30]/80 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                      />
                    </div>
                  ) : null}
                  {openQuestions.includes("problem") ? (
                    <div>
                      <label htmlFor="activation-problem" className="block text-xs text-slate-300">
                        {copy.clarifications.problem}
                      </label>
                      <input
                        id="activation-problem"
                        value={problem}
                        onChange={(event) => setProblem(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-teal-500/25 bg-[#0d1a30]/80 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                      />
                    </div>
                  ) : null}
                  {openQuestions.includes("constraints") ? (
                    <div>
                      <label htmlFor="activation-constraints" className="block text-xs text-slate-300">
                        {copy.clarifications.constraints}
                      </label>
                      <input
                        id="activation-constraints"
                        value={constraints}
                        onChange={(event) => setConstraints(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-teal-500/25 bg-[#0d1a30]/80 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div>
              <p className="text-sm font-medium text-slate-100">{copy.clarifications.materials}</p>
              {materials.length > 0 ? (
                <ul className="mt-1.5 space-y-1">
                  {materials.map((material, index) => (
                    <li key={`${material.origin}-${index}`} className="break-all text-xs text-slate-300">
                      · {material.value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-slate-500">{copy.materialsEmpty}</p>
              )}
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div className="flex gap-2">
                  <input
                    aria-label={copy.materialsAddNote}
                    value={materialNote}
                    onChange={(event) => setMaterialNote(event.target.value)}
                    placeholder={copy.materialsAddNote}
                    className="min-w-0 flex-1 rounded-lg border border-teal-500/25 bg-[#0d1a30]/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addMaterial("user_note", materialNote);
                      setMaterialNote("");
                    }}
                    className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-teal-500/25 px-3 text-xs text-slate-200 hover:border-teal-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                  >
                    {copy.materialsAddNote}
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    aria-label={copy.materialsAddLink}
                    value={materialLink}
                    onChange={(event) => setMaterialLink(event.target.value)}
                    placeholder="https://"
                    inputMode="url"
                    className="min-w-0 flex-1 rounded-lg border border-teal-500/25 bg-[#0d1a30]/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addMaterial("user_link", materialLink);
                      setMaterialLink("");
                    }}
                    className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-teal-500/25 px-3 text-xs text-slate-200 hover:border-teal-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                  >
                    {copy.materialsAddLink}
                  </button>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">{copy.materialsFileHint}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                data-activation-build-card="1"
                onClick={() => buildCard("typed_command")}
                className="inline-flex min-h-11 items-center rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-200"
              >
                {copy.continueCta}
              </button>
              <button
                type="button"
                onClick={() => setStep("describe")}
                className="inline-flex min-h-11 items-center rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
              >
                {copy.backCta}
              </button>
            </div>
          </div>
        ) : null}

        {step === "card" && card ? (
          <StarterWorkCardPreview
            card={card}
            exampleMode={exampleMode}
            onConfirm={confirmCard}
            onBack={() => setStep(exampleMode ? "choices" : "refine")}
          />
        ) : null}
      </div>
    </section>
  );
}
