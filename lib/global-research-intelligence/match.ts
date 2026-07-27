/**
 * Research match engine — 3–5 explainable options; never opaque “best”.
 */

import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import { universities } from "@/lib/universities";
import { countries } from "@/lib/countries";
import { namesMatch } from "@/lib/name-match";

export type ResearchMatchInput = {
  readonly topicHint: string;
  readonly methodologyHint?: string | null;
  readonly geographyCountryIds?: readonly string[];
  readonly languages?: readonly string[];
  readonly collaborationType?: string | null;
};

export type ResearchMatchOption = {
  readonly rankAmongResults: number;
  readonly topicId: string;
  readonly topicName: string;
  readonly domainName: string;
  readonly universityId: string | null;
  readonly universityName: string | null;
  readonly whyMatches: readonly string[];
  readonly supportingEvidence: readonly string[];
  readonly unknown: readonly string[];
  readonly capabilityAvailable: string;
  readonly limitation: string;
  readonly userMustVerify: readonly string[];
  readonly whoApprovesNext: string;
  readonly humanVerificationRequired: true;
};

export type ResearchMatchResult = {
  readonly inputFingerprint: string;
  readonly options: readonly ResearchMatchOption[];
  readonly rankingForbiddenNotice: string;
  readonly honestyNotice: string;
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fingerprint(input: ResearchMatchInput): string {
  return normalize(
    [
      input.topicHint,
      input.methodologyHint ?? "",
      ...(input.geographyCountryIds ?? []),
      ...(input.languages ?? []),
      input.collaborationType ?? "",
    ].join("|"),
  );
}

function countryIdForUniversityCountry(countryName: string): string | null {
  return countries.find((c) => namesMatch(c.name, countryName))?.id ?? null;
}

export function runResearchMatch(input: ResearchMatchInput): ResearchMatchResult {
  const fp = fingerprint(input);
  const hint = normalize(input.topicHint);
  const method = normalize(input.methodologyHint ?? "");
  const geo = input.geographyCountryIds ?? [];

  const scoredTopics = RESEARCH_TOPICS.map((t) => {
    let score = 0;
    const blob = normalize(`${t.topicName} ${t.domain} ${t.description} ${t.relatedMethods.join(" ")}`);
    if (hint && blob.includes(hint.split(" ")[0] ?? "")) score += 8;
    for (const token of hint.split(" ").filter((x) => x.length > 3)) {
      if (blob.includes(token)) score += 2;
    }
    if (method && t.relatedMethods.some((m) => normalize(m).includes(method.split(" ")[0] ?? ""))) {
      score += 5;
    }
    for (let i = 0; i < t.topicId.length; i++) score += t.topicId.charCodeAt(i) % 3;
    return { t, score };
  }).sort((a, b) => (b.score !== a.score ? b.score - a.score : a.t.topicId.localeCompare(b.t.topicId)));

  const topicSlice = scoredTopics.slice(0, 5);

  const uniPool = universities
    .map((u) => {
      const cid = countryIdForUniversityCountry(u.country);
      let score = 0;
      if (geo.length === 0) score += 1;
      else if (cid && geo.includes(cid)) score += 10;
      else score -= 3;
      for (let i = 0; i < u.id.length; i++) score += u.id.charCodeAt(i) % 2;
      return { u, score, cid };
    })
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.u.id.localeCompare(b.u.id)));

  const options: ResearchMatchOption[] = topicSlice.map((row, index) => {
    const uni = uniPool[index % Math.max(uniPool.length, 1)]?.u ?? null;
    const inGeo =
      !geo.length ||
      (uni != null &&
        (() => {
          const cid = countryIdForUniversityCountry(uni.country);
          return cid != null && geo.includes(cid);
        })());

    return {
      rankAmongResults: index + 1,
      topicId: row.t.topicId,
      topicName: row.t.topicName,
      domainName: row.t.domain,
      universityId: uni?.id ?? null,
      universityName: uni?.name ?? null,
      whyMatches: [
        `Catalog topic “${row.t.topicName}” aligns with topic hint by name/domain/methods text match only.`,
        uni
          ? inGeo
            ? `Registry university ${uni.name} (${uni.country}) is a geography candidate — not a quality ranking.`
            : `Registry university ${uni.name} shown without verified geographic fit.`
          : "No university registry candidate attached.",
      ],
      supportingEvidence: [
        `Catalog domain: ${row.t.domain}`,
        row.t.relatedMethods.length
          ? `Catalog methods: ${row.t.relatedMethods.slice(0, 3).join("; ")}`
          : "No catalog methods listed.",
        uni?.website ? `University website recorded: ${uni.website}` : "University website may be missing.",
      ],
      unknown: [
        "Verified laboratory capability not connected",
        "Verified researcher expertise not connected",
        "Active opportunity status not connected",
        "Collaboration history not connected",
      ],
      capabilityAvailable: "Catalog topic metadata and local university registry identity only.",
      limitation:
        "No claim of research quality, success, or readiness — sources for labs/people/outcomes are not connected.",
      userMustVerify: [
        "Whether any institution actually works on this topic",
        "Methodology compatibility with your protocol",
        "Ethics, IP, and funding constraints",
      ],
      whoApprovesNext: "The human user — CBAI does not approve collaboration or spending.",
      humanVerificationRequired: true,
    };
  });

  return {
    inputFingerprint: fp,
    options: options.slice(0, Math.min(5, Math.max(3, options.length))),
    rankingForbiddenNotice:
      "CBAI never returns one opaque “best” research match or ranks people/institutions as good/bad.",
    honestyNotice:
      "Matches use catalog text + local university registry only. Missing labs, people, and outcomes stay unknown.",
  };
}
