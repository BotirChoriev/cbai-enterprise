"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { clearLivingMemory, resetLivingMemoryClearFlag } from "@/lib/intelligence-os/living-memory";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

/** User-controlled session memory — not surveillance. */
export default function LivingMemoryControl() {
  const { t } = useTranslation();
  const [cleared, setCleared] = useState(false);

  function handleClear() {
    clearLivingMemory();
    setCleared(true);
  }

  function handleRestore() {
    resetLivingMemoryClearFlag();
    setCleared(false);
  }

  return (
    <section className={`${cbaiMineralSurface} space-y-2 p-4`}>
      <p className={cbaiSectionEyebrow}>{t("experienceEngineering.clearLivingMemory")}</p>
      <p className="text-xs text-zinc-500">{t("experienceEngineering.clearLivingMemoryBody")}</p>
      {cleared ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-teal-400/80">{t("experienceEngineering.livingMemoryCleared")}</p>
          <button type="button" onClick={handleRestore} className="text-xs text-zinc-500 hover:text-zinc-300">
            {t("common.continue")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
        >
          {t("experienceEngineering.clearLivingMemory")}
        </button>
      )}
    </section>
  );
}
