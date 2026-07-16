"use client";

import { cbaiLoadingLine, cbaiMineralPanel, cbaiTransition } from "@/components/brand/brand-classes";

type ActivationStatusLineProps = {
  message: string;
  /** polite for completions; assertive for errors */
  politeness?: "polite" | "assertive";
  compact?: boolean;
};

/** One calm, visible status — replaces silent loading and toast spam. */
export default function ActivationStatusLine({
  message,
  politeness = "polite",
  compact = false,
}: ActivationStatusLineProps) {
  if (!message) return null;

  return (
    <p
      role="status"
      aria-live={politeness}
      className={
        compact
          ? `${cbaiLoadingLine} ${cbaiTransition}`
          : `${cbaiMineralPanel} ${cbaiLoadingLine} ${cbaiTransition}`
      }
    >
      {message}
    </p>
  );
}
