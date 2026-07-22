/**
 * Compatibility adapter stubs (Stage 1) — not wired into product call paths.
 */

export { ADAPTER_NOT_WIRED, type AdapterStatus } from "@/lib/canonical-contracts/adapters/types";

export {
  researchEvidenceToPlatformEvidenceAdapter,
  type ResearchEvidenceAdapterInput,
  type ResearchEvidenceAdapterResult,
} from "@/lib/canonical-contracts/adapters/research-evidence-adapter";

export {
  collaborationToOrgOsAdapter,
  type CollaborationOrgAdapterInput,
  type CollaborationOrgAdapterResult,
} from "@/lib/canonical-contracts/adapters/collaboration-org-adapter";

export {
  genesisToProjectAdapter,
  type GenesisProjectAdapterInput,
  type GenesisProjectAdapterResult,
} from "@/lib/canonical-contracts/adapters/genesis-project-adapter";
