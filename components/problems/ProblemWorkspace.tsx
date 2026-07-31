"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { listProblems, subscribeProblems } from "@/lib/problems/problem-repository";
import type { Problem } from "@/lib/problems/problem.types";
import ProblemInvestigationPanel from "@/components/problems/ProblemInvestigationPanel";
import ProblemDecisionWorkspace from "@/components/problems/ProblemDecisionWorkspace";
import ProblemCloudStatus from "@/components/problems/ProblemCloudStatus";
import DecisionJourneyHero from "@/components/experience/DecisionJourneyHero";

const COPY = {
  en: {
    title: "Problem Space",
    purpose: "AI investigates and structures the work. You evaluate and decide.",
    empty: "No confirmed Problem is open yet.",
    back: "Open a Problem",
    evidence: "Evidence",
    contradictions: "Contradictions",
    unknowns: "Unknowns",
    scenarios: "Scenarios",
    decision: "Human decision",
    monitoring: "Monitoring",
    confirmed: "Confirmed by a human",
    outcome: "Desired outcome",
  },
  uz: {
    title: "Muammo maydoni",
    purpose: "AI tekshiradi va ishni tizimlashtiradi. Siz baholaysiz va qaror qilasiz.",
    empty: "Hali inson tasdiqlagan muammo ochilmagan.",
    back: "Muammo ochish",
    evidence: "Dalillar",
    contradictions: "Qarama-qarshiliklar",
    unknowns: "Noma’lumlar",
    scenarios: "Ssenariylar",
    decision: "Inson qarori",
    monitoring: "Monitoring",
    confirmed: "Inson tomonidan tasdiqlangan",
    outcome: "Kutilgan natija",
  },
} as const;

export default function ProblemWorkspace() {
  const searchParams = useSearchParams();
  const [problems, setProblems] = useState<readonly Problem[]>([]);
  useEffect(() => {
    const refresh = () => setProblems(listProblems());
    refresh();
    return subscribeProblems(refresh);
  }, []);
  const requestedId = searchParams.get("problemId");
  const problem = requestedId
    ? problems.find((item) => item.id === requestedId) ?? null
    : problems[0] ?? null;
  const brief = problem?.briefs.find((item) => item.version === problem.currentBriefVersion);
  const locale = brief?.contentLocale === "uz" ? "uz" : "en";
  const copy = COPY[locale];

  if (!problem || !brief) {
    return (
      <div className="mx-auto max-w-[100rem] space-y-5">
        <DecisionJourneyHero variant="problem" />
        <section className="rounded-2xl border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] p-6">
          <h2 className="cbai-display text-2xl font-semibold text-[var(--cbai-text-primary)]">{copy.title}</h2>
          <p className="mt-3 text-sm text-[var(--cbai-text-secondary)]">{copy.empty}</p>
          <Link href="/" className="mt-5 inline-flex rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950">
            {copy.back}
          </Link>
        </section>
      </div>
    );
  }

  const sections = [
    [copy.evidence, problem.evidencePassportIds.length, "evidence"],
    [copy.contradictions, problem.unresolvedContradictionCount, "contradiction"],
    [copy.unknowns, problem.criticalUnknownCount, "unknown"],
    [copy.scenarios, 0, "scenario"],
    [copy.decision, problem.status === "decided" ? 1 : 0, "human"],
    [copy.monitoring, problem.status === "monitoring" ? 1 : 0, "monitoring"],
  ] as const;

  return (
    <div className="mx-auto max-w-[100rem] space-y-5" data-cbai-problem-workspace={problem.id}>
      <DecisionJourneyHero variant="problem" />
      <header className="rounded-2xl border border-teal-500/25 bg-[var(--cbai-glass-surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-teal-300">{copy.title}</p>
            <h1 className="cbai-display mt-2 text-2xl font-semibold text-[var(--cbai-text-primary)]">{brief.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <ProblemCloudStatus problemId={problem.id} locale={locale} />
            <span className="rounded-full border border-teal-500/30 bg-teal-950/30 px-3 py-1 text-xs text-teal-200">
              {copy.confirmed}
            </span>
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--cbai-text-secondary)]">{copy.purpose}</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
        <article className="rounded-2xl border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--cbai-text-primary)]">Problem Brief · v{brief.version}</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--cbai-text-secondary)]">{brief.problemStatement}</p>
          {brief.desiredOutcome ? (
            <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-950/20 p-3">
              <p className="text-xs uppercase tracking-wide text-sky-300">{copy.outcome}</p>
              <p className="mt-1 text-sm text-[var(--cbai-text-primary)]">{brief.desiredOutcome}</p>
            </div>
          ) : null}
        </article>

        <aside className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-5">
          <h2 className="text-sm font-semibold text-amber-200">{copy.unknowns}</h2>
          {brief.unknowns.length ? (
            <ul className="mt-3 space-y-2 text-sm text-[var(--cbai-text-secondary)]">
              {brief.unknowns.map((unknown) => <li key={unknown}>• {unknown}</li>)}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[var(--cbai-text-secondary)]">0</p>
          )}
        </aside>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6" aria-label={locale === "uz" ? "Muammo holati" : "Problem status"}>
        {sections.map(([label, count, role]) => (
          <article
            key={label}
            className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] p-4"
            data-cbai-problem-status={role}
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  role === "human"
                    ? "bg-amber-400"
                    : role === "contradiction"
                      ? "bg-rose-400"
                      : role === "unknown"
                        ? "bg-violet-400"
                        : "bg-teal-400"
                }`}
                aria-hidden="true"
              />
              <p className="text-xs font-medium text-[var(--cbai-text-secondary)]">{label}</p>
            </div>
            <p className={`mt-3 text-2xl font-semibold ${role === "human" ? "text-amber-300" : "text-[var(--cbai-text-primary)]"}`}>{count}</p>
          </article>
        ))}
      </section>
      <ProblemInvestigationPanel problem={problem} />
      <ProblemDecisionWorkspace problem={problem} />
    </div>
  );
}
