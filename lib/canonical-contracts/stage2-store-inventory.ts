/**
 * Stage 2.1 — store inventory + canonical ownership (read-only map).
 * No consumer rewiring here; reversible adapters land separately.
 */

export type StoreOwner =
  | "platform-actions"
  | "voice-operator"
  | "organization-os"
  | "operational-objects"
  | "project-domain"
  | "mission-domain"
  | "evidence-knowledge"
  | "graph-lon"
  | "auth-device-local"
  | "auth-supabase"
  | "scientific-intake"
  | "object-storage"
  | "quarantined-intelligence"
  | "quarantined-collaboration";

export type StoreInventoryEntry = {
  readonly id: string;
  readonly persistence: "memory" | "localStorage" | "sessionStorage" | "server" | "none";
  readonly canonicalOwner: StoreOwner;
  readonly duplicateRisk: "none" | "adapter_required" | "quarantine";
  readonly notes: string;
};

export const STAGE2_STORE_INVENTORY: readonly StoreInventoryEntry[] = [
  {
    id: "platform-actions-registry",
    persistence: "none",
    canonicalOwner: "platform-actions",
    duplicateRisk: "none",
    notes: "Single allowlisted action registry for UI/voice/Realtime tools",
  },
  {
    id: "voice-session-memory",
    persistence: "sessionStorage",
    canonicalOwner: "voice-operator",
    duplicateRisk: "none",
    notes: "Realtime lifecycle + transcript; not team authority",
  },
  {
    id: "auth-device-local-users",
    persistence: "localStorage",
    canonicalOwner: "auth-device-local",
    duplicateRisk: "none",
    notes: "Personal only — never team auth (SF-2)",
  },
  {
    id: "auth-supabase-session",
    persistence: "server",
    canonicalOwner: "auth-supabase",
    duplicateRisk: "none",
    notes: "Cloud personal/org identity when configured",
  },
  {
    id: "organization-os",
    persistence: "server",
    canonicalOwner: "organization-os",
    duplicateRisk: "adapter_required",
    notes: "Provisional teams owner; legacy collab must adapt in",
  },
  {
    id: "cbai-team-drafts",
    persistence: "localStorage",
    canonicalOwner: "organization-os",
    duplicateRisk: "adapter_required",
    notes: "Local team drafts — bind behind org-os; not a second authority",
  },
  {
    id: "lib-collaboration-store",
    persistence: "localStorage",
    canonicalOwner: "quarantined-collaboration",
    duplicateRisk: "quarantine",
    notes: "Quarantined; no competing owner",
  },
  {
    id: "operational-objects",
    persistence: "localStorage",
    canonicalOwner: "operational-objects",
    duplicateRisk: "none",
    notes: "Distinct from projects/missions with explicit relationships",
  },
  {
    id: "scientific-intake-records",
    persistence: "localStorage",
    canonicalOwner: "scientific-intake",
    duplicateRisk: "none",
    notes: "Metadata only; object refs via object-storage",
  },
  {
    id: "object-storage-refs",
    persistence: "server",
    canonicalOwner: "object-storage",
    duplicateRisk: "none",
    notes: "No blob payloads in localStorage",
  },
  {
    id: "lib-intelligence-graph",
    persistence: "memory",
    canonicalOwner: "quarantined-intelligence",
    duplicateRisk: "quarantine",
    notes: "Keep until parity proven; lib/graph + LON canonical",
  },
] as const;
