"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { derivePrimaryEvidenceStates } from "@/lib/intelligence-os/evidence-primary-states";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import {
  cbaiLinkAction,
  cbaiMineralPanel,
  cbaiMineralPanelMd,
  cbaiSectionEyebrow,
  cbaiStatCell,
  cbaiTextCaption,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

const STATE_LABEL: Record<string, string> = {
  known: "evidenceKnown",
  unknown: "evidenceUnknown",
  conflict: "evidenceConflict",
  needs_review: "evidenceNeedsReview",
};

export default function EvidencePrimaryStatesPanel() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();
  const disclosure = useProgressiveDisclosure();
  const states = useMemo(() => derivePrimaryEvidenceStates(mission), [mission]);
  const total = states.reduce((sum, row) => sum + row.count, 0);

  if (!mission) {
    return (
      <section className={`${cbaiMineralPanel} space-y-2`} role="status">
        <p className={cbaiTextCaption}>{t("zeroLearningCurve.evidenceNoMission")}</p>
        <Link href="/" className={cbaiLinkAction}>
          {t("zeroLearningCurve.evidenceNoMissionAction")} →
        </Link>
      </section>
    );
  }

  if (total === 0) {
    return (
      <section className={`${cbaiMineralPanel} space-y-2`} role="status">
        <p className={cbaiTextCaption}>{t("zeroLearningCurve.evidenceEmpty")}</p>
        <Link
          href={`/my-work${mission.projectId ? `?project=${mission.projectId}#project-evidence` : ""}`}
          className={cbaiLinkAction}
        >
          {t("zeroLearningCurve.evidenceEmptyAction")} →
        </Link>
      </section>
    );
  }

  return (
    <section className={cbaiMineralPanelMd} aria-labelledby="evidence-primary-states">
      <p className={cbaiSectionEyebrow} id="evidence-primary-states">
        {t("zeroLearningCurve.evidenceStatesEyebrow")}
      </p>
      {disclosure.showEvidenceAdvanced ? (
        <p className={cbaiTextMuted}>{t("zeroLearningCurve.evidenceStatesExplainer")}</p>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {states.map((row) => (
          <div key={row.state} className={cbaiStatCell}>
            <p className="text-[10px] uppercase tracking-wider text-zinc-600">
              {t(`zeroLearningCurve.${STATE_LABEL[row.state]}`)}
            </p>
            <p className="text-lg font-medium text-zinc-200">{row.count}</p>
            {disclosure.showEvidenceAdvanced ? (
              <p className="mt-1 text-[10px] text-zinc-600">{row.detail}</p>
            ) : null}
          </div>
        ))}
      </div>
      {disclosure.showEvidenceAdvanced && mission?.projectId ? (
        <Link href={`/my-work?project=${mission.projectId}#project-evidence`} className={cbaiLinkAction}>
          {t("zeroLearningCurve.advancedDetails")} →
        </Link>
      ) : null}
    </section>
  );
}
