/**
 * Ontology object validation — schema checks before create/update.
 */

import { getKindSchema } from "@/lib/ontology/schema-registry";
import { isOntologyObjectKind } from "@/lib/ontology/object-kinds";
import type { OntologyObjectDraft, OntologyObjectRecord, OntologyValidationIssue, OntologyValidationResult } from "@/lib/ontology/types";

function issue(code: string, message: string, severity: "error" | "warning" = "error", field?: string): OntologyValidationIssue {
  return { code, severity, message, field };
}

export function validateOntologyDraft(draft: OntologyObjectDraft): OntologyValidationResult {
  const issues: OntologyValidationIssue[] = [];

  if (!isOntologyObjectKind(draft.kind)) {
    issues.push(issue("invalid_kind", `Unknown object kind: ${String(draft.kind)}`));
    return { valid: false, issues };
  }

  if (!draft.title?.trim()) {
    issues.push(issue("missing_title", "Title is required", "error", "title"));
  }

  if (!draft.contentLocale || !draft.createdLocale) {
    issues.push(issue("missing_locale", "contentLocale and createdLocale are required", "error", "contentLocale"));
  }

  if (!draft.provenance?.source) {
    issues.push(issue("missing_provenance", "Provenance source is required", "error", "provenance"));
  }

  const schema = getKindSchema(draft.kind);
  const metadata = draft.metadata ?? {};
  for (const key of schema.requiredMetadata) {
    if (metadata[key] === undefined || metadata[key] === null || metadata[key] === "") {
      issues.push(issue("missing_metadata", `Required metadata field "${key}" missing for kind ${draft.kind}`, "error", key));
    }
  }

  return { valid: issues.filter((i) => i.severity === "error").length === 0, issues };
}

export function validateOntologyRecord(record: OntologyObjectRecord): OntologyValidationResult {
  const issues: OntologyValidationIssue[] = [];

  if (!record.id) issues.push(issue("missing_id", "Object id is required", "error", "id"));
  if (!record.createdAt) issues.push(issue("missing_created_at", "createdAt is required", "error", "createdAt"));
  if (!record.updatedAt) issues.push(issue("missing_updated_at", "updatedAt is required", "error", "updatedAt"));

  const draftResult = validateOntologyDraft({
    kind: record.kind,
    title: record.title,
    description: record.description,
    status: record.status,
    contentLocale: record.contentLocale,
    createdLocale: record.createdLocale,
    provenance: record.provenance,
    sourceReferences: record.sourceReferences,
    relationshipIds: record.relationshipIds,
    metadata: record.metadata,
  });

  return {
    valid: issues.filter((i) => i.severity === "error").length === 0 && draftResult.valid,
    issues: [...issues, ...draftResult.issues],
  };
}

/** Read-only registry projections cannot be mutated to active status without adapter. */
export function canMutateObject(record: OntologyObjectRecord): boolean {
  const schema = getKindSchema(record.kind);
  if (schema.readOnly && record.provenance.source === "registry_projection") {
    return false;
  }
  return record.status !== "archived";
}
