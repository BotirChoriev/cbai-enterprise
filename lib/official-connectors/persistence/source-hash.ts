/**
 * Stable source hash for duplicate prevention / versioning.
 */

import type { VerifiedObservation } from "@/lib/official-connectors/types";

export function sourceHashForObservation(observation: VerifiedObservation): string {
  const payload = [
    observation.provenance.sourceSlug,
    observation.provenance.sourceUrl,
    observation.indicatorCode,
    observation.entityId,
    observation.referencePeriod,
    String(observation.value),
    observation.unit,
    observation.provenance.publicationDate ?? "",
  ].join("|");
  return fnv1aHex(payload);
}

function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `h${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
