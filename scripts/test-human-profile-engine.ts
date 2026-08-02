import assert from "node:assert/strict";
import { test } from "node:test";
import type { HumanContext } from "@/lib/human-centered-workspace/contracts";
import type {
  HumanContextEvent,
  HumanContextRepository,
} from "@/lib/human-centered-workspace/context-repository";
import {
  readScientistHumanContext,
  scientistInputFromHumanContext,
  writeScientistHumanContext,
} from "@/lib/human-centered-workspace/scientist-context-adapter";
import { SCIENTIST_REFERENCE_CAPABILITIES } from "@/lib/human-centered-workspace/scientist-capabilities";
import { composeWorkspace } from "@/lib/human-centered-workspace/workspace-composer";
import { buildOperationalHumanContext } from "@/lib/human-centered-workspace/operational-context-adapter";
import { OPERATIONAL_REFERENCE_CAPABILITIES } from "@/lib/human-centered-workspace/operational-capabilities";

class MemoryContextRepository implements HumanContextRepository {
  private contexts = new Map<string, HumanContext>();
  private events = new Map<string, HumanContextEvent[]>();

  read(contextId: string): HumanContext | null {
    return this.contexts.get(contextId) ?? null;
  }

  write(context: HumanContext, event: HumanContextEvent): void {
    const previous = this.contexts.get(context.contextId);
    if (previous && context.version <= previous.version) throw new Error("version_conflict");
    this.contexts.set(context.contextId, context);
    this.events.set(context.contextId, [...(this.events.get(context.contextId) ?? []), event]);
  }

  readEvents(contextId: string): readonly HumanContextEvent[] {
    return this.events.get(contextId) ?? [];
  }

  remove(contextId: string): void {
    this.contexts.delete(contextId);
    this.events.delete(contextId);
  }
}

test("unknown university stays unknown and visible", () => {
  const repository = new MemoryContextRepository();
  const context = writeScientistHumanContext(
    {
      universityId: null,
      universityName: null,
      unitId: "meter",
      unitSymbol: "m",
      projectStatement: "Continue the experiment",
      smartIdeaId: null,
    },
    repository,
  );

  const university = context.attributes.find((item) => item.key === "universityId");
  assert.equal(university?.value.state, "unknown");
  assert.equal(university?.value.value, null);
  assert.ok(context.openQuestions.some((item) => item.id === "university"));
});

test("context is workspace-scoped and inferred identity is not promoted to fact", () => {
  const repository = new MemoryContextRepository();
  const context = writeScientistHumanContext(
    {
      universityId: "mit",
      universityName: "Massachusetts Institute of Technology",
      unitId: "meter",
      unitSymbol: "m",
      projectStatement: "Measure the sample",
      smartIdeaId: "idea-1",
    },
    repository,
  );

  assert.deepEqual(context.scope, { kind: "workspace", workspaceId: "scientist-research-active" });
  assert.equal(context.selfDescription.state, "inferred");
  assert.equal(context.authorityPolicy.finalDecisionRemainsHuman, true);
});

test("writes advance versions and append auditable events", () => {
  const repository = new MemoryContextRepository();
  const base = {
    universityId: null,
    universityName: null,
    unitId: null,
    unitSymbol: null,
    projectStatement: "Continue university research",
    smartIdeaId: null,
  };
  const first = writeScientistHumanContext(base, repository);
  const second = writeScientistHumanContext({ ...base, universityId: "oxford", universityName: "University of Oxford" }, repository);

  assert.equal(first.version, 1);
  assert.equal(second.version, 2);
  assert.equal(repository.readEvents(second.contextId).length, 2);
  assert.equal(readScientistHumanContext(repository)?.version, 2);
});

test("identical context writes are idempotent and do not create audit noise", () => {
  const repository = new MemoryContextRepository();
  const input = {
    universityId: "mit",
    universityName: "MIT",
    unitId: "K",
    unitSymbol: "K",
    projectStatement: "Measure temperature stability",
    smartIdeaId: "idea-1",
  };
  const first = writeScientistHumanContext(input, repository);
  const repeated = writeScientistHumanContext(input, repository);

  assert.equal(repeated.version, first.version);
  assert.equal(repository.readEvents(first.contextId).length, 1);
});

test("legacy role metadata does not create a false context change", () => {
  const repository = new MemoryContextRepository();
  const input = {
    universityId: "mit",
    universityName: "MIT",
    unitId: "K",
    unitSymbol: "K",
    projectStatement: "Measure temperature stability",
    smartIdeaId: "idea-1",
  };
  const first = writeScientistHumanContext(input, repository);
  const compatibilityInput = { role: "scientist", ...input };
  const repeated = writeScientistHumanContext(compatibilityInput, repository);

  assert.equal(repeated.version, first.version);
  assert.equal(repository.readEvents(first.contextId).length, 1);
});

test("scientist compatibility projection round-trips without guessing", () => {
  const repository = new MemoryContextRepository();
  const source = {
    universityId: null,
    universityName: null,
    unitId: "kelvin",
    unitSymbol: "K",
    projectStatement: "Review temperature measurements",
    smartIdeaId: "idea-temperature",
  };
  const context = writeScientistHumanContext(source, repository);
  assert.deepEqual(scientistInputFromHumanContext(context), source);
});

test("workspace composition is capability-driven and exposes blocked modules", () => {
  const repository = new MemoryContextRepository();
  const context = writeScientistHumanContext(
    {
      universityId: null,
      universityName: null,
      unitId: "kelvin",
      unitSymbol: "K",
      projectStatement: "Evaluate temperature measurements",
      smartIdeaId: null,
    },
    repository,
  );
  const manifest = composeWorkspace(context, SCIENTIST_REFERENCE_CAPABILITIES, {
    workspaceId: "research-reference",
    title: "Research operating environment",
  });

  assert.equal(manifest.contextVersion, context.version);
  assert.equal(manifest.modules.length, 4);
  assert.equal(manifest.modules.find((item) => item.capabilityId === "evidence.review")?.state, "active");
  assert.equal(manifest.modules.find((item) => item.capabilityId === "research.measurement")?.state, "blocked");
  assert.ok(manifest.compositionReasons.every((reason) => reason.statement.length > 0));
  assert.ok(manifest.missingItems.some((item) => item.id === "research-project"));
});

test("complete context activates measurement and comparison without declaring proof", () => {
  const repository = new MemoryContextRepository();
  const context = writeScientistHumanContext(
    {
      universityId: "cambridge",
      universityName: "University of Cambridge",
      unitId: "kelvin",
      unitSymbol: "K",
      projectStatement: "Compare experiment measurements",
      smartIdeaId: "idea-1",
    },
    repository,
  );
  const manifest = composeWorkspace(context, SCIENTIST_REFERENCE_CAPABILITIES, {
    workspaceId: "research-reference",
    title: "Research operating environment",
  });

  assert.ok(manifest.modules.every((module) => module.state === "active"));
  assert.ok(SCIENTIST_REFERENCE_CAPABILITIES.every((capability) => capability.evidencePolicy.evidenceRequiredForConclusion));
  assert.equal(JSON.stringify(manifest).includes("proved"), false);
});

test("the same composer supports unrelated operational goals without a persona router", () => {
  const vehicleService = buildOperationalHumanContext({
    contextId: "ctx-service",
    workspaceId: "service-workspace",
    outcome: "Create an accountable vehicle service operating process",
    knownFacts: ["The business repairs commercial vehicles"],
    missingInformation: ["Current systems", "Team responsibilities"],
  });
  const educationMission = buildOperationalHumanContext({
    contextId: "ctx-education",
    workspaceId: "education-workspace",
    outcome: "Coordinate a university teaching improvement mission",
    knownFacts: ["The curriculum is under human review"],
    missingInformation: ["Success criteria", "Decision owner"],
  });

  const serviceManifest = composeWorkspace(vehicleService, OPERATIONAL_REFERENCE_CAPABILITIES, {
    workspaceId: "service",
    title: "Service operations",
  });
  const educationManifest = composeWorkspace(educationMission, OPERATIONAL_REFERENCE_CAPABILITIES, {
    workspaceId: "education",
    title: "Education operations",
  });

  assert.deepEqual(
    serviceManifest.modules.map((item) => item.capabilityId),
    educationManifest.modules.map((item) => item.capabilityId),
  );
  assert.equal(serviceManifest.modules.find((item) => item.capabilityId === "operations.context")?.state, "active");
  assert.equal(educationManifest.modules.find((item) => item.capabilityId === "execution.plan")?.state, "blocked");
  assert.equal(vehicleService.selfDescription.state, "unknown");
  assert.equal(educationMission.selfDescription.state, "unknown");
});
