import type { HumanContext } from "@/lib/human-centered-workspace/contracts";
import type { HumanContextEvent } from "@/lib/human-centered-workspace/context-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type CloudHumanContextError =
  | "cloud_unavailable"
  | "not_authenticated"
  | "version_conflict"
  | "cloud_error";

export type CloudHumanContextResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: CloudHumanContextError };

function cloudError(message?: string): CloudHumanContextResult<never> {
  if (message?.includes("human_context_version_conflict")) return { ok: false, error: "version_conflict" };
  if (message?.includes("authentication_required")) return { ok: false, error: "not_authenticated" };
  return { ok: false, error: "cloud_error" };
}

export async function readCloudHumanContext(
  contextId: string,
): Promise<CloudHumanContextResult<HumanContext | null>> {
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, error: "cloud_unavailable" };
  const { data, error } = await client
    .from("human_context_snapshots")
    .select("payload")
    .eq("context_id", contextId)
    .maybeSingle();
  if (error) return cloudError(error.message);
  return { ok: true, value: data ? (data.payload as HumanContext) : null };
}

export async function writeCloudHumanContext(
  context: HumanContext,
  expectedVersion: number,
  event: HumanContextEvent,
): Promise<CloudHumanContextResult<HumanContext>> {
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, error: "cloud_unavailable" };
  const { data, error } = await client.rpc("save_human_context", {
    p_context: context,
    p_expected_version: expectedVersion,
    p_event: event,
  });
  if (error || !data) return cloudError(error?.message);
  return { ok: true, value: data.payload as HumanContext };
}

export async function removeCloudHumanContext(
  contextId: string,
): Promise<CloudHumanContextResult<boolean>> {
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, error: "cloud_unavailable" };
  const { data, error } = await client.rpc("delete_human_context", { p_context_id: contextId });
  if (error) return cloudError(error.message);
  return { ok: true, value: data };
}
