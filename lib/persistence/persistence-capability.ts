/**
 * BUILD-034 — Honest shared persistence capability detection.
 * UI must never silently present device-local data as shared collaboration.
 */

import { isSupabaseConfigured } from "@/lib/supabase/client";

export type PersistenceCapability =
  | "shared_backend_ready"
  | "shared_backend_misconfigured"
  | "shared_backend_not_configured"
  | "device_local_development_only";

export type PersistenceAdapterKind = "supabase_shared" | "device_local";

export type PersistenceStatus = {
  readonly capability: PersistenceCapability;
  readonly adapter: PersistenceAdapterKind;
  readonly organizationCollaborationShared: boolean;
  readonly label: string;
  readonly limitation: string;
};

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function detectPersistenceCapability(): PersistenceCapability {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url && !key) return "shared_backend_not_configured";
  if (!url || !key) return "shared_backend_misconfigured";
  if (!isSupabaseConfigured()) return "shared_backend_misconfigured";
  return "shared_backend_ready";
}

export function resolvePersistenceStatus(): PersistenceStatus {
  const capability = detectPersistenceCapability();
  if (capability === "shared_backend_ready") {
    return {
      capability,
      adapter: "supabase_shared",
      organizationCollaborationShared: true,
      label: "Shared backend configured",
      limitation:
        "Organization and collaboration records sync through Supabase with RLS. Multi-user verification requires signed-in sessions.",
    };
  }
  if (capability === "shared_backend_misconfigured") {
    return {
      capability,
      adapter: "device_local",
      organizationCollaborationShared: false,
      label: "Shared backend misconfigured",
      limitation:
        "Supabase environment variables are incomplete. Organization and collaboration remain device-local only.",
    };
  }
  return {
    capability: "device_local_development_only",
    adapter: "device_local",
    organizationCollaborationShared: false,
    label: "Device-local development only",
    limitation:
      "development_only · single_device · not_collaboration_safe — shared backend not configured.",
  };
}

export function isOrganizationCollaborationShared(): boolean {
  return resolvePersistenceStatus().organizationCollaborationShared;
}
