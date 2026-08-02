import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveScientistWorkflowTurn,
  type ScientistWorkflowContext,
} from "@/lib/voice-operator/scientist-workflow";

test("recognized university and unit open the measurement workspace without a conclusion", () => {
  const result = resolveScientistWorkflowTurn(
    "I am a scientist at MIT continuing an experiment measured in degrees Celsius.",
    null,
  );
  assert.equal(result.handled, true);
  assert.match(result.href ?? "", /^\/research\/canvas\?/);
  assert.match(result.href ?? "", /university=mit/);
  assert.match(result.href ?? "", /unit=degC/);
  assert.doesNotMatch(result.message ?? "", /proves|confirmed/i);
  assert.match(result.message ?? "", /select or create/i);
});

test("unknown university stays unknown and the operator asks for it", () => {
  const result = resolveScientistWorkflowTurn(
    "I am a scientist and I need to continue my university project.",
    null,
  );
  assert.equal(result.context?.universityId, null);
  assert.equal(result.context?.unitId, null);
  assert.doesNotMatch(result.href ?? "", /university=/);
  assert.match(result.message ?? "", /which university/i);
});

test("a university-only answer completes the pending scientist context without guessing", () => {
  const pending = resolveScientistWorkflowTurn(
    "I am a scientist and I need to continue my university project.",
    null,
  ).context ?? null;
  const result = resolveScientistWorkflowTurn("MIT", pending);
  assert.equal(result.context?.universityId, "mit");
  assert.match(result.href ?? "", /university=mit/);
  assert.match(result.message ?? "", /which measurement unit/i);
});

test("measurement continuity restores the same university, unit, and project", () => {
  const context: ScientistWorkflowContext = {
    role: "scientist",
    universityId: "mit",
    universityName: "MIT",
    unitId: "degC",
    unitSymbol: "°C",
    projectStatement: "Thermal stability experiment",
    smartIdeaId: "idea-17",
  };
  const result = resolveScientistWorkflowTurn("Return to the measurements we were using.", context);
  assert.match(result.href ?? "", /university=mit/);
  assert.match(result.href ?? "", /unit=degC/);
  assert.match(result.href ?? "", /smartIdea=idea-17/);
  assert.deepEqual(result.context, context);
});

test("unsupported proof request is refused and does not navigate", () => {
  const result = resolveScientistWorkflowTurn("Tell me that my experiment proves the hypothesis.", null);
  assert.equal(result.handled, true);
  assert.equal(result.href, undefined);
  assert.match(result.message ?? "", /cannot declare/i);
  assert.match(result.message ?? "", /study design.*measurements.*uncertainty.*controls.*analysis method/i);
  assert.match(result.message ?? "", /human confirmation/i);
});

test("ordinary Evidence navigation remains owned by the canonical command system", () => {
  assert.deepEqual(resolveScientistWorkflowTurn("Open Evidence.", null), { handled: false });
});
