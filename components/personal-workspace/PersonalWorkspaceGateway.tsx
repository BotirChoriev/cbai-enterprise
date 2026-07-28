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
  addPersonalMaterials,
  clearPersonalWorkspace,
  confirmPersonalOutcome,
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
    plan: "Open full work plan",
    ask: "Ask CBAI",
    change: "Change profession",
    human: "AI structures the work. You confirm the plan and make the decisions.",
    sections: "Suggested workspace sections",
    sectionsHint: "Choose the sections you want. CBAI will keep the rest in the background.",
    materials: "Materials",
    materialHint: "Images, video, audio, PDF, documents, spreadsheets, and device exports.",
    addMaterial: "Choose files",
    confirmMaterials: "Confirm and link",
    composerPlaceholder: "Write, speak, or add material…",
    sendToCbai: "Work with CBAI",
    decisionQueue: "Your decision queue",
    verifyTitle: "Verify today’s outcome",
    verifyBody: "The tasks are complete. Confirm the real result before CBAI learns from it.",
    verifyPlaceholder: "What happened? What worked, failed, or changed?",
    verifyConfirm: "Confirm outcome",
    linkedMaterials: "Confirmed materials",
    verifiedLearning: "Verified learning",
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
    plan: "To‘liq ish rejasini ochish",
    ask: "CBAI’dan so‘rash",
    change: "Kasbni o‘zgartirish",
    human: "AI ishni tizimlaydi. Reja va yakuniy qarorni siz tasdiqlaysiz.",
    sections: "Tavsiya qilingan workspace bo‘limlari",
    sectionsHint: "Kerakli bo‘limlarni tanlang. Qolganlari orqa fonda qoladi.",
    materials: "Materiallar",
    materialHint: "Rasm, video, audio, PDF, hujjat, jadval va qurilma eksportlari.",
    addMaterial: "Fayl tanlash",
    confirmMaterials: "Tasdiqlash va ulash",
    composerPlaceholder: "Yozing, gapiring yoki material qo‘shing…",
    sendToCbai: "CBAI bilan ishlash",
    decisionQueue: "Sizning qaror navbatingiz",
    verifyTitle: "Bugungi natijani tekshirish",
    verifyBody: "Vazifalar bajarildi. CBAI bundan o‘rganishidan oldin haqiqiy natijani tasdiqlang.",
    verifyPlaceholder: "Nima bo‘ldi? Nima ishladi, ishlamadi yoki o‘zgardi?",
    verifyConfirm: "Natijani tasdiqlash",
    linkedMaterials: "Tasdiqlangan materiallar",
    verifiedLearning: "Tasdiqlangan o‘rganish",
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
  const [selectedModuleIds, setSelectedModuleIds] = useState<readonly string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<readonly File[]>([]);
  const [composerText, setComposerText] = useState("");
  const [learningNote, setLearningNote] = useState("");
  const interpretation = useMemo(() => interpretProfession(statement), [statement]);
  const template = getProfessionTemplate(workspace?.templateId ?? interpretation.templateId);

  function openVoiceWithContext(prompt: string) {
    voice.setTextInput(prompt);
    voice.openDock();
  }

  function openOperationalPlan(input: {
    professionStatement: string;
    goal: string;
    tasks: readonly { readonly label: string }[];
  }) {
    objects?.openComposer(
      {
        type: "work_plan",
        title: localized(template.workspaceTitle, locale),
        summary: input.goal,
        objective: input.goal,
        rationale: `Confirmed personal workspace template: ${template.id}.`,
        expectedOutcome: input.goal,
        domain: template.id === "scientist" ? "research" : "general",
        status: "active",
        priority: "normal",
        requiredInputs: template.modules.map((module) => module.id),
        evidenceRequirements: ["Completion evidence confirmed by the human"],
        nextAction: input.tasks[0]?.label ?? "",
        humanDecision: "Human confirmed profession, goal, and workspace before creation.",
        knownInformation: [`profession:${input.professionStatement}`, `template:${template.id}`],
        missingInformation: [],
        assumptions: [],
        humanApprovalRequired: true,
        relatedObjectIds: [],
        locale,
        provenance: {
          source: "manual",
          originalText: input.professionStatement,
          locale,
          inferredFields: ["templateId"],
        },
      },
      ["templateId"],
      "manual",
    );
  }

  function confirmWorkspace() {
    const tasks = template.starterTasks.map((task) => ({
      id: task.id,
      label: localized(task.label, locale),
      completed: false,
    }));
    savePersonalWorkspace({
      version: 2,
      professionStatement: statement.trim(),
      templateId: template.id,
      goal: goal.trim(),
      createdAt: new Date().toISOString(),
      tasks,
      selectedModuleIds,
      materials: [],
      currentStage: "act",
      decisions: [],
      learningNote: null,
    });
  }

  function beginReview() {
    setSelectedModuleIds(template.modules.map((module) => module.id));
    setReviewing(true);
  }

  function toggleModule(moduleId: string) {
    setSelectedModuleIds((current) =>
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId],
    );
  }

  function confirmPendingFiles() {
    addPersonalMaterials(
      pendingFiles.map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
      })),
    );
    setPendingFiles([]);
  }

  if (workspace) {
    const completed = workspace.tasks.filter((task) => task.completed).length;
    const percent = workspace.tasks.length
      ? Math.round((completed / workspace.tasks.length) * 100)
      : 0;
    const visibleModules = template.modules.filter(
      (module) =>
        workspace.selectedModuleIds.length === 0 ||
        workspace.selectedModuleIds.includes(module.id),
    );
    const stages = ["sense", "structure", "compare", "decide", "act", "verify", "learn"] as const;
    const currentStageIndex = stages.indexOf(workspace.currentStage);
    const pendingDecisions = workspace.decisions.filter((decision) => decision.status === "pending");
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
          <ol className="mt-4 grid grid-cols-7 gap-1" aria-label="CBAI cybernetic work loop">
            {stages.map((stage, index) => (
              <li
                key={stage}
                className={`rounded-md px-1 py-1.5 text-center text-[9px] font-semibold uppercase tracking-wide ${
                  index <= currentStageIndex
                    ? "bg-teal-300/15 text-teal-200"
                    : "bg-white/[0.035] text-slate-600"
                }`}
              >
                {stage}
              </li>
            ))}
          </ol>
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
              {visibleModules.map((module) => (
                <Link key={module.id} href={module.route} className="min-h-20 rounded-xl border border-teal-300/15 bg-teal-950/20 p-3 text-sm font-medium text-teal-100 hover:border-teal-300/40">
                  {localized(module.label, locale)}
                  <span className="mt-3 block text-xs text-teal-300/60">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-5 sm:px-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.6fr)]">
            <div>
              <h3 className="text-sm font-semibold text-white">{copy.materials}</h3>
              <p className="mt-1 text-xs text-slate-400">{copy.materialHint}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-white/15 px-4 text-sm text-white">
                  + {copy.addMaterial}
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.json,.xml,.txt"
                    className="sr-only"
                    onChange={(event) => setPendingFiles(Array.from(event.target.files ?? []))}
                  />
                </label>
                {pendingFiles.length ? (
                  <button
                    type="button"
                    onClick={confirmPendingFiles}
                    className="inline-flex min-h-11 items-center rounded-full bg-amber-300 px-4 text-sm font-semibold text-slate-950"
                  >
                    {copy.confirmMaterials} · {pendingFiles.length}
                  </button>
                ) : null}
              </div>
              {workspace.materials.length ? (
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{copy.linkedMaterials}</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {workspace.materials.map((material) => (
                      <li key={material.id} className="rounded-full border border-emerald-300/20 bg-emerald-950/20 px-3 py-1.5 text-xs text-emerald-100">
                        {material.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="rounded-xl border border-white/10 bg-black/15 p-3">
              <label htmlFor="personal-cbai-composer" className="sr-only">{copy.composerPlaceholder}</label>
              <textarea
                id="personal-cbai-composer"
                value={composerText}
                onChange={(event) => setComposerText(event.target.value)}
                rows={2}
                placeholder={copy.composerPlaceholder}
                className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!composerText.trim()}
                  onClick={() => {
                    openVoiceWithContext(
                      `${composerText.trim()}\n\nWorkspace: ${localized(template.workspaceTitle, locale)}\nGoal: ${workspace.goal}`,
                    );
                    setComposerText("");
                  }}
                  className="inline-flex min-h-10 items-center rounded-full bg-teal-300 px-4 text-xs font-semibold text-slate-950 disabled:opacity-40"
                >
                  {copy.sendToCbai}
                </button>
              </div>
            </div>
          </div>
        </div>

        {pendingDecisions.length || workspace.currentStage === "verify" ? (
          <section className="border-t border-amber-300/20 bg-amber-950/10 px-5 py-5 sm:px-6" data-human-decision-queue="">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">{copy.decisionQueue}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{copy.verifyTitle}</h3>
            <p className="mt-1 text-sm text-slate-300">{copy.verifyBody}</p>
            <textarea
              value={learningNote}
              onChange={(event) => setLearningNote(event.target.value)}
              rows={2}
              placeholder={copy.verifyPlaceholder}
              className="mt-3 w-full rounded-xl border border-amber-300/20 bg-[#07101f] px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="button"
              disabled={!learningNote.trim()}
              onClick={() => confirmPersonalOutcome(learningNote)}
              className="mt-3 inline-flex min-h-11 items-center rounded-full bg-amber-300 px-5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copy.verifyConfirm}
            </button>
          </section>
        ) : null}

        {workspace.currentStage === "learn" && workspace.learningNote ? (
          <section className="border-t border-emerald-300/15 bg-emerald-950/10 px-5 py-4 sm:px-6" data-verified-learning="">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">{copy.verifiedLearning}</p>
            <p className="mt-2 text-sm leading-6 text-emerald-50">{workspace.learningNote}</p>
          </section>
        ) : null}

        <footer className="flex flex-wrap gap-2 border-t border-white/10 px-5 py-4 sm:px-6">
          <Link href="/problems" className="inline-flex min-h-11 items-center rounded-full bg-teal-300 px-5 text-sm font-semibold text-slate-950">
            {copy.solve}
          </Link>
          <button
            type="button"
            onClick={() => openOperationalPlan(workspace)}
            className="inline-flex min-h-11 items-center rounded-full border border-teal-300/30 px-5 text-sm text-teal-100"
          >
            {copy.plan}
          </button>
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
              onClick={beginReview}
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="personal-goal" className="text-sm font-semibold text-white">{copy.goal}</label>
                <button
                  type="button"
                  onClick={() =>
                    openVoiceWithContext(
                      locale === "uz"
                        ? `Kasbim: ${statement.trim()}. Asosiy maqsadim yoki muammoimni aniqlashga yordam bering.`
                        : `My profession: ${statement.trim()}. Help me define my main goal or problem.`,
                    )
                  }
                  className="text-xs text-teal-200 hover:text-teal-100"
                >
                  🎙 {copy.voice}
                </button>
              </div>
              <textarea
                id="personal-goal"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                rows={2}
                placeholder={copy.goalPlaceholder}
                className="mt-2 w-full rounded-xl border border-white/15 bg-[#07101f] px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:border-teal-300/60 focus:outline-none"
              />
            </div>
            <fieldset>
              <legend className="text-sm font-semibold text-white">{copy.sections}</legend>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-400">{copy.sectionsHint}</p>
                <button
                  type="button"
                  onClick={() =>
                    openVoiceWithContext(
                      locale === "uz"
                        ? `${statement.trim()} uchun kundalik ish stolida qaysi bo‘limlar kerakligini men bilan aniqlang.`
                        : `Help me decide which daily workspace sections I need for ${statement.trim()}.`,
                    )
                  }
                  className="text-xs text-teal-200 hover:text-teal-100"
                >
                  🎙 {copy.voice}
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {template.modules.map((module) => (
                  <label key={module.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedModuleIds.includes(module.id)}
                      onChange={() => toggleModule(module.id)}
                      className="h-4 w-4 accent-teal-400"
                    />
                    <span className="text-sm text-slate-100">{localized(module.label, locale)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="text-xs text-slate-400">{copy.human}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!goal.trim() || selectedModuleIds.length === 0}
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
