import assert from "node:assert/strict";
import { test } from "node:test";
import { buildOperationalHumanContext } from "@/lib/human-centered-workspace/operational-context-adapter";
import { OPERATIONAL_REFERENCE_CAPABILITIES } from "@/lib/human-centered-workspace/operational-capabilities";
import {
  createOrResumePersonalWorkspace,
  type PersonalWorkspaceAggregate,
  type PersonalWorkspaceLifecycleRepository,
  type WorkspaceCreationRun,
} from "@/lib/human-centered-workspace/personal-workspace-lifecycle";

class MemoryLifecycleRepository implements PersonalWorkspaceLifecycleRepository {
  workspaces = new Map<string, PersonalWorkspaceAggregate>();
  runs = new Map<string, WorkspaceCreationRun>();
  failNextWorkspaceSave = false;
  workspaceSaveCount = 0;

  readWorkspace(workspaceId: string) {
    return this.workspaces.get(workspaceId) ?? null;
  }

  saveWorkspace(workspace: PersonalWorkspaceAggregate) {
    if (this.failNextWorkspaceSave) {
      this.failNextWorkspaceSave = false;
      throw new Error("workspace_storage_unavailable");
    }
    this.workspaceSaveCount += 1;
    this.workspaces.set(workspace.workspaceId, workspace);
  }

  readRunByIdempotencyKey(idempotencyKey: string) {
    return [...this.runs.values()].find((run) => run.idempotencyKey === idempotencyKey) ?? null;
  }

  readRun(runId: string) {
    return this.runs.get(runId) ?? null;
  }

  saveRun(run: WorkspaceCreationRun) {
    this.runs.set(run.runId, run);
  }
}

const context = buildOperationalHumanContext({
  contextId: "human-context-1",
  workspaceId: "discovery-workspace",
  outcome: "Build a measurable vehicle service operating system",
  knownFacts: ["The human owns the final decision", "A service team already exists"],
  missingInformation: ["Success criteria"],
});

const input = {
  ownerId: "user-1",
  context,
  capabilities: OPERATIONAL_REFERENCE_CAPABILITIES,
  title: "Personal operating workspace",
  idempotencyKey: "discovery-session-1:confirmed-v1",
} as const;

test("confirmed context creates one durable workspace and completes every checkpoint", () => {
  const repository = new MemoryLifecycleRepository();
  const result = createOrResumePersonalWorkspace(input, repository, "2026-08-01T10:00:00.000Z");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.run.status, "completed");
  assert.equal(result.run.lastSuccessfulCheckpoint, "completed");
  assert.equal(result.workspace.contextVersion, context.version);
  assert.equal(result.workspace.manifest.missingItems.some((item) => item.label === "Success criteria"), true);
  assert.equal(repository.workspaces.size, 1);
});

test("replaying the same confirmed discovery returns the same workspace without duplication", () => {
  const repository = new MemoryLifecycleRepository();
  const first = createOrResumePersonalWorkspace(input, repository);
  const second = createOrResumePersonalWorkspace(input, repository);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  if (!first.ok || !second.ok) return;
  assert.equal(second.workspace.workspaceId, first.workspace.workspaceId);
  assert.equal(repository.workspaces.size, 1);
  assert.equal(repository.workspaceSaveCount, 1);
});

test("failure preserves collected context and resumes from the last successful checkpoint", () => {
  const repository = new MemoryLifecycleRepository();
  repository.failNextWorkspaceSave = true;
  const failed = createOrResumePersonalWorkspace(input, repository, "2026-08-01T10:00:00.000Z");
  assert.equal(failed.ok, false);
  if (failed.ok) return;
  assert.equal(failed.run.status, "failed");
  assert.equal(failed.run.lastSuccessfulCheckpoint, "manifest_composed");
  assert.equal(failed.run.errorCode, "workspace_storage_unavailable");
  assert.equal(failed.run.contextId, context.contextId);

  const resumed = createOrResumePersonalWorkspace(input, repository, "2026-08-01T10:01:00.000Z");
  assert.equal(resumed.ok, true);
  if (!resumed.ok) return;
  assert.equal(resumed.run.runId, failed.run.runId);
  assert.equal(resumed.run.retryCount, 1);
  assert.equal(resumed.run.status, "completed");
  assert.equal(repository.workspaces.size, 1);
});
