/**
 * Real Evidence bookmarking (Platform Activation mission, "Close the final documented product
 * gaps"). Reuses the existing bookmark/context system exactly as-is — a bookmarked Evidence item
 * is just a `ContextEntityRef` with `kind: "evidence"`, saved/removed through the same
 * pinEntityToWorkspace/unpinEntityFromWorkspace the country/company/university/research_topic/
 * project bookmarks already use (components/platform/context/PlatformContextProvider.tsx). No
 * second bookmark model, no new storage key.
 *
 * A bookmarked Evidence item has no detail page of its own — real evidence items
 * (TopicEvidenceCatalogItem, lib/research/evidence/evidence-topic-builder.ts) are shown in the
 * context of the research topic that catalogs them, so a bookmark resolves back to that topic's
 * real page. `evidenceItemId` is always the deterministic `topic-evidence:{topicId}:{slug}` shape
 * that buildEvidenceItemId() produces — parsed here, never re-derived or guessed.
 */

import type { ContextEntityRef } from "@/lib/context/context-types";
import { getResearchTopicPath, getResearchTopicById } from "@/lib/research/research-topics";
import type { TopicEvidenceCatalogItem } from "@/lib/research/evidence/evidence-topic-builder";

const EVIDENCE_ID_PREFIX = "topic-evidence:";

/** Real parse of the deterministic evidenceItemId shape — returns null for anything that isn't
 * genuinely one of these catalog items, never a guessed fallback. */
export function parseEvidenceItemId(evidenceItemId: string): { topicId: string; slug: string } | null {
  if (!evidenceItemId.startsWith(EVIDENCE_ID_PREFIX)) return null;
  const rest = evidenceItemId.slice(EVIDENCE_ID_PREFIX.length);
  const separatorIndex = rest.indexOf(":");
  if (separatorIndex === -1) return null;
  const topicId = rest.slice(0, separatorIndex);
  const slug = rest.slice(separatorIndex + 1);
  if (!topicId || !slug) return null;
  return { topicId, slug };
}

/** The real research topic page this evidence item belongs to — falls back to the Evidence
 * catalog itself only when the topicId genuinely doesn't parse (never a fabricated destination). */
export function evidenceItemHref(evidenceItemId: string): string {
  const parsed = parseEvidenceItemId(evidenceItemId);
  if (!parsed) return "/knowledge";
  return `${getResearchTopicPath(parsed.topicId)}#evidence-lifecycle-heading`;
}

/** Real, human-readable "which topic is this from" label for the My Work saved-Evidence list —
 * honestly blank when the owning topic can no longer be resolved (catalog changed), never a
 * fabricated topic name. */
export function evidenceItemTopicName(evidenceItemId: string): string | null {
  const parsed = parseEvidenceItemId(evidenceItemId);
  if (!parsed) return null;
  return getResearchTopicById(parsed.topicId)?.topicName ?? null;
}

/** Builds the real ContextEntityRef for a real catalog Evidence item — the one place this
 * conversion happens, so every bookmark button uses the exact same shape. */
export function toEvidenceEntityRef(item: TopicEvidenceCatalogItem): ContextEntityRef {
  return { kind: "evidence", id: item.evidenceItemId, name: item.label };
}
