"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  listEvidencePassports,
  subscribeEvidencePassports,
  getEmptyEvidencePassportSnapshot,
} from "@/lib/evidence-passport";
import {
  addProblemClaim,
  addProblemContradiction,
  addProblemUnknown,
  decideProblemReadiness,
  linkEvidencePassportToClaim,
} from "@/lib/problems/problem-repository";
import type {
  Problem,
  ProblemContradiction,
  ProblemUnknownSeverity,
} from "@/lib/problems/problem.types";

type Props = {
  readonly problem: Problem;
};

export default function ProblemInvestigationPanel({ problem }: Props) {
  const passports = useSyncExternalStore(
    subscribeEvidencePassports,
    listEvidencePassports,
    getEmptyEvidencePassportSnapshot,
  );
  const [claimText, setClaimText] = useState("");
  const [claimOrigin, setClaimOrigin] = useState<"human" | "ai">("human");
  const [unknownQuestion, setUnknownQuestion] = useState("");
  const [unknownImportance, setUnknownImportance] = useState("");
  const [unknownEvidence, setUnknownEvidence] = useState("");
  const [unknownSeverity, setUnknownSeverity] = useState<ProblemUnknownSeverity>("high");
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [selectedPassportId, setSelectedPassportId] = useState("");
  const [contradictionExplanation, setContradictionExplanation] = useState("");
  const [contradictionReason, setContradictionReason] =
    useState<ProblemContradiction["reason"]>("other");
  const [acceptedUnknowns, setAcceptedUnknowns] = useState<readonly string[]>([]);
  const [acknowledgedContradictions, setAcknowledgedContradictions] =
    useState<readonly string[]>([]);
  const [checkpointNote, setCheckpointNote] = useState("");

  const selectedPassport = useMemo(
    () => passports.find((passport) => passport.passportId === selectedPassportId) ?? null,
    [passports, selectedPassportId],
  );
  const availablePassports = passports.filter(
    (passport) => !problem.evidencePassportIds.includes(passport.passportId),
  );

  function toggle(current: readonly string[], id: string, setter: (next: readonly string[]) => void) {
    setter(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <section className="space-y-4" data-cbai-problem-investigation="">
      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] p-5">
          <h2 className="text-base font-semibold text-[var(--cbai-text-primary)]">Claims</h2>
          <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">
            AI may propose a claim, but a human must confirm it before it enters the Problem.
          </p>
          <div className="mt-4 space-y-2">
            <textarea
              value={claimText}
              onChange={(event) => setClaimText(event.target.value)}
              placeholder="A statement that must be tested"
              className="min-h-20 w-full rounded-lg border border-[var(--cbai-border-default)] bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <select
                value={claimOrigin}
                onChange={(event) => setClaimOrigin(event.target.value as "human" | "ai")}
                className="rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-3 py-2 text-sm"
              >
                <option value="human">Human claim</option>
                <option value="ai">AI-proposed claim</option>
              </select>
              <button
                type="button"
                disabled={!claimText.trim()}
                onClick={() => {
                  addProblemClaim({
                    problemId: problem.id,
                    statement: claimText,
                    createdBy: claimOrigin,
                    confirmedByHuman: true,
                  });
                  setClaimText("");
                }}
                className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
              >
                Confirm claim
              </button>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {problem.claims.map((claim) => (
              <li key={claim.id} className="rounded-lg border border-[var(--cbai-border-default)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-[var(--cbai-text-primary)]">{claim.statement}</p>
                  <span className="rounded-full border border-[var(--cbai-border-default)] px-2 py-0.5 text-[11px]">
                    {claim.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[var(--cbai-text-muted)]">
                  {claim.createdBy === "ai" ? "AI-proposed · human-confirmed" : "Human-provided"} · {claim.evidencePassportIds.length} evidence
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] p-5">
          <h2 className="text-base font-semibold text-[var(--cbai-text-primary)]">Evidence Passport links</h2>
          <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">
            Original source and CBAI synthesis remain separate. Only a human links evidence to a claim.
          </p>
          <div className="mt-4 grid gap-2">
            <select
              value={selectedClaimId}
              onChange={(event) => setSelectedClaimId(event.target.value)}
              className="rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-3 py-2 text-sm"
            >
              <option value="">Select claim</option>
              {problem.claims.map((claim) => <option key={claim.id} value={claim.id}>{claim.statement}</option>)}
            </select>
            <select
              value={selectedPassportId}
              onChange={(event) => setSelectedPassportId(event.target.value)}
              className="rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-3 py-2 text-sm"
            >
              <option value="">Select existing Evidence Passport</option>
              {availablePassports.map((passport) => (
                <option key={passport.passportId} value={passport.passportId}>
                  {passport.claimText} · {passport.stance} · {passport.humanVerificationStatus}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedClaimId || !selectedPassport}
              onClick={() => {
                if (!selectedPassport) return;
                linkEvidencePassportToClaim({
                  problemId: problem.id,
                  claimId: selectedClaimId,
                  passportId: selectedPassport.passportId,
                  stance: selectedPassport.stance,
                  humanVerificationStatus: selectedPassport.humanVerificationStatus,
                  confirmedByHuman: true,
                });
                setSelectedPassportId("");
              }}
              className="w-fit rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
            >
              Confirm evidence link
            </button>
            {passports.length === 0 ? (
              <p className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-3 text-xs text-amber-100">
                No Evidence Passport exists yet. Create and verify one in Evidence Space first.
              </p>
            ) : null}
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-5">
          <h2 className="text-base font-semibold text-amber-100">Unknown Register</h2>
          <div className="mt-4 grid gap-2">
            <input value={unknownQuestion} onChange={(e) => setUnknownQuestion(e.target.value)} placeholder="What is not known?" className="rounded-lg border border-amber-500/20 bg-transparent px-3 py-2 text-sm" />
            <input value={unknownImportance} onChange={(e) => setUnknownImportance(e.target.value)} placeholder="Why does it matter?" className="rounded-lg border border-amber-500/20 bg-transparent px-3 py-2 text-sm" />
            <input value={unknownEvidence} onChange={(e) => setUnknownEvidence(e.target.value)} placeholder="Evidence required to resolve it" className="rounded-lg border border-amber-500/20 bg-transparent px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <select value={unknownSeverity} onChange={(e) => setUnknownSeverity(e.target.value as ProblemUnknownSeverity)} className="rounded-lg border border-amber-500/20 bg-[var(--cbai-solid-surface)] px-3 py-2 text-sm">
                <option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="critical">critical</option>
              </select>
              <button
                type="button"
                disabled={!unknownQuestion.trim()}
                onClick={() => {
                  addProblemUnknown({
                    problemId: problem.id,
                    question: unknownQuestion,
                    whyItMatters: unknownImportance,
                    evidenceNeeded: unknownEvidence,
                    severity: unknownSeverity,
                    owner: "human_owner",
                    confirmedByHuman: true,
                  });
                  setUnknownQuestion("");
                  setUnknownImportance("");
                  setUnknownEvidence("");
                }}
                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
              >
                Register unknown
              </button>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {problem.unknownRegister.map((unknown) => (
              <li key={unknown.id} className="rounded-lg border border-amber-500/20 p-3 text-sm">
                <p>{unknown.question}</p>
                <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">{unknown.severity} · {unknown.status} · {unknown.evidenceNeeded}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-5">
          <h2 className="text-base font-semibold text-rose-100">Contradiction Register</h2>
          <div className="mt-4 grid gap-2">
            <select value={selectedClaimId} onChange={(e) => setSelectedClaimId(e.target.value)} className="rounded-lg border border-rose-500/20 bg-[var(--cbai-solid-surface)] px-3 py-2 text-sm">
              <option value="">Select affected claim</option>
              {problem.claims.map((claim) => <option key={claim.id} value={claim.id}>{claim.statement}</option>)}
            </select>
            <select value={contradictionReason} onChange={(e) => setContradictionReason(e.target.value as ProblemContradiction["reason"])} className="rounded-lg border border-rose-500/20 bg-[var(--cbai-solid-surface)] px-3 py-2 text-sm">
              <option value="methodology">methodology</option><option value="time_period">time period</option><option value="geography">geography</option><option value="sample">sample</option><option value="measurement">measurement</option><option value="incomplete_data">incomplete data</option><option value="other">other</option>
            </select>
            <textarea value={contradictionExplanation} onChange={(e) => setContradictionExplanation(e.target.value)} placeholder="Explain the contradiction; do not resolve it automatically" className="min-h-20 rounded-lg border border-rose-500/20 bg-transparent px-3 py-2 text-sm" />
            <button
              type="button"
              disabled={!selectedClaimId || !contradictionExplanation.trim()}
              onClick={() => {
                addProblemContradiction({
                  problemId: problem.id,
                  claimId: selectedClaimId,
                  evidencePassportIds: selectedPassportId ? [selectedPassportId] : [],
                  reason: contradictionReason,
                  severity: "high",
                  explanation: contradictionExplanation,
                  confirmedByHuman: true,
                });
                setContradictionExplanation("");
              }}
              className="w-fit rounded-lg bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
            >
              Register contradiction
            </button>
          </div>
          <ul className="mt-4 space-y-2">
            {problem.contradictions.map((item) => (
              <li key={item.id} className="rounded-lg border border-rose-500/20 p-3 text-sm">
                <p>{item.explanation}</p>
                <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">{item.reason} · {item.severity} · {item.status}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="rounded-2xl border border-teal-500/25 bg-teal-950/10 p-5">
        <h2 className="text-base font-semibold text-teal-100">Human readiness checkpoint</h2>
        <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">
          Critical unknowns and contradictions must be resolved or explicitly accepted by a human before scenario design.
        </p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-amber-200">Accept unknowns as explicit risks</p>
            {problem.unknownRegister.filter((item) => item.status === "open" && (item.severity === "high" || item.severity === "critical")).map((item) => (
              <label key={item.id} className="mt-2 flex gap-2 text-sm">
                <input type="checkbox" checked={acceptedUnknowns.includes(item.id)} onChange={() => toggle(acceptedUnknowns, item.id, setAcceptedUnknowns)} />
                <span>{item.question}</span>
              </label>
            ))}
          </div>
          <div>
            <p className="text-xs font-medium text-rose-200">Acknowledge unresolved contradictions</p>
            {problem.contradictions.filter((item) => item.status === "unresolved" && (item.severity === "high" || item.severity === "critical")).map((item) => (
              <label key={item.id} className="mt-2 flex gap-2 text-sm">
                <input type="checkbox" checked={acknowledgedContradictions.includes(item.id)} onChange={() => toggle(acknowledgedContradictions, item.id, setAcknowledgedContradictions)} />
                <span>{item.explanation}</span>
              </label>
            ))}
          </div>
        </div>
        <textarea value={checkpointNote} onChange={(e) => setCheckpointNote(e.target.value)} placeholder="Human rationale or conditions" className="mt-4 min-h-20 w-full rounded-lg border border-teal-500/20 bg-transparent px-3 py-2 text-sm" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => decideProblemReadiness({ problemId: problem.id, decision: "continue_investigation", note: checkpointNote, confirmedByHuman: true })} className="rounded-lg border border-teal-500/30 px-4 py-2 text-sm text-teal-100">
            Continue investigation
          </button>
          <button type="button" onClick={() => decideProblemReadiness({ problemId: problem.id, decision: "ready_for_scenarios", acceptCriticalUnknownIds: acceptedUnknowns, acknowledgeContradictionIds: acknowledgedContradictions, note: checkpointNote, confirmedByHuman: true })} className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950">
            Confirm readiness for scenarios
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--cbai-text-muted)]">Current: {problem.readinessCheckpoint.status}</p>
      </article>
    </section>
  );
}
