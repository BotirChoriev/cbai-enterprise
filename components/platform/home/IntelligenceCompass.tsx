"use client";

import Link from "next/link";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { resolveCompassDirections } from "@/lib/assistant/intelligence-compass";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

/**
 * Intelligence Compass (Platform Activation mission, Mission 10) — a functional navigation
 * mechanism, not a decorative clock: six real directions arranged in a ring, each a real link to
 * an already-existing route. Framing text adapts to the user's real, saved work-context role
 * (lib/assistant/intelligence-compass.ts); the destinations themselves never change per role.
 * This is always an *additional* way in — the standard Sidebar/mobile nav remains the primary,
 * always-available navigation, so nothing here is the only way to reach any of these six pages.
 */
export default function IntelligenceCompass() {
  const { profile } = useAssistantProfile();
  const { t } = useTranslation();
  const directions = resolveCompassDirections(profile.workspaceRole);

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
