/**
 * Digital Twin permissions — organization-scoped note only.
 * Does not implement RBAC; documents the intended boundary.
 */

import type { DigitalTwinPermissionsNote } from "@/lib/digital-twin/types";

export const DIGITAL_TWIN_PERMISSIONS_NOTE: DigitalTwinPermissionsNote = {
  scope: "organization",
  summary:
    "Digital Twin modules are organization-scoped. Access must follow organization membership and roles — not personal user modes.",
  details: [
    "User modes (Phase 3) do not grant Digital Twin data access.",
    "Cameras are a device registry only — no live video without a verified connector and organization approval.",
    "Dashboards (CEO / regional / branch) stay empty until verified organization sources connect.",
    "Anomaly detection remains Planned until a real detection pipeline exists.",
  ],
};

export function digitalTwinRequiresOrganizationScope(): boolean {
  return DIGITAL_TWIN_PERMISSIONS_NOTE.scope === "organization";
}
