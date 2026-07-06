import type {
  EntityId,
  GlobalRegistry,
  RegistryValidationIssue,
  RegistryValidationReport,
} from "@/lib/registry/types";
import { isActiveEntityType, isValidEntityIdFormat, parseEntityId } from "@/lib/registry/entity-id";
import { entitySlugKey } from "@/lib/registry/entity-index";

function pushIssue(
  target: RegistryValidationIssue[],
  issue: RegistryValidationIssue,
): void {
  target.push(issue);
}

/** Validate a built global registry snapshot. */
export function validateGlobalRegistry(registry: GlobalRegistry): RegistryValidationReport {
  const errors: RegistryValidationIssue[] = [];
  const warnings: RegistryValidationIssue[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const knownIds = new Set(registry.entities.map((entity) => entity.entityId));

  for (const entity of registry.entities) {
    if (!isValidEntityIdFormat(entity.entityId)) {
      pushIssue(errors, {
        code: "invalid_entity_id_format",
        severity: "error",
        message: `Entity ID "${entity.entityId}" does not match required format.`,
        entityId: entity.entityId,
      });
    }

    const parsed = parseEntityId(entity.entityId);
    if (parsed && parsed.entityType !== entity.entityType) {
      pushIssue(errors, {
        code: "unknown_entity_type",
        severity: "error",
        message: `Entity type mismatch for "${entity.entityId}".`,
        entityId: entity.entityId,
      });
    }

    if (!isActiveEntityType(entity.entityType)) {
      pushIssue(errors, {
        code: "unknown_entity_type",
        severity: "error",
        message: `Unknown entity type "${entity.entityType}".`,
        entityId: entity.entityId,
      });
    }

    if (seenIds.has(entity.entityId)) {
      pushIssue(errors, {
        code: "duplicate_entity_id",
        severity: "error",
        message: `Duplicate entity ID "${entity.entityId}".`,
        entityId: entity.entityId,
      });
    }
    seenIds.add(entity.entityId);

    const slugKey = entitySlugKey(entity.entityType, entity.slug);
    if (seenSlugs.has(slugKey)) {
      pushIssue(errors, {
        code: "duplicate_slug",
        severity: "error",
        message: `Duplicate slug "${entity.slug}" for type "${entity.entityType}".`,
        entityId: entity.entityId,
      });
    }
    seenSlugs.add(slugKey);

    if (parsed && entity.slug !== parsed.slug) {
      pushIssue(warnings, {
        code: "broken_relationship",
        severity: "warning",
        message: `Slug segment "${entity.slug}" does not match entity ID slug "${parsed.slug}".`,
        entityId: entity.entityId,
      });
    }

    for (const relatedId of entity.relatedEntityIds) {
      if (!knownIds.has(relatedId)) {
        pushIssue(errors, {
          code: "missing_reference",
          severity: "error",
          message: `Missing related entity "${relatedId}" referenced by "${entity.entityId}".`,
          entityId: entity.entityId,
          relatedEntityId: relatedId,
        });
        continue;
      }

      if (!isValidEntityIdFormat(relatedId)) {
        pushIssue(errors, {
          code: "broken_relationship",
          severity: "error",
          message: `Invalid related entity ID format "${relatedId}".`,
          entityId: entity.entityId,
          relatedEntityId: relatedId,
        });
      }
    }

    if (entity.relatedEntityIds.length === 0 && entity.entityType !== "country") {
      pushIssue(warnings, {
        code: "broken_relationship",
        severity: "warning",
        message: `Entity "${entity.entityId}" has no resolvable related entities in local catalogs.`,
        entityId: entity.entityId,
      });
    }
  }

  const allIssues = [...errors, ...warnings];

  return {
    valid: errors.length === 0,
    issueCount: allIssues.length,
    errors,
    warnings,
  };
}

/** Validate registry and throw if errors exist — for CI hooks. */
export function assertRegistryValid(registry: GlobalRegistry): void {
  const report = validateGlobalRegistry(registry);
  if (!report.valid) {
    const summary = report.errors.map((issue) => issue.message).join("; ");
    throw new Error(`Global registry validation failed: ${summary}`);
  }
}

/** Summarize validation for observability. */
export function summarizeValidationReport(report: RegistryValidationReport): {
  valid: boolean;
  errorCount: number;
  warningCount: number;
} {
  return {
    valid: report.valid,
    errorCount: report.errors.length,
    warningCount: report.warnings.length,
  };
}

export type { EntityId };
