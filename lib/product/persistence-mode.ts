/**
 * Persistence mode honesty — device-local vs shared backend.
 */

export type PersistenceMode =
  | "device-local"
  | "authenticated-shared"
  | "offline-outbox"
  | "backend-unavailable";

export function resolvePersistenceMode(input?: {
  supabaseConfigured?: boolean;
  authenticated?: boolean;
  offline?: boolean;
}): PersistenceMode {
  if (input?.offline) return "offline-outbox";
  if (input?.supabaseConfigured && input?.authenticated) return "authenticated-shared";
  if (input?.supabaseConfigured && !input?.authenticated) return "backend-unavailable";
  return "device-local";
}

export function persistenceModeDisclaimer(mode: PersistenceMode): string {
  switch (mode) {
    case "device-local":
      return "Records are stored on this device only unless you sign in to a configured shared workspace.";
    case "authenticated-shared":
      return "Signed-in shared mode — organization scope and permissions apply.";
    case "offline-outbox":
      return "Offline — changes queue locally until connectivity returns.";
    case "backend-unavailable":
      return "Shared backend is configured but you are not signed in — data remains device-local.";
  }
}
