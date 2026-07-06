import { getIndicatorById } from "@/lib/indicator-framework";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import {
  isConnectorCapability,
  REQUIRED_CONNECTOR_CAPABILITIES,
} from "@/lib/connectors/connector-capabilities";
import { isConnectorStatus } from "@/lib/connectors/connector-status";
import {
  isValidConnectorIdFormat,
  parseConnectorId,
} from "@/lib/connectors/connector-builder";
import {
  CONNECTOR_SUPPORTED_ENTITY_TYPES,
  type ConnectorDefinition,
  type ConnectorRegistry,
  type ConnectorValidationIssue,
  type ConnectorValidationReport,
} from "@/lib/connectors/connector-types";

const KNOWN_ENTITY_TYPES = new Set<string>(CONNECTOR_SUPPORTED_ENTITY_TYPES);
const KNOWN_SOURCE_IDS = new Set(OFFICIAL_EVIDENCE_SOURCES.map((source) => source.id));
const REQUIRED_CAPABILITIES = new Set<string>(REQUIRED_CONNECTOR_CAPABILITIES);

function pushIssue(
  target: ConnectorValidationIssue[],
  issue: ConnectorValidationIssue,
): void {
  target.push(issue);
}

function validateCoverage(connector: ConnectorDefinition): ConnectorValidationIssue[] {
  const issues: ConnectorValidationIssue[] = [];

  if (!connector.coverage.summary.trim()) {
    pushIssue(issues, {
      code: "broken_coverage",
      severity: "error",
      message: `Connector "${connector.connectorId}" has empty coverage summary.`,
      connectorId: connector.connectorId,
    });
  }

  if (connector.coverage.supportedCountries.length === 0) {
    pushIssue(issues, {
      code: "broken_coverage",
      severity: "error",
      message: `Connector "${connector.connectorId}" has no supported countries scope.`,
      connectorId: connector.connectorId,
    });
  }

  if (connector.coverage.supportedLanguages.length === 0) {
    pushIssue(issues, {
      code: "broken_coverage",
      severity: "warning",
      message: `Connector "${connector.connectorId}" declares no supported languages.`,
      connectorId: connector.connectorId,
    });
  }

  return issues;
}

/** Validate a built connector registry snapshot. */
export function validateConnectorRegistry(registry: ConnectorRegistry): ConnectorValidationReport {
  const errors: ConnectorValidationIssue[] = [];
  const warnings: ConnectorValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const connector of registry.connectors) {
    if (!isValidConnectorIdFormat(connector.connectorId)) {
      pushIssue(errors, {
        code: "invalid_connector_id_format",
        severity: "error",
        message: `Connector ID "${connector.connectorId}" does not match required format.`,
        connectorId: connector.connectorId,
      });
    }

    if (seenIds.has(connector.connectorId)) {
      pushIssue(errors, {
        code: "duplicate_connector_id",
        severity: "error",
        message: `Duplicate connector ID "${connector.connectorId}".`,
        connectorId: connector.connectorId,
      });
    }
    seenIds.add(connector.connectorId);

    const parsed = parseConnectorId(connector.connectorId);
    if (parsed && parsed.slug !== connector.connectorId.replace(/^connector-/, "")) {
      pushIssue(errors, {
        code: "invalid_connector_id_format",
        severity: "error",
        message: `Connector slug mismatch for "${connector.connectorId}".`,
        connectorId: connector.connectorId,
      });
    }

    if (!isConnectorStatus(connector.status)) {
      pushIssue(errors, {
        code: "invalid_status",
        severity: "error",
        message: `Unknown status "${connector.status}" on connector "${connector.connectorId}".`,
        connectorId: connector.connectorId,
        reference: connector.status,
      });
    }

    for (const entityType of connector.supportedEntities) {
      if (!KNOWN_ENTITY_TYPES.has(entityType)) {
        pushIssue(errors, {
          code: "unknown_entity_type",
          severity: "error",
          message: `Unknown entity type "${entityType}" on connector "${connector.connectorId}".`,
          connectorId: connector.connectorId,
          reference: entityType,
        });
      }
    }

    for (const indicatorId of connector.supportedIndicators) {
      if (!getIndicatorById(indicatorId)) {
        pushIssue(errors, {
          code: "unknown_indicator",
          severity: "error",
          message: `Unknown indicator "${indicatorId}" on connector "${connector.connectorId}".`,
          connectorId: connector.connectorId,
          reference: indicatorId,
        });
      }
    }

    if (connector.supportedIndicators.length === 0) {
      pushIssue(warnings, {
        code: "unknown_indicator",
        severity: "warning",
        message: `Connector "${connector.connectorId}" resolves zero supported indicators.`,
        connectorId: connector.connectorId,
      });
    }

    for (const capability of connector.capabilities) {
      if (!isConnectorCapability(capability)) {
        pushIssue(errors, {
          code: "broken_capability",
          severity: "error",
          message: `Unknown capability "${capability}" on connector "${connector.connectorId}".`,
          connectorId: connector.connectorId,
          reference: capability,
        });
      }
    }

    for (const required of REQUIRED_CAPABILITIES) {
      if (!connector.capabilities.includes(required as ConnectorDefinition["capabilities"][number])) {
        pushIssue(errors, {
          code: "broken_capability",
          severity: "error",
          message: `Connector "${connector.connectorId}" missing required capability "${required}".`,
          connectorId: connector.connectorId,
          reference: required,
        });
      }
    }

    if (connector.evidenceSourceId && !KNOWN_SOURCE_IDS.has(connector.evidenceSourceId)) {
      pushIssue(errors, {
        code: "unknown_evidence_source",
        severity: "error",
        message: `Unknown evidence source "${connector.evidenceSourceId}" on connector "${connector.connectorId}".`,
        connectorId: connector.connectorId,
        reference: connector.evidenceSourceId,
      });
    }

    if (!connector.evidenceSourceId && connector.status !== "planned") {
      pushIssue(warnings, {
        code: "unknown_evidence_source",
        severity: "warning",
        message: `Connector "${connector.connectorId}" has no evidence source binding.`,
        connectorId: connector.connectorId,
      });
    }

    if (connector.authentication.kind !== "none" && !connector.authentication.description.trim()) {
      pushIssue(errors, {
        code: "invalid_authentication",
        severity: "error",
        message: `Connector "${connector.connectorId}" requires authentication description.`,
        connectorId: connector.connectorId,
      });
    }

    for (const issue of validateCoverage(connector)) {
      if (issue.severity === "error") {
        errors.push(issue);
      } else {
        warnings.push(issue);
      }
    }
  }

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

/** Assert registry validity — throws on validation errors. */
export function assertConnectorRegistryValid(registry: ConnectorRegistry): void {
  const report = validateConnectorRegistry(registry);
  if (!report.valid) {
    const summary = report.errors.map((issue) => issue.message).join("; ");
    throw new Error(`Connector registry validation failed: ${summary}`);
  }
}

export function summarizeConnectorValidationReport(
  report: ConnectorValidationReport,
): string {
  if (report.valid && report.warnings.length === 0) {
    return "Connector registry valid — no issues.";
  }

  const parts: string[] = [];
  if (report.errors.length > 0) {
    parts.push(`${report.errors.length} error(s)`);
  }
  if (report.warnings.length > 0) {
    parts.push(`${report.warnings.length} warning(s)`);
  }
  return `Connector registry validation: ${parts.join(", ")}.`;
}
