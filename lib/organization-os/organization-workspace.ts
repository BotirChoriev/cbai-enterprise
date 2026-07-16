/**
 * EPIC-05 — Organization workspace derivation.
 */

import { loadOrganizations } from "@/lib/organization-os/organization-store";
import type { OrganizationObjectContract, OrganizationWorkspace } from "@/lib/organization-os/organization.types";
import { loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import { loadProjects } from "@/lib/project/project-store";
import { deriveEvidenceRuntime } from "@/lib/evidence-runtime/evidence-runtime";

export function deriveOrganizationWorkspace(organizationId: string | null = null): OrganizationWorkspace {
  const organizations = loadOrganizations();
  const org = organizationId ? organizations.find((o) => o.id === organizationId) ?? null : organizations[0] ?? null;
  const mission = loadCurrentMission();

  return {
    organizationId: org?.id ?? null,
    organizationName: org?.name ?? null,
    kind: org?.kind ?? null,
    activeMissionIds: mission ? [mission.id] : [],
    teamIds: [],
    maturity: org?.maturity ?? "architecture_only",
    cloudSyncConnected: false,
    limitation: org
      ? "Organization workspace is device-local — teams, rooms, and cloud sync are not connected."
      : "No organization workspace is configured — mission-first operation continues on this device.",
  };
}

export function deriveOrganizationObjectContract(
  organizationId: string | null = null,
): OrganizationObjectContract {
  const workspace = deriveOrganizationWorkspace(organizationId);
  const mission = loadCurrentMission();
  const projects = loadProjects();
  const runtime = deriveEvidenceRuntime(mission, mission?.projectId);

  if (!workspace.organizationId) {
    return {
      identity: null,
      mission: mission?.problem ?? null,
      knowledge: projects.length > 0 ? `${projects.length} project(s) on device` : null,
      evidence: runtime.records.length > 0 ? `${runtime.records.length} evidence reference(s)` : null,
      projects: projects.length > 0 ? `${projects.length} active project record(s)` : null,
      people: null,
      capabilities: mission?.capabilitiesNeeded || null,
      trust: runtime.limitation,
      reports: null,
      impact: mission?.whoBenefits || null,
      legacy: null,
    };
  }

  const org = loadOrganizations().find((o) => o.id === workspace.organizationId);
  return {
    identity: org?.name ?? null,
    mission: org?.missionStatement ?? mission?.problem ?? null,
    knowledge: `${projects.length} linked project(s)`,
    evidence: `${runtime.records.length} evidence reference(s)`,
    projects: `${projects.length} project(s)`,
    people: "Membership not connected — architecture only.",
    capabilities: mission?.capabilitiesNeeded || "Capability coverage derived from mission when present.",
    trust: runtime.limitation,
    reports: "Report readiness follows project/mission linkage.",
    impact: mission?.whoBenefits ?? "Impact review follows mission when linked.",
    legacy: "Legacy trail follows mission artifacts when present.",
  };
}
