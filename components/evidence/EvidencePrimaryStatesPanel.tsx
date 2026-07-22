"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { derivePrimaryEvidenceStates } from "@/lib/intelligence-os/evidence-primary-states";
import {
  deriveFirstMinuteAction,
  translateFirstMinuteAction,
  type FirstMinuteAction,
} from "@/lib/intelligence-os/first-minute";
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

/** Matches deriveFirstMinuteAction(null) on the server — no localStorage on SSR. */
const PRE_HYDRATION_FIRST_MINUTE: FirstMinuteAction = {
  label: "Start a mission",
  labelKey: "startMission",
  href: "/?create=1",
  reason: "Name the problem first",
  exposesArchitecture: false,
};

export default function EvidencePrimaryStatesPanel() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { mission } = useMissionContext();
  const disclosure = useProgressiveDisclosure();
  const states = useMemo(() => derivePrimaryEvidenceStates(mission), [mission]);
  const next = useMemo(
    () => (hydrated ? deriveFirstMinuteAction(mission) : PRE_HYDRATION_FIRST_MINUTE),
    [hydrated, mission],
  );
  const total = states.reduce((sum, row) => sum + row.count, 0);

  if (!mission) {
    return (
      <section className={`${cbaiMineralPanel} space-y-2`} role="status">
        <p className={cbaiTextCaption}>{t("zeroLearningCurve.evidenceNoMission")}</p>
        <Link href={next.href} className={cbaiLinkAction}>
          {translateFirstMinuteAction(t, next)} →
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
