import type {
  PersonalWorkspaceAggregate,
  PersonalWorkspaceLifecycleRepository,
  WorkspaceCreationRun,
} from "@/lib/human-centered-workspace/personal-workspace-lifecycle";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

const WORKSPACES_KEY = "cbai-personal-workspace-aggregates-v1";
const RUNS_KEY = "cbai-workspace-creation-runs-v1";

function readCollection<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(key));
    return raw ? (JSON.parse(raw) as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function writeCollection<T>(key: string, value: Record<string, T>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(resolveStorageKey(key), JSON.stringify(value));
}

export class DeviceLocalWorkspaceLifecycleRepository implements PersonalWorkspaceLifecycleRepository {
  readWorkspace(workspaceId: string): PersonalWorkspaceAggregate | null {
    return readCollection<PersonalWorkspaceAggregate>(WORKSPACES_KEY)[workspaceId] ?? null;
  }

  saveWorkspace(workspace: PersonalWorkspaceAggregate): void {
    const workspaces = readCollection<PersonalWorkspaceAggregate>(WORKSPACES_KEY);
    const existing = workspaces[workspace.workspaceId];
    if (existing && existing.ownerId !== workspace.ownerId) throw new Error("workspace_owner_mismatch");
    writeCollection(WORKSPACES_KEY, { ...workspaces, [workspace.workspaceId]: workspace });
  }

  readRun(runId: string): WorkspaceCreationRun | null {
    return readCollection<WorkspaceCreationRun>(RUNS_KEY)[runId] ?? null;
  }

  readRunByIdempotencyKey(idempotencyKey: string): WorkspaceCreationRun | null {
    return Object.values(readCollection<WorkspaceCreationRun>(RUNS_KEY)).find(
      (run) => run.idempotencyKey === idempotencyKey,
    ) ?? null;
  }

  saveRun(run: WorkspaceCreationRun): void {
    const runs = readCollection<WorkspaceCreationRun>(RUNS_KEY);
    const existing = runs[run.runId];
    if (existing && existing.ownerId !== run.ownerId) throw new Error("workspace_run_owner_mismatch");
    writeCollection(RUNS_KEY, { ...runs, [run.runId]: run });
  }
}

export const deviceLocalWorkspaceLifecycleRepository = new DeviceLocalWorkspaceLifecycleRepository();
