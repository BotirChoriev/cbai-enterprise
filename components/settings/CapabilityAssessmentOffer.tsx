"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { deriveCapabilityAssessmentOffer } from "@/lib/intelligence-os/capability-assessment";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

/** Optional capability assessment — only after real work, never mandatory. */
export default function CapabilityAssessmentOffer() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();

  const offer = useMemo(
    () => (hydrated ? deriveCapabilityAssessmentOffer(resolveOperatorName(profile)) : null),
    [hydrated, profile],
  );

  if (!hydrated || !offer?.eligible) return null;

  return (
    <section className={`${cbaiMineralSurface} space-y-2 p-4`}>
      <p className={cbaiSectionEyebrow}>{t("zeroLearningCurve.capabilityAssessmentOffer")}</p>
      <p className="text-xs text-zinc-500">{offer.reason}</p>
      <p className="text-[10px] text-zinc-600">{t("zeroLearningCurve.capabilityAssessmentBody")}</p>
      <Link href={offer.href} className="text-xs text-teal-400 hover:text-teal-300">
        {t("zeroLearningCurve.capabilityAssessmentOffer")} →
      </Link>
    </section>
  );
}
