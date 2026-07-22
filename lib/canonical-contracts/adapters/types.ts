/**
 * Shared adapter stub status (Stage 1).
 */

export type AdapterStatus = {
  readonly wired: false;
  readonly stage: 1;
  readonly reason: string;
};

export const ADAPTER_NOT_WIRED: AdapterStatus = {
  wired: false,
  stage: 1,
  reason: "Stage 1 stub — compatibility adapter not wired; no data migration",
};
