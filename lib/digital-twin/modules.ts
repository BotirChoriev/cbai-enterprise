/**
 * Digital Twin module registry — honest empty / planned until real sources exist.
 */

import type { DigitalTwinModule, DigitalTwinModuleId } from "@/lib/digital-twin/types";

const NOT_CONNECTED =
  "Not connected — no verified organization data source is wired yet.";
const PLANNED = "Planned — module shell only until a real integration exists.";

export const DIGITAL_TWIN_MODULES: readonly DigitalTwinModule[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Organization digital twin summary — empty until sources connect.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "locations",
    label: "Locations",
    description: "Organization locations foundation (HQ, regional, branch).",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Stock and asset inventory views.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "products",
    label: "Products",
    description: "Product catalog and SKU registry.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "sales",
    label: "Sales",
    description: "Sales activity — no fabricated revenue metrics.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "expenses",
    label: "Expenses",
    description: "Expense tracking — empty until finance systems connect.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "employees",
    label: "Employees",
    description: "Workforce directory stubs — organization-scoped.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "suppliers",
    label: "Suppliers",
    description: "Supplier registry.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "contracts",
    label: "Contracts",
    description: "Contract index — no fabricated obligations.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "meetings",
    label: "Meetings",
    description: "Meeting schedule stubs.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "Operational task board stubs.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "safety",
    label: "Safety",
    description: "Safety programs and checks.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "health",
    label: "Health",
    description: "Occupational health records stubs.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "incidents",
    label: "Incidents",
    description: "Incident log — empty until reporting sources connect.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "cameras",
    label: "Cameras",
    description: "Camera device registry only — no live video feeds.",
    integrationStatus: "not_connected",
    integrationNote: "Registry only — live camera streams are not available and are not simulated.",
    camerasRegistryOnly: true,
  },
  {
    id: "documents",
    label: "Documents",
    description: "Document library stubs.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "map",
    label: "Map",
    description: "Location map — coordinates only when a real source provides them.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "alerts",
    label: "Alerts",
    description: "Operational alerts — empty until alert sources connect.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "anomaly",
    label: "Anomaly",
    description: "Anomaly detection — planned, not operational.",
    integrationStatus: "planned",
    integrationNote: PLANNED,
  },
  {
    id: "dashboard_ceo",
    label: "CEO dashboard",
    description: "Executive overview — no fabricated KPIs.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "dashboard_regional",
    label: "Regional dashboard",
    description: "Regional rollup — empty until locations and sources connect.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
  {
    id: "dashboard_branch",
    label: "Branch dashboard",
    description: "Branch-level overview — empty until branch data connects.",
    integrationStatus: "not_connected",
    integrationNote: NOT_CONNECTED,
  },
] as const;

export const DIGITAL_TWIN_MODULE_IDS: readonly DigitalTwinModuleId[] =
  DIGITAL_TWIN_MODULES.map((module) => module.id);

export function getDigitalTwinModule(id: DigitalTwinModuleId): DigitalTwinModule {
  const found = DIGITAL_TWIN_MODULES.find((module) => module.id === id);
  if (!found) {
    return DIGITAL_TWIN_MODULES[0];
  }
  return found;
}

export function isDigitalTwinModuleId(value: unknown): value is DigitalTwinModuleId {
  return typeof value === "string" && (DIGITAL_TWIN_MODULE_IDS as readonly string[]).includes(value);
}

/** Every integration remains Not Connected or Planned until a real source exists. */
export function allDigitalTwinIntegrationsHonest(): boolean {
  return DIGITAL_TWIN_MODULES.every(
    (module) =>
      module.integrationStatus === "not_connected" || module.integrationStatus === "planned",
  );
}
