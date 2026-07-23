/**
 * Phase 10 — Machine-readable production readiness blockers.
 * Production remains untouched. Launch stays disallowed until blockers clear.
 */

export type ProductionReadinessArea =
  | "security"
  | "secrets"
  | "rls"
  | "authz"
  | "backups"
  | "rollback"
  | "disaster_recovery"
  | "retention"
  | "launch_checklist";

export type ProductionBlocker = {
  readonly id: string;
  readonly area: ProductionReadinessArea;
  readonly title: string;
  readonly severity: "blocker" | "high" | "medium";
  readonly status: "open" | "mitigated_preview" | "resolved";
  readonly note: string;
};

/**
 * Honest open blockers. Do not mark resolved without evidence.
 * Production project creation is intentionally listed as untouched.
 */
export const PRODUCTION_LAUNCH_BLOCKERS: readonly ProductionBlocker[] = [
  {
    id: "prod-untouched",
    area: "launch_checklist",
    title: "Production environment untouched",
    severity: "blocker",
    status: "open",
    note: "No production project, deploy target, or live customer data plane is authorized.",
  },
  {
    id: "secrets-audit",
    area: "secrets",
    title: "Secrets audit not evidence-complete",
    severity: "blocker",
    status: "open",
    note: "Confirm no keys in git, client bundles, or shared logs; rotate any exposed preview credentials.",
  },
  {
    id: "rls-tenant-proof",
    area: "rls",
    title: "Multi-tenant RLS proof incomplete for production",
    severity: "blocker",
    status: "mitigated_preview",
    note: "Preview tests exist; production tenant isolation drill not done (Production untouched).",
  },
  {
    id: "authz-matrix",
    area: "authz",
    title: "Signed authorization matrix missing",
    severity: "high",
    status: "open",
    note: "Organization RBAC vs user modes boundary documented in product; launch sign-off pending.",
  },
  {
    id: "backup-restore-drill",
    area: "backups",
    title: "Backup restore drill not evidence-complete",
    severity: "blocker",
    status: "open",
    note: "Documented recovery paths exist; production restore evidence required before launch.",
  },
  {
    id: "rollback-drill",
    area: "rollback",
    title: "Rollback drill not evidence-complete",
    severity: "high",
    status: "open",
    note: "See CBAI-ROLLBACK-PLAN.md — drill against production remains blocked while Production is untouched.",
  },
  {
    id: "dr-rpo-rto",
    area: "disaster_recovery",
    title: "DR RPO/RTO not signed",
    severity: "blocker",
    status: "open",
    note: "No signed disaster recovery targets or failover for a production region.",
  },
  {
    id: "retention-policy",
    area: "retention",
    title: "Retention and deletion policy unsigned",
    severity: "high",
    status: "open",
    note: "Legal review of evidence, voice, and account retention still planned.",
  },
  {
    id: "security-hardening",
    area: "security",
    title: "Production security hardening incomplete",
    severity: "blocker",
    status: "open",
    note: "Dependency audit, threat model sign-off, and production IdP hardening pending.",
  },
] as const;

export function openProductionBlockers(): readonly ProductionBlocker[] {
  return PRODUCTION_LAUNCH_BLOCKERS.filter((item) => item.status !== "resolved");
}

/** Always false while any non-resolved blocker remains (expected for this phase). */
export function isProductionLaunchAllowed(): boolean {
  return openProductionBlockers().length === 0;
}

export function productionReadinessReportPath(): string {
  return "docs/operations/CBAI-PRODUCTION-READINESS-REPORT.md";
}
