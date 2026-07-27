"use client";

import { useMemo, useState } from "react";
import {
  addDecisionCriterion,
  addProblemMonitoringTrigger,
  addProblemScenario,
  evaluateProblemScenario,
  observeProblemMetric,
  recordProblemDecision,
  reopenProblemDecision,
} from "@/lib/problems/problem-repository";
import type { Problem } from "@/lib/problems/problem.types";

export default function ProblemDecisionWorkspace({ problem }: { readonly problem: Problem }) {
  const [criterion, setCriterion] = useState("");
  const [weight, setWeight] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [scenarioTitle, setScenarioTitle] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [scenarioOrigin, setScenarioOrigin] = useState<"human" | "ai">("ai");
  const [evaluationScenario, setEvaluationScenario] = useState("");
  const [evaluationCriterion, setEvaluationCriterion] = useState("");
  const [evaluationScore, setEvaluationScore] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [evaluationRationale, setEvaluationRationale] = useState("");
  const [chosenScenario, setChosenScenario] = useState("");
  const [decisionRationale, setDecisionRationale] = useState("");
  const [triggerLabel, setTriggerLabel] = useState("");
  const [triggerMetric, setTriggerMetric] = useState("");
  const [triggerThreshold, setTriggerThreshold] = useState("");
  const [observationValues, setObservationValues] = useState<Record<string, string>>({});
  const [reopenReason, setReopenReason] = useState("");

  const scenarioReady = problem.readinessCheckpoint.status === "ready_for_scenarios";
  const comparableScenarios = useMemo(
    () => problem.scenarios.filter((scenario) => scenario.status === "ready_for_human_review"),
    [problem.scenarios],
  );

  return (
    <section className="space-y-4" data-cbai-decision-workspace="">
      <header className="rounded-2xl border border-sky-500/20 bg-sky-950/10 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-300">Scenario comparison</p>
        <h2 className="mt-2 text-lg font-semibold text-[var(--cbai-text-primary)]">AI structures options. Humans choose.</h2>
        <p className="mt-1 text-sm text-[var(--cbai-text-secondary)]">
          Scores are review aids, not an automatic ranking or recommendation.
        </p>
        {!scenarioReady ? (
          <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-950/10 p-3 text-xs text-amber-100">
            Human readiness checkpoint must approve scenario design first.
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] p-5">
          <h3 className="font-semibold">Human-defined criteria</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <input value={criterion} onChange={(e) => setCriterion(e.target.value)} placeholder="Decision criterion" className="min-w-52 flex-1 rounded-lg border border-[var(--cbai-border-default)] bg-transparent px-3 py-2 text-sm" />
            <select value={weight} onChange={(e) => setWeight(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)} className="rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-3 py-2 text-sm">
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>weight {value}</option>)}
            </select>
            <button type="button" disabled={!scenarioReady || !criterion.trim()} onClick={() => {
              addDecisionCriterion({ problemId: problem.id, label: criterion, description: "", weight, confirmedByHuman: true });
              setCriterion("");
            }} className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40">Add criterion</button>
          </div>
          <ul className="mt-3 space-y-2">
            {problem.decisionCriteria.map((item) => <li key={item.id} className="rounded-lg border border-[var(--cbai-border-default)] p-3 text-sm">{item.label} · weight {item.weight} · human-defined</li>)}
          </ul>
        </article>

        <article className="rounded-2xl border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] p-5">
          <h3 className="font-semibold">Scenario drafts</h3>
          <div className="mt-3 grid gap-2">
            <input value={scenarioTitle} onChange={(e) => setScenarioTitle(e.target.value)} placeholder="Scenario title" className="rounded-lg border border-[var(--cbai-border-default)] bg-transparent px-3 py-2 text-sm" />
            <textarea value={scenarioDescription} onChange={(e) => setScenarioDescription(e.target.value)} placeholder="What changes under this scenario?" className="min-h-20 rounded-lg border border-[var(--cbai-border-default)] bg-transparent px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <select value={scenarioOrigin} onChange={(e) => setScenarioOrigin(e.target.value as "human" | "ai")} className="rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-3 py-2 text-sm">
                <option value="ai">AI-proposed</option><option value="human">Human-proposed</option>
              </select>
              <button type="button" disabled={!scenarioReady || !scenarioTitle.trim()} onClick={() => {
                addProblemScenario({ problemId: problem.id, title: scenarioTitle, description: scenarioDescription, createdBy: scenarioOrigin, confirmedByHuman: true });
                setScenarioTitle(""); setScenarioDescription("");
              }} className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40">Confirm scenario</button>
            </div>
          </div>
        </article>
      </div>

      {problem.scenarios.length ? (
        <article className="overflow-x-auto rounded-2xl border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] p-5">
          <h3 className="font-semibold">Side-by-side evidence matrix</h3>
          <table className="mt-3 min-w-full text-left text-sm">
            <thead><tr><th className="p-2">Scenario</th>{problem.decisionCriteria.map((item) => <th key={item.id} className="p-2">{item.label}</th>)}<th className="p-2">Status</th></tr></thead>
            <tbody>{problem.scenarios.map((scenario) => (
              <tr key={scenario.id} className="border-t border-[var(--cbai-border-default)]">
                <td className="p-2"><p className="font-medium">{scenario.title}</p><p className="text-xs text-[var(--cbai-text-muted)]">{scenario.createdBy === "ai" ? "AI-proposed · human-confirmed" : "Human-proposed"}</p></td>
                {problem.decisionCriteria.map((item) => {
                  const evaluation = scenario.evaluations.find((entry) => entry.criterionId === item.id);
                  return <td key={item.id} className="p-2">{evaluation?.score ?? "unknown"}<span className="block text-xs text-[var(--cbai-text-muted)]">{evaluation?.uncertainty}</span></td>;
                })}
                <td className="p-2">{scenario.status}</td>
              </tr>
            ))}</tbody>
          </table>
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            <select value={evaluationScenario} onChange={(e) => setEvaluationScenario(e.target.value)} className="rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-3 py-2 text-sm"><option value="">Scenario</option>{problem.scenarios.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
            <select value={evaluationCriterion} onChange={(e) => setEvaluationCriterion(e.target.value)} className="rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-3 py-2 text-sm"><option value="">Criterion</option>{problem.decisionCriteria.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
            <select value={evaluationScore} onChange={(e) => setEvaluationScore(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)} className="rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-3 py-2 text-sm">{[1,2,3,4,5].map((value) => <option key={value} value={value}>score {value}</option>)}</select>
            <input value={evaluationRationale} onChange={(e) => setEvaluationRationale(e.target.value)} placeholder="Evidence-based rationale" className="rounded-lg border border-[var(--cbai-border-default)] bg-transparent px-3 py-2 text-sm" />
          </div>
          <button type="button" disabled={!evaluationScenario || !evaluationCriterion || !evaluationRationale.trim()} onClick={() => {
            evaluateProblemScenario({ problemId: problem.id, scenarioId: evaluationScenario, criterionId: evaluationCriterion, score: evaluationScore, rationale: evaluationRationale, uncertainty: "unknown", confirmedByHuman: true });
            setEvaluationRationale("");
          }} className="mt-2 rounded-lg border border-sky-500/30 px-4 py-2 text-sm text-sky-100 disabled:opacity-40">Confirm evaluation</button>
        </article>
      ) : null}

      <article className="rounded-2xl border border-teal-500/25 bg-teal-950/10 p-5">
        <h3 className="font-semibold text-teal-100">Human Decision Ledger</h3>
        <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">At least two scenarios are required. CBAI never selects one automatically.</p>
        <div className="mt-3 grid gap-2 md:grid-cols-[minmax(12rem,0.5fr)_minmax(16rem,1fr)_auto]">
          <select value={chosenScenario} onChange={(e) => setChosenScenario(e.target.value)} className="rounded-lg border border-teal-500/20 bg-[var(--cbai-solid-surface)] px-3 py-2 text-sm"><option value="">Human chooses scenario</option>{comparableScenarios.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
          <input value={decisionRationale} onChange={(e) => setDecisionRationale(e.target.value)} placeholder="Human rationale" className="rounded-lg border border-teal-500/20 bg-transparent px-3 py-2 text-sm" />
          <button type="button" disabled={!chosenScenario || !decisionRationale.trim() || problem.scenarios.length < 2} onClick={() => recordProblemDecision({ problemId: problem.id, chosenScenarioId: chosenScenario, rationale: decisionRationale, confirmedByHuman: true })} className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40">Record human decision</button>
        </div>
        <ul className="mt-3 space-y-2">{problem.decisions.map((decision) => <li key={decision.id} className="rounded-lg border border-teal-500/20 p-3 text-sm"><p>{decision.rationale}</p><p className="mt-1 text-xs text-[var(--cbai-text-muted)]">human · immutable forecast snapshot · {decision.decidedAt}</p></li>)}</ul>
      </article>

      <article className="rounded-2xl border border-violet-500/20 bg-violet-950/10 p-5">
        <h3 className="font-semibold text-violet-100">Monitoring and review triggers</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <input value={triggerLabel} onChange={(e) => setTriggerLabel(e.target.value)} placeholder="Trigger label" className="rounded-lg border border-violet-500/20 bg-transparent px-3 py-2 text-sm" />
          <input value={triggerMetric} onChange={(e) => setTriggerMetric(e.target.value)} placeholder="Metric" className="rounded-lg border border-violet-500/20 bg-transparent px-3 py-2 text-sm" />
          <input value={triggerThreshold} onChange={(e) => setTriggerThreshold(e.target.value)} placeholder="Above threshold" className="rounded-lg border border-violet-500/20 bg-transparent px-3 py-2 text-sm" />
          <button type="button" disabled={problem.status !== "decided" || !triggerLabel.trim() || !triggerMetric.trim()} onClick={() => addProblemMonitoringTrigger({ problemId: problem.id, label: triggerLabel, metric: triggerMetric, operator: "above", threshold: Number(triggerThreshold), owner: "human_owner", confirmedByHuman: true })} className="rounded-lg bg-violet-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40">Activate monitoring</button>
        </div>
        <ul className="mt-3 space-y-2">{problem.monitoringTriggers.map((trigger) => (
          <li key={trigger.id} className="rounded-lg border border-violet-500/20 p-3">
            <div className="flex flex-wrap items-center gap-2"><p className="text-sm">{trigger.label}: {trigger.metric} {trigger.operator} {String(trigger.threshold)}</p><span className="text-xs text-violet-200">{trigger.status}</span></div>
            <div className="mt-2 flex gap-2"><input value={observationValues[trigger.id] ?? ""} onChange={(e) => setObservationValues((current) => ({ ...current, [trigger.id]: e.target.value }))} placeholder="Verified observation" className="rounded-lg border border-violet-500/20 bg-transparent px-3 py-2 text-sm" /><button type="button" onClick={() => observeProblemMetric({ problemId: problem.id, triggerId: trigger.id, value: Number(observationValues[trigger.id]), sourceConfirmedByHuman: true })} className="rounded-lg border border-violet-500/30 px-3 py-2 text-sm">Record observation</button></div>
          </li>
        ))}</ul>
        {problem.monitoringTriggers.some((trigger) => trigger.status === "triggered") ? (
          <div className="mt-4 flex flex-wrap gap-2"><input value={reopenReason} onChange={(e) => setReopenReason(e.target.value)} placeholder="Human reason to reopen" className="min-w-64 flex-1 rounded-lg border border-rose-500/20 bg-transparent px-3 py-2 text-sm" /><button type="button" disabled={!reopenReason.trim()} onClick={() => reopenProblemDecision({ problemId: problem.id, reason: reopenReason, confirmedByHuman: true })} className="rounded-lg bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40">Human: reopen decision</button></div>
        ) : null}
      </article>
    </section>
  );
}
