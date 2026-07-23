/**
 * Observation store with duplicate prevention.
 * Phase 1 stores validated drafts only when explicitly published by callers —
 * no invented sample evidence is seeded.
 */

import type {
  NormalizedObservationDraft,
  ValidatedObservation,
} from "@/lib/official-connector-foundation/types";

export function observationIdentityKey(draft: NormalizedObservationDraft): string {
  return [
    draft.provenance.sourceName,
    draft.provenance.datasetOrEndpoint,
    draft.indicatorCode,
    draft.entityType,
    draft.entityId,
    draft.referencePeriod,
    String(draft.value),
    draft.unit,
  ]
    .map((part) => part.trim().toLowerCase())
    .join("|");
}

export type PublishResult =
  | { readonly ok: true; readonly observation: ValidatedObservation; readonly duplicate: false }
  | { readonly ok: false; readonly duplicate: true; readonly existingId: string; readonly message: string };

export class FoundationObservationStore {
  private readonly byId = new Map<string, ValidatedObservation>();
  private readonly byIdentity = new Map<string, string>();
  private seq = 0;

  publishValidated(draft: NormalizedObservationDraft): PublishResult {
    const identity = observationIdentityKey(draft);
    const existingId = this.byIdentity.get(identity);
    if (existingId) {
      return {
        ok: false,
        duplicate: true,
        existingId,
        message: "Duplicate observation rejected",
      };
    }
    this.seq += 1;
    const id = `fobs-${this.seq}`;
    const observation: ValidatedObservation = {
      ...draft,
      id,
      verificationState: "validated",
      provenance: {
        ...draft.provenance,
        verificationState: "validated",
      },
    };
    this.byId.set(id, observation);
    this.byIdentity.set(identity, id);
    return { ok: true, observation, duplicate: false };
  }

  get(id: string): ValidatedObservation | undefined {
    return this.byId.get(id);
  }

  list(): readonly ValidatedObservation[] {
    return [...this.byId.values()];
  }

  clear(): void {
    this.byId.clear();
    this.byIdentity.clear();
    this.seq = 0;
  }
}
