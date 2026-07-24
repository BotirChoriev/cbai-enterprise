/**
 * Canonical module ownership registry (Stage 1 — documentation as code).
 * Does not change runtime wiring.
 */

export type CanonicalCapability =
  | "voice_io"
  | "platform_actions"
  | "forward_deployed_engines"
  | "evidence_workspace"
  | "research_evidence_adapter"
  | "knowledge_graph"
  | "missions"
  | "projects"
  | "operational_objects"
  | "organization_membership"
  | "auth_device_local"
  | "auth_cloud"
  | "i18n"
  | "spatial_home"
  | "orphan_intelligence_engine";

export type CanonicalOwnerRecord = {
  readonly capability: CanonicalCapability;
  readonly ownerModule: string;
  readonly maturity: "proven" | "partial" | "placeholder" | "quarantine";
  readonly stage1Note: string;
};

export const CANONICAL_OWNERS: readonly CanonicalOwnerRecord[] = [
  {
    capability: "voice_io",
    ownerModule: "lib/voice-operator",
    maturity: "partial",
    stage1Note: "I/O adapter only; must not own navigation",
  },
  {
    capability: "platform_actions",
    ownerModule: "lib/platform-actions",
    maturity: "proven",
    stage1Note: "Sole action registry + allowlisted navigation",
  },
  {
    capability: "forward_deployed_engines",
    ownerModule: "lib/forward-deployed-engines",
    maturity: "partial",
    stage1Note: "Confirmation boundary for Level 2/3 engine starts",
  },
  {
    capability: "evidence_workspace",
    ownerModule: "lib/evidence-explorer.ts + components/evidence + /knowledge",
    maturity: "proven",
    stage1Note: "Canonical platform Evidence surface",
  },
  {
    capability: "research_evidence_adapter",
    ownerModule: "lib/research",
    maturity: "partial",
    stage1Note: "Domain adapter; MERGE stores only in Stage 2+",
  },
  {
    capability: "knowledge_graph",
    ownerModule: "lib/graph + lib/living-graph + lib/living-object-network",
    maturity: "proven",
    stage1Note: "Canonical /graph stack",
  },
  {
    capability: "missions",
    ownerModule: "lib/intelligence-os",
    maturity: "proven",
    stage1Note: "Not lib/intelligence (orphan)",
  },
  {
    capability: "projects",
    ownerModule: "lib/project",
    maturity: "proven",
    stage1Note: "Do not merge with OO/mission schemas in Stage 1",
  },
  {
    capability: "operational_objects",
    ownerModule: "lib/operational-objects",
    maturity: "proven",
    stage1Note: "Draft-first; confirmation before persistence",
  },
  {
    capability: "organization_membership",
    ownerModule: "lib/organization-os",
    maturity: "partial",
    stage1Note: "Provisional teams owner; localStorage ≠ secure collab",
  },
  {
    capability: "auth_device_local",
    ownerModule: "lib/auth",
    maturity: "partial",
    stage1Note: "SF-2: not team authorization",
  },
  {
    capability: "auth_cloud",
    ownerModule: "lib/supabase",
    maturity: "partial",
    stage1Note: "Optional; required for shared production features later",
  },
  {
    capability: "i18n",
    ownerModule: "lib/i18n",
    maturity: "proven",
    stage1Note: "Locale provenance; no silent rewrite of user text",
  },
  {
    capability: "spatial_home",
    ownerModule: "components/spatial-world + lib/spatial-world",
    maturity: "proven",
    stage1Note: "Preserve globe + Natural Earth attribution",
  },
  {
    capability: "orphan_intelligence_engine",
    ownerModule: "lib/intelligence",
    maturity: "quarantine",
    stage1Note: "No new app/components imports; do not delete in Stage 1",
  },
] as const;

export function ownerForCapability(capability: CanonicalCapability): CanonicalOwnerRecord | undefined {
  return CANONICAL_OWNERS.find((row) => row.capability === capability);
}
