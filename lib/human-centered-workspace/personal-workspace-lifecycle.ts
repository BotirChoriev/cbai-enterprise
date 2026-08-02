import type {
  CapabilityManifest,
  HumanContext,
  WorkspaceManifest,
} from "@/lib/human-centered-workspace/contracts";
import { composeWorkspace } from "@/lib/human-centered-workspace/workspace-composer";
import type { ExecutionBlueprint } from "@/lib/human-centered-workspace/execution-blueprint";

export type WorkspaceCreationCheckpoint =
  | "started"
  | "context_ready"
  | "manifest_composed"
  | "workspace_saved"
  | "completed";

export type PersonalWorkspaceAggregate = {
  readonly workspaceId: string;
  readonly ownerId: string;
  readonly contextId: string;
  readonly contextVersion: number;
  readonly version: number;
  readonly lifecycleState: "active" | "archived";
  readonly manifest: WorkspaceManifest;
  readonly executionBlueprint?: ExecutionBlueprint;
  readonly enabledModuleIds: readonly string[];
  readonly moduleOrder: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type WorkspaceCreationRun = {
  readonly runId: string;
  readonly ownerId: string;
  readonly workspaceId: string;
  readonly contextId: string;
  readonly contextVersion: number;
  readonly idempotencyKey: string;
  readonly status: "running" | "failed" | "completed";
  readonly currentStep: WorkspaceCreationCheckpoint;
  readonly lastSuccessfulCheckpoint: WorkspaceCreationCheckpoint;
  readonly retryCount: number;
  readonly errorCode: string | null;
  readonly retryable: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export interface PersonalWorkspaceLifecycleRepository {
  readWorkspace(workspaceId: string): PersonalWorkspaceAggregate | null;
  saveWorkspace(workspace: PersonalWorkspaceAggregate): void;
  readRun(runId: string): WorkspaceCreationRun | null;
  readRunByIdempotencyKey(idempotencyKey: string): WorkspaceCreationRun | null;
  saveRun(run: WorkspaceCreationRun): void;
}

export type CreatePersonalWorkspaceInput = {
  readonly ownerId: string;
  readonly context: HumanContext;
  readonly capabilities: readonly CapabilityManifest[];
  readonly title: string;
  readonly idempotencyKey: string;
  readonly executionBlueprint?: ExecutionBlueprint;
};

export type WorkspaceCreationResult =
  | { readonly ok: true; readonly workspace: PersonalWorkspaceAggregate; readonly run: WorkspaceCreationRun }
  | { readonly ok: false; readonly run: WorkspaceCreationRun };

function stableId(prefix: string, source: string): string {
  let hash = 2166136261;
  for (const char of source) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `${prefix}-${(hash >>> 0).toString(36)}`;
}

function errorCode(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message.trim().slice(0, 120);
  return "workspace_creation_failed";
}

/**
 * Additive, synchronous coordinator for the existing local-first architecture.
 * Every persisted checkpoint is safe to resume. Reusing the same idempotency key
 * returns the same workspace and never repeats completed discovery.
 */
export function createOrResumePersonalWorkspace(
  input: CreatePersonalWorkspaceInput,
  repository: PersonalWorkspaceLifecycleRepository,
  now = new Date().toISOString(),
): WorkspaceCreationResult {
  const existingRun = repository.readRunByIdempotencyKey(input.idempotencyKey);
  if (existingRun?.status === "completed") {
    const existingWorkspace = repository.readWorkspace(existingRun.workspaceId);
    if (existingWorkspace) return { ok: true, workspace: existingWorkspace, run: existingRun };
  }

  const runId = existingRun?.runId ?? stableId("workspace-run", `${input.ownerId}:${input.idempotencyKey}`);
  const workspaceId = existingRun?.workspaceId ?? stableId("workspace", `${input.ownerId}:${input.idempotencyKey}`);
  let run: WorkspaceCreationRun = existingRun
    ? { ...existingRun, status: "running", errorCode: null, retryable: true, updatedAt: now }
    : {
        runId,
        ownerId: input.ownerId,
        workspaceId,
        contextId: input.context.contextId,
        contextVersion: input.context.version,
        idempotencyKey: input.idempotencyKey,
        status: "running",
        currentStep: "started",
        lastSuccessfulCheckpoint: "started",
        retryCount: 0,
        errorCode: null,
        retryable: true,
        createdAt: now,
        updatedAt: now,
      };

  const checkpoint = (step: WorkspaceCreationCheckpoint) => {
    run = { ...run, currentStep: step, lastSuccessfulCheckpoint: step, updatedAt: now };
    repository.saveRun(run);
  };

  try {
    repository.saveRun(run);
    checkpoint("context_ready");
    const manifest = composeWorkspace(input.context, input.capabilities, {
      workspaceId,
      title: input.title,
    });
    checkpoint("manifest_composed");

    const existingWorkspace = repository.readWorkspace(workspaceId);
    const workspace: PersonalWorkspaceAggregate = existingWorkspace ?? {
      workspaceId,
      ownerId: input.ownerId,
      contextId: input.context.contextId,
      contextVersion: input.context.version,
      version: 1,
      lifecycleState: "active",
      manifest,
      ...(input.executionBlueprint ? { executionBlueprint: input.executionBlueprint } : {}),
      enabledModuleIds: manifest.modules.filter((module) => module.state !== "blocked").map((module) => module.moduleId),
      moduleOrder: manifest.layout.orderedModuleIds,
      createdAt: now,
      updatedAt: now,
    };
    repository.saveWorkspace(workspace);
    checkpoint("workspace_saved");
    checkpoint("completed");
    run = { ...run, status: "completed", retryable: false, updatedAt: now };
    repository.saveRun(run);
    return { ok: true, workspace, run };
  } catch (error) {
    run = {
      ...run,
      status: "failed",
      retryCount: run.retryCount + 1,
      errorCode: errorCode(error),
      retryable: true,
      updatedAt: now,
    };
    try {
      repository.saveRun(run);
    } catch {
      // The original exact failure remains in the returned run even if checkpoint persistence fails.
    }
    return { ok: false, run };
  }
}
