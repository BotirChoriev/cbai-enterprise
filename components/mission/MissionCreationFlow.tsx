"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { createMission } from "@/lib/intelligence-os/mission-store";
import { createProject } from "@/lib/project/project-store";
import { linkMissionToProject } from "@/lib/intelligence-os/mission-store";
import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type MissionCreationFlowProps = {
  onComplete: () => void;
  onCancel: () => void;
};

const STEPS = ["problem", "purpose", "evidence", "disciplines", "impact"] as const;

export default function MissionCreationFlow({ onComplete, onCancel }: MissionCreationFlowProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [problem, setProblem] = useState("");
  const [whyExists, setWhyExists] = useState("");
  const [whoBenefits, setWhoBenefits] = useState("");
  const [whoCouldBeHarmed, setWhoCouldBeHarmed] = useState("");
  const [evidenceHave, setEvidenceHave] = useState("");
  const [evidenceMissing, setEvidenceMissing] = useState("");
  const [disciplines, setDisciplines] = useState("");
  const [capabilitiesNeeded, setCapabilitiesNeeded] = useState("");
  const [environmentalImpact, setEnvironmentalImpact] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");

  function finish() {
    const project = createProject({
      title: problem.trim().slice(0, 120) || "New mission project",
      type: "research_project",
      description: whyExists.trim(),
      tags: [],
      visibility: "private",
      status: "active",
      researchQuestion: problem.trim(),
    });
    const mission = createMission({
      problem: problem.trim(),
      whyExists: whyExists.trim(),
      whoBenefits: whoBenefits.trim(),
      whoCouldBeHarmed: whoCouldBeHarmed.trim(),
      evidenceHave: evidenceHave.trim(),
      evidenceMissing: evidenceMissing.trim(),
      disciplines: disciplines.split(",").map((d) => d.trim()).filter(Boolean),
      capabilitiesNeeded: capabilitiesNeeded.trim(),
      environmentalImpact: environmentalImpact.trim(),
      successCriteria: successCriteria.trim(),
      projectId: project.id,
    });
    linkMissionToProject(mission.id, project.id);
    onComplete();
  }

  const stepLabels = [
    t("missionCreation.stepProblem"),
    t("missionCreation.stepPurpose"),
    t("missionCreation.stepEvidence"),
    t("missionCreation.stepDisciplines"),
    t("missionCreation.stepImpact"),
  ];

  return (
    <div className={`${cbaiMineralSurface} space-y-5 p-6`} role="dialog" aria-labelledby="mission-creation-title">
      <div>
        <p className={cbaiSectionEyebrow}>{t("missionCreation.eyebrow")}</p>
        <h2 id="mission-creation-title" className="text-lg font-semibold text-zinc-100">
          {t("missionCreation.title")}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          {t("missionCreation.stepOf", { current: String(step + 1), total: String(STEPS.length) })}
          {" · "}
          {stepLabels[step]}
        </p>
      </div>

      {step === 0 ? (
        <label className="block space-y-2">
          <span className="text-sm text-zinc-300">{t("missionCreation.problemLabel")}</span>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder={t("missionCreation.problemPlaceholder")}
            rows={4}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus-visible:border-teal-500/40"
          />
        </label>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">{t("missionCreation.whyLabel")}</span>
            <textarea value={whyExists} onChange={(e) => setWhyExists(e.target.value)} rows={2} className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none focus-visible:border-teal-500/40" />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">{t("missionCreation.benefitsLabel")}</span>
            <textarea value={whoBenefits} onChange={(e) => setWhoBenefits(e.target.value)} rows={2} className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none focus-visible:border-teal-500/40" />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">{t("missionCreation.harmLabel")}</span>
            <textarea value={whoCouldBeHarmed} onChange={(e) => setWhoCouldBeHarmed(e.target.value)} rows={2} className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none focus-visible:border-teal-500/40" />
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">{t("missionCreation.evidenceHaveLabel")}</span>
            <textarea value={evidenceHave} onChange={(e) => setEvidenceHave(e.target.value)} rows={3} className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none focus-visible:border-teal-500/40" />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">{t("missionCreation.evidenceMissingLabel")}</span>
            <textarea value={evidenceMissing} onChange={(e) => setEvidenceMissing(e.target.value)} rows={3} className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none focus-visible:border-teal-500/40" />
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">{t("missionCreation.disciplinesLabel")}</span>
            <input value={disciplines} onChange={(e) => setDisciplines(e.target.value)} placeholder={t("missionCreation.disciplinesPlaceholder")} className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none focus-visible:border-teal-500/40" />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">{t("missionCreation.capabilitiesLabel")}</span>
            <textarea value={capabilitiesNeeded} onChange={(e) => setCapabilitiesNeeded(e.target.value)} rows={2} className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none focus-visible:border-teal-500/40" />
          </label>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">{t("missionCreation.environmentalLabel")}</span>
            <textarea value={environmentalImpact} onChange={(e) => setEnvironmentalImpact(e.target.value)} rows={2} className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none focus-visible:border-teal-500/40" />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">{t("missionCreation.successLabel")}</span>
            <textarea value={successCriteria} onChange={(e) => setSuccessCriteria(e.target.value)} rows={2} className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none focus-visible:border-teal-500/40" />
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className={cbaiBtnSecondary}>
            {t("missionCreation.back")}
          </button>
        ) : (
          <button type="button" onClick={onCancel} className={cbaiBtnSecondary}>
            {t("missionCreation.cancel")}
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 && problem.trim().length < 10}
            className={cbaiBtnPrimary}
          >
            {t("missionCreation.next")}
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={problem.trim().length < 10 || successCriteria.trim().length < 5}
            className={cbaiBtnPrimary}
          >
            {t("missionCreation.finish")}
          </button>
        )}
      </div>
    </div>
  );
}
