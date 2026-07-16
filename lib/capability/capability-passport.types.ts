/**
 * Capability Passport — earned capability from real work, not CV, diploma, or job title.
 *
 * Signals derive ONLY from verifiable platform activity: projects, evidence refs, notes,
 * questions, and entity engagement. No self-declared skills. No fabricated scores.
 */

export type CapabilityDomainId =
  | "research"
  | "evidence"
  | "analysis"
  | "governance"
  | "synthesis"
  | "collaboration";

export type CapabilitySignalSource =
  | "project_created"
  | "project_completed"
  | "evidence_linked"
  | "note_authored"
  | "question_opened"
  | "entity_engaged"
  | "report_saved";

export type CapabilitySignal = {
  readonly id: string;
  readonly domainId: CapabilityDomainId;
  readonly source: CapabilitySignalSource;
  readonly label: string;
  readonly occurredAt: string;
  readonly projectId?: string;
  readonly evidenceCount?: number;
};

export type CapabilityDomainSummary = {
  readonly domainId: CapabilityDomainId;
  readonly signalCount: number;
  readonly lastActivityAt: string | null;
  readonly maturity: "emerging" | "developing" | "demonstrated" | "none";
};

export type CapabilityPassport = {
  readonly ownerLabel: string;
  readonly updatedAt: string;
  readonly totalSignals: number;
  readonly domains: readonly CapabilityDomainSummary[];
  readonly recentSignals: readonly CapabilitySignal[];
  readonly readiness: "empty" | "emerging" | "active";
};

export const CAPABILITY_DOMAIN_LABELS: Record<CapabilityDomainId, string> = {
  research: "Research",
  evidence: "Evidence",
  analysis: "Analysis",
  governance: "Governance",
  synthesis: "Synthesis",
  collaboration: "Collaboration",
};

export function capabilityMaturityFromCount(count: number): CapabilityDomainSummary["maturity"] {
  if (count === 0) return "none";
  if (count <= 2) return "emerging";
  if (count <= 8) return "developing";
  return "demonstrated";
}
