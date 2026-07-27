/**
 * Official logo registry — empty until assets are licensed.
 * Never fabricate or AI-generate institutional marks.
 */

import type { UniversityLogoIdentity } from "@/lib/university-intelligence/types";

const PERMITTED_LOGOS: Readonly<
  Record<
    string,
    {
      officialLogoUrl: string;
      emblemUrl?: string;
      logoSource: string;
      logoLicense: string;
      usageStatus: "permitted" | "license_verified";
    }
  >
> = {
  // Intentionally empty — add only after license verification.
};

export function resolveUniversityLogo(universityId: string): UniversityLogoIdentity {
  const entry = PERMITTED_LOGOS[universityId];
  if (!entry?.officialLogoUrl) {
    return {
      officialLogoUrl: null,
      emblemUrl: null,
      logoSource: null,
      logoLicense: null,
      usageStatus: "not_connected",
      isOfficialAsset: false,
    };
  }
  return {
    officialLogoUrl: entry.officialLogoUrl,
    emblemUrl: entry.emblemUrl ?? null,
    logoSource: entry.logoSource,
    logoLicense: entry.logoLicense,
    usageStatus: entry.usageStatus,
    isOfficialAsset: true,
  };
}

/** Neutral monogram from abbreviation — visually distinct from official logos. */
export function neutralMonogram(abbreviation: string): string {
  const cleaned = abbreviation.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return cleaned.slice(0, 4) || "UNI";
}
