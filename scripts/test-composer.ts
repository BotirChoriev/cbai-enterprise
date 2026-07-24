/**
 * Composer-focused regression tests — draft card and linked-work entry.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  buildCountryLinkedWorkDraft,
  buildGraphLinkedWorkDraft,
} from "@/lib/operational-objects/linked-work-draft";
import { missingRequiredFields } from "@/lib/operational-objects/command-interpreter";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

test("composer component requires explicit confirmation actions", () => {
  const source = readSource("components/operational-objects/OperationalObjectComposer.tsx");
  assert.ok(source.includes("confirmDraft"));
  assert.ok(source.includes("saveDraft"));
  assert.ok(source.includes("operationalObject.confirmCreate"));
  assert.ok(source.includes("role=\"dialog\""));
  assert.ok(source.includes("missingFieldLabel"));
});

test("linked work button never calls confirmOperationalObject directly", () => {
  const source = readSource("components/operational-objects/CreateLinkedWorkButton.tsx");
  assert.ok(source.includes("openComposer"));
  assert.doesNotMatch(source, /confirmOperationalObject/);
  assert.doesNotMatch(source, /saveOperationalDraft/);
});

test("country linked draft marks inferred fields for review", () => {
  const { draft, inferredFields } = buildCountryLinkedWorkDraft(
    { countryId: "uz", countryName: "Uzbekistan", routePath: "/countries" },
    "evidence_request",
    "uz",
  );
  assert.equal(draft.status, "draft");
  assert.ok(inferredFields.length >= 4);
  assert.ok(missingRequiredFields(draft).includes("humanDecision"));
});

test("graph linked draft only built with explicit node context", () => {
  const { draft } = buildGraphLinkedWorkDraft(
    {
      nodeId: "n-42",
      entityType: "company",
      entityId: "acme",
      entityName: "ACME",
      routePath: "/graph",
    },
    "research_question",
    "en",
  );
  assert.equal(draft.provenance.source, "existing_object");
  assert.equal(draft.provenance.graphNodeId, "n-42");
});
