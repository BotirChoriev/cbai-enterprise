"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import {
  COMPASS_DIRECTION_HREFS,
  COMPASS_DIRECTION_ORDER,
} from "@/lib/assistant/intelligence-compass";
import { getDictionary } from "@/lib/i18n/translate";
import { translateCompassDirection } from "@/lib/i18n/compass-translation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function IntelligenceCompass() {
  const { profile } = useAssistantProfile();
  const { t, language } = useTranslation();
  const dictionary = getDictionary(language);

  const directions = useMemo(
    () =>
      COMPASS_DIRECTION_ORDER.map((id) => ({
        id,
        href: COMPASS_DIRECTION_HREFS[id],
        ...translateCompassDirection(dictionary, profile.workspaceRole, id),
      })),
    [dictionary, profile.workspaceRole],
  );

  return (
    <section aria-labelledby="home-compass-heading" className="space-y-3">
      <p className={cbaiSectionEyebrow} id="home-compass-heading">
        {t("home.compassHeading")}
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {directions.map((direction, index) => (
          <li key={direction.id}>
            <Link
              href={direction.href}
              className={`${cbaiGlassCard} group flex h-full flex-col gap-1.5 p-3.5 transition-colors hover:border-teal-500/30`}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-teal-500/30 text-[10px] font-semibold text-teal-300"
                >
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-zinc-100 group-hover:text-teal-300">
                  {direction.label}
                </span>
              </span>
              <span className="text-[11px] leading-relaxed text-zinc-500">{direction.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
