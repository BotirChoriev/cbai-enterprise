/**
 * Operational Object model, migration, and routing tests.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isOperationalObject,
  isOperationalObjectDomain,
  isOperationalObjectStatus,
  isOperationalObjectType,
} from "@/lib/operational-objects/operational-object.types";
import { routeOperationalObject } from "@/lib/operational-objects/operational-object-routing";
import { missingRequiredFields } from "@/lib/operational-objects/command-interpreter";
import {
  buildCountryLinkedWorkDraft,
  buildGraphLinkedWorkDraft,
} from "@/lib/operational-objects/linked-work-draft";

test("operational object type guard accepts canonical types", () => {
  assert.equal(isOperationalObjectType("work_plan"), true);
  assert.equal(isOperationalObjectType("evidence_request"), true);
  assert.equal(isOperationalObjectType("unknown"), false);
});

test("operational object status guard accepts required statuses", () => {
  for (const status of [
    "draft",
    "ready",
    "active",
    "waiting_for_input",
    "waiting_for_evidence",
    "needs_review",
    "blocked",
    "completed",
    "archived",
  ]) {
    assert.equal(isOperationalObjectStatus(status), true);
  }
});

test("operational object domain guard accepts CBAI domains", () => {
  assert.equal(isOperationalObjectDomain("research"), true);
  assert.equal(isOperationalObjectDomain("general"), true);
  assert.equal(isOperationalObjectDomain("marketing"), false);
});

test("isOperationalObject validates minimal shape", () => {
  const valid = {
    id: "op-1",
    version: 1,
    type: "work_plan",
    title: "Evaluate water infrastructure",
    summary: "",
    objective: "Evaluate",
    rationale: "",
    expectedOutcome: "",
    domain: "countries",
    status: "draft",
    priority: "normal",
    requiredInputs: [],
    evidenceRequirements: [],
    nextAction: "Review",
    humanDecision: "Confirm scope",
    relatedObjectIds: [],
    locale: "en",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    provenance: { source: "typed_command" },
  };
  assert.equal(isOperationalObject(valid), true);
  assert.equal(isOperationalObject({ ...valid, customField: "preserve-me" }), true);
});

test("missing required fields never fabricates defaults", () => {
  const missing = missingRequiredFields({
    type: "work_plan",
    title: "",
    summary: "",
    objective: "",
    rationale: "",
    expectedOutcome: "",
    domain: "general",
    status: "draft",
    priority: "normal",
    requiredInputs: [],
    evidenceRequirements: [],
    nextAction: "",
    humanDecision: "",
    relatedObjectIds: [],
    locale: "en",
    provenance: { source: "manual" },
  });
  assert.ok(missing.includes("title"));
  assert.ok(missing.includes("objective"));
  assert.ok(missing.includes("humanDecision"));
});

test("routing is deterministic by type and domain", () => {
  const research = routeOperationalObject({
    type: "research_question",
    domain: "research",
  });
  assert.equal(research.href, "/research");

  const evidence = routeOperationalObject({
    type: "evidence_request",
    domain: "evidence",
  });
  assert.equal(evidence.href, "/knowledge");

  const projectLinked = routeOperationalObject({
    type: "task",
    domain: "general",
    projectId: "project-abc",
  });
  assert.match(projectLinked.href, /my-work\?project=project-abc/);
});

test("country linked work draft prefills factual context without creating records", () => {
  const { draft, inferredFields } = buildCountryLinkedWorkDraft(
    { countryId: "uz", countryName: "Uzbekistan", routePath: "/countries?country=uz" },
    "research_question",
    "uz",
  );
  assert.equal(draft.status, "draft");
  assert.equal(draft.domain, "countries");
  assert.equal(draft.type, "research_question");
  assert.ok(draft.relatedObjectIds.includes("entity:country:uz"));
  assert.equal(draft.provenance.relatedEntityName, "Uzbekistan");
  assert.ok(inferredFields.includes("domain"));
  assert.ok(draft.title.includes("Tadqiqot savoli"));
  assert.ok(draft.nextAction.includes("tasdiqlang"));
});

test("graph linked work draft requires selected node context", () => {
  const { draft } = buildGraphLinkedWorkDraft(
    {
      nodeId: "node-1",
      entityType: "country",
      entityId: "uz",
      entityName: "Uzbekistan",
      routePath: "/graph",
    },
    "work_plan",
    "en",
  );
  assert.equal(draft.domain, "knowledge");
  assert.ok(draft.relatedObjectIds.includes("graph-node:node-1"));
  assert.equal(draft.provenance.graphNodeId, "node-1");
});

test("report draft preset maps to work plan with reports domain", () => {
  const { draft } = buildCountryLinkedWorkDraft(
    { countryId: "de", countryName: "Germany", routePath: "/countries" },
    "report_draft",
    "en",
  );
  assert.equal(draft.type, "work_plan");
  assert.equal(draft.domain, "reports");
});
