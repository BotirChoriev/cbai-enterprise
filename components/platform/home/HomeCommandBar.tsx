"use client";

import AssistantCommandCenter from "@/components/assistant/AssistantCommandCenter";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

/**
 * Prominent first-screen voice/text command bar (Phase 1/8) — reuses the exact same
 * AssistantCommandCenter component already mounted in the global header (never a second
 * assistant or a duplicate command system), rendered with `size="prominent"`. A stable `useId()`
 * inside that component keeps the two simultaneous mounts (header + here) from colliding.
 */
export default function HomeCommandBar() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="home-command-bar-heading" className={`${cbaiGlassCard} mx-auto max-w-3xl space-y-3 p-6 text-center sm:p-8`}>
      <p className={cbaiSectionEyebrow} id="home-command-bar-heading">
        {t("home.quickActions")}
      </p>
      <div className="flex justify-center">
        <AssistantCommandCenter size="prominent" />
      </div>
    </section>
  );
}
