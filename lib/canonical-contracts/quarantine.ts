/**
 * Quarantine markers for duplicate / orphan ownership paths (Stage 1).
 * Paths are marked, not deleted or moved.
 */

export type QuarantineEntry = {
  readonly path: string;
  readonly reason: string;
  readonly canonicalReplacement: string;
  readonly stage1Action: "mark_only";
  readonly stage2PlusAction: "physical_quarantine_or_archive_candidate";
};

export const QUARANTINED_OWNERSHIP_PATHS: readonly QuarantineEntry[] = [
  {
    path: "lib/intelligence",
    reason: "Orphan intelligence engine — no live app/components imports",
    canonicalReplacement: "platform stacks (platform-actions, evidence-explorer, lib/graph, intelligence-os)",
    stage1Action: "mark_only",
    stage2PlusAction: "physical_quarantine_or_archive_candidate",
  },
  {
    path: "lib/intelligence/evidence",
    reason: "Duplicate evidence layer vs /knowledge evidence workspace",
    canonicalReplacement: "lib/evidence-explorer.ts + components/evidence",
    stage1Action: "mark_only",
    stage2PlusAction: "physical_quarantine_or_archive_candidate",
  },
  {
    path: "lib/intelligence/graph",
    reason: "Duplicate graph layer vs lib/graph + LON",
    canonicalReplacement: "lib/graph + lib/living-object-network",
    stage1Action: "mark_only",
    stage2PlusAction: "physical_quarantine_or_archive_candidate",
  },
  {
    path: "lib/collaboration",
    reason: "Stores with zero component imports; provisional owner is organization-os",
    canonicalReplacement: "lib/organization-os",
    stage1Action: "mark_only",
    stage2PlusAction: "physical_quarantine_or_archive_candidate",
  },
] as const;
