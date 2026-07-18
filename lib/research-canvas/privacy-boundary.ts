/**
 * Privacy and external-search boundary — consent, sanitization, revocation.
 */

import type { SmartIdea } from "@/lib/research-canvas/research-canvas-types";
import { getSanitizedSearchConcepts } from "@/lib/research-canvas/smart-idea-store";

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

export const IP_BOUNDARY_NOTICE =
  "Searching public databases does not create legal intellectual-property protection. Consider professional review for patents and licensing.";

export function visibilityEnforcementNote(visibility: SmartIdea["visibility"]): string {
  if (visibility === "Private") return "Private — device-local unless shared mode with real permissions is configured.";
  if (visibility === "Team Only" || visibility === "Organization") {
    return `${visibility} — full secure sharing requires authenticated backend enforcement; device-local mode stores locally only.`;
  }
  return `${visibility} — publication requires explicit human action; nothing is auto-published.`;
}
