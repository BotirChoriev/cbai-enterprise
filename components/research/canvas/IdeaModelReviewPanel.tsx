"use client";

import { useMemo } from "react";
import { buildIdeaModelSummary } from "@/lib/research-canvas/idea-model-summary";
import type { SmartIdea } from "@/lib/research-canvas/research-canvas-types";
import { cbaiBtnPrimary, cbaiFocusRing, cbaiMineralSurface } from "@/components/brand/brand-classes";

type Props = {
  readonly idea: SmartIdea;
  readonly rc: (key: string) => string;
  readonly onAdvanceToMeasurement: () => void;
  readonly canAdvance: boolean;
};

export default function IdeaModelReviewPanel({ idea, rc, onAdvanceToMeasurement, canAdvance }: Props) {
  const summary = useMemo(() => buildIdeaModelSummary(idea), [idea]);

  return (
    <div className={`${cbaiMineralSurface} space-y-4 rounded-lg border border-zinc-800 p-4`}>
      <div>
        <h3 className="text-sm font-semibold text-zinc-200">{rc("ideaModelReviewTitle")}</h3>
        <p className="text-xs text-zinc-500">{rc("ideaModelReviewNotice")}</p>
      </div>

      <section className="space-y-1 text-sm">
        <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{rc("ideaModelProblem")}</h4>
        <p className="text-zinc-300">{summary.problem}</p>
      </section>

      <section className="space-y-1 text-sm">
        <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{rc("ideaModelPurpose")}</h4>
        <p className="text-zinc-300">{summary.purpose}</p>
      </section>

      <section className="space-y-1 text-sm">
        <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{rc("ideaModelIntendedOutcome")}</h4>
        <p className="text-zinc-300">{summary.intendedOutcome}</p>
      </section>

      <section className="space-y-1 text-sm">
        <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{rc("ideaModelAssumptions")}</h4>
        <ul className="list-disc pl-4 text-zinc-400">
          {summary.assumptions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-1 text-sm">
        <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{rc("ideaModelUnknowns")}</h4>
        <ul className="list-disc pl-4 text-zinc-400">
          {summary.unknowns.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-1 text-sm">
        <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{rc("ideaModelSuccessCriteria")}</h4>
        <ul className="list-disc pl-4 text-zinc-400">
          {summary.successCriteria.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 text-sm">
        <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{rc("ideaModelConfirmedSources")}</h4>
        {summary.confirmedSources.length === 0 ? (
          <p className="text-zinc-500">{rc("ideaModelNoConfirmedSources")}</p>
        ) : (
          <ul className="space-y-2">
            {summary.confirmedSources.map((item) => (
              <li key={`${item.field}-${item.value}`} className="rounded border border-zinc-800 p-2 text-xs">
                <p className="font-medium text-zinc-300">{item.field}</p>
                <p className="text-zinc-400">{item.value}</p>
                {item.sourceRef ? (
                  <p className="text-zinc-500">{rc("ideaModelSourceRef")}: {item.sourceRef}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {summary.rejectedExcludedCount > 0 ? (
        <p className="text-xs text-amber-400/90">
          {rc("ideaModelRejectedExcluded")}: {summary.rejectedExcludedCount}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onAdvanceToMeasurement}
        disabled={!canAdvance}
        className={canAdvance ? cbaiBtnPrimary : `${cbaiFocusRing} rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-500`}
      >
        {rc("advanceToMeasurementPlanning")}
      </button>
    </div>
  );
}
