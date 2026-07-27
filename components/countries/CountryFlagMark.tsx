"use client";

import { flagEmojiFromIsoAlpha2 } from "@/lib/country-intelligence/flags";
import { fillCountryCopy, getCountryIntelligenceCopy } from "@/lib/i18n/platform-copy-country-intelligence";
import { useTranslation } from "@/lib/i18n/use-translation";

type CountryFlagMarkProps = {
  readonly isoAlpha2: string;
  readonly displayName: string;
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
};

const SIZE: Record<NonNullable<CountryFlagMarkProps["size"]>, string> = {
  sm: "h-8 w-10 text-lg",
  md: "h-10 w-12 text-2xl",
  lg: "h-14 w-16 text-4xl",
};

/**
 * Unicode flag from ISO alpha-2 with accessible alt and neutral fallback.
 * Never fabricates a coat of arms.
 */
export default function CountryFlagMark({
  isoAlpha2,
  displayName,
  size = "md",
  className = "",
}: CountryFlagMarkProps) {
  const { language } = useTranslation();
  const copy = getCountryIntelligenceCopy(language);
  const emoji = flagEmojiFromIsoAlpha2(isoAlpha2);
  const alt = fillCountryCopy(copy.flagAlt, { country: displayName });

  return (
    <span
      role="img"
      aria-label={alt}
      className={`inline-flex shrink-0 items-center justify-center rounded-md border border-[color-mix(in_oklab,var(--cbai-border)_80%,transparent)] bg-[color-mix(in_oklab,var(--cbai-surface)_70%,transparent)] leading-none ${SIZE[size]} ${className}`}
      data-cbai-country-flag=""
    >
      {emoji ? (
        <span aria-hidden="true" className="select-none">
          {emoji}
        </span>
      ) : (
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--cbai-text-secondary)]">
          {isoAlpha2}
        </span>
      )}
    </span>
  );
}
