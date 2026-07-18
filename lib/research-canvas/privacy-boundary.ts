/**
 * Privacy and external-search boundary — consent, sanitization, revocation.
 */

import type { SmartIdea } from "@/lib/research-canvas/research-canvas-types";
import { getSanitizedSearchConcepts } from "@/lib/research-canvas/smart-idea-store";
import {
  getResearchCanvasRuntimeCopy,
  type ResearchCanvasRuntimeCopy,
} from "@/lib/i18n/research-canvas-runtime-copy";

export type ExternalSearchConsent = {
  readonly confirmed: boolean;
  readonly sanitizedQueryPreview: readonly string[];
  readonly consentAt: string | null;
  readonly revokedAt: string | null;
  readonly transmitsPrivateArtifact: false;
};

export function buildExternalSearchConsent(idea: SmartIdea): ExternalSearchConsent {
  return {
    confirmed: idea.externalSearchConfirmed && !idea.externalSearchRevoked,
    sanitizedQueryPreview: getSanitizedSearchConcepts(idea),
    consentAt: idea.externalSearchConsentAt ?? null,
    revokedAt: idea.externalSearchRevokedAt ?? null,
    transmitsPrivateArtifact: false,
  };
}

export function buildSanitizedSearchQuery(idea: SmartIdea, userEditedQuery?: string): string {
  const edited = userEditedQuery?.trim();
  if (edited) return edited;
  return getSanitizedSearchConcepts(idea).slice(0, 3).join(" ");
}

export function assertNoPrivateArtifactInQuery(query: string, idea: SmartIdea): { ok: boolean; reason?: string } {
  for (const artifact of idea.artifacts) {
    if (artifact.dataUrl && query.includes(artifact.dataUrl.slice(0, 32))) {
      return { ok: false, reason: "Query must not include private artifact content." };
    }
    if (artifact.fileName && query.length > 500) {
      return { ok: false, reason: "Query too long — use concise sanitized concepts." };
    }
  }
  if (query.includes("data:image") || query.includes("base64")) {
    return { ok: false, reason: "Encoded artifact content cannot be transmitted." };
  }
  return { ok: true };
}

export const IP_BOUNDARY_NOTICE = getResearchCanvasRuntimeCopy("en").ipBoundaryNotice;

export function getIpBoundaryNotice(copy: ResearchCanvasRuntimeCopy = getResearchCanvasRuntimeCopy("en")): string {
  return copy.ipBoundaryNotice;
}

export function visibilityEnforcementNote(
  visibility: SmartIdea["visibility"],
  copy: ResearchCanvasRuntimeCopy = getResearchCanvasRuntimeCopy("en"),
): string {
  if (visibility === "Private") return copy.visibilityPrivate;
  if (visibility === "Team Only" || visibility === "Organization") return copy.visibilityTeam;
  return copy.visibilityPublic;
}
