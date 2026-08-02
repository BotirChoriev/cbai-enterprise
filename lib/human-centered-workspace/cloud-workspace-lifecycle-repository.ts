import type {
  PersonalWorkspaceAggregate,
  WorkspaceCreationRun,
} from "@/lib/human-centered-workspace/personal-workspace-lifecycle";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type CloudWorkspaceError =
  | "cloud_unavailable"
  | "not_authenticated"
  | "not_found"
  | "cloud_error";

export type CloudWorkspaceResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: CloudWorkspaceError; readonly detail?: string };

export type CloudWorkspaceBundle = {
  readonly workspace: PersonalWorkspaceAggregate;
  readonly run: WorkspaceCreationRun | null;
};

function mapError(message?: string): CloudWorkspaceResult<never> {
  if (message?.includes("authentication_required") || message?.includes("JWT")) {
    return { ok: false, error: "not_authenticated", detail: message };
  }
  return { ok: false, error: "cloud_error", detail: message };
}

export async function saveCloudPersonalWorkspace(
  workspace: PersonalWorkspaceAggregate,
  run: WorkspaceCreationRun,
): Promise<CloudWorkspaceResult<CloudWorkspaceBundle>> {
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, error: "cloud_unavailable" };
  const { error } = await client.rpc("save_personal_workspace", {
    p_workspace: workspace as unknown as Record<string, unknown>,
    p_run: run as unknown as Record<string, unknown>,
  });
  if (error) return mapError(error.message);
  return { ok: true, value: { workspace, run } };
}

export async function readCloudPersonalWorkspace(
  workspaceId: string,
): Promise<CloudWorkspaceResult<CloudWorkspaceBundle>> {
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, error: "cloud_unavailable" };
  const workspaceResult = await client
    .from("personal_workspace_aggregates")
    .select("payload")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (workspaceResult.error) return mapError(workspaceResult.error.message);
  if (!workspaceResult.data) return { ok: false, error: "not_found" };
  const runResult = await client
    .from("workspace_creation_runs")
    .select("payload")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (runResult.error) return mapError(runResult.error.message);
  return {
    ok: true,
    value: {
      workspace: workspaceResult.data.payload as unknown as PersonalWorkspaceAggregate,
      run: runResult.data
        ? (runResult.data.payload as unknown as WorkspaceCreationRun)
        : null,
    },
  };
}
