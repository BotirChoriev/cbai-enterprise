"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { saveHumanImpact, loadHumanImpactForMission, loadHumanImpactForProject } from "@/lib/intelligence-os/human-impact-store";
import type { HumanImpactAssessment } from "@/lib/intelligence-os/human-impact.types";
import { cbaiBtnPrimary, cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type HumanImpactPanelProps = {
  missionId?: string;
  projectId?: string;
  onSaved?: (assessment: HumanImpactAssessment) => void;
};

const FIELDS = [
  "humanBenefit",
  "possibleHarm",
  "environmentalEffect",
  "ethicalConcerns",
  "affectedCommunities",
  "longTermConsequences",
  "unknownRisks",
  "mitigation",
  "missingEvidence",
  "humanOwner",
] as const;

export default function HumanImpactPanel({ missionId, projectId, onSaved }: HumanImpactPanelProps) {
  const { t } = useTranslation();
  const existing =
    (missionId ? loadHumanImpactForMission(missionId) : null) ??
    (projectId ? loadHumanImpactForProject(projectId) : null);

  const [values, setValues] = useState<Record<(typeof FIELDS)[number], string>>({
    humanBenefit: existing?.humanBenefit ?? "",
    possibleHarm: existing?.possibleHarm ?? "",
    environmentalEffect: existing?.environmentalEffect ?? "",
    ethicalConcerns: existing?.ethicalConcerns ?? "",
    affectedCommunities: existing?.affectedCommunities ?? "",
    longTermConsequences: existing?.longTermConsequences ?? "",
    unknownRisks: existing?.unknownRisks ?? "",
    mitigation: existing?.mitigation ?? "",
    missingEvidence: existing?.missingEvidence ?? "",
    humanOwner: existing?.humanOwner ?? "",
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const assessment = saveHumanImpact({
      missionId,
      projectId,
      ...values,
    });
    setSaved(true);
    onSaved?.(assessment);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <section className={`${cbaiMineralSurface} space-y-4 p-5`} aria-labelledby="human-impact-heading">
      <div>
        <p className={cbaiSectionEyebrow}>{t("humanImpact.eyebrow")}</p>
        <h2 id="human-impact-heading" className="text-base font-semibold text-zinc-100">
          {t("humanImpact.title")}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">{t("humanImpact.noFakeScores")}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field} className="block space-y-1.5">
            <span className="text-xs text-zinc-400">{t(`humanImpact.${field}` as "humanImpact.humanBenefit")}</span>
            <textarea
              value={values[field]}
              onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
              rows={field === "humanBenefit" || field === "longTermConsequences" ? 3 : 2}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-teal-500/40"
            />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleSave} className={cbaiBtnPrimary}>
          {t("humanImpact.save")}
        </button>
        {saved ? <span className="text-xs text-emerald-400">{t("common.saved")}</span> : null}
        {existing?.isComplete ? (
          <span className="text-xs text-teal-400">{t("missionCenter.impactComplete")}</span>
        ) : (
          <span className="text-xs text-amber-400/90">{t("humanImpact.requiredForReport")}</span>
        )}
      </div>
    </section>
  );
}
