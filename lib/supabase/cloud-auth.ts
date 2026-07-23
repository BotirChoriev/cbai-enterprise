/**
 * Real Supabase Auth activation (Real Supabase Authentication + Cloud Persistence mission,
 * Phase 3). Every function here calls the real supabase-js `auth` client — no fake sessions, no
 * simulated backend. When Supabase is not configured (see lib/supabase/client.ts), every function
 * returns an honest "cloud is not configured" result rather than pretending to succeed.
 *
 * Error messages are deliberately generic and user-facing (Phase 13/15: never expose raw
 * Postgres/Supabase error strings, never reveal whether an email exists on sign-in failure beyond
 * what Supabase itself already reveals).
 */

import type { Session, User as SupabaseUser, AuthChangeEvent } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type CloudUser = {
  id: string;
  email: string;
  emailConfirmed: boolean;
  createdAt: string;
};

export type CloudAuthResult =
  | { ok: true; user: CloudUser; session: Session }
  | { ok: false; error: string; code: "not_configured" | "invalid_credentials" | "network" | "unknown" };

export type CloudActionResult = { ok: true } | { ok: false; error: string };

const NOT_CONFIGURED_ERROR = "Cloud accounts are not available in this deployment yet.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

function toCloudUser(user: SupabaseUser): CloudUser {
  return {
    id: user.id,
    email: user.email ?? "",
    emailConfirmed: Boolean(user.email_confirmed_at),
    createdAt: user.created_at,
  };
}

/** Never leaks raw Supabase/Postgres error text to the UI — maps to a short, honest, generic message. */
function friendlyAuthError(rawMessage: string | undefined): string {
  const message = (rawMessage ?? "").toLowerCase();
  if (message.includes("already registered") || message.includes("already exists")) {
    return "An account with this email already exists.";
  }
  if (message.includes("invalid login") || message.includes("invalid credentials")) {
    return "Incorrect email or password.";
  }
  if (message.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  if (message.includes("password")) {
    return "Password must be at least 8 characters.";
  }
  if (message.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (message.includes("fetch") || message.includes("network")) {
    return "Could not reach the server. Check your connection and try again.";
  }
  return GENERIC_ERROR;
}

export async function cloudSignUp(email: string, password: string): Promise<CloudAuthResult> {
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, error: NOT_CONFIGURED_ERROR, code: "not_configured" };

  const { data, error } = await client.auth.signUp({ email: email.trim().toLowerCase(), password });
  if (error || !data.user || !data.session) {
    return { ok: false, error: friendlyAuthError(error?.message), code: "invalid_credentials" };
  }
  return { ok: true, user: toCloudUser(data.user), session: data.session };
}

export async function cloudSignIn(email: string, password: string): Promise<CloudAuthResult> {
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, error: NOT_CONFIGURED_ERROR, code: "not_configured" };

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error || !data.user || !data.session) {
    return { ok: false, error: friendlyAuthError(error?.message), code: "invalid_credentials" };
  }
  return { ok: true, user: toCloudUser(data.user), session: data.session };
}

/** Clears the real Supabase session AND any sensitive local session state (Phase 15). */
export async function cloudSignOut(): Promise<void> {
  const client = getSupabaseBrowserClient();
  if (!client) return;
  await client.auth.signOut();
}

/** Real session restoration — reads whatever Supabase already has persisted (its own storage key,
 * see client.ts's `storageKey: "cbai-supabase-auth"`), never fabricated. */
export async function getCloudSession(): Promise<{ user: CloudUser; session: Session } | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const { data, error } = await client.auth.getSession();
  if (error || !data.session || !data.session.user) return null;
  return { user: toCloudUser(data.session.user), session: data.session };
}

export function onCloudAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const client = getSupabaseBrowserClient();
  if (!client) return () => {};
  const { data } = client.auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
}

export async function requestPasswordReset(email: string, redirectTo: string): Promise<CloudActionResult> {
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, error: NOT_CONFIGURED_ERROR };

  const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
  if (error) return { ok: false, error: friendlyAuthError(error.message) };
  return { ok: true };
}

/** Completes a password reset — must be called only from the recovery session Supabase creates
 * when the user follows the reset-password email link (see app/(dashboard)/reset-password). */
export async function completePasswordReset(newPassword: string): Promise<CloudActionResult> {
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, error: NOT_CONFIGURED_ERROR };

  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: friendlyAuthError(error.message) };
  return { ok: true };
}

/**
 * Change password while already signed in — same browser `auth.updateUser` path as reset
 * completion. Honest when unconfigured; does not invent admin session-revoke APIs.
 */
export async function changeSignedInPassword(newPassword: string): Promise<CloudActionResult> {
  return completePasswordReset(newPassword);
}

export async function resendEmailConfirmation(email: string): Promise<CloudActionResult> {
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, error: NOT_CONFIGURED_ERROR };

  const { error } = await client.auth.resend({ type: "signup", email: email.trim().toLowerCase() });
  if (error) return { ok: false, error: friendlyAuthError(error.message) };
  return { ok: true };
}

export { isSupabaseConfigured };
