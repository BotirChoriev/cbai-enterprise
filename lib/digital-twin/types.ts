/**
 * Phase 9 — Enterprise Digital Twin foundations.
 * Additive registry + location stubs. No fabricated metrics or camera feeds.
 */

import type { ProductStatus } from "@/lib/product-status";

export type DigitalTwinModuleId =
  | "overview"
  | "locations"
  | "inventory"
  | "products"
  | "sales"
  | "expenses"
  | "employees"
  | "suppliers"
  | "contracts"
  | "meetings"
  | "tasks"
  | "safety"
  | "health"
  | "incidents"
  | "cameras"
  | "documents"
  | "map"
  | "alerts"
  | "anomaly"
  | "dashboard_ceo"
  | "dashboard_regional"
  | "dashboard_branch";

export type DigitalTwinIntegrationStatus = Extract<
  ProductStatus,
  "not_connected" | "planned"
>;

export type OrganizationLocation = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly kind: "hq" | "regional" | "branch" | "warehouse" | "other";
  readonly regionLabel: string | null;
  readonly addressLine: string | null;
  /** Coordinates only when a real source provides them — otherwise null. */
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DigitalTwinModule = {
  readonly id: DigitalTwinModuleId;
  readonly label: string;
  readonly description: string;
  readonly integrationStatus: DigitalTwinIntegrationStatus;
  readonly integrationNote: string;
  /** Cameras are registry-only — never claim live video. */
  readonly camerasRegistryOnly?: boolean;
};

export type DigitalTwinDashboardScope = "ceo" | "regional" | "branch";

export type DigitalTwinPermissionsNote = {
  readonly scope: "organization";
  readonly summary: string;
  readonly details: readonly string[];
};
