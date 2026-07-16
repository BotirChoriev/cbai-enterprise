"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { deriveMentalModel } from "@/lib/intelligence-os/mental-model";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { shouldShowMentalModelStrip } from "@/lib/intelligence-os/progressive-disclosure";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

/** Answers: where, why, happening, unfinished, next, changed — compact cognitive orientation. */
export default function MentalModelStrip() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const { mission } = useMissionContext();

  const disclosure = useProgressiveDisclosure();
  const model = useMemo(() => {
    if (!hydrated) return null;
    const passport = buildCapabilityPassport(resolveOperatorName(profile));
    return deriveMentalModel(pathname, mission, passport, profile.workspaceRole);
  }, [hydrated, pathname, mission, profile]);

  if (!hydrated || !model || !shouldShowMentalModelStrip(pathname, disclosure)) return null;

  const whyText = model.why === "begin-mission"
    ? t("experienceEngineering.beginMission")
    : model.why;

  const unfinishedText = model.unfinished === "flow-complete"
    ? t("experienceEngineering.flowComplete")
    : model.unfinished === "no-mission"
      ? t("experienceEngineering.noMission")
      : model.unfinished;

  return (
    <section
      className="cbai-mental-model-strip shrink-0 border-b border-zinc-800/60 px-4 py-2 sm:px-5"
      aria-label={t("experienceEngineering.mentalModelEyebrow")}
    >
      <p className={`${cbaiSectionEyebrow} mb-1.5`}>{t("experienceEngineering.mentalModelEyebrow")}</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <dt className="text-zinc-600">{t("experienceEngineering.whereAmI")}</dt>
          <dd className="text-zinc-400">{t(`intelligenceSpaces.${model.whereLabelKey}`)}</dd>
        </div>
        <div className="col-span-2 sm:col-span-1 lg:col-span-1">
          <dt className="text-zinc-600">{t("experienceEngineering.whyAmIHere")}</dt>
          <dd className="truncate text-zinc-400" title={whyText}>{whyText}</dd>
        </div>
        <div>
          <dt className="text-zinc-600">{t("experienceEngineering.whatIsHappening")}</dt>
          <dd className="truncate text-zinc-400" title={model.happening}>{model.happening}</dd>
        </div>
        <div>
          <dt className="text-zinc-600">{t("experienceEngineering.whatUnfinished")}</dt>
          <dd className="truncate text-zinc-400" title={unfinishedText}>{unfinishedText}</dd>
        </div>
        <div>
          <dt className="text-zinc-600">{t("experienceEngineering.whatNext")}</dt>
          <dd>
            <Link href={model.nextHref} className="text-teal-400/90 hover:text-teal-300">
              {model.nextLabel} →
            </Link>
          </dd>
        </div>
        {model.changedKey ? (
          <div>
            <dt className="text-zinc-600">{t("experienceEngineering.whatChanged")}</dt>
            <dd className="text-zinc-500">{t(`experienceEngineering.${model.changedKey}` as "experienceEngineering.flowStageCompletedQuestion")}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
