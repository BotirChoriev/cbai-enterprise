/**
 * Central command pipeline — intent distinction tests.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { interpretCommand } from "@/lib/operational-objects/command-interpreter";
import {
  myWorkHrefForObject,
  routeOperationalObject,
} from "@/lib/operational-objects/operational-object-routing";

const baseContext = {
  locale: "en",
  pathname: "/",
  missionId: null,
  projectId: null,
};

const voiceContext = {
  relationshipFocus: null,
  operatorName: "Operator",
  focusedEntityName: undefined,
};

test("creation command opens composer — never auto-creates", () => {
  const intent = interpretCommand(
    "Create a plan to evaluate water infrastructure evidence in Uzbekistan",
    voiceContext,
    baseContext,
  );
  assert.equal(intent.kind, "open_composer");
  if (intent.kind === "open_composer") {
    assert.match(intent.draft.title.toLowerCase(), /water infrastructure/);
    assert.equal(intent.draft.status, "draft");
  }
});

test("search command is distinct from research question creation", () => {
  const search = interpretCommand("search Uzbekistan water policy", voiceContext, baseContext);
  assert.equal(search.kind, "search");

  const create = interpretCommand(
    "create research question about Uzbekistan water policy",
    voiceContext,
    baseContext,
  );
  assert.equal(create.kind, "open_composer");
});

test("evidence request is distinct from generic project", () => {
  const evidence = interpretCommand(
    "request evidence for Uzbekistan water infrastructure sources",
    voiceContext,
    { ...baseContext, pathname: "/countries" },
  );
  assert.equal(evidence.kind, "open_composer");
  if (evidence.kind === "open_composer") {
    assert.equal(evidence.draft.type, "evidence_request");
  }
});

test("navigation commands resolve through voice action layer", () => {
  const intent = interpretCommand("open my work", voiceContext, baseContext);
  assert.equal(intent.kind, "navigate");
});

test("read-only navigation never opens a mutation composer", () => {
  for (const phrase of ["open evidence", "open my work", "open trust", "open graph"]) {
    const intent = interpretCommand(phrase, voiceContext, baseContext);
    assert.notEqual(intent.kind, "open_composer", `${phrase} must remain read-only`);
    assert.ok(intent.kind === "navigate" || intent.kind === "informational" || intent.kind === "clarify");
  }
});

test("creation command yields draft status — confirmation required before object exists", () => {
  const intent = interpretCommand("create work plan for water evidence review", voiceContext, baseContext);
  assert.equal(intent.kind, "open_composer");
  if (intent.kind === "open_composer") {
    assert.equal(intent.draft.status, "draft");
    assert.ok(intent.draft.title.trim().length > 0);
    assert.ok(intent.draft.type.length > 0);
  }
});

test("ambiguous and clarify intents do not silently create records", () => {
  const ambiguous = interpretCommand("maybe something", voiceContext, baseContext);
  assert.ok(
    ambiguous.kind === "clarify" ||
      ambiguous.kind === "ambiguous" ||
      ambiguous.kind === "informational" ||
      ambiguous.kind === "navigate",
  );
  assert.notEqual(ambiguous.kind, "open_composer");
});

test("confirmed object routing matches type/domain after confirmation contract", () => {
  // Type overrides win for evidence_request → evidence surface (/knowledge alias).
  const evidenceReq = routeOperationalObject({
    type: "evidence_request",
    domain: "countries",
    projectId: undefined,
  });
  assert.equal(evidenceReq.href, "/knowledge");
  // Domain routing when no type override applies.
  const countryPlan = routeOperationalObject({
    type: "review",
    domain: "countries",
    projectId: undefined,
  });
  assert.equal(countryPlan.href, "/countries");
  assert.match(myWorkHrefForObject("oo-test-id"), /\/my-work/);
  assert.match(myWorkHrefForObject("oo-test-id"), /oo-test-id/);
});

test("provider confirm path is idempotent and confirmation-gated (source contract)", () => {
  const provider = readFileSync(
    join(process.cwd(), "components/operational-objects/OperationalObjectProvider.tsx"),
    "utf8",
  );
  assert.match(provider, /confirmInFlightRef/);
  assert.match(provider, /lastConfirmKeyRef/);
  assert.match(provider, /confirmOperationalObject/);
  assert.match(provider, /missingRequiredFields/);
  // Confirm creates then routes to My Work for the object — never silent create.
  assert.match(provider, /myWorkHrefForObject/);
});

test("ambiguous short input triggers clarification", () => {
  const intent = interpretCommand("water", voiceContext, baseContext);
  assert.equal(intent.kind, "clarify");
});

test("locale is captured on draft provenance", () => {
  const intent = interpretCommand(
    "create task to review governance standards",
    voiceContext,
    { ...baseContext, locale: "uz", pathname: "/governance" },
  );
  assert.equal(intent.kind, "open_composer");
  if (intent.kind === "open_composer") {
    assert.equal(intent.draft.locale, "uz");
    assert.equal(intent.draft.domain, "governance");
  }
});
