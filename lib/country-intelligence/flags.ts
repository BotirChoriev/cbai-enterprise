/**
 * Flag + emblem helpers. Emblems require licensed assets — never fabricate.
 */

import type { EmblemMetadata, FlagMetadata } from "@/lib/country-intelligence/types";

/** ISO 3166-1 alpha-2 → Unicode regional indicator flag emoji. */
export function flagEmojiFromIsoAlpha2(isoAlpha2: string): string {
  const code = isoAlpha2.trim().toUpperCase();
  // Only produce flags for well-formed alpha codes (A–Z). Reject digits/symbols.
  if (!/^[A-Z]{2}$/.test(code)) return "";
  // Reject clearly non-assigned placeholder codes used in tests / unknowns.
  if (code === "XX" || code === "ZZ") return "";
  const A = 0x1f1e6;
  const base = "A".charCodeAt(0);
  return String.fromCodePoint(A + (code.charCodeAt(0) - base), A + (code.charCodeAt(1) - base));
}

export function buildFlagMetadata(isoAlpha2: string): FlagMetadata {
  return {
    isoAlpha2: isoAlpha2.toUpperCase(),
    emoji: flagEmojiFromIsoAlpha2(isoAlpha2),
    altTextKey: "flagAlt",
  };
}

/**
 * Licensed emblem registry. Empty by design until assets are verified.
 * Never invent a generic coat of arms.
 */
const LICENSED_EMBLEMS: Readonly<Record<string, Omit<EmblemMetadata, "available" | "reasonIfUnavailable">>> = {
  // Intentionally empty — add only after license verification.
};

export function resolveEmblemMetadata(countryId: string): EmblemMetadata {
  const entry = LICENSED_EMBLEMS[countryId];
  if (!entry?.assetPath || !entry.license) {
    return {
      available: false,
      assetPath: null,
      source: null,
      license: null,
      reasonIfUnavailable: "not_licensed",
    };
  }
  return {
    available: true,
    assetPath: entry.assetPath,
    source: entry.source,
    license: entry.license,
    reasonIfUnavailable: "not_licensed",
  };
}

/** Accessible flag label without repeating adjacent country name when name is provided separately. */
export function flagAltText(displayName: string, copyFlagAlt: string): string {
  return copyFlagAlt.replace("{country}", displayName);
}
