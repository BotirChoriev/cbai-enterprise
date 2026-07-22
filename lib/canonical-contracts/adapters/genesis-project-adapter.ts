import { ADAPTER_NOT_WIRED, type AdapterStatus } from "@/lib/canonical-contracts/adapters/types";

export type GenesisProjectAdapterInput = {
  readonly genesisExecutionId?: string;
  readonly livingResearchObjectId?: string;
};

export type GenesisProjectAdapterResult = AdapterStatus & {
  readonly canonicalOwner: "lib/project";
  readonly mapping: "deferred";
};

/**
 * Genesis execution / living research objects → Project engine.
 * Stage 1: not wired; MERGE carefully only in Stage 2+.
 */
export function genesisToProjectAdapter(
  _input: GenesisProjectAdapterInput,
): GenesisProjectAdapterResult {
  void _input;
  return {
    ...ADAPTER_NOT_WIRED,
    canonicalOwner: "lib/project",
    mapping: "deferred",
  };
}
