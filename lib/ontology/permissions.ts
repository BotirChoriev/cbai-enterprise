/**
 * Ontology permissions — mutation gates and read-only enforcement.
 */

import type { OntologyObjectRecord } from "@/lib/ontology/types";
import { getKindSchema } from "@/lib/ontology/schema-registry";

export type OntologyPermissionAction =
  | "read"
  | "create_draft"
  | "confirm"
  | "update"
  | "link"
  | "unlink"
  | "archive";

export type OntologyPermissionResult = {
  readonly allowed: boolean;
  readonly reason?: string;
};

export function checkOntologyPermission(
  record: OntologyObjectRecord | null,
  action: OntologyPermissionAction,
): OntologyPermissionResult {
  if (action === "read") return { allowed: true };

  if (!record) {
    return action === "create_draft"
      ? { allowed: true }
      : { allowed: false, reason: "Object not found" };
  }

  const schema = getKindSchema(record.kind);

  if (schema.readOnly && record.provenance.source === "registry_projection") {
    if (action === "update" || action === "confirm") {
      return { allowed: false, reason: "Registry projections are read-only" };
    }
  }

  if (record.status === "archived") {
    return { allowed: false, reason: "Archived objects cannot be modified" };
  }

  if (action === "confirm" && record.status !== "draft" && record.status !== "awaiting_confirmation") {
    return { allowed: false, reason: "Only draft or awaiting_confirmation objects can be confirmed" };
  }

  if (action === "update" && record.status === "awaiting_confirmation") {
    return { allowed: true };
  }

  return { allowed: true };
}

/** No mutation may occur merely because a model suggested it. */
export function requiresHumanConfirmation(record: OntologyObjectRecord): boolean {
  return (
    record.status === "draft" ||
    record.status === "awaiting_confirmation" ||
    record.provenance.source === "engine_inferred"
  );
}
