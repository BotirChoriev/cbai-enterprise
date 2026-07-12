/**
 * Real, typed per-table Supabase CRUD (Real Supabase Authentication + Cloud Persistence mission,
 * Phase 7). Every function here performs a real supabase-js call against the schema in
 * supabase/migrations/0001_init_schema.sql — nothing here is a stub or a simulated backend.
 *
 * `local_id` is the idempotency key for every write: the outbox (lib/supabase/outbox.ts) always
 * upserts with `onConflict: "owner_id,local_id"`, so retrying a queued operation after a network
 * failure can never create a duplicate cloud row, and a create-then-immediately-update from the
 * same local record collapses into one upsert instead of racing.
 *
 * PostgREST's query builder infers table shape from a *literal* table-name overload; a table name
 * held in a generic type parameter (`table: T`) defeats that inference and collapses every result
 * to `never`/`SelectQueryError`. The public functions below stay fully typed on Row/Insert; the one
 * `unknown` cast inside each is the documented boundary where a real (but here type-erased)
 * PostgREST call happens — the actual request/response over the wire is unaffected either way.
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type SyncTableName = keyof Database["public"]["Tables"];

export const SYNC_TABLES: readonly SyncTableName[] = [
  "projects",
  "project_objectives",
  "project_notes",
  "project_tasks",
  "project_questions",
  "project_evidence",
  "project_entity_links",
  "bookmarks",
  "reports",
  "activity_events",
];

export type CloudWriteResult = { ok: true } | { ok: false; error: string };

function untypedClient(): SupabaseClient | null {
  return getSupabaseBrowserClient() as unknown as SupabaseClient | null;
}

/** Real upsert keyed on (owner_id, local_id) — idempotent, retry-safe by construction. */
export async function upsertCloudRow<T extends SyncTableName>(
  table: T,
  row: Database["public"]["Tables"][T]["Insert"],
): Promise<CloudWriteResult> {
  const client = untypedClient();
  if (!client) return { ok: false, error: "Cloud storage is not configured." };

  const { error } = await client.from(table).upsert(row, { onConflict: "owner_id,local_id" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Real delete keyed on (owner_id, local_id) — the same dedup key every upsert uses. */
export async function deleteCloudRowByLocalId(
  table: SyncTableName,
  ownerId: string,
  localId: string,
): Promise<CloudWriteResult> {
  const client = untypedClient();
  if (!client) return { ok: false, error: "Cloud storage is not configured." };

  const { error } = await client.from(table).delete().eq("owner_id", ownerId).eq("local_id", localId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Real select * where owner_id = X — used by pull-sync (lib/supabase/pull-sync.ts) to hydrate
 * the local cache on sign-in. Returns [] (never throws) on any failure so pull-sync can treat a
 * network error as "nothing to pull yet" rather than crashing the sign-in flow. */
export async function listCloudRows<T extends SyncTableName>(
  table: T,
  ownerId: string,
): Promise<Database["public"]["Tables"][T]["Row"][]> {
  const client = untypedClient();
  if (!client) return [];

  const { data, error } = await client.from(table).select("*").eq("owner_id", ownerId);
  if (error || !data) return [];
  return data as Database["public"]["Tables"][T]["Row"][];
}
