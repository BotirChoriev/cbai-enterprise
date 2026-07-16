"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import OperatingContextColumn from "@/components/operating/OperatingContextColumn";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { shouldShowOperatingContextColumn } from "@/lib/intelligence-os/progressive-disclosure";

/** Mobile access to Living Context — hidden on lg+ where rail is persistent. */
export default function LivingContextMobileToggle() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const disclosure = useProgressiveDisclosure();
  const [open, setOpen] = useState(false);

  if (!shouldShowOperatingContextColumn(pathname, disclosure)) return null;

  return (
    <>
      <button
        type="button"
        className="fixed bottom-20 right-4 z-40 rounded-full border border-teal-500/30 bg-[#050810]/95 px-4 py-2 text-xs font-medium text-teal-300 shadow-lg lg:hidden"
        aria-expanded={open}
        aria-controls="living-context-drawer"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? t("livingIntelligence.closeLivingContext") : t("livingIntelligence.openLivingContext")}
      </button>
      {open ? (
        <div
          id="living-context-drawer"
          className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto border-t border-zinc-800 bg-[#050810] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("intelligenceSpaces.livingContext")}
        >
          <OperatingContextColumn className="border-l-0" />
        </div>
      ) : null}
    </>
  );
}
