import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import type { EvidenceSourceRecord } from "@/lib/evidence-infrastructure/types";
import { INFRASTRUCTURE_VERSION } from "@/lib/evidence-infrastructure/types";
import {
  findConnectorsByEvidenceSourceId,
  getAllConnectors,
} from "@/lib/connectors";
import type { ConnectorDefinition } from "@/lib/connectors";
import { getGlobalRegistry } from "@/lib/registry";
import type { EntityId } from "@/lib/registry";
import { getIndicatorBySlug, FRAMEWORK_VERSION } from "@/lib/indicator-framework";
import { getMissionCatalog } from "@/lib/missions";
import { buildReportsCenterModel } from "@/lib/reports-center";
import type { ApplicableEntity } from "@/lib/indicator-framework/types";
import {
  EVIDENCE_WATCH_REGISTRY_SNAPSHOT_AT,
  EVIDENCE_WATCH_FOUNDATION_VERSION,
} from "@/lib/evidence-watch/watch-version";
import {
  WATCH_RECORD_VERSION,
  type EvidenceWatchCatalog,
  type EvidenceWatchChangeType,
  type EvidenceWatchId,
  type EvidenceWatchMethodologyReference,
  type EvidenceWatchRecord,
} from "@/lib/evidence-watch/watch-types";

export const WATCH_ID_PATTERN =
  /^watch-(new_source_connected|new_dataset_available|dataset_updated|methodology_updated|connector_verified|connector_deprecated|verification_status_changed)-[a-z0-9-]+$/;

function buildWatchId(
  changeType: EvidenceWatchChangeType,
  anchorId: string,
): EvidenceWatchId {
  const normalized = anchorId.replace(/^src-|^connector-/, "");
  return `watch-${changeType}-${normalized}` as EvidenceWatchId;
}

function resolveIndicatorIdsFromSlugs(slugs: readonly string[]): string[] {
  return slugs
    .map((slug) => getIndicatorBySlug(slug))
    .filter((indicator): indicator is NonNullable<typeof indicator> => indicator !== undefined)
    .map((indicator) => indicator.id);
}

function resolveEntityIdsForIndicators(indicatorIds: readonly string[]): EntityId[] {
  const indicatorSet = new Set(indicatorIds);
  return getGlobalRegistry()
    .entities.filter((entity) =>
      entity.indicatorIds.some((indicatorId) => indicatorSet.has(indicatorId)),
    )
    .map((entity) => entity.entityId);
}

function resolveAffectedMissions(indicatorIds: readonly string[]): string[] {
  const indicatorSet = new Set(indicatorIds);
  return getMissionCatalog()
    .missions.filter((mission) =>
      mission.requiredIndicators.some((id) => indicatorSet.has(id)),
    )
    .map((mission) => mission.missionId);
}

function resolveAffectedWorkspaces(missionIds: readonly string[]): string[] {
  const missionSet = new Set(missionIds);
  const workspaces = new Set<string>();

  for (const mission of getMissionCatalog().missions) {
    if (missionSet.has(mission.missionId)) {
      for (const workspaceId of mission.requiredWorkspaces) {
        workspaces.add(workspaceId);
      }
    }
  }

  return [...workspaces].sort();
}

function resolveAffectedReports(indicatorIds: readonly string[]): string[] {
  const indicatorSet = new Set(indicatorIds);
  const reports = buildReportsCenterModel().reportTypes;
  const applicableEntities = new Set<ApplicableEntity>();

  for (const entity of getGlobalRegistry().entities) {
    if (entity.indicatorIds.some((id) => indicatorSet.has(id))) {
      applicableEntities.add(entity.entityType);
    }
  }

  return reports
    .filter((report) => {
      if (report.entityScope === "multi-entity") return true;
      return applicableEntities.has(report.entityScope as ApplicableEntity);
    })
    .map((report) => report.id);
}

function buildStandardLimitations(): string[] {
  return [
    "Evidence Watch describes official evidence posture from registries — not live monitoring.",
    "Change timestamps reflect registry snapshot time — not real-time detection.",
    "No operational notices, urgency labels, severity levels, or recommendations are generated.",
    "Change descriptions do not interpret political or economic meaning.",
    "Human review is required before using watch records in decision support.",
  ];
}

function buildMethodologyReference(
  standardReference: string,
  description: string,
  registryVersion: string,
): EvidenceWatchMethodologyReference {
  return {
    standardReference,
    description,
    registryVersion,
  };
}

function buildSourceWatchRecord(
  source: EvidenceSourceRecord,
  changeType: EvidenceWatchChangeType,
  connector: ConnectorDefinition | null,
  description: string,
): EvidenceWatchRecord {
  const indicatorIds = resolveIndicatorIdsFromSlugs(source.supportedIndicators);
  const entityIds = resolveEntityIdsForIndicators(indicatorIds);
  const affectedMissions = resolveAffectedMissions(indicatorIds);
  const affectedWorkspaces = resolveAffectedWorkspaces(affectedMissions);
  const affectedReports = resolveAffectedReports(indicatorIds);

  return {
    watchId: buildWatchId(changeType, source.id),
    sourceId: source.id,
    connectorId: connector?.connectorId ?? null,
    entityIds,
    indicatorIds,
    changeType,
    changeTimestamp: EVIDENCE_WATCH_REGISTRY_SNAPSHOT_AT,
    affectedReports,
    affectedMissions,
    affectedWorkspaces,
    methodologyReference: buildMethodologyReference(
      `evidence-infrastructure/sources/${source.slug}`,
      description,
      INFRASTRUCTURE_VERSION,
    ),
    limitations: buildStandardLimitations(),
    humanReviewRequired: true,
    version: WATCH_RECORD_VERSION,
  };
}

function buildConnectorWatchRecord(
  connector: ConnectorDefinition,
  changeType: EvidenceWatchChangeType,
  description: string,
): EvidenceWatchRecord | null {
  const sourceId = connector.evidenceSourceId;
  if (!sourceId) return null;

  const source = OFFICIAL_EVIDENCE_SOURCES.find((entry) => entry.id === sourceId);
  if (!source) return null;

  const indicatorIds =
    connector.supportedIndicators.length > 0
      ? [...connector.supportedIndicators]
      : resolveIndicatorIdsFromSlugs(source.supportedIndicators);

  const entityIds = resolveEntityIdsForIndicators(indicatorIds);
  const affectedMissions = resolveAffectedMissions(indicatorIds);
  const affectedWorkspaces = resolveAffectedWorkspaces(affectedMissions);
  const affectedReports = resolveAffectedReports(indicatorIds);

  return {
    watchId: buildWatchId(changeType, connector.connectorId),
    sourceId,
    connectorId: connector.connectorId,
    entityIds,
    indicatorIds,
    changeType,
    changeTimestamp: EVIDENCE_WATCH_REGISTRY_SNAPSHOT_AT,
    affectedReports,
    affectedMissions,
    affectedWorkspaces,
    methodologyReference: buildMethodologyReference(
      `connectors/${connector.evidenceSourceSlug ?? connector.connectorId}`,
      description,
      connector.version,
    ),
    limitations: buildStandardLimitations(),
    humanReviewRequired: true,
    version: WATCH_RECORD_VERSION,
  };
}

function buildSourceWatchRecords(source: EvidenceSourceRecord): EvidenceWatchRecord[] {
  const records: EvidenceWatchRecord[] = [];
  const connectors = findConnectorsByEvidenceSourceId(source.id);
  const primaryConnector = connectors[0] ?? null;

  if (source.connectionStatus === "connected") {
    records.push(
      buildSourceWatchRecord(
        source,
        "new_source_connected",
        primaryConnector,
        `Official source "${source.name}" registered as connected in Evidence Infrastructure.`,
      ),
    );

    if (source.supportedIndicators.length > 0) {
      records.push({
        ...buildSourceWatchRecord(
          source,
          "new_dataset_available",
          primaryConnector,
          `Dataset scope declared for connected source "${source.name}" — ${source.supportedIndicators.length} indicator mapping(s).`,
        ),
        watchId: buildWatchId("new_dataset_available", source.id),
      });
    }
  }

  if (source.connectionStatus === "deprecated") {
    records.push(
      buildSourceWatchRecord(
        source,
        "connector_deprecated",
        primaryConnector,
        `Official source "${source.name}" marked deprecated in Evidence Infrastructure registry.`,
      ),
    );
  }

  if (
    source.connectionStatus === "connected" &&
    source.verificationStatus === "verified"
  ) {
    records.push({
      ...buildSourceWatchRecord(
        source,
        "verification_status_changed",
        primaryConnector,
        `Verification status for "${source.name}" recorded as verified in Evidence Infrastructure.`,
      ),
      watchId: buildWatchId("verification_status_changed", source.id),
    });
  }

  if (source.updateFrequency && source.connectionStatus === "connected") {
    records.push({
      ...buildSourceWatchRecord(
        source,
        "dataset_updated",
        primaryConnector,
        `Update frequency declared for connected source "${source.name}": ${source.updateFrequency}.`,
      ),
      watchId: buildWatchId("dataset_updated", source.id),
    });
  }

  return records;
}

function buildConnectorWatchRecords(connector: ConnectorDefinition): EvidenceWatchRecord[] {
  const records: EvidenceWatchRecord[] = [];

  if (connector.status === "connected") {
    const built = buildConnectorWatchRecord(
      connector,
      "connector_verified",
      `Connector "${connector.connectorName}" registered as connected in Connector Architecture.`,
    );
    if (built) records.push(built);
  }

  if (connector.status === "deprecated") {
    const built = buildConnectorWatchRecord(
      connector,
      "connector_deprecated",
      `Connector "${connector.connectorName}" marked deprecated in Connector Architecture.`,
    );
    if (built) records.push(built);
  }

  return records;
}

function buildMethodologyWatchRecord(): EvidenceWatchRecord {
  const indicatorIds = getGlobalRegistry()
    .entities.flatMap((entity) => entity.indicatorIds)
    .filter((id, index, array) => array.indexOf(id) === index);

  const affectedMissions = resolveAffectedMissions(indicatorIds);
  const affectedWorkspaces = resolveAffectedWorkspaces(affectedMissions);
  const affectedReports = resolveAffectedReports(indicatorIds);

  return {
    watchId: buildWatchId("methodology_updated", "indicator-framework"),
    sourceId: "src-cbai-local-registry",
    connectorId: null,
    entityIds: getGlobalRegistry().entities.map((entity) => entity.entityId),
    indicatorIds,
    changeType: "methodology_updated",
    changeTimestamp: EVIDENCE_WATCH_REGISTRY_SNAPSHOT_AT,
    affectedReports,
    affectedMissions,
    affectedWorkspaces,
    methodologyReference: buildMethodologyReference(
      "indicator-framework",
      `Global Indicator Framework version ${FRAMEWORK_VERSION} registered in platform catalog.`,
      FRAMEWORK_VERSION,
    ),
    limitations: buildStandardLimitations(),
    humanReviewRequired: true,
    version: WATCH_RECORD_VERSION,
  };
}

/** Build full evidence watch catalog from infrastructure and connector registries. */
export function buildEvidenceWatchCatalog(): EvidenceWatchCatalog {
  const records: EvidenceWatchRecord[] = [];

  for (const source of OFFICIAL_EVIDENCE_SOURCES) {
    records.push(...buildSourceWatchRecords(source));
  }

  for (const connector of getAllConnectors()) {
    records.push(...buildConnectorWatchRecords(connector));
  }

  records.push(buildMethodologyWatchRecord());

  const uniqueRecords = records.filter(
    (record, index, array) =>
      array.findIndex((candidate) => candidate.watchId === record.watchId) === index,
  );

  const byChangeType: EvidenceWatchCatalog["byChangeType"] = {
    new_source_connected: uniqueRecords.filter(
      (record) => record.changeType === "new_source_connected",
    ),
    new_dataset_available: uniqueRecords.filter(
      (record) => record.changeType === "new_dataset_available",
    ),
    dataset_updated: uniqueRecords.filter(
      (record) => record.changeType === "dataset_updated",
    ),
    methodology_updated: uniqueRecords.filter(
      (record) => record.changeType === "methodology_updated",
    ),
    connector_verified: uniqueRecords.filter(
      (record) => record.changeType === "connector_verified",
    ),
    connector_deprecated: uniqueRecords.filter(
      (record) => record.changeType === "connector_deprecated",
    ),
    verification_status_changed: uniqueRecords.filter(
      (record) => record.changeType === "verification_status_changed",
    ),
  };

  return {
    version: EVIDENCE_WATCH_FOUNDATION_VERSION,
    watchRecordVersion: WATCH_RECORD_VERSION,
    registrySnapshotAt: EVIDENCE_WATCH_REGISTRY_SNAPSHOT_AT,
    watchCount: uniqueRecords.length,
    records: uniqueRecords,
    byChangeType,
  };
}

export function isValidWatchIdFormat(id: string): id is EvidenceWatchId {
  return WATCH_ID_PATTERN.test(id);
}

/** Build watch record by ID. */
export function buildEvidenceWatchRecord(
  watchId: string,
): EvidenceWatchRecord | null {
  return buildEvidenceWatchCatalog().records.find((record) => record.watchId === watchId) ?? null;
}

/** Watch records affecting a specific entity. */
export function buildEvidenceWatchRecordsForEntity(
  entityId: EntityId,
): EvidenceWatchRecord[] {
  return buildEvidenceWatchCatalog().records.filter((record) =>
    record.entityIds.includes(entityId),
  );
}

/** Watch records affecting a specific official source. */
export function buildEvidenceWatchRecordsForSource(sourceId: string): EvidenceWatchRecord[] {
  return buildEvidenceWatchCatalog().records.filter((record) => record.sourceId === sourceId);
}
