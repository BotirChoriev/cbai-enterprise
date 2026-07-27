"use client";

import { useMemo, useState } from "react";
import {
  buildDecisionProvenanceGraph,
  explainWhyConclusionShown,
} from "@/lib/decision-provenance";
import { cbaiBtnSecondarySm, cbaiFocusRing, cbaiMineralPanel, cbaiTextMuted } from "@/components/brand/brand-classes";

/**
 * Trust surface: “Why is this conclusion shown?”
 * Demo graph only — never auto-approves a final decision.
 */
export default function DecisionProvenanceInspector() {
  const [title, setTitle] = useState("Sample decision path");
  const [claim, setClaim] = useState("Local materials suggest a pilot is feasible");
  const [source, setSource] = useState("User-provided notes");
  const [assumption, setAssumption] = useState("Budget and timeline remain within stated constraints");
  const [optionA, setOptionA] = useState("Evidence-first path");
  const [optionB, setOptionB] = useState("Expert collaboration path");
  const [optionC, setOptionC] = useState("Limited pilot path");
  const [risk, setRisk] = useState("Missing counter-evidence and external verification");
  const [built, setBuilt] = useState(false);

  const graph = useMemo(() => {
    if (!built) return null;
    try {
      return buildDecisionProvenanceGraph({
        title,
        sourceLabel: source,
        claimText: claim,
        assumption,
        options: [optionA, optionB, optionC],
        risk,
        contentLocale: "en",
      });
    } catch {
      return null;
    }
  }, [built, title, source, claim, assumption, optionA, optionB, optionC, risk]);

  const explanation = graph ? explainWhyConclusionShown(graph) : null;

  return (
    <section
      className={`${cbaiMineralPanel} space-y-4 p-4`}
      data-cbai-decision-provenance=""
      aria-labelledby="why-shown-heading"
    >
      <div>
        <h2 id="why-shown-heading" className="text-lg font-semibold text-[color:var(--cbai-text-primary)]">
          Why is this conclusion shown?
        </h2>
        <p className={`text-sm ${cbaiTextMuted}`}>
          Decision Provenance Graph: source → claim → counter-evidence → assumption → options → risk → human
          approval → outcome. CBAI never owns the final decision.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className={cbaiTextMuted}>Title</span>
          <input
            className="min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3"
            value={title}
            onChange={(e) => {
              setBuilt(false);
              setTitle(e.target.value);
            }}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className={cbaiTextMuted}>Source</span>
          <input
            className="min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3"
            value={source}
            onChange={(e) => {
              setBuilt(false);
              setSource(e.target.value);
            }}
          />
        </label>
        <label className="block space-y-1 text-sm sm:col-span-2">
          <span className={cbaiTextMuted}>Claim</span>
          <input
            className="min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3"
            value={claim}
            onChange={(e) => {
              setBuilt(false);
              setClaim(e.target.value);
            }}
          />
        </label>
        <label className="block space-y-1 text-sm sm:col-span-2">
          <span className={cbaiTextMuted}>Assumption (marked as assumption)</span>
          <input
            className="min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3"
            value={assumption}
            onChange={(e) => {
              setBuilt(false);
              setAssumption(e.target.value);
            }}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className={cbaiTextMuted}>Option 1</span>
          <input
            className="min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3"
            value={optionA}
            onChange={(e) => {
              setBuilt(false);
              setOptionA(e.target.value);
            }}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className={cbaiTextMuted}>Option 2</span>
          <input
            className="min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3"
            value={optionB}
            onChange={(e) => {
              setBuilt(false);
              setOptionB(e.target.value);
            }}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className={cbaiTextMuted}>Option 3</span>
          <input
            className="min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3"
            value={optionC}
            onChange={(e) => {
              setBuilt(false);
              setOptionC(e.target.value);
            }}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className={cbaiTextMuted}>Risk</span>
          <input
            className="min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3"
            value={risk}
            onChange={(e) => {
              setBuilt(false);
              setRisk(e.target.value);
            }}
          />
        </label>
      </div>

      <button
        type="button"
        className={`${cbaiBtnSecondarySm} min-h-11 ${cbaiFocusRing}`}
        onClick={() => setBuilt(true)}
        data-cbai-build-provenance=""
      >
        Inspect provenance path
      </button>

      {graph && explanation ? (
        <div className="space-y-3" data-cbai-provenance-result="">
          <p className="text-sm text-[color:var(--cbai-text-primary)]">{explanation.whyShown}</p>
          <p className={`text-xs ${cbaiTextMuted}`}>
            Final decision owner: {graph.finalDecisionOwner} · Human approval required:{" "}
            {String(graph.humanApprovalRequired)}
          </p>
          <ol className="space-y-1 text-sm">
            {graph.nodes.map((n) => (
              <li key={n.id} className="rounded-md border border-[color:var(--cbai-border-subtle)] px-2 py-1.5">
                <span className="font-medium capitalize">{n.kind.replaceAll("_", " ")}</span>
                <span className={`ml-2 ${cbaiTextMuted}`}>[{n.knowledgeState}]</span>
                <span className="mt-0.5 block">{n.label}</span>
              </li>
            ))}
          </ol>
          {explanation.whatIsUnknown.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">
                Unknowns
              </p>
              <ul className={`mt-1 list-disc pl-5 text-sm ${cbaiTextMuted}`}>
                {explanation.whatIsUnknown.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
