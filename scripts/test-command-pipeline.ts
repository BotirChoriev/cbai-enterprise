/**
 * Central command pipeline — intent distinction tests.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { interpretCommand } from "@/lib/operational-objects/command-interpreter";

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
