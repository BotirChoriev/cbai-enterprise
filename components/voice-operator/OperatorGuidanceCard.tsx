"use client";

import type { PlatformGuidance } from "@/lib/platform-actions/types";
import { useTranslation } from "@/lib/i18n/use-translation";

type OperatorGuidanceCardProps = {
  readonly guidance: PlatformGuidance;
  readonly onDismiss: () => void;
};

export default function OperatorGuidanceCard({ guidance, onDismiss }: OperatorGuidanceCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] p-3 text-xs shadow-[var(--cbai-shadow-soft)] backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[var(--foreground)]">{t("platformGuidance.cardTitle")}</p>
          <p className="mt-0.5 text-[var(--foreground)]">{t(guidance.sectionKey)}</p>
          <p className="mt-1 text-[var(--muted)]">{t(guidance.purposeKey)}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 min-h-8 rounded-md px-2 text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          {t("platformGuidance.dismiss")}
        </button>
      </div>
      {guidance.nextActions.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {guidance.nextActions.slice(0, 3).map((action) => (
            <li key={action.id} className="text-[var(--foreground)]">
              • {t(action.labelKey)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
