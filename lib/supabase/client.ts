/**
 * Supabase browser client (Real Supabase Authentication + Cloud Persistence mission).
 *
 * CBAI is a Next.js static export (output: "export" in next.config.ts) — there is no server
 * runtime, no API routes, no middleware, and no server component that ever executes on a request.
 * Every page ships as static HTML plus client-side JS. That means there is exactly one honest
 * place a Supabase client can live: the browser. There is no "server client" for this
 * architecture to construct (see lib/supabase/README.md and docs/supabase-setup.md for the full
 * reasoning) — building one would either be dead code or, worse, an invitation to put a
 * service-role key somewhere that ends up in the client bundle.
 *
 * This client is lazily constructed and genuinely optional: `getSupabaseBrowserClient()` returns
 * `null` whenever NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured, so
 * every caller must handle the unconfigured case explicitly rather than assuming cloud is active.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function getSupabaseUrl(): string | undefined {
  return readEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string | undefined {
  return readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/** Real env-var check — never assumes configuration that isn't there. */
export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl()) && Boolean(getSupabaseAnonKey());
}

let cachedClient: SupabaseClient<Database> | null | undefined;

/**
 * Returns a real, shared Supabase client, or `null` when unconfigured or outside a browser
 * (during static generation there is never a window, and a Supabase client should never be
 * constructed server-side in this architecture — see the module doc comment above).
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (!isBrowser()) return null;
  if (!isSupabaseConfigured()) return null;

  if (cachedClient === undefined) {
    const url = getSupabaseUrl();
    const anonKey = getSupabaseAnonKey();
    cachedClient =
      url && anonKey
        ? createClient<Database>(url, anonKey, {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
              storageKey: "cbai-supabase-auth",
            },
          })
        : null;
  }
  return cachedClient;
}

/** Test-only: reset the cached client so tests can simulate configured/unconfigured transitions. */
export function __resetSupabaseClientForTests(): void {
  cachedClient = undefined;
}
