"use client";

import { cbaiMineralPanel, cbaiSectionEyebrow, cbaiTextBody, cbaiTextMuted } from "@/components/brand/brand-classes";
import type { EnginePlan } from "@/lib/forward-deployed-engines/engine-types";
import { useTranslation } from "@/lib/i18n/use-translation";

type Props = {
  plan: EnginePlan;
};

export default function ProposedPlan({ plan }: Props) {
  const { t } = useTranslation();
  return (
    <section className={cbaiMineralPanel} aria-labelledby="engine-plan">
      <h2 className={cbaiSectionEyebrow} id="engine-plan">
        {t("forwardDeployed.proposedPlan")}
      </h2>
      {plan.hypotheses?.length ? (
        <div className="mb-3">
          <p className={cbaiTextMuted}>Hypotheses</p>
          <ul className="list-inside list-disc space-y-1">
            {plan.hypotheses.map((h) => (
              <li key={h} className={cbaiTextBody}>{h}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <ol className="space-y-2">
        {plan.proposedTasks.map((task, i) => (
          <li key={task.id} className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-3 py-2">
            <p className="text-sm font-medium text-zinc-200">
              {i + 1}. {task.title}
            </p>
            <p className={cbaiTextMuted}>{task.description}</p>
          </li>
        ))}
      </ol>
      {plan.reportOutline?.length ? (
        <div className="mt-3">
          <p className={cbaiTextMuted}>Report outline</p>
          <p className={cbaiTextBody}>{plan.reportOutline.join(" → ")}</p>
        </div>
      ) : null}
    </section>
  );
}
