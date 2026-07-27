"use client";

import { useState, type ReactNode } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { cbaiFocusRing } from "@/components/brand/brand-classes";

type ExpertDetailDisclosureProps = {
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
};

/**
 * Discoverable expert depth for all disclosure levels — collapsed by default for beginners.
 */
export default function ExpertDetailDisclosure({
  children,
  defaultOpen = false,
}: ExpertDetailDisclosureProps) {
  const { t } = useTranslation();
  const disclosure = useProgressiveDisclosure();
  const [open, setOpen] = useState(defaultOpen || disclosure.level === "expert");

  if (!disclosure.showExpertDetailToggle && disclosure.level === "beginner") {
    // Still show a labeled control so depth is discoverable.
  }

  return (
    <details
      className="cbai-expert-detail rounded-lg border border-[var(--cbai-border-default)] p-3"
      open={open}
      onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
      data-cbai-expert-detail=""
    >
      <summary className={`cursor-pointer text-sm font-medium text-[var(--cbai-text-primary)] ${cbaiFocusRing}`}>
        {t("operationalObject.expertDetailToggle")}
        <span className="mt-1 block text-[11px] font-normal text-[var(--cbai-text-muted)]">
          {t("operationalObject.expertDetailHint")}
        </span>
      </summary>
      <div className="mt-3 space-y-4">{children}</div>
    </details>
  );
}
