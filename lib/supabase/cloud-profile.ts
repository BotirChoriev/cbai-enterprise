/**
 * Cloud profile CRUD (Phase 4) — one real row per Supabase Auth user, upserted on first cloud
 * sign-in and updated when the operator edits preferences. Never stores a password hash: Supabase
 * Auth owns credentials entirely (see supabase/migrations/0001_init_schema.sql).
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow, Database } from "@/lib/supabase/database.types";

export type CloudProfile = {
  id: string;
  displayName: string;
  organization: string;
  preferredLanguage: string;
  workspaceRole: string;
  country: string;
  timezone: string;
  accessibilityPreferences: Record<string, unknown>;
  assistantName: string;
  avatarMode: string;
  createdAt: string;
  updatedAt: string;
};

function fromRow(row: ProfileRow): CloudProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    organization: row.organization,
    preferredLanguage: row.preferred_language,
    workspaceRole: row.workspace_role,
    country: row.country,
    timezone: row.timezone,
    accessibilityPreferences: row.accessibility_preferences,
    assistantName: row.assistant_name,
    avatarMode: row.avatar_mode,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchCloudProfile(userId: string): Promise<CloudProfile | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const { data, error } = await client.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return fromRow(data as ProfileRow);
}

export type CloudProfilePatch = Partial<{
  displayName: string;
  organization: string;
  preferredLanguage: string;
  workspaceRole: string;
  country: string;
  timezone: string;
  accessibilityPreferences: Record<string, unknown>;
  assistantName: string;
  avatarMode: string;
}>;

/** Real upsert — creates the profile row on first cloud sign-in, updates it thereafter. Never
 * throws; returns null on failure so callers can show a real "could not save" state (Phase 13). */
export async function upsertCloudProfile(userId: string, patch: CloudProfilePatch): Promise<CloudProfile | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const row: Database["public"]["Tables"]["profiles"]["Insert"] = {
    id: userId,
    ...(patch.displayName !== undefined ? { display_name: patch.displayName } : {}),
    ...(patch.organization !== undefined ? { organization: patch.organization } : {}),
    ...(patch.preferredLanguage !== undefined ? { preferred_language: patch.preferredLanguage } : {}),
    ...(patch.workspaceRole !== undefined ? { workspace_role: patch.workspaceRole } : {}),
    ...(patch.country !== undefined ? { country: patch.country } : {}),
    ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
    ...(patch.accessibilityPreferences !== undefined
      ? { accessibility_preferences: patch.accessibilityPreferences }
      : {}),
    ...(patch.assistantName !== undefined ? { assistant_name: patch.assistantName } : {}),
    ...(patch.avatarMode !== undefined ? { avatar_mode: patch.avatarMode } : {}),
  };

  const { data, error } = await client.from("profiles").upsert(row).select("*").maybeSingle();
  if (error || !data) return null;
  return fromRow(data as ProfileRow);
}
