"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useOperationalObjectsOptional } from "@/components/operational-objects/OperationalObjectProvider";
import {
  getProfessionTemplate,
  interpretProfession,
  localized,
} from "@/lib/personal-workspace/profession-engine";
import {
  clearPersonalWorkspace,
  getPersonalWorkspaceServerSnapshot,
  getPersonalWorkspaceSnapshot,
  savePersonalWorkspace,
  subscribePersonalWorkspace,
  togglePersonalTask,
} from "@/lib/personal-workspace/personal-workspace-store";

const COPY = {
  en: {
    eyebrow: "Block 01 · People",
    title: "Tell CBAI what you do. Build your daily operating desk.",
    body: "CBAI adapts the workflow to your profession, problem, and desired result. You review the interpretation before anything is created.",
    prompt: "What work do you do?",
    placeholder: "For example: I am a painter, cook, or scientist…",
    understand: "Understand me",
    understood: "CBAI understood",
    goal: "What must improve or be completed?",
    goalPlaceholder: "Describe today’s result or current problem…",
    confirm: "Confirm and create my desk",
    edit: "Edit",
    voice: "Say it by voice",
    today: "Today",
    progress: "Today’s progress",
    solve: "Open a problem",
    ask: "Ask CBAI",
    change: "Change profession",
    human: "AI structures the work. You confirm the plan and make the decisions.",
  },
  uz: {
    eyebrow: "1-blok · Insonlar",
    title: "Nima ish qilishingizni ayting. CBAI kundalik ish stolingizni qursin.",
    body: "CBAI ish oqimini kasbingiz, muammoingiz va kerakli natijaga moslaydi. Hech narsa yaratilishidan oldin tushunganini siz tasdiqlaysiz.",
    prompt: "Siz nima ish qilasiz?",
    placeholder: "Masalan: men malyarman, oshpazman yoki olimman…",
    understand: "Meni tushun",
    understood: "CBAI shunday tushundi",
    goal: "Nimani yaxshilash yoki yakunlash kerak?",
    goalPlaceholder: "Bugungi natija yoki hozirgi muammoni yozing…",
    confirm: "Tasdiqlash va stolimni yaratish",
    edit: "Tahrirlash",
    voice: "Ovoz bilan aytish",
    today: "Bugun",
    progress: "Bugungi progress",
    solve: "Muammoni ochish",
    ask: "CBAI’dan so‘rash",
    change: "Kasbni o‘zgartirish",
    human: "AI ishni tizimlaydi. Reja va yakuniy qarorni siz tasdiqlaysiz.",
  },
} as const;

export default function PersonalWorkspaceGateway() {
  const { language } = useTranslation();
  const locale = language === "uz" ? "uz" : "en";
  const copy = COPY[locale];
  const voice = useVoiceOperator();
  const objects = useOperationalObjectsOptional();
  const workspace = useSyncExternalStore(
    subscribePersonalWorkspace,
    getPersonalWorkspaceSnapshot,
    getPersonalWorkspaceServerSnapshot,
  );
  const [statement, setStatement] = useState("");
  const [goal, setGoal] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const interpretation = useMemo(() => interpretProfession(statement), [statement]);
  const template = getProfessionTemplate(workspace?.templateId ?? interpretation.templateId);

  function openVoiceWithContext(prompt: string) {
    voice.setTextInput(prompt);
    voice.openDock();
  }

  function confirmWorkspace() {
    const tasks = template.starterTasks.map((task) => ({
      id: task.id,
      label: localized(task.label, locale),
      completed: false,
    }));
    savePersonalWorkspace({
      version: 1,
      professionStatement: statement.trim(),
      templateId: template.id,
      goal: goal.trim(),
      createdAt: new Date().toISOString(),
      tasks,
    });
    objects?.openComposer(
      {
        type: "work_plan",
        title: localized(template.workspaceTitle, locale),
        summary: goal.trim(),
        objective: goal.trim(),
        rationale: `Confirmed personal workspace template: ${template.id}.`,
        expectedOutcome: goal.trim(),
        domain: template.id === "scientist" ? "research" : "general",
        status: "active",
        priority: "normal",
        requiredInputs: template.modules.map((module) => module.id),
        evidenceRequirements: ["Completion evidence confirmed by the human"],
        nextAction: tasks[0]?.label ?? "",
        humanDecision: "Human confirmed profession, goal, and workspace before creation.",
        knownInformation: [`profession:${statement.trim()}`, `template:${template.id}`],
        missingInformation: [],
        assumptions: [],
        humanApprovalRequired: true,
        relatedObjectIds: [],
        locale,
        provenance: {
          source: "manual",
          originalText: statement.trim(),
          locale,
          inferredFields: ["templateId"],
        },
      },
      ["templateId"],
      "manual",
    );
  }

  if (workspace) {
    const completed = workspace.tasks.filter((task) => task.completed).length;
    const percent = workspace.tasks.length
      ? Math.round((completed / workspace.tasks.length) * 100)
      : 0;
    return (
      <section
        className="overflow-hidden rounded-2xl border border-teal-300/25 bg-[linear-gradient(145deg,rgba(7,24,39,0.98),rgba(7,15,29,0.96))] shadow-[0_22px_80px_rgba(0,0,0,0.28)]"
        data-personal-workspace="daily-desk"
      >
        <header className="border-b border-white/10 p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-300">{copy.eyebrow}</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="cbai-display text-2xl font-semibold text-white">
                {localized(template.workspaceTitle, locale)}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">{workspace.goal}</p>
            </div>
            <div className="min-w-28 text-right">
              <p className="text-xs text-slate-400">{copy.progress}</p>
              <p className="mt-1 text-2xl font-semibold text-teal-200">{percent}%</p>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-400" style={{ width: `${percent}%` }} />
          </div>
        </header>

        <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
          <div>
            <h3 className="text-sm font-semibold text-white">{copy.today}</h3>
            <div className="mt-3 grid gap-2">
              {workspace.tasks.map((task) => (
                <label key={task.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => togglePersonalTask(task.id)}
                    className="h-4 w-4 accent-teal-400"
                  />
                  <span className={task.completed ? "text-sm text-slate-500 line-through" : "text-sm text-slate-100"}>
                    {task.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Workspace</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {template.modules.map((module) => (
                <Link key={module.id} href={module.route} className="min-h-20 rounded-xl border border-teal-300/15 bg-teal-950/20 p-3 text-sm font-medium text-teal-100 hover:border-teal-300/40">
                  {localized(module.label, locale)}
                  <span className="mt-3 block text-xs text-teal-300/60">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap gap-2 border-t border-white/10 px-5 py-4 sm:px-6">
          <Link href="/problems" className="inline-flex min-h-11 items-center rounded-full bg-teal-300 px-5 text-sm font-semibold text-slate-950">
            {copy.solve}
          </Link>
          <button
            type="button"
            onClick={() =>
              openVoiceWithContext(
                locale === "uz"
                  ? `${localized(template.workspaceTitle, locale)} uchun bugungi ishlarimni ko‘rib chiqishga yordam ber. Maqsadim: ${workspace.goal}`
                  : `Help me review today's work in my ${localized(template.workspaceTitle, locale)}. My goal: ${workspace.goal}`,
              )
            }
            className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-sm text-white"
          >
            {copy.ask}
          </button>
          <button type="button" onClick={clearPersonalWorkspace} className="ml-auto text-xs text-slate-500 hover:text-slate-300">
            {copy.change}
          </button>
        </footer>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-teal-300/25 bg-[linear-gradient(145deg,rgba(13,148,136,0.18),rgba(8,15,30,0.96)_54%)] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.25)] sm:p-6"
      data-personal-workspace={reviewing ? "awaiting-human-confirmation" : "profession-discovery"}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-300">{copy.eyebrow}</p>
      <h2 className="cbai-display mt-3 max-w-3xl text-2xl font-semibold leading-tight text-white sm:text-3xl">{copy.title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{copy.body}</p>

      <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/40 p-4">
        <label htmlFor="profession-statement" className="text-sm font-semibold text-white">{copy.prompt}</label>
        <textarea
          id="profession-statement"
          value={statement}
          onChange={(event) => {
            setStatement(event.target.value);
            setReviewing(false);
          }}
          rows={2}
          placeholder={copy.placeholder}
          className="mt-2 w-full rounded-xl border border-white/15 bg-[#07101f] px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:border-teal-300/60 focus:outline-none"
        />
        {!reviewing ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!statement.trim()}
              onClick={() => setReviewing(true)}
              className="inline-flex min-h-11 items-center rounded-full bg-teal-300 px-5 text-sm font-semibold text-slate-950 disabled:opacity-40"
            >
              {copy.understand}
            </button>
            <button
              type="button"
              onClick={() =>
                openVoiceWithContext(
                  locale === "uz"
                    ? "Kasbim va kundalik ishimni aniqlash uchun menga savollar bering."
                    : "Ask me questions to understand my profession and daily work.",
                )
              }
              className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-sm text-white"
            >
              {copy.voice}
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4" data-human-checkpoint="profession-confirmation">
            <div className="rounded-xl border border-teal-300/25 bg-teal-950/25 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-teal-300">{copy.understood}</p>
              <p className="mt-2 text-lg font-semibold text-white">{localized(template.label, locale)}</p>
              {interpretation.followUp ? <p className="mt-1 text-xs text-slate-400">{interpretation.followUp}</p> : null}
            </div>
            <div>
              <label htmlFor="personal-goal" className="text-sm font-semibold text-white">{copy.goal}</label>
              <textarea
                id="personal-goal"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                rows={2}
                placeholder={copy.goalPlaceholder}
                className="mt-2 w-full rounded-xl border border-white/15 bg-[#07101f] px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:border-teal-300/60 focus:outline-none"
              />
            </div>
            <p className="text-xs text-slate-400">{copy.human}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!goal.trim()}
                onClick={confirmWorkspace}
                className="inline-flex min-h-11 items-center rounded-full bg-teal-300 px-5 text-sm font-semibold text-slate-950 disabled:opacity-40"
              >
                {copy.confirm}
              </button>
              <button type="button" onClick={() => setReviewing(false)} className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-slate-400">
                {copy.edit}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
