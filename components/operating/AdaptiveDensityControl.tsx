"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import type { UserDensityMode } from "@/lib/intelligence-os/adaptive-density";
import { densityModeExplanation } from "@/lib/intelligence-os/adaptive-density";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const MODES: readonly UserDensityMode[] = ["focused", "standard", "expert"];

const MODE_LABEL: Record<UserDensityMode, string> = {
  focused: "densityFocused",
  standard: "densityStandard",
  expert: "densityExpert",
};

const MODE_EXPLAIN: Record<UserDensityMode, string> = {
  focused: "densityFocusedExplain",
  standard: "densityStandardExplain",
  expert: "densityExpertExplain",
};

/** User-controlled display density — explainable, reversible, never capability-gated. */
export default function AdaptiveDensityControl() {
  const { t } = useTranslation();
  const { profile, updateProfile } = useAssistantProfile();
  const current = profile.displayDensity ?? "standard";

  return (
    <section className={`${cbaiMineralSurface} space-y-3 p-4`}>
      <p className={cbaiSectionEyebrow}>{t("universalWorkspace.densityControl")}</p>
      <div className="flex flex-wrap gap-2">
        {MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={current === mode}
            onClick={() => updateProfile({ displayDensity: mode })}
            className={`rounded-md border px-3 py-1.5 text-xs ${
              current === mode
                ? "border-teal-500/50 bg-teal-500/10 text-teal-300"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            }`}
          >
            {t(`universalWorkspace.${MODE_LABEL[mode]}`)}
          </button>
        ))}
      </div>
      <p className="text-xs text-zinc-500">
        {t("universalWorkspace.densityExplanation")}: {t(`universalWorkspace.${MODE_EXPLAIN[current]}`)}
      </p>
      <p className="text-[10px] text-zinc-600">{densityModeExplanation(current)}</p>
    </section>
  );
}
