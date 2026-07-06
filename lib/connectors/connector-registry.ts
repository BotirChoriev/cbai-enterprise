import type { ConnectorCapability } from "@/lib/connectors/connector-capabilities";
import type { ConnectorStatus } from "@/lib/connectors/connector-status";
import type {
  ConnectorDefinition,
  ConnectorId,
  ConnectorRegistry,
  ConnectorRegistryIndex,
  ConnectorSupportedEntityType,
} from "@/lib/connectors/connector-types";
import { buildConnectorRegistry } from "@/lib/connectors/connector-builder";

function groupByStatus(
  connectors: readonly ConnectorDefinition[],
): ReadonlyMap<ConnectorStatus, readonly ConnectorDefinition[]> {
  const map = new Map<ConnectorStatus, ConnectorDefinition[]>();

  for (const connector of connectors) {
    const list = map.get(connector.status) ?? [];
    list.push(connector);
    map.set(connector.status, list);
  }

  return map;
}

function groupByEntityType(
  connectors: readonly ConnectorDefinition[],
): ReadonlyMap<ConnectorSupportedEntityType, readonly ConnectorDefinition[]> {
  const map = new Map<ConnectorSupportedEntityType, ConnectorDefinition[]>();

  for (const connector of connectors) {
    for (const entityType of connector.supportedEntities) {
      const list = map.get(entityType) ?? [];
      list.push(connector);
      map.set(entityType, list);
    }
  }

  return map;
}

function groupByEvidenceSourceId(
  connectors: readonly ConnectorDefinition[],
): ReadonlyMap<string, readonly ConnectorDefinition[]> {
  const map = new Map<string, ConnectorDefinition[]>();

  for (const connector of connectors) {
    if (!connector.evidenceSourceId) continue;
    const list = map.get(connector.evidenceSourceId) ?? [];
    list.push(connector);
    map.set(connector.evidenceSourceId, list);
  }

  return map;
}

function groupByCapability(
  connectors: readonly ConnectorDefinition[],
): ReadonlyMap<ConnectorCapability, readonly ConnectorDefinition[]> {
  const map = new Map<ConnectorCapability, ConnectorDefinition[]>();

  for (const connector of connectors) {
    for (const capability of connector.capabilities) {
      const list = map.get(capability) ?? [];
      list.push(connector);
      map.set(capability, list);
    }
  }

  return map;
}

function buildConnectorRegistryIndex(registry: ConnectorRegistry): ConnectorRegistryIndex {
  const byId = new Map<ConnectorId, ConnectorDefinition>();

  for (const connector of registry.connectors) {
    byId.set(connector.connectorId, connector);
  }

  return {
    byId,
    byStatus: groupByStatus(registry.connectors),
    byEntityType: groupByEntityType(registry.connectors),
    byEvidenceSourceId: groupByEvidenceSourceId(registry.connectors),
    byCapability: groupByCapability(registry.connectors),
  };
}

let cachedRegistry: ConnectorRegistry | null = null;
let cachedIndex: ConnectorRegistryIndex | null = null;

/** Unified CBAI official evidence connector registry — definitions only. */
export function getConnectorRegistry(): ConnectorRegistry {
  if (!cachedRegistry) {
    cachedRegistry = buildConnectorRegistry();
  }
  return cachedRegistry;
}

/** Indexed connector registry views for fast lookup. */
export function getConnectorRegistryIndex(): ConnectorRegistryIndex {
  if (!cachedIndex) {
    cachedIndex = buildConnectorRegistryIndex(getConnectorRegistry());
  }
  return cachedIndex;
}

/** Force rebuild — for tests and future migration hooks. */
export function rebuildConnectorRegistry(): ConnectorRegistry {
  cachedRegistry = buildConnectorRegistry();
  cachedIndex = buildConnectorRegistryIndex(cachedRegistry);
  return cachedRegistry;
}

export function getAllConnectors(): readonly ConnectorDefinition[] {
  return getConnectorRegistry().connectors;
}

export function getConnectorCount(): number {
  return getConnectorRegistry().connectorCount;
}

export type { ConnectorRegistryIndex };
