"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { GraphMissionAnalysis } from "@/lib/graph/graph-mission";
import { cbaiMineralSurface, cbaiSectionEyebrow, cbaiBtnSecondary } from "@/components/brand/brand-classes";

type GraphMissionInstrumentProps = {
  analysis: GraphMissionAnalysis;
  focusMode: "mission" | "evidence" | "all";
  onFocusModeChange: (mode: "mission" | "evidence" | "all") => void;
};

export default function GraphMissionInstrument({
  analysis,
  focusMode,
  onFocusModeChange,
}: GraphMissionInstrumentProps) {
  const { t } = useTranslation();

  return (
    <section className={`${cbaiMineralSurface} space-y-4 p-4`} aria-labelledby="graph-mission-instrument">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={cbaiSectionEyebrow}>{t("intelligenceNetwork.eyebrow")}</p>
        <Link href="/" className="text-xs text-teal-400 hover:text-teal-300">
          {t("operatingContext.returnPath")} →
        </Link>
      </div>
      <h2 id="graph-mission-instrument" className="text-sm font-medium text-zinc-200">
        {t("intelligenceNetwork.missionFocus")}
      </h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("intelligenceNetwork.focusModes")}>
        {(["mission", "evidence", "all"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={focusMode === mode}
            onClick={() => onFocusModeChange(mode)}
            className={`rounded-full px-3 py-1 text-xs ${
              focusMode === mode
                ? "border border-teal-500/40 bg-teal-500/10 text-teal-300"
                : "border border-zinc-800 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t(`intelligenceNetwork.mode${mode.charAt(0).toUpperCase()}${mode.slice(1)}` as "intelligenceNetwork.modeMission")}
          </button>
        ))}
      </div>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-zinc-600">{t("intelligenceNetwork.connectedEntities")}</dt>
          <dd className="text-zinc-300">{analysis.connectedEntities.length}</dd>
        </div>
        <div>
          <dt className="text-zinc-600">{t("intelligenceNetwork.supportingEvidence")}</dt>
          <dd className="text-zinc-300">{analysis.supportingEvidenceCount}</dd>
        </div>
      </dl>
      <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-3">
        <p className={cbaiSectionEyebrow}>{t("livingIntelligence.universePulse")}</p>
        <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-zinc-600">{t("livingIntelligence.universeRelationships")}</dt>
            <dd className="text-zinc-300">{analysis.connectedEntities.length}</dd>
          </div>
          <div>
            <dt className="text-zinc-600">{t("livingIntelligence.universeEvidence")}</dt>
            <dd className="text-zinc-300">{analysis.supportingEvidenceCount}</dd>
          </div>
          <div>
            <dt className="text-zinc-600">{t("livingIntelligence.universeQuestions")}</dt>
            <dd className="text-zinc-300">{analysis.unresolvedQuestions.length}</dd>
          </div>
          <div>
            <dt className="text-zinc-600">{t("livingIntelligence.universeUnknowns")}</dt>
            <dd className="text-zinc-300">{analysis.missingEvidenceLabels.length}</dd>
          </div>
        </dl>
        <p className="mt-2 text-[10px] text-zinc-700">{t("livingIntelligence.noDecorativeActivity")}</p>
      </div>
      {analysis.missingEvidenceLabels.length > 0 ? (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("intelligenceNetwork.missingEvidence")}</p>
          <ul className="mt-1 space-y-1">
            {analysis.missingEvidenceLabels.map((label) => (
              <li key={label} className="text-sm text-zinc-400">
                {label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {analysis.unresolvedQuestions.length > 0 ? (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("intelligenceNetwork.unresolvedQuestions")}</p>
          <ul className="mt-1 space-y-1">
            {analysis.unresolvedQuestions.slice(0, 5).map((q) => (
              <li key={q} className="text-sm text-zinc-400">
                {q}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {analysis.impactConcern ? (
        <p className="text-xs text-[var(--gold-soft)]">
          {t("intelligenceNetwork.impactConcern")}: {analysis.impactConcern}
        </p>
      ) : null}
      {analysis.limitation ? (
        <p className="text-xs text-zinc-600">
          {t("evidencePulse.limitation")}: {analysis.limitation}
        </p>
      ) : null}
      <Link href="/my-work" className={`${cbaiBtnSecondary} inline-flex text-xs`}>
        {t("intelligenceNetwork.linkProjectEntities")} →
      </Link>
    </section>
  );
}
