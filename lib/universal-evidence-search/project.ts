/**
 * Universal Evidence Search — projects gateway/registry hits into six honest buckets.
 * Never fabricates entities; empty buckets stay empty with coverage notes.
 */

import type { GatewaySearchResponse } from "@/lib/search-gateway";
import { listEvidencePassports } from "@/lib/evidence-passport";
import { listWorldChangeRadar } from "@/lib/world-and-me-intelligence";

export const UES_GROUP_IDS = [
  "entities",
  "evidence",
  "people",
  "work",
  "changes",
  "opportunities",
] as const;

export type UesGroupId = (typeof UES_GROUP_IDS)[number];

export type UesResultItem = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly href: string | null;
  readonly sourceLabel: string;
  readonly evidenceState: "registry" | "passport" | "unknown" | "external_blocked";
  readonly whyRelevant: string;
  readonly officialVsCbai: "official_or_registry" | "cbai_synthesis" | "unknown";
  readonly unknowns: readonly string[];
};

export type UesGroup = {
  readonly id: UesGroupId;
  readonly items: readonly UesResultItem[];
  readonly coverageNote: string;
};

export type UniversalEvidenceSearchProjection = {
  readonly query: string;
  readonly groups: readonly UesGroup[];
  readonly hasResults: boolean;
  readonly registryOnly: boolean;
  readonly honestyBanner: string;
};

function entityHref(type: string, id: string): string {
  if (type === "country") return `/countries?country=${encodeURIComponent(id)}`;
  if (type === "company") return `/companies?company=${encodeURIComponent(id)}`;
  if (type === "university") return `/universities?university=${encodeURIComponent(id)}`;
  return "/search";
}

export function projectUniversalEvidenceSearch(
  response: GatewaySearchResponse,
  options?: { readonly locale?: string },
): UniversalEvidenceSearchProjection {
  const q = response.query.trim();
  const locale = options?.locale ?? "en";

  const entityItems: UesResultItem[] = response.groups
    .filter((g) => ["countries", "companies", "universities"].includes(g.id))
    .flatMap((g) =>
      g.entities.map((hit) => ({
        id: hit.entity.id,
        title: hit.entity.name,
        subtitle: hit.entity.type,
        href: entityHref(hit.entity.type, hit.entity.id),
        sourceLabel: "Local registry",
        evidenceState: "registry" as const,
        whyRelevant: hit.matchReasons?.[0]?.snippet || "Matched local registry fields.",
        officialVsCbai: "official_or_registry" as const,
        unknowns: ["External live verification not connected in this Preview."],
      })),
    );

  const workItems: UesResultItem[] = response.groups
    .filter((g) => g.id === "projects" || g.id === "research_topics")
    .flatMap((g) => [
      ...g.entities.map((hit) => ({
        id: hit.entity.id,
        title: hit.entity.name,
        subtitle: g.label,
        href: entityHref(hit.entity.type, hit.entity.id),
        sourceLabel: "Local registry",
        evidenceState: "registry" as const,
        whyRelevant: "Matched work/topic registry entry.",
        officialVsCbai: "official_or_registry" as const,
        unknowns: ["Outcome verification requires human review."],
      })),
      ...g.topics.map((topic) => ({
        id: topic.id,
        title: topic.label,
        subtitle: topic.platformArea,
        href: topic.href ?? topic.route ?? "/research",
        sourceLabel: topic.connected ? "Connected area" : "Declared area",
        evidenceState: topic.connected ? ("registry" as const) : ("unknown" as const),
        whyRelevant: topic.matchReason || "Keyword match in declared platform area.",
        officialVsCbai: "cbai_synthesis" as const,
        unknowns: topic.connected ? [] : ["Evidence not connected for this topic."],
      })),
    ]);

  const evidenceTopicItems: UesResultItem[] = response.groups
    .filter((g) => g.id === "evidence" || g.id === "knowledge")
    .flatMap((g) =>
      g.topics.map((topic) => ({
        id: topic.id,
        title: topic.label,
        subtitle: topic.evidenceStatus,
        href: topic.href ?? topic.route ?? "/evidence",
        sourceLabel: "Platform evidence area",
        evidenceState: topic.connected ? ("registry" as const) : ("unknown" as const),
        whyRelevant: topic.matchReason || "Matched evidence/knowledge topic keywords.",
        officialVsCbai: "cbai_synthesis" as const,
        unknowns: ["Counter-evidence and replication status may be unknown."],
      })),
    );

  const qLower = q.toLowerCase();
  const passportItems: UesResultItem[] = listEvidencePassports()
    .filter(
      (p) =>
        !q ||
        p.claimText.toLowerCase().includes(qLower) ||
        p.originalSourceContent.toLowerCase().includes(qLower),
    )
    .slice(0, 20)
    .map((p) => ({
      id: p.passportId,
      title: p.claimText,
      subtitle: `${p.stance} · ${p.humanVerificationStatus}`,
      href: `/evidence?passport=${encodeURIComponent(p.passportId)}`,
      sourceLabel: p.directSourceUrl || "User-confirmed passport",
      evidenceState: "passport" as const,
      whyRelevant: "Evidence Passport match.",
      officialVsCbai: p.cbaiSynthesis ? ("cbai_synthesis" as const) : ("official_or_registry" as const),
      unknowns: p.limitations.length ? [...p.limitations] : ["Freshness may be unknown."],
    }));

  const peopleItems: UesResultItem[] = []; // ORCID/people registry not connected — stay empty honestly.

  const radar = listWorldChangeRadar();
  const changeItems: UesResultItem[] = radar.records
    .filter((c) => !q || c.title.toLowerCase().includes(qLower))
    .slice(0, 12)
    .map((c) => ({
      id: c.id,
      title: c.title || "Change record",
      subtitle: c.freshness || radar.freshness,
      href: "/graph",
      sourceLabel: c.sourceName || "World Change Radar",
      evidenceState: c.freshness === "no_verified_live_source" ? ("unknown" as const) : ("registry" as const),
      whyRelevant: "Projected from World and Me radar (no fabricated live feed).",
      officialVsCbai: "cbai_synthesis" as const,
      unknowns: c.freshness === "no_verified_live_source" ? [radar.emptyState] : [],
    }));

  const opportunityItems: UesResultItem[] = response.groups
    .filter((g) => g.id === "future_modules")
    .flatMap((g) =>
      g.topics.map((topic) => ({
        id: topic.id,
        title: topic.label,
        subtitle: "Declared opportunity / module",
        href: topic.href ?? "/research",
        sourceLabel: "Platform declaration",
        evidenceState: "external_blocked" as const,
        whyRelevant: topic.matchReason || "Declared future capability — not a fabricated opportunity.",
        officialVsCbai: "cbai_synthesis" as const,
        unknowns: ["External opportunity feeds are not connected."],
      })),
    );

  const groups: UesGroup[] = [
    {
      id: "entities",
      items: entityItems,
      coverageNote: entityItems.length
        ? "Local country/company/university registry matches."
        : "No registry entity matches for this query.",
    },
    {
      id: "evidence",
      items: [...passportItems, ...evidenceTopicItems],
      coverageNote:
        passportItems.length || evidenceTopicItems.length
          ? "Evidence Passports and declared evidence areas."
          : "No evidence passport or evidence-area matches.",
    },
    {
      id: "people",
      items: peopleItems,
      coverageNote: "People/ORCID registry is not connected in this Preview — bucket stays empty.",
    },
    {
      id: "work",
      items: workItems,
      coverageNote: workItems.length ? "Projects and research topics from local catalogs." : "No work matches.",
    },
    {
      id: "changes",
      items: changeItems,
      coverageNote: changeItems.length
        ? "World Change Radar projections (honest empty when no verified live source)."
        : "No verified change records for this query.",
    },
    {
      id: "opportunities",
      items: opportunityItems,
      coverageNote: opportunityItems.length
        ? "Declared platform opportunities only — not live grant feeds."
        : "No opportunity declarations matched.",
    },
  ];

  const hasResults = groups.some((g) => g.items.length > 0);

  return {
    query: q,
    groups,
    hasResults,
    registryOnly: passportItems.length === 0,
    honestyBanner:
      locale === "uz"
        ? "Natijalar mahalliy reestr va ochiq passportlardan. Tasdiqlanmagan jonli manba uydurilmaydi."
        : "Results are local registry and confirmed passport hits. Unverified live sources are never fabricated.",
  };
}
