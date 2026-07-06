import type { ConnectorCapability } from "@/lib/connectors/connector-capabilities";
import type { ConnectorStatus } from "@/lib/connectors/connector-status";
import type {
  ConnectorDefinition,
  ConnectorId,
  ConnectorSupportedEntityType,
} from "@/lib/connectors/connector-types";
import {
  getConnectorRegistry,
  getConnectorRegistryIndex,
} from "@/lib/connectors/connector-registry";
import { parseConnectorId } from "@/lib/connectors/connector-builder";

/** Find a connector by permanent ID. */
export function findConnectorById(connectorId: ConnectorId): ConnectorDefinition | undefined {
  return getConnectorRegistryIndex().byId.get(connectorId);
}

/** Find a connector by ID string with format validation. */
export function findConnectorByIdString(connectorId: string): ConnectorDefinition | undefined {
  if (!parseConnectorId(connectorId)) return undefined;
  return findConnectorById(connectorId as ConnectorId);
}

/** Find connectors by lifecycle status. */
export function findConnectorsByStatus(
  status: ConnectorStatus,
): readonly ConnectorDefinition[] {
  return getConnectorRegistryIndex().byStatus.get(status) ?? [];
}

/** Find connectors supporting a given entity type. */
export function findConnectorsByEntityType(
  entityType: ConnectorSupportedEntityType,
): readonly ConnectorDefinition[] {
  return getConnectorRegistryIndex().byEntityType.get(entityType) ?? [];
}

/** Find connectors bound to an Evidence Infrastructure source ID. */
export function findConnectorsByEvidenceSourceId(
  evidenceSourceId: string,
): readonly ConnectorDefinition[] {
  return getConnectorRegistryIndex().byEvidenceSourceId.get(evidenceSourceId) ?? [];
}

/** Find connectors exposing a given capability. */
export function findConnectorsByCapability(
  capability: ConnectorCapability,
): readonly ConnectorDefinition[] {
  return getConnectorRegistryIndex().byCapability.get(capability) ?? [];
}

/** Search connectors by display name (case-insensitive substring). */
export function searchConnectorsByName(query: string): readonly ConnectorDefinition[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return getConnectorRegistry().connectors;

  return getConnectorRegistry().connectors.filter((connector) =>
    connector.connectorName.toLowerCase().includes(normalized),
  );
}

/** List connector statuses present in the registry. */
export function listActiveConnectorStatuses(): readonly ConnectorStatus[] {
  const statuses = new Set<ConnectorStatus>();
  for (const connector of getConnectorRegistry().connectors) {
    statuses.add(connector.status);
  }
  return [...statuses];
}
