"use client";

import { cbaiMineralPanel, cbaiSectionEyebrow, cbaiTextBody, cbaiTextMuted } from "@/components/brand/brand-classes";
import type { EnginePlan } from "@/lib/forward-deployed-engines/engine-types";
import { useTranslation } from "@/lib/i18n/use-translation";

type Props = {
  plan: EnginePlan;
};

export default function RiskPanel({ plan }: Props) {
  const { t } = useTranslation();
  if (plan.risks.length === 0 && plan.limitations.length === 0) return null;

  return (
    <section className={cbaiMineralPanel} aria-labelledby="engine-risks">
      <h2 className={cbaiSectionEyebrow} id="engine-risks">
        {t("forwardDeployed.risks")}
      </h2>
      {plan.risks.length > 0 ? (
        <ul className="mb-3 space-y-2">
          {plan.risks.map((r) => (
            <li key={r.id} className={cbaiTextBody}>
              <span className="text-amber-400/90 uppercase">{r.severity}</span>: {r.description}
            </li>
          ))}
        </ul>
      ) : null}
      {plan.limitations.length > 0 ? (
        <ul className="space-y-1">
          {plan.limitations.map((l) => (
            <li key={l.id} className={cbaiTextMuted}>{l.description}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
