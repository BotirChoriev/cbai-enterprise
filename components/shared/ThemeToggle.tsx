"use client";

import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import type { ThemeMode } from "@/lib/assistant/assistant-profile";
import { useTranslation } from "@/lib/i18n/use-translation";

const THEME_OPTIONS: readonly {
  mode: ThemeMode;
  labelKey: "themeSystem" | "themeLight" | "themeDeep";
  icon: React.ReactNode;
}[] = [
  {
    mode: "system",
    labelKey: "themeSystem",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
        <rect x="2.5" y="3.5" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M7 17h6M10 13.5V17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    mode: "light",
    labelKey: "themeLight",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
        <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1L4.7 4.7"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    mode: "dark",
    labelKey: "themeDeep",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
        <path
          d="M17 11.5A7 7 0 018.5 3 7 7 0 1017 11.5z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

/**
 * Real Light / Deep / System toggle — labels localized via settingsPage theme keys.
 */
export default function ThemeToggle({
  className = "",
  hideOnMobile = false,
}: {
  className?: string;
  hideOnMobile?: boolean;
}) {
  const { profile, updateProfile } = useAssistantProfile();
  const { t } = useTranslation();

  return (
    <div
      role="radiogroup"
      aria-label={t("settingsPage.themeAriaLabel")}
      className={`${hideOnMobile ? "hidden sm:inline-flex" : "inline-flex"} items-center gap-0.5 rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] p-0.5 ${className}`}
    >
      {THEME_OPTIONS.map((option) => {
        const isActive = profile.themeMode === option.mode;
        const label = t(`settingsPage.${option.labelKey}`);
        return (
          <button
            key={option.mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            title={label}
            onClick={() => updateProfile({ themeMode: option.mode })}
            className={`flex h-7 min-w-7 items-center justify-center gap-1 rounded-md px-1.5 text-[11px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cbai-focus-ring)] ${
              isActive
                ? "bg-[var(--cbai-accent-subtle)] text-[var(--cbai-accent-primary)]"
                : "text-[var(--cbai-text-muted)] hover:text-[var(--cbai-text-primary)]"
            }`}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}
