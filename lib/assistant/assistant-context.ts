/**
 * Assistant context awareness (Release 4, Phase 5) — derives "where the user currently is" from
 * the same real page context the platform already tracks (PlatformContextProvider's
 * country/company/university selection, or the real research topic on a topic page). No new
 * tracking system, no question asked of the user — pure derivation from existing state.
 */

import type { ContextEntityRef } from "@/lib/context";
import { getResearchTopicById, getResearchTopicPath } from "@/lib/research/research-topics";

export type AssistantContextEntity = {
  kind: "country" | "company" | "university" | "research_topic";
  name: string;
  href: string;
};

function entityHref(entity: ContextEntityRef): string {
  const params = new URLSearchParams({ [entity.kind]: entity.id });
  const base = entity.kind === "country" ? "/countries" : entity.kind === "company" ? "/companies" : "/universities";
  return `${base}?${params.toString()}`;
}

/**
 * Resolves the current Assistant context. Research topic pages take priority when the pathname
 * is an exact topic route (a real research topic id) — otherwise falls back to whichever entity
 * PlatformContext has focused (country, then company, then university).
 */
export function resolveAssistantContext(
  pathname: string,
  platformEntity: ContextEntityRef | null,
): AssistantContextEntity | null {
  const topicMatch = /^\/research\/([^/]+)$/.exec(pathname);
  if (topicMatch) {
    const topic = getResearchTopicById(topicMatch[1]);
    if (topic) {
      return { kind: "research_topic", name: topic.topicName, href: getResearchTopicPath(topic.topicId) };
    }
  }

  if (platformEntity) {
    return { kind: platformEntity.kind, name: platformEntity.name, href: entityHref(platformEntity) };
  }

  return null;
}
