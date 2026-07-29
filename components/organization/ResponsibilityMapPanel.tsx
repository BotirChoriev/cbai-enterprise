"use client";

import { useEffect, useMemo, useState } from "react";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { OrganizationMembership } from "@/lib/organization-os/organization-membership-store";
import {
  RESPONSIBILITY_ROLES,
  confirmResponsibilityMapDraft,
  deriveResponsibilityMapDraft,
  type ResponsibilityRole,
} from "@/lib/organization-os/responsibility-map";
import {
  loadResponsibilityMap,
  persistConfirmedResponsibilityMap,
} from "@/lib/organization-os/responsibility-map-persistence";

type ResponsibilityMapPanelProps = {
  organizationId: string;
  organizationName: string;
  members: readonly OrganizationMembership[];
  problems: readonly { readonly id: string; readonly title: string }[];
  sharedPersistence: boolean;
};

const COPY = {
  en: {
    eyebrow: "People & Responsibility Engine",
    title: "Make responsibility visible before work begins.",
    body: "CBAI proposes accountable roles from real organization members. Review gaps and separation-of-duty conflicts before confirming anything.",
    sessionOnly: "Session draft only — no responsibility assignment is written to the database.",
    sharedNotice: "AI prepares the draft. Only your explicit confirmation writes the map and audit event.",
    role: "Responsibility",
    assignee: "Accountable member",
    unassigned: "Unassigned",
    suggested: "AI suggestion",
    changed: "Human selection",
    gaps: "Required roles still empty",
    conflicts: "Conflicts to resolve",
    ready: "Ready for human review",
    notReady: "Resolve every required gap and conflict first.",
    confirm: "Confirm this draft for the current session",
    confirmed: "Human-reviewed session draft",
    reset: "Reset suggestions",
    voice: "Review with Voice Operator",
    voicePrompt: "Review this company responsibility map with me. Ask who owns the problem, who reviews evidence, who makes the final decision, and who independently monitors the result. Do not assign anyone without my confirmation.",
    problem: "Problem Space",
    chooseProblem: "Choose a confirmed problem",
    noProblem: "Open and confirm a Problem before saving responsibilities.",
    saved: "Saved after human confirmation",
    saveFailed: "The confirmed map could not be saved.",
    roles: {
      problem_owner: "Problem owner",
      evidence_contributor: "Evidence contributor",
      evidence_reviewer: "Evidence reviewer",
      scenario_reviewer: "Scenario reviewer",
      decision_owner: "Decision owner",
      action_owner: "Action owner",
      monitoring_owner: "Monitoring owner",
      observer: "Observer",
    },
    conflictLabels: {
      decision_owner_is_evidence_reviewer: "The final decision owner cannot review their own evidence.",
      decision_owner_is_only_scenario_reviewer: "The final decision owner cannot be the only scenario reviewer.",
      problem_has_no_independent_monitor: "The problem owner needs an independent monitoring owner.",
    },
  },
  uz: {
    eyebrow: "Odamlar va mas’uliyat mexanizmi",
    title: "Ish boshlanishidan oldin mas’uliyatni ko‘rinadigan qiling.",
    body: "CBAI haqiqiy tashkilot a’zolaridan mas’ul rollarni taklif qiladi. Hech narsani tasdiqlashdan oldin bo‘shliqlar va vakolat konfliktlarini tekshiring.",
    sessionOnly: "Faqat session draft — hech qanday mas’uliyat database’ga yozilmaydi.",
    sharedNotice: "AI draft tayyorlaydi. Faqat sizning aniq tasdig‘ingiz xarita va audit eventni yozadi.",
    role: "Mas’uliyat",
    assignee: "Javobgar a’zo",
    unassigned: "Belgilanmagan",
    suggested: "AI taklifi",
    changed: "Inson tanlovi",
    gaps: "Bo‘sh qolgan majburiy rollar",
    conflicts: "Hal qilinadigan konfliktlar",
    ready: "Inson tekshiruviga tayyor",
    notReady: "Avval barcha majburiy bo‘shliq va konfliktlarni hal qiling.",
    confirm: "Bu draftni joriy session uchun tasdiqlash",
    confirmed: "Inson tekshirgan session draft",
    reset: "Takliflarni tiklash",
    voice: "Ovoz operatori bilan tekshirish",
    voicePrompt: "Kompaniya mas’uliyat xaritasini men bilan tekshir. Muammo egasi, dalil tekshiruvchisi, yakuniy qaror egasi va natijani mustaqil kuzatuvchi kimligini bittadan so‘ra. Mening tasdig‘imsiz hech kimni belgilama.",
    problem: "Muammo maydoni",
    chooseProblem: "Tasdiqlangan muammoni tanlang",
    noProblem: "Mas’uliyatlarni saqlashdan oldin muammoni oching va tasdiqlang.",
    saved: "Inson tasdig‘idan keyin saqlandi",
    saveFailed: "Tasdiqlangan xaritani saqlab bo‘lmadi.",
    roles: {
      problem_owner: "Muammo egasi",
      evidence_contributor: "Dalil kirituvchi",
      evidence_reviewer: "Dalil tekshiruvchisi",
      scenario_reviewer: "Ssenariy tekshiruvchisi",
      decision_owner: "Qaror egasi",
      action_owner: "Amal egasi",
      monitoring_owner: "Monitoring egasi",
      observer: "Kuzatuvchi",
    },
    conflictLabels: {
      decision_owner_is_evidence_reviewer: "Yakuniy qaror egasi o‘z dalilini o‘zi tekshirmasligi kerak.",
      decision_owner_is_only_scenario_reviewer: "Yakuniy qaror egasi yagona ssenariy tekshiruvchisi bo‘lmasligi kerak.",
      problem_has_no_independent_monitor: "Muammo egasidan mustaqil monitoring egasi kerak.",
    },
  },
} as const;

export default function ResponsibilityMapPanel({
  organizationId,
  organizationName,
  members,
  problems,
  sharedPersistence,
}: ResponsibilityMapPanelProps) {
  const { language } = useTranslation();
  const voice = useVoiceOperator();
  const copy = language === "uz" ? COPY.uz : COPY.en;
  const [overrides, setOverrides] = useState<Partial<Record<ResponsibilityRole, string | null>>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [problemId, setProblemId] = useState(problems[0]?.id ?? "");
  const [version, setVersion] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const draft = useMemo(() => deriveResponsibilityMapDraft(members, overrides), [members, overrides]);

  const memberName = new Map(members.map((member) => [member.id, member.userDisplayName]));

  useEffect(() => {
    if (!problemId || !sharedPersistence) return;
    let active = true;
    void loadResponsibilityMap(organizationId, problemId).then((saved) => {
      if (!active) return;
      if (saved) {
        setOverrides(saved.assignments);
        setVersion(saved.version);
        setConfirmed(true);
        setSaveState("saved");
      } else {
        setOverrides({});
        setVersion(0);
        setConfirmed(false);
        setSaveState("idle");
      }
    });
    return () => {
      active = false;
    };
  }, [organizationId, problemId, sharedPersistence]);

  const updateAssignment = (role: ResponsibilityRole, memberId: string) => {
    setConfirmed(false);
    setOverrides((current) => ({ ...current, [role]: memberId || null }));
  };

  const openVoice = () => {
    voice.setTextInput(`${copy.voicePrompt} Organization: ${organizationName}.`);
    voice.openDock();
  };

  const confirmAndPersist = () => {
    const reviewed = confirmResponsibilityMapDraft(draft, true);
    if (!reviewed) return;
    setConfirmed(true);
    if (!sharedPersistence || !problemId) return;
    setSaveState("saving");
    void persistConfirmedResponsibilityMap({
      organizationId,
      problemLocalId: problemId,
      draft: reviewed,
      expectedVersion: version,
    }).then((result) => {
      if (!result.ok) {
        setSaveState("error");
        return;
      }
      setVersion(result.value.version);
      setSaveState("saved");
    });
  };

  return (
    <section
      className="overflow-hidden rounded-[1.75rem] border border-violet-300/15 bg-[linear-gradient(145deg,rgba(10,18,34,.98),rgba(18,21,45,.94))]"
      aria-labelledby="responsibility-map-title"
      data-responsibility-map={confirmed ? "human_reviewed_session" : "draft"}
    >
      <div className="grid gap-5 border-b border-white/10 px-5 py-6 sm:px-7 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-[.67rem] font-semibold uppercase tracking-[.24em] text-violet-300">{copy.eyebrow}</p>
          <h2 id="responsibility-map-title" className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{copy.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{copy.body}</p>
          <p className="mt-3 text-xs text-amber-200">{sharedPersistence ? copy.sharedNotice : copy.sessionOnly}</p>
        </div>
        <button type="button" onClick={openVoice} className="min-h-11 self-end rounded-full border border-violet-300/25 px-5 text-sm font-medium text-violet-200">
          {copy.voice}
        </button>
      </div>

      <div className="grid gap-5 p-5 sm:p-7 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <label className="block rounded-2xl border border-violet-300/15 bg-violet-300/[.04] p-4">
            <span className="text-xs font-semibold text-violet-200">{copy.problem}</span>
            <select
              value={problemId}
              onChange={(event) => setProblemId(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-slate-100"
            >
              <option value="">{copy.chooseProblem}</option>
              {problems.map((problem) => <option key={problem.id} value={problem.id}>{problem.title}</option>)}
            </select>
            {!problems.length ? <span className="mt-2 block text-xs text-amber-200">{copy.noProblem}</span> : null}
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {RESPONSIBILITY_ROLES.map((role) => {
            const assignment = draft.assignments.find((item) => item.role === role);
            return (
              <label key={role} className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                <span className="block text-xs font-semibold text-white">{copy.roles[role]}</span>
                <span className="mt-1 block text-[.65rem] uppercase tracking-[.14em] text-slate-500">
                  {assignment?.suggested ? copy.suggested : copy.changed}
                </span>
                <select
                  value={assignment?.memberId ?? ""}
                  onChange={(event) => updateAssignment(role, event.target.value)}
                  className="mt-3 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-slate-100"
                  aria-label={`${copy.roles[role]} — ${copy.assignee}`}
                >
                  <option value="">{copy.unassigned}</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.userDisplayName} · {member.role}
                    </option>
                  ))}
                </select>
                {assignment?.memberId ? (
                  <span className="mt-2 block text-xs text-slate-500">{memberName.get(assignment.memberId)}</span>
                ) : null}
              </label>
            );
            })}
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/55 p-5">
          <div>
            <p className="text-xs font-semibold text-white">{copy.gaps}</p>
            <ul className="mt-2 space-y-1 text-sm text-amber-200">
              {draft.gaps.length ? draft.gaps.map((gap) => <li key={gap}>{copy.roles[gap]}</li>) : <li>—</li>}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{copy.conflicts}</p>
            <ul className="mt-2 space-y-1 text-sm text-rose-200">
              {draft.conflicts.length
                ? draft.conflicts.map((conflict) => <li key={conflict}>{copy.conflictLabels[conflict]}</li>)
                : <li>—</li>}
            </ul>
          </div>
          <p className={`rounded-xl border p-3 text-sm ${draft.readyForHumanReview ? "border-emerald-300/20 bg-emerald-300/8 text-emerald-200" : "border-amber-300/20 bg-amber-300/8 text-amber-200"}`}>
            {draft.readyForHumanReview ? copy.ready : copy.notReady}
          </p>
          <button
            type="button"
            onClick={confirmAndPersist}
            disabled={!draft.readyForHumanReview || (sharedPersistence && !problemId) || saveState === "saving"}
            className="min-h-11 w-full rounded-xl bg-violet-300 px-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {confirmed ? copy.confirmed : copy.confirm}
          </button>
          {saveState === "saved" ? <p className="text-xs text-emerald-300">{copy.saved} · v{version}</p> : null}
          {saveState === "error" ? <p className="text-xs text-rose-300">{copy.saveFailed}</p> : null}
          <button
            type="button"
            onClick={() => {
              setOverrides({});
              setConfirmed(false);
              setSaveState("idle");
            }}
            className="min-h-11 w-full rounded-xl border border-white/10 px-4 text-sm text-slate-300"
          >
            {copy.reset}
          </button>
        </aside>
      </div>
    </section>
  );
}
