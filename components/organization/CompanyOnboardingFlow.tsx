"use client";

import { useState } from "react";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  buildCompanyOnboardingDraft,
  confirmCompanyOnboardingDraft,
  type CompanyOnboardingDraft,
  type CompanyOnboardingInput,
} from "@/lib/company-onboarding/company-onboarding";
import { ORGANIZATION_KINDS, type OrganizationKind } from "@/lib/organization-os/organization.types";

type CompanyOnboardingFlowProps = {
  busy: boolean;
  onConfirm: (input: CompanyOnboardingInput) => void;
};

const COPY = {
  en: {
    eyebrow: "Human-confirmed company onboarding",
    title: "Describe the organization. Review what CBAI understood.",
    intro: "No workspace is created until you review the structured draft and explicitly confirm it.",
    contextLabel: "Describe the organization and the work it needs to improve",
    contextPlaceholder: "We are a manufacturing company. Our teams need to reduce quality failures without slowing production...",
    name: "Organization name",
    kind: "Organization type",
    purpose: "Operating purpose or first problem",
    purposePlaceholder: "What outcome must change, and who is responsible for the final decision?",
    website: "Official website (optional)",
    structure: "Structure draft",
    useVoice: "Continue with Voice Operator",
    voicePrompt: "Help me describe my organization for a human-confirmed CBAI workspace. Ask one question at a time about identity, purpose, people, evidence, and decision ownership.",
    review: "Review before activation",
    understood: "CBAI understood",
    spaces: "Suggested operating spaces",
    assumptions: "Assumptions requiring review",
    unknowns: "Unknowns still visible",
    none: "None",
    requiredMissing: "Name and operating purpose are required before confirmation.",
    edit: "Edit draft",
    confirm: "I confirm — create this workspace",
    waiting: "Creating the confirmed workspace…",
    boundary: "AI may structure and suggest. Only your confirmation creates the organization.",
  },
  uz: {
    eyebrow: "Inson tasdiqlaydigan kompaniya onboardingi",
    title: "Tashkilotni tushuntiring. CBAI nimani tushunganini tekshiring.",
    intro: "Siz tizimlangan draftni tekshirib, aniq tasdiqlamaguningizcha hech qanday ish maydoni yaratilmaydi.",
    contextLabel: "Tashkilot va yaxshilanishi kerak bo‘lgan ishni tasvirlang",
    contextPlaceholder: "Biz ishlab chiqarish kompaniyasimiz. Jamoalarimiz ishlab chiqarishni sekinlashtirmasdan sifat muammolarini kamaytirishi kerak...",
    name: "Tashkilot nomi",
    kind: "Tashkilot turi",
    purpose: "Operatsion maqsad yoki birinchi muammo",
    purposePlaceholder: "Qaysi natija o‘zgarishi kerak va yakuniy qaror uchun kim javobgar?",
    website: "Rasmiy veb-sayt (ixtiyoriy)",
    structure: "Draftni tizimlash",
    useVoice: "Ovoz operatori bilan davom etish",
    voicePrompt: "Inson tasdiqlaydigan CBAI ish maydoni uchun tashkilotimni tushuntirishga yordam ber. Identifikatsiya, maqsad, odamlar, dalillar va qaror egasi haqida bittadan savol ber.",
    review: "Faollashtirishdan oldin tekshiring",
    understood: "CBAI tushungan holat",
    spaces: "Tavsiya etilgan operatsion maydonlar",
    assumptions: "Tekshirilishi kerak bo‘lgan taxminlar",
    unknowns: "Ko‘rinib turgan noma’lumlar",
    none: "Yo‘q",
    requiredMissing: "Tasdiqlashdan oldin nom va operatsion maqsad kiritilishi shart.",
    edit: "Draftni tahrirlash",
    confirm: "Tasdiqlayman — ish maydonini yaratish",
    waiting: "Tasdiqlangan ish maydoni yaratilmoqda…",
    boundary: "AI tizimlashi va taklif qilishi mumkin. Tashkilotni faqat sizning tasdig‘ingiz yaratadi.",
  },
} as const;

export default function CompanyOnboardingFlow({ busy, onConfirm }: CompanyOnboardingFlowProps) {
  const { language } = useTranslation();
  const voice = useVoiceOperator();
  const copy = language === "uz" ? COPY.uz : COPY.en;
  const [statement, setStatement] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<OrganizationKind>("company");
  const [missionStatement, setMissionStatement] = useState("");
  const [website, setWebsite] = useState("");
  const [draft, setDraft] = useState<CompanyOnboardingDraft | null>(null);

  const structureDraft = () => {
    setDraft(buildCompanyOnboardingDraft({ statement, name, kind, missionStatement, website }));
  };

  const confirmDraft = () => {
    if (!draft) return;
    const confirmed = confirmCompanyOnboardingDraft(draft, true);
    if (confirmed) onConfirm(confirmed);
  };

  const openVoice = () => {
    voice.setTextInput(copy.voicePrompt);
    voice.openDock();
  };

  return (
    <section
      id="create-org-heading"
      className="overflow-hidden rounded-[1.75rem] border border-cyan-300/15 bg-[color:var(--cbai-surface-solid)]"
      aria-labelledby="company-onboarding-title"
      data-company-onboarding={draft ? "review" : "capture"}
    >
      <div className="border-b border-[var(--cbai-border-subtle)] px-5 py-6 sm:px-7">
        <p className="text-[.67rem] font-semibold uppercase tracking-[.24em] text-cyan-400">{copy.eyebrow}</p>
        <h2 id="company-onboarding-title" className="mt-3 text-2xl font-semibold tracking-tight text-[var(--cbai-text-primary)] sm:text-3xl">
          {copy.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--cbai-text-secondary)]">{copy.intro}</p>
      </div>

      {!draft ? (
        <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label htmlFor="company-context" className="text-xs font-medium text-[var(--cbai-text-secondary)]">
              {copy.contextLabel}
            </label>
            <textarea
              id="company-context"
              value={statement}
              onChange={(event) => setStatement(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-[var(--cbai-border-default)] bg-[var(--cbai-canvas)] px-4 py-3 text-sm text-[var(--cbai-text-primary)] focus:border-cyan-400 focus:outline-none"
              placeholder={copy.contextPlaceholder}
            />
          </div>
          <label className="text-xs font-medium text-[var(--cbai-text-secondary)]">
            {copy.name}
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-canvas)] px-3 text-sm text-[var(--cbai-text-primary)]"
            />
          </label>
          <label className="text-xs font-medium text-[var(--cbai-text-secondary)]">
            {copy.kind}
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as OrganizationKind)}
              className="mt-2 min-h-11 w-full rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-canvas)] px-3 text-sm text-[var(--cbai-text-primary)]"
            >
              {ORGANIZATION_KINDS.map((organizationKind) => (
                <option key={organizationKind} value={organizationKind}>{organizationKind}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-[var(--cbai-text-secondary)] lg:col-span-2">
            {copy.purpose}
            <textarea
              value={missionStatement}
              onChange={(event) => setMissionStatement(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-canvas)] px-3 py-3 text-sm text-[var(--cbai-text-primary)]"
              placeholder={copy.purposePlaceholder}
            />
          </label>
          <label className="text-xs font-medium text-[var(--cbai-text-secondary)]">
            {copy.website}
            <input
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              inputMode="url"
              className="mt-2 min-h-11 w-full rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-canvas)] px-3 text-sm text-[var(--cbai-text-primary)]"
            />
          </label>
          <div className="flex flex-wrap items-end gap-2">
            <button type="button" onClick={structureDraft} className="min-h-11 rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950">
              {copy.structure}
            </button>
            <button type="button" onClick={openVoice} className="min-h-11 rounded-xl border border-cyan-300/25 px-5 text-sm font-medium text-cyan-300">
              {copy.useVoice}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,.9fr)]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[.045] p-5">
              <p className="text-[.67rem] font-semibold uppercase tracking-[.2em] text-cyan-400">{copy.understood}</p>
              <h3 className="mt-3 text-xl font-semibold text-[var(--cbai-text-primary)]">{draft.input.name || "—"}</h3>
              <p className="mt-1 text-sm text-[var(--cbai-text-secondary)]">{draft.suggestedKind}</p>
              <p className="mt-4 text-sm leading-6 text-[var(--cbai-text-primary)]">{draft.input.missionStatement || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--cbai-text-muted)]">{copy.spaces}</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {draft.suggestedSpaces.map((space) => (
                  <li key={space} className="rounded-xl border border-[var(--cbai-border-default)] p-3 text-sm text-[var(--cbai-text-secondary)]">
                    {space}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-[var(--cbai-border-default)] bg-[var(--cbai-canvas)] p-5">
            <div>
              <p className="text-xs font-semibold text-[var(--cbai-text-primary)]">{copy.assumptions}</p>
              <p className="mt-2 text-sm text-amber-300">{draft.assumptions.join(", ") || copy.none}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--cbai-text-primary)]">{copy.unknowns}</p>
              <p className="mt-2 text-sm text-[var(--cbai-text-secondary)]">{draft.unknowns.join(", ") || copy.none}</p>
            </div>
            {!draft.readyForHumanConfirmation ? (
              <p className="rounded-xl border border-amber-300/20 bg-amber-300/8 p-3 text-sm text-amber-200">{copy.requiredMissing}</p>
            ) : null}
            <p className="text-xs leading-5 text-[var(--cbai-text-muted)]">{copy.boundary}</p>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={confirmDraft}
                disabled={!draft.readyForHumanConfirmation || busy}
                className="min-h-11 rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? copy.waiting : copy.confirm}
              </button>
              <button type="button" onClick={() => setDraft(null)} disabled={busy} className="min-h-11 rounded-xl border border-[var(--cbai-border-default)] px-4 text-sm text-[var(--cbai-text-secondary)]">
                {copy.edit}
              </button>
              <button type="button" onClick={openVoice} disabled={busy} className="min-h-11 rounded-xl border border-cyan-300/20 px-4 text-sm text-cyan-300">
                {copy.useVoice}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
