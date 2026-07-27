/**
 * Deterministic Academic Match Engine — 3–5 explainable options.
 * Never ranks people or universities as good/bad; never claims a single “best”.
 */

export type AcademicMatchInput = {
  readonly projectTheme: string;
  readonly researchQuestion?: string | null;
  readonly methodology?: string | null;
  readonly requiredExpertise?: readonly string[];
  readonly requiredLaboratory?: string | null;
  readonly equipment?: readonly string[];
  readonly geographyCountryIds?: readonly string[];
  readonly languages?: readonly string[];
  readonly collaborationType?: string | null;
  readonly deadline?: string | null;
  readonly fundingStatus?: string | null;
  readonly ethicsConstraints?: readonly string[];
  readonly ipConfidentiality?: string | null;
};

export type AcademicMatchOption = {
  readonly rankAmongResults: number;
  readonly universityId: string;
  readonly universityName: string;
  readonly countryName: string;
  readonly whyMatches: readonly string[];
  readonly supportingEvidence: readonly string[];
  readonly missingInformation: readonly string[];
  readonly methodologyCompatibility: "unknown" | "compatible" | "incompatible" | "partial";
  readonly laboratoryCompatibility: "unknown" | "compatible" | "incompatible" | "partial";
  readonly languageCompatibility: "unknown" | "compatible" | "incompatible" | "partial";
  readonly geographicConstraints: readonly string[];
  readonly collaborationHistory: string;
  readonly opportunityStatus: "not_connected" | "possible_registry_match";
  readonly sourceFreshness: "unknown";
  readonly potentialLimitations: readonly string[];
  readonly humanVerificationRequired: true;
};

export type AcademicMatchResult = {
  readonly inputFingerprint: string;
  readonly options: readonly AcademicMatchOption[];
  readonly rankingForbiddenNotice: string;
  readonly honestyNotice: string;
};

import { universities } from "@/lib/universities";
import { countries } from "@/lib/countries";
import { namesMatch } from "@/lib/name-match";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fingerprint(input: AcademicMatchInput): string {
  return normalize(
    [
      input.projectTheme,
      input.researchQuestion ?? "",
      input.methodology ?? "",
      ...(input.requiredExpertise ?? []),
      input.requiredLaboratory ?? "",
      ...(input.equipment ?? []),
      ...(input.geographyCountryIds ?? []),
      ...(input.languages ?? []),
      input.collaborationType ?? "",
      input.deadline ?? "",
      input.fundingStatus ?? "",
      ...(input.ethicsConstraints ?? []),
      input.ipConfidentiality ?? "",
    ].join("|"),
  );
}

function countryIdForName(countryName: string): string | null {
  return countries.find((c) => namesMatch(c.name, countryName))?.id ?? null;
}

function scoreUniversity(
  universityId: string,
  countryName: string,
  input: AcademicMatchInput,
): number {
  let score = 0;
  const geo = input.geographyCountryIds ?? [];
  const cid = countryIdForName(countryName);
  if (geo.length === 0) score += 1;
  else if (cid && geo.includes(cid)) score += 10;
  else score -= 5;

  const theme = normalize(input.projectTheme);
  const name = normalize(universityId + " " + countryName);
  if (theme && name.includes(theme.split(" ")[0] ?? "")) score += 1;

  // Stable tie-breaker from id hash (deterministic).
  for (let i = 0; i < universityId.length; i++) score += universityId.charCodeAt(i) % 3;
  return score;
}

/**
 * Return 3–5 explainable options. Same input → same fingerprint and same ordered ids.
 */
export function runAcademicMatch(input: AcademicMatchInput): AcademicMatchResult {
  const fp = fingerprint(input);
  const geo = input.geographyCountryIds ?? [];

  const scored = universities
    .map((u) => ({
      u,
      score: scoreUniversity(u.id, u.country, input),
    }))
    .filter((row) => {
      if (geo.length === 0) return true;
      const cid = countryIdForName(row.u.country);
      return cid != null && geo.includes(cid);
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.u.id.localeCompare(b.u.id);
    });

  // Prefer geography-filtered set; if empty, fall back to all with honest geographic miss notice.
  const pool = scored.length > 0 ? scored : [...universities]
    .map((u) => ({ u, score: scoreUniversity(u.id, u.country, input) }))
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.u.id.localeCompare(b.u.id)));

  const slice = pool.slice(0, Math.min(5, Math.max(3, Math.min(5, pool.length))));
  const options: AcademicMatchOption[] = slice.map((row, index) => {
    const cid = countryIdForName(row.u.country);
    const inGeo = geo.length === 0 || (cid != null && geo.includes(cid));
    return {
      rankAmongResults: index + 1,
      universityId: row.u.id,
      universityName: row.u.name,
      countryName: row.u.country,
      whyMatches: [
        inGeo
          ? `Registry location matches requested geography (${row.u.country}).`
          : `Geography filter empty or unmatched — shown as registry candidate only.`,
        input.projectTheme
          ? `Project theme “${input.projectTheme}” is treated as a search hint — no verified lab/theme link is claimed.`
          : "No project theme provided.",
      ],
      supportingEvidence: [
        `Local registry identity: ${row.u.name} (${row.u.city}).`,
        row.u.website ? `Official website recorded: ${row.u.website}` : "Official website not recorded in registry.",
      ],
      missingInformation: [
        "Verified laboratories and equipment not connected.",
        "Verified academic profiles not connected.",
        "Methodology compatibility cannot be confirmed without source methods.",
      ],
      methodologyCompatibility: "unknown",
      laboratoryCompatibility: "unknown",
      languageCompatibility: "unknown",
      geographicConstraints: inGeo ? [] : ["Requested countries do not include this registry country."],
      collaborationHistory: "No verified collaboration history connected.",
      opportunityStatus: "not_connected",
      sourceFreshness: "unknown",
      potentialLimitations: [
        "Match is registry-based, not a scientific quality ranking.",
        "Human verification required before any outreach.",
      ],
      humanVerificationRequired: true,
    };
  });

  return {
    inputFingerprint: fp,
    options,
    rankingForbiddenNotice:
      "CBAI never produces a simplistic “best university” or personal good/bad ranking. Options are explainable shortlists for human decision.",
    honestyNotice:
      "Matches use local registry geography and identity only until licensed scientific catalogs connect. Missing lab/method data stays unknown.",
  };
}
