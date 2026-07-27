"use client";

import { neutralMonogram } from "@/lib/university-intelligence/logo";
import type { UniversityLogoIdentity } from "@/lib/university-intelligence/types";
import { getUniversityIntelligenceCopy } from "@/lib/i18n/platform-copy-university-intelligence";
import { useTranslation } from "@/lib/i18n/use-translation";

type Props = {
  readonly abbreviation: string;
  readonly officialName: string;
  readonly logo: UniversityLogoIdentity;
  readonly size?: "sm" | "md" | "lg";
};

const SIZE = {
  sm: "h-10 w-10 text-[10px]",
  md: "h-12 w-12 text-xs",
  lg: "h-16 w-16 text-sm",
} as const;

export default function UniversityLogoMark({
  abbreviation,
  officialName,
  logo,
  size = "md",
}: Props) {
  const { language } = useTranslation();
  const copy = getUniversityIntelligenceCopy(language);
  const monogram = neutralMonogram(abbreviation);

  if (logo.isOfficialAsset && logo.officialLogoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- verified local/permitted asset path only
      <img
        src={logo.officialLogoUrl}
        alt={`${copy.officialLogo}: ${officialName}`}
        className={`${SIZE[size]} rounded-lg border border-[var(--cbai-border)] object-contain bg-[var(--cbai-surface)] p-1`}
        data-cbai-official-logo=""
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={copy.neutralMonogram}
      className={`inline-flex ${SIZE[size]} shrink-0 items-center justify-center rounded-lg border border-dashed border-teal-500/40 bg-[color-mix(in_oklab,var(--cbai-surface)_80%,transparent)] font-mono font-bold tracking-wide text-teal-700 dark:text-teal-300`}
      data-cbai-neutral-monogram=""
    >
      <span aria-hidden="true">{monogram}</span>
    </span>
  );
}
