"use client";

import { cbaiMineralPanel, cbaiSectionEyebrow, cbaiTextBody } from "@/components/brand/brand-classes";
import type { EnginePlan } from "@/lib/forward-deployed-engines/engine-types";
import { useTranslation } from "@/lib/i18n/use-translation";

type Props = {
  plan: EnginePlan;
};

export default function EvidenceRequirements({ plan }: Props) {
  const { t } = useTranslation();
  if (plan.evidenceRequirements.length === 0) return null;

  return (
    <section className={cbaiMineralPanel} aria-labelledby="engine-evidence-req">
      <h2 className={cbaiSectionEyebrow} id="engine-evidence-req">
        {t("forwardDeployed.evidenceRequirements")}
      </h2>
      <ul className="list-inside list-disc space-y-1">
        {plan.evidenceRequirements.map((req) => (
          <li key={req} className={cbaiTextBody}>{req}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-zinc-600">{t("forwardDeployed.officialSourceNote")}</p>
    </section>
  );
}
