import { ADAPTER_NOT_WIRED, type AdapterStatus } from "@/lib/canonical-contracts/adapters/types";

export type ResearchEvidenceAdapterInput = {
  readonly researchEvidenceId: string;
  readonly topicId?: string;
};

export type ResearchEvidenceAdapterResult = AdapterStatus & {
  readonly canonicalRoute: "/knowledge";
  readonly mapping: "deferred";
};

/**
 * Research evidence → platform Evidence workspace.
 * Stage 1: returns not-wired status only (no store reads/writes).
 */
export function researchEvidenceToPlatformEvidenceAdapter(
  _input: ResearchEvidenceAdapterInput,
): ResearchEvidenceAdapterResult {
  void _input;
  return {
    ...ADAPTER_NOT_WIRED,
    canonicalRoute: "/knowledge",
    mapping: "deferred",
  };
}
