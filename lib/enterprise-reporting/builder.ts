/**
 * Phase 8 — Enterprise report builder.
 * Pulls from authorized device/org stores only. Honest empty/partial labels.
 * Never invents evidence, scores, or secrets.
 */

import { loadMissionEngineRuntimes } from "@/lib/mission-engine";
import { loadEvidenceRecords } from "@/lib/evidence-engine";
import { loadOrganizationAudit } from "@/lib/organization-os/organization-audit-store";
import { loadApprovalsForUser } from "@/lib/enterprise-collaboration/approval-store";
import { loadActiveEnterpriseContext } from "@/lib/enterprise-collaboration/active-context";
import { loadMembershipForUser } from "@/lib/organization-os/organization-membership-store";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import {
  ENTERPRISE_REPORTING_VERSION,
  reportTypeLabel,
  type EnterpriseReportBuildInput,
  type EnterpriseReportDocument,
  type EnterpriseReportSection,
  type EnterpriseReportSourceRef,
  type EnterpriseReportType,
} from "@/lib/enterprise-reporting/types";

export type ReportBuilderDeps = {
  readonly actorId?: string | null;
  readonly missionCount?: number;
  readonly evidenceCount?: number;
  readonly missingEvidenceCount?: number;
  readonly orgEventCount?: number;
  readonly approvalCount?: number;
  readonly recentOrgEvents?: readonly string[];
  readonly recentApprovals?: readonly string[];
};

function resolveOrgId(actorId: string | null, preferred?: string | null): string | null {
  if (preferred) {
    if (!actorId) return null;
    return loadMembershipForUser(actorId, preferred) ? preferred : null;
  }
  const active = loadActiveEnterpriseContext();
  if (!active.organizationId || !actorId) return null;
  return loadMembershipForUser(actorId, active.organizationId) ? active.organizationId : null;
}

function countMissingEvidence(): number {
  let n = 0;
  for (const runtime of loadMissionEngineRuntimes()) {
    for (const req of runtime.evidenceRequirements) {
      if (req.required && !req.satisfied) n += 1;
    }
  }
  return n;
}

function gatherDefaults(input: EnterpriseReportBuildInput, deps?: ReportBuilderDeps) {
  const actorId = deps?.actorId !== undefined ? deps.actorId : input.actorId ?? resolveActorId();
  const organizationId = resolveOrgId(actorId, input.organizationId);
  const missions = loadMissionEngineRuntimes();
  const evidence = loadEvidenceRecords();
  const orgEvents = organizationId ? loadOrganizationAudit(organizationId) : [];
  const approvals = actorId ? loadApprovalsForUser(actorId, organizationId) : [];

  return {
    actorId,
    organizationId,
    missionCount: deps?.missionCount ?? missions.length,
    evidenceCount: deps?.evidenceCount ?? evidence.length,
    missingEvidenceCount: deps?.missingEvidenceCount ?? countMissingEvidence(),
    orgEventCount: deps?.orgEventCount ?? orgEvents.length,
    approvalCount: deps?.approvalCount ?? approvals.length,
    recentOrgEvents:
      deps?.recentOrgEvents ??
      orgEvents.slice(0, 8).map((e) => `${e.event} — ${e.actorDisplayName} @ ${e.timestamp}`),
    recentApprovals:
      deps?.recentApprovals ??
      approvals.slice(0, 8).map((a) => `${a.status}: ${a.title} (${a.id})`),
    missionStages: missions.slice(0, 8).map((m) => `${m.missionId}: ${m.stage}`),
    evidenceStatuses: evidence.slice(0, 8).map((e) => `${e.id}: ${e.status} — ${e.title}`),
  };
}

function methodologyBody(type: EnterpriseReportType): string {
  return [
    `Report type: ${reportTypeLabel(type)}.`,
    "Methodology: assemble facts from authorized device-local / org-scoped stores only.",
    "No external connector values are invented. Planned sources remain Planned/Missing.",
    "This builder does not score entities or invent confidence percentages.",
  ].join(" ");
}

function confidenceBody(ctx: ReturnType<typeof gatherDefaults>): string {
  if (ctx.missionCount === 0 && ctx.evidenceCount === 0 && ctx.orgEventCount === 0) {
    return "Confidence: Insufficient Evidence — authorized stores are empty for this scope.";
  }
  if (ctx.missingEvidenceCount > 0) {
    return `Confidence: Partial — ${ctx.missingEvidenceCount} required evidence item(s) still missing.`;
  }
  return "Confidence: Device-local / org-scoped facts only — not a verified institutional score.";
}

function missingDataBody(ctx: ReturnType<typeof gatherDefaults>): string {
  const gaps: string[] = [];
  if (ctx.missionCount === 0) gaps.push("No mission engine runtimes.");
  if (ctx.evidenceCount === 0) gaps.push("No evidence engine records.");
  if (ctx.missingEvidenceCount > 0) {
    gaps.push(`${ctx.missingEvidenceCount} unsatisfied required evidence requirement(s).`);
  }
  if (ctx.orgEventCount === 0) gaps.push("No organization audit events in scope.");
  if (gaps.length === 0) return "No structural missing-data flags for the current authorized stores.";
  return gaps.join(" ");
}

function sourcesFor(type: EnterpriseReportType): EnterpriseReportSourceRef[] {
  const base: EnterpriseReportSourceRef[] = [
    {
      label: "Mission engine (device-local)",
      status: "authorized_store",
      detail: "lib/mission-engine runtimes",
    },
    {
      label: "Evidence engine (device-local)",
      status: "authorized_store",
      detail: "lib/evidence-engine records",
    },
    {
      label: "Organization activity audit",
      status: "authorized_store",
      detail: "Membership-gated organization audit store",
    },
  ];
  if (type === "approval_history") {
    base.push({
      label: "Enterprise approvals",
      status: "authorized_store",
      detail: "Org-scoped approval store — never auto-approved",
    });
  }
  base.push({
    label: "Official connectors (non-World Bank)",
    status: "planned",
    detail: "UN / OECD / US Census / US BEA / IMF remain Planned until verified",
  });
  return base;
}

function typeFacts(
  type: EnterpriseReportType,
  ctx: ReturnType<typeof gatherDefaults>,
  input: EnterpriseReportBuildInput,
): { readonly key: string; readonly value: string }[] {
  const facts: { key: string; value: string }[] = [
    { key: "reportType", value: type },
    { key: "organizationId", value: ctx.organizationId ?? "none" },
    { key: "missionCount", value: String(ctx.missionCount) },
    { key: "evidenceCount", value: String(ctx.evidenceCount) },
    { key: "missingEvidenceCount", value: String(ctx.missingEvidenceCount) },
  ];
  if (input.entityLabel) facts.push({ key: "entityLabel", value: input.entityLabel });
  if (input.missionId) facts.push({ key: "missionId", value: input.missionId });

  switch (type) {
    case "mission":
      facts.push({ key: "missionStages", value: ctx.missionStages.join("; ") || "none" });
      break;
    case "evidence":
      facts.push({ key: "evidenceStatuses", value: ctx.evidenceStatuses.join("; ") || "none" });
      break;
    case "org_activity":
      facts.push({ key: "orgEventCount", value: String(ctx.orgEventCount) });
      facts.push({ key: "recentEvents", value: ctx.recentOrgEvents.join("; ") || "none" });
      break;
    case "approval_history":
      facts.push({ key: "approvalCount", value: String(ctx.approvalCount) });
      facts.push({ key: "recentApprovals", value: ctx.recentApprovals.join("; ") || "none" });
      break;
    case "risk":
      facts.push({
        key: "riskBasis",
        value:
          ctx.missingEvidenceCount > 0
            ? "Missing required evidence elevates incomplete-coverage risk (qualitative only)."
            : "No missing required evidence flagged; risk section remains qualitative.",
      });
      break;
    default:
      break;
  }
  return facts;
}

function buildSections(
  type: EnterpriseReportType,
  ctx: ReturnType<typeof gatherDefaults>,
): EnterpriseReportSection[] {
  return [
    { id: "methodology", title: "Methodology", body: methodologyBody(type) },
    { id: "confidence", title: "Confidence", body: confidenceBody(ctx) },
    { id: "missing_data", title: "Missing data", body: missingDataBody(ctx) },
    {
      id: "sources",
      title: "Sources",
      body: sourcesFor(type)
        .map((s) => `${s.label} [${s.status}]: ${s.detail}`)
        .join(" | "),
    },
    {
      id: "audit",
      title: "Audit",
      body: [
        `Generated at device-local time for actor ${ctx.actorId ?? "anonymous"}.`,
        `Org scope: ${ctx.organizationId ?? "none"}.`,
        "No secrets included. Assistant and human approvals are never auto-completed by this builder.",
      ].join(" "),
    },
  ];
}

export function buildEnterpriseReport(
  input: EnterpriseReportBuildInput,
  deps?: ReportBuilderDeps,
): EnterpriseReportDocument {
  const type = input.reportType;
  const ctx = gatherDefaults(input, deps);
  const empty =
    ctx.missionCount === 0 &&
    ctx.evidenceCount === 0 &&
    ctx.orgEventCount === 0 &&
    ctx.approvalCount === 0;
  const availability = empty ? "empty" : ctx.missingEvidenceCount > 0 ? "partial" : "device_local_stores";
  const title =
    input.title?.trim() ||
    `${reportTypeLabel(type)} report${input.entityLabel ? ` — ${input.entityLabel}` : ""}`;

  const warnings: string[] = [];
  if (empty) warnings.push("Authorized stores returned no facts for this scope.");
  if (ctx.missingEvidenceCount > 0) {
    warnings.push("Required evidence incomplete — do not treat as verified.");
  }
  if (!ctx.organizationId && (type === "org_activity" || type === "approval_history")) {
    warnings.push("No organization in scope — membership-gated sections are empty.");
  }

  return {
    version: ENTERPRISE_REPORTING_VERSION,
    reportType: type,
    title,
    generatedAt: new Date().toISOString(),
    availability,
    summary: [
      `${title}.`,
      `Availability: ${availability}.`,
      `Missions: ${ctx.missionCount}; evidence records: ${ctx.evidenceCount}; missing required evidence: ${ctx.missingEvidenceCount}.`,
    ].join(" "),
    sections: buildSections(type, ctx),
    sources: sourcesFor(type),
    facts: typeFacts(type, ctx, input),
    warnings,
  };
}
