/**
 * Relationship-aware Command Center commands (Platform Relationship Activation mission,
 * migrated onto the Universal Entity Engine in the Platform Core mission).
 *
 * `resolveAssistantCommand` (assistant-commands.ts) is a pure phrase→fixed-href table — it has no
 * notion of "the entity currently on screen," so it cannot answer "open related research" for
 * whichever country/company/university/research topic the user is actually looking at. This
 * resolver fills that gap using `lib/entity/entity-relationships.ts`'s `buildEntityRelationships`
 * — the one shared relationship vocabulary every entity module normalizes onto — instead of
 * calling each module's per-kind relationship function directly. Never a fabricated link: when
 * exactly one real related entity exists, it navigates straight there; when several exist, it
 * opens the real listing page; when none exist, it returns an honest message instead of guessing.
 */

import { getResearchTopicPath } from "@/lib/research/research-topics";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import type { EntityRelationship, EntityType } from "@/lib/entity/entity.types";
import { profileSectionHref } from "@/components/shared/entity-profile-path";

export type RelationshipFocus =
  | { kind: "country"; id: string }
  | { kind: "company"; id: string }
  | { kind: "university"; id: string }
  | { kind: "research_topic"; id: string };

export type RelationshipCommandResult =
  | { type: "navigate"; href: string; message: string }
  | { type: "message"; message: string };

function matchesAny(normalized: string, phrases: readonly string[]): boolean {
  return phrases.some((phrase) => normalized.includes(phrase));
}

/** Picks a destination from a set of real relationships already resolved to hrefs. */
function pickTarget(matches: readonly EntityRelationship[], listHref: string, kindLabel: string): RelationshipCommandResult {
  const real = matches.filter((m) => m.targetHref !== null);
  if (real.length === 0) {
    return { type: "message", message: `No related ${kindLabel} connected yet.` };
  }
  if (real.length === 1) {
    return { type: "navigate", href: real[0].targetHref!, message: `Opening ${real[0].targetName}.` };
  }
  return { type: "navigate", href: listHref, message: `Opening ${kindLabel} (${real.length} related).` };
}

function relationshipsOfType(
  focus: RelationshipFocus,
  targetType: EntityType,
  relationshipType?: EntityRelationship["type"],
): EntityRelationship[] {
  return buildEntityRelationships(focus.kind, focus.id).filter(
    (rel) => rel.targetType === targetType && (relationshipType === undefined || rel.type === relationshipType),
  );
}

function focusBaseHref(focus: RelationshipFocus): string {
  switch (focus.kind) {
    case "country":
      return `/countries?country=${focus.id}`;
    case "company":
      return `/companies?company=${focus.id}`;
    case "university":
      return `/universities?university=${focus.id}`;
    case "research_topic":
      return getResearchTopicPath(focus.id);
  }
}

const RELATED_EVIDENCE_PHRASES = ["open related evidence", "related evidence", "open evidence"];
const RELATED_RESEARCH_PHRASES = ["open related research", "related research"];
const RELATED_COMPANY_PHRASES = ["open related compan", "related compan"];
const RELATED_UNIVERSITY_PHRASES = ["open related universit", "related universit"];
const OPEN_COUNTRY_PHRASES = ["open related country", "related country", "open country"];

/**
 * Resolves a relationship-aware command against whichever real entity is currently focused.
 * Returns null when the phrase isn't one of this resolver's — callers should fall through to
 * `resolveAssistantCommand` next.
 */
export function resolveRelationshipCommand(
  rawInput: string,
  focus: RelationshipFocus | null,
): RelationshipCommandResult | null {
  const normalized = rawInput.trim().toLowerCase();
  if (!normalized) return null;

  if (matchesAny(normalized, RELATED_EVIDENCE_PHRASES)) {
    if (!focus) return { type: "navigate", href: "/knowledge", message: "Opening Evidence." };
    return {
      type: "navigate",
      href: profileSectionHref(focusBaseHref(focus), "evidence"),
      message: "Opening Evidence.",
    };
  }

  if (matchesAny(normalized, RELATED_RESEARCH_PHRASES)) {
    if (focus?.kind === "company") {
      const matches = relationshipsOfType(focus, "research_topic", "HAS_RESEARCH");
      if (matches.length === 0) {
        return { type: "message", message: "No research topics related to this company yet." };
      }
      if (matches.length === 1) {
        return { type: "navigate", href: matches[0].targetHref!, message: `Opening ${matches[0].targetName}.` };
      }
      return { type: "navigate", href: "/research", message: `Opening Research (${matches.length} related topics).` };
    }
    if (focus?.kind === "country" || focus?.kind === "university") {
      return { type: "message", message: "No verified research connection exists for this entity yet." };
    }
    return { type: "navigate", href: "/research", message: "Opening Research." };
  }

  if (matchesAny(normalized, RELATED_COMPANY_PHRASES)) {
    if (focus?.kind === "country" || focus?.kind === "university" || focus?.kind === "research_topic") {
      return pickTarget(relationshipsOfType(focus, "company"), "/companies", "companies");
    }
    return { type: "message", message: "No related companies connected yet." };
  }

  if (matchesAny(normalized, RELATED_UNIVERSITY_PHRASES)) {
    if (focus?.kind === "country" || focus?.kind === "company") {
      return pickTarget(relationshipsOfType(focus, "university"), "/universities", "universities");
    }
    return { type: "message", message: "No related universities connected yet." };
  }

  if (matchesAny(normalized, OPEN_COUNTRY_PHRASES)) {
    if (focus?.kind === "company" || focus?.kind === "university") {
      const matches = relationshipsOfType(focus, "country", "LOCATED_IN");
      const target = matches[0];
      return target && target.targetHref
        ? { type: "navigate", href: target.targetHref, message: `Opening ${target.targetName}.` }
        : { type: "message", message: "No related country connected yet." };
    }
    if (focus?.kind === "country") {
      return { type: "message", message: "Already viewing a country." };
    }
    return { type: "navigate", href: "/countries", message: "Opening Countries." };
  }

  return null;
}
