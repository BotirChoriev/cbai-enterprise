/**
 * Honest monitoring plan model (Adaptive Intelligence Workspace).
 *
 * CBAI never fabricates live monitoring. Every indicator starts with no
 * measurement, an explicit data status, and a human owner. A "measured"
 * status can only be reached by a real measurement entered by a person or
 * delivered by a genuinely connected source.
 */

import type { ActivationRole } from "@/lib/activation/role-workspace-engine";

export const MONITORING_DATA_STATUSES = [
  "data_not_connected",
  "manual_entry_available",
  "source_required",
  "measured",
] as const;

export type MonitoringDataStatus = (typeof MONITORING_DATA_STATUSES)[number];

export type MonitoringFrequency = "daily" | "weekly" | "monthly";

export type MonitoringIndicator = {
  readonly id: string;
  /** Unit of measure; null until the user or a real source defines it. */
  readonly unit: string | null;
  readonly baseline: number | null;
  readonly target: number | null;
  readonly measurementSource: string | null;
  readonly frequency: MonitoringFrequency;
  /** Monitoring always has a human owner; CBAI is never the decision owner. */
  readonly owner: "human_owner";
  readonly acceptableRange: { readonly min: number; readonly max: number } | null;
  readonly warningThreshold: number | null;
  readonly lastMeasurement: { readonly value: number; readonly at: string } | null;
  readonly status: MonitoringDataStatus;
  /** Human escalation point — a person decides, not the platform. */
  readonly escalation: "human_review";
};

function indicator(
  id: string,
  unit: string | null,
  frequency: MonitoringFrequency,
  status: Exclude<MonitoringDataStatus, "measured">,
): MonitoringIndicator {
  return {
    id,
    unit,
    baseline: null,
    target: null,
    measurementSource: null,
    frequency,
    owner: "human_owner",
    acceptableRange: null,
    warningThreshold: null,
    lastMeasurement: null,
    status,
    escalation: "human_review",
  };
}

const ROLE_INDICATORS: Record<ActivationRole, readonly MonitoringIndicator[]> = {
  manufacturer: [
    indicator("uptime", "%", "daily", "manual_entry_available"),
    indicator("downtime", "h", "daily", "manual_entry_available"),
    indicator("maintenanceDue", "days", "weekly", "manual_entry_available"),
    indicator("outputIndicator", null, "daily", "manual_entry_available"),
    indicator("costIndicator", null, "weekly", "manual_entry_available"),
    indicator("qualityIndicator", "%", "daily", "manual_entry_available"),
    indicator("deliveryIndicator", "%", "weekly", "source_required"),
    indicator("riskIndicator", null, "weekly", "manual_entry_available"),
  ],
  scientist: [
    indicator("milestoneProgress", "%", "weekly", "manual_entry_available"),
    indicator("evidenceCoverage", null, "weekly", "manual_entry_available"),
    indicator("reviewCadence", null, "monthly", "manual_entry_available"),
  ],
  student: [
    indicator("milestoneProgress", "%", "weekly", "manual_entry_available"),
    indicator("evidenceCoverage", null, "weekly", "manual_entry_available"),
    indicator("reviewCadence", null, "monthly", "manual_entry_available"),
  ],
  entrepreneur: [
    indicator("milestoneProgress", "%", "weekly", "manual_entry_available"),
    indicator("costIndicator", null, "weekly", "manual_entry_available"),
    indicator("demandSignal", null, "weekly", "source_required"),
  ],
  engineer: [
    indicator("requirementCoverage", "%", "weekly", "manual_entry_available"),
    indicator("testPassRate", "%", "weekly", "manual_entry_available"),
    indicator("riskIndicator", null, "weekly", "manual_entry_available"),
  ],
  laboratory: [
    indicator("calibrationDue", "days", "weekly", "manual_entry_available"),
    indicator("repeatability", null, "weekly", "manual_entry_available"),
    indicator("evidenceCoverage", null, "weekly", "manual_entry_available"),
  ],
  teacher: [
    indicator("learnerProgress", null, "weekly", "manual_entry_available"),
    indicator("materialReadiness", "%", "weekly", "manual_entry_available"),
  ],
  agronomist: [
    indicator("yieldExpectation", null, "monthly", "manual_entry_available"),
    indicator("waterUse", null, "weekly", "manual_entry_available"),
    indicator("inputCosts", null, "monthly", "manual_entry_available"),
  ],
  public_servant: [
    indicator("implementationProgress", "%", "monthly", "manual_entry_available"),
    indicator("publicImpactEvidence", null, "monthly", "source_required"),
  ],
  other: [
    indicator("milestoneProgress", "%", "weekly", "manual_entry_available"),
    indicator("riskIndicator", null, "weekly", "manual_entry_available"),
  ],
};

/** Initial monitoring plan for a role — every value honestly unmeasured. */
export function buildInitialMonitoring(role: ActivationRole): readonly MonitoringIndicator[] {
  return ROLE_INDICATORS[role];
}

/** All indicator ids used anywhere — copy files must label all of them. */
export function allMonitoringIndicatorIds(): readonly string[] {
  const ids = new Set<string>();
  for (const list of Object.values(ROLE_INDICATORS)) {
    for (const item of list) ids.add(item.id);
  }
  return [...ids];
}
