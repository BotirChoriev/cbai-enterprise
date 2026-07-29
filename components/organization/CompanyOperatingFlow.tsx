"use client";

import Link from "next/link";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useTranslation } from "@/lib/i18n/use-translation";

type CompanyOperatingFlowProps = {
  organizationName: string | null;
  memberCount: number;
  pendingInvitationCount: number;
  auditEventCount: number;
};

const COPY = {
  en: {
    eyebrow: "Company Collaborative Intelligence OS",
    title: "One company. One shared decision process.",
    body: "CBAI keeps identity, people, problems, evidence, approvals, and monitoring in one operating context. AI structures the work; accountable people decide.",
    voice: "Shape this workspace with Voice Operator",
    identity: "Identity",
    identityBody: "Confirm who the organization is and why this workspace exists.",
    people: "People",
    peopleBody: "Assign access and responsibility without losing accountability.",
    problem: "Problem",
    problemBody: "Open decision-worthy work with a named human owner.",
    evidence: "Evidence",
    evidenceBody: "Connect verified material, gaps, and contradictions.",
    decision: "Human decision",
    decisionBody: "Compare paths and record the authorized judgment.",
    monitoring: "Monitor",
    monitoringBody: "Watch outcomes, triggers, and reasons to review.",
    configured: "Workspace configured",
    waiting: "Awaiting human confirmation",
    liveContext: "Live operating context",
    members: "Members",
    invitations: "Pending invitations",
    audit: "Audit events",
    openProblem: "Open a company problem",
    reviewEvidence: "Review evidence",
    collaboration: "Open collaboration room",
    governance: "Review governance",
    noOrg: "Confirm the organization identity below to unlock the shared operating context.",
  },
  uz: {
    eyebrow: "Kompaniya Collaborative Intelligence OS",
    title: "Bitta kompaniya. Bitta umumiy qaror jarayoni.",
    body: "CBAI identifikatsiya, odamlar, muammolar, dalillar, tasdiqlar va monitoringni bitta operatsion kontekstda saqlaydi. AI ishni tizimlaydi; mas’ul insonlar qaror beradi.",
    voice: "Ish maydonini Ovoz operatori bilan shakllantirish",
    identity: "Identifikatsiya",
    identityBody: "Tashkilot kimligi va bu maydon nima uchun ochilganini tasdiqlang.",
    people: "Odamlar",
    peopleBody: "Hisobdorlikni yo‘qotmasdan ruxsat va mas’uliyat bering.",
    problem: "Muammo",
    problemBody: "Inson egasi belgilangan qaror talab qiluvchi ishni oching.",
    evidence: "Dalillar",
    evidenceBody: "Tekshirilgan material, bo‘shliq va qarama-qarshiliklarni ulang.",
    decision: "Inson qarori",
    decisionBody: "Yo‘llarni taqqoslang va vakolatli inson hukmini qayd eting.",
    monitoring: "Monitoring",
    monitoringBody: "Natija, trigger va qayta ko‘rish sabablarini kuzating.",
    configured: "Ish maydoni sozlangan",
    waiting: "Inson tasdig‘i kutilmoqda",
    liveContext: "Jonli operatsion kontekst",
    members: "A’zolar",
    invitations: "Kutilayotgan takliflar",
    audit: "Audit hodisalari",
    openProblem: "Kompaniya muammosini ochish",
    reviewEvidence: "Dalillarni tekshirish",
    collaboration: "Hamkorlik xonasini ochish",
    governance: "Boshqaruvni tekshirish",
    noOrg: "Umumiy operatsion kontekstni ochish uchun quyida tashkilot identifikatsiyasini tasdiqlang.",
  },
} as const;

export default function CompanyOperatingFlow({
  organizationName,
  memberCount,
  pendingInvitationCount,
  auditEventCount,
}: CompanyOperatingFlowProps) {
  const { language } = useTranslation();
  const { openDock } = useVoiceOperator();
  const copy = language === "uz" ? COPY.uz : COPY.en;
  const configured = Boolean(organizationName);

  const stages = [
    [copy.identity, copy.identityBody, configured],
    [copy.people, copy.peopleBody, configured && memberCount > 0],
    [copy.problem, copy.problemBody, false],
    [copy.evidence, copy.evidenceBody, false],
    [copy.decision, copy.decisionBody, false],
    [copy.monitoring, copy.monitoringBody, false],
  ] as const;

  return (
    <section
      className="overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[linear-gradient(145deg,rgba(5,18,31,.98),rgba(7,29,43,.94)_58%,rgba(7,45,52,.9))] shadow-[0_32px_90px_rgba(0,0,0,.28)]"
      aria-labelledby="company-operating-flow-title"
      data-company-operating-flow={configured ? "configured" : "awaiting_identity"}
    >
      <div className="grid gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,.92fr)] lg:px-10 lg:py-10">
        <div>
          <p className="text-[.68rem] font-semibold uppercase tracking-[.28em] text-cyan-300">
            {copy.eyebrow}
          </p>
          <h2
            id="company-operating-flow-title"
            className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-.035em] text-white sm:text-4xl lg:text-5xl"
          >
            {copy.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{copy.body}</p>

          <button
            type="button"
            onClick={openDock}
            className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-5 text-sm font-medium text-cyan-50 transition hover:border-cyan-200/50 hover:bg-cyan-300/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            <span className="grid size-7 place-items-center rounded-full bg-cyan-300 text-slate-950" aria-hidden="true">
              ◉
            </span>
            {copy.voice}
          </button>
        </div>

        <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/45 p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[.65rem] font-semibold uppercase tracking-[.22em] text-slate-500">
                {copy.liveContext}
              </p>
              <p className="mt-2 text-xl font-semibold text-white">{organizationName ?? copy.waiting}</p>
            </div>
            <span
              className={`mt-1 size-3 rounded-full ${
                configured ? "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.8)]" : "bg-amber-300"
              }`}
              aria-hidden="true"
            />
          </div>

          {configured ? (
            <dl className="mt-7 grid grid-cols-3 gap-2">
              {[
                [copy.members, memberCount],
                [copy.invitations, pendingInvitationCount],
                [copy.audit, auditEventCount],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-white/[.035] p-3">
                  <dt className="text-[.65rem] leading-4 text-slate-500">{label}</dt>
                  <dd className="mt-2 text-2xl font-semibold text-white">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4 text-sm leading-6 text-amber-100">
              {copy.noOrg}
            </p>
          )}

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Link href="/?openProblem=1" className="rounded-xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950">
              {copy.openProblem}
            </Link>
            <Link href="/evidence" className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-center text-sm font-medium text-slate-100">
              {copy.reviewEvidence}
            </Link>
            <Link href="/rooms" className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-center text-sm font-medium text-slate-100">
              {copy.collaboration}
            </Link>
            <Link href="/governance" className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-center text-sm font-medium text-slate-100">
              {copy.governance}
            </Link>
          </div>
        </div>
      </div>

      <ol className="grid border-t border-white/10 sm:grid-cols-2 xl:grid-cols-6" aria-label={copy.title}>
        {stages.map(([title, body, complete], index) => (
          <li
            key={title}
            className={`relative min-h-36 border-white/10 p-5 sm:border-r ${
              complete ? "bg-cyan-300/[.075]" : "bg-slate-950/20"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[.67rem] tracking-[.18em] text-slate-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={`size-2 rounded-full ${complete ? "bg-cyan-300" : "border border-slate-600"}`}
                aria-hidden="true"
              />
            </div>
            <h3 className="mt-5 text-sm font-semibold text-white">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
