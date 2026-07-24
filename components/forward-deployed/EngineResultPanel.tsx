"use client";

import { cbaiMineralPanel, cbaiSectionEyebrow, cbaiTextBody } from "@/components/brand/brand-classes";
import type { EnginePlan, EngineRunRecord } from "@/lib/forward-deployed-engines/engine-types";
import { exposeEngineProvenance } from "@/lib/forward-deployed-engines/engine-audit";
import { useTranslation } from "@/lib/i18n/use-translation";

type Props = {
  run: EngineRunRecord;
  plan: EnginePlan;
};

export default function EngineResultPanel({ run, plan }: Props) {
  const { t } = useTranslation();
  const provenance = exposeEngineProvenance(run);

  return (
    <section className={cbaiMineralPanel} aria-labelledby="engine-results">
      <h2 className={cbaiSectionEyebrow} id="engine-results">
        {t("forwardDeployed.results")}
      </h2>
      <p className={cbaiTextBody}>{plan.nextSafeAction}</p>
      <dl className="mt-3 space-y-1 text-xs text-zinc-600">
        <div className="flex gap-2">
          <dt>{t("forwardDeployed.engineVersion")}:</dt>
          <dd>{provenance.engineVersion}</dd>
        </div>
        <div className="flex gap-2">
          <dt>{t("forwardDeployed.schemaVersion")}:</dt>
          <dd>{provenance.schemaVersion}</dd>
        </div>
      </dl>
    </section>
  );
}
