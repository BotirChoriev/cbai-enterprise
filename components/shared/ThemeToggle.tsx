"use client";

import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import type { ThemeMode } from "@/lib/assistant/assistant-profile";

const THEME_OPTIONS: readonly { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
  {
    mode: "system",
    label: "System",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
        <rect x="2.5" y="3.5" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M7 17h6M10 13.5V17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    mode: "light",
    label: "Light",
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
    label: "Deep",
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
 * Real Light Intelligence Mode / Deep Intelligence Mode / System toggle (Platform Activation
 * mission — the `html.theme-light` CSS variables already existed but nothing ever set the class).
 * Reuses the existing AssistantProfile (`themeMode`) rather than a second, parallel theme store —
 * the same profile that already persists signed-out locally and signed-in via cloud profile sync.
 */
export default function ThemeToggle({
  className = "",
  hideOnMobile = false,
}: {
  className?: string;
  /** True hides this control below the `sm` breakpoint. A boolean prop rather than a passed
   * `"hidden sm:inline-flex"` className — the display utility must live in exactly one place, or
   * the base `inline-flex` this component needs for its own layout wins the cascade regardless of
   * what a caller passes in (a real bug this fixed: the control never actually hid on mobile). */
  hideOnMobile?: boolean;
}) {
  const { profile, updateProfile } = useAssistantProfile();

  return (
    <div
      role="radiogroup"
      aria-label="Interface theme"
      className={`${hideOnMobile ? "hidden sm:inline-flex" : "inline-flex"} items-center gap-0.5 rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5 ${className}`}
    >
      {THEME_OPTIONS.map((option) => {
        const isActive = profile.themeMode === option.mode;
        return (
          <button
            key={option.mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${option.label} theme`}
            title={`${option.label} theme`}
            onClick={() => updateProfile({ themeMode: option.mode })}
            className={`flex h-7 min-w-7 items-center justify-center gap-1 rounded-md px-1.5 text-[11px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
              isActive ? "bg-cyan-500/15 text-cyan-300" : "text-zinc-500 hover:text-zinc-200"
            }`}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}
