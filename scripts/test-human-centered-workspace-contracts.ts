import assert from "node:assert/strict";
import { test } from "node:test";
import type {
  CapabilityManifest,
  ContextValue,
  EventEnvelope,
  WorkspaceManifest,
} from "@/lib/human-centered-workspace";
import { HUMAN_CENTERED_KERNEL_RULES } from "@/lib/human-centered-workspace";

test("unknown human context remains explicit and sourced", () => {
  const university: ContextValue<string> = {
    value: null,
    state: "unknown",
    source: { kind: "human" },
    observedAt: "2026-08-01T00:00:00.000Z",
  };

  assert.equal(university.value, null);
  assert.equal(university.state, "unknown");
  assert.equal(HUMAN_CENTERED_KERNEL_RULES.unknownContextMustRemainExplicit, true);
});

test("capabilities compose behavior without naming a persona", () => {
  const measurement: CapabilityManifest = {
    capabilityId: "research.measurement",
    version: "1.0.0",
    purpose: "Capture measurements with units and provenance",
    requiredContext: [{ key: "project", reason: "Measurements belong to a project" }],
    optionalContext: [{ key: "university", reason: "Connect institutional context when known" }],
    inputs: [{ schemaId: "measurement.input", version: 1 }],
    outputs: [{ schemaId: "measurement.passport", version: 1 }],
    uiBlocks: [{ blockId: "measurement.panel", version: 1 }],
    actions: ["navigate.research"],
    evidencePolicy: {
      evidenceRequiredForConclusion: true,
      limitationsMustRemainVisible: true,
      provenanceRequiredForImports: true,
    },
    permissions: [],
    integrations: [],
    lifecycle: {
      initialState: "draft",
      states: ["draft", "reviewed"],
      terminalStates: ["reviewed"],
    },
  };

  assert.equal("role" in measurement, false);
  assert.equal(measurement.evidencePolicy.evidenceRequiredForConclusion, true);
});

test("workspace manifest explains composition and preserves missing items", () => {
  const manifest: WorkspaceManifest = {
    workspaceId: "workspace-1",
    version: 1,
    contextId: "context-1",
    contextVersion: 1,
    title: "Research workspace",
    objective: "Continue the experiment",
    modules: [],
    layout: { orderedModuleIds: [] },
    commands: [],
    missingItems: [
      {
        id: "university",
        label: "University",
        reason: "Institution was not provided",
        requiredFor: ["institutional linkage"],
      },
    ],
    requiredConfirmations: [],
    compositionReasons: [],
  };

  assert.equal(manifest.missingItems[0]?.id, "university");
  assert.equal(manifest.contextVersion, 1);
});

test("event envelope carries audit and idempotency identity", () => {
  const event: EventEnvelope<{ workspaceId: string }> = {
    eventId: "event-1",
    eventType: "workspace.composed",
    schemaVersion: 1,
    aggregateId: "workspace-1",
    aggregateVersion: 1,
    actor: { actorId: "person-1", actorKind: "human" },
    occurredAt: "2026-08-01T00:00:00.000Z",
    correlationId: "correlation-1",
    idempotencyKey: "compose-workspace-1-v1",
    payload: { workspaceId: "workspace-1" },
  };

  assert.equal(event.actor.actorKind, "human");
  assert.equal(event.idempotencyKey, "compose-workspace-1-v1");
});
