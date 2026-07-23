"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { PublicUser, AuthResult } from "@/lib/auth/auth-types";
import {
  getCurrentUser,
  signIn as storeSignIn,
  signUp as storeSignUp,
  signOut as storeSignOut,
  updateCurrentUser,
} from "@/lib/auth/auth-store";
import {
  cloudSignIn as apiCloudSignIn,
  cloudSignUp as apiCloudSignUp,
  cloudSignOut as apiCloudSignOut,
  getCloudSession,
  onCloudAuthStateChange,
  requestPasswordReset as apiRequestPasswordReset,
  completePasswordReset as apiCompletePasswordReset,
  resendEmailConfirmation as apiResendEmailConfirmation,
  changeSignedInPassword as apiChangeSignedInPassword,
  isSupabaseConfigured,
  type CloudUser,
  type CloudAuthResult,
  type CloudActionResult,
} from "@/lib/supabase/cloud-auth";
import { pullCloudDataToLocal } from "@/lib/supabase/pull-sync";
import { processQueue } from "@/lib/supabase/outbox";

/**
 * Account model (Real Supabase Authentication + Cloud Persistence mission, Phase 3).
 *
 * Two independent account systems coexist deliberately, never merged into one fake identity:
 *  - the pre-existing device-local account (lib/auth/) — hashed-and-salted, browser-only, no
 *    server verification, unchanged by this mission.
 *  - a real Supabase Auth cloud account — server-verified sessions, real email/password.
 *
 * `accountMode` is the one field every surface should read to decide what to say and what data to
 * trust: "cloud" (a verified Supabase session exists — this is real cross-device data),
 * "device-local" (only the local account is signed in — real, but device-bound), or "signed-out".
 * A signed-in cloud session always takes precedence for `accountMode`, but both `user` (local) and
 * `cloudUser` are exposed independently so the UI can be explicit rather than conflating them.
 */
export type AccountMode = "cloud" | "device-local" | "signed-out";

type AuthValue = {
  // Device-local account (unchanged surface — lib/auth/)
  user: PublicUser | null;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName: string, organization?: string) => Promise<AuthResult>;
  signOut: () => void;
  updateProfile: (patch: { displayName?: string; organization?: string }) => void;

  // Cloud account (Supabase)
  cloudUser: CloudUser | null;
  isCloudSignedIn: boolean;
  isCloudConfigured: boolean;
  cloudSessionRestoring: boolean;
  cloudSignIn: (email: string, password: string) => Promise<CloudAuthResult>;
  cloudSignUp: (email: string, password: string) => Promise<CloudAuthResult>;
  cloudSignOut: () => Promise<void>;
  requestPasswordReset: (email: string, redirectTo: string) => Promise<CloudActionResult>;
  completePasswordReset: (newPassword: string) => Promise<CloudActionResult>;
  resendEmailConfirmation: (email: string) => Promise<CloudActionResult>;
  changeSignedInPassword: (newPassword: string) => Promise<CloudActionResult>;

  // Combined
  accountMode: AccountMode;
};

const AuthContext = createContext<AuthValue | null>(null);

// Same real-external-store pattern as AssistantProfileProvider — the server snapshot is always
// signed-out (no session exists during static generation), reconciled with the real local session
// on the client via useSyncExternalStore, never a setState-in-effect cascade. The cloud session
// below is handled separately (useState + a real subscription) because restoring it is genuinely
// asynchronous — a local-storage read through supabase-js's own session cache, not a synchronous
// snapshot function.
const listeners = new Set<() => void>();
let cachedSnapshot: PublicUser | null | undefined;

function getSnapshot(): PublicUser | null {
  if (cachedSnapshot === undefined) {
    cachedSnapshot = getCurrentUser();
  }
  return cachedSnapshot;
}

function getServerSnapshot(): PublicUser | null {
  return null;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  cachedSnapshot = getCurrentUser();
  listeners.forEach((listener) => listener());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [cloudSessionRestoring, setCloudSessionRestoring] = useState(isSupabaseConfigured());
  const pulledForUserId = useRef<string | null>(null);

  // Pulls this cloud user's data into their local cache bucket exactly once per session (not on
  // every re-render) — see lib/supabase/pull-sync.ts. Also resumes any outbox writes left queued
  // from a previous session (e.g. the tab closed mid-sync) rather than waiting for the next edit.
  const hydrateCloudUser = useCallback((next: CloudUser | null) => {
    setCloudUser(next);
    if (next && pulledForUserId.current !== next.id) {
      pulledForUserId.current = next.id;
      void pullCloudDataToLocal(next.id);
      void processQueue(next.id);
    }
  }, []);

  useEffect(() => {
    // Initial state already reflects the unconfigured case (see useState above) — nothing to
    // restore or subscribe to, so exit before touching any external system.
    if (!isSupabaseConfigured()) return;

    let cancelled = false;
    getCloudSession().then((result) => {
      if (cancelled) return;
      hydrateCloudUser(result?.user ?? null);
      setCloudSessionRestoring(false);
    });

    const unsubscribe = onCloudAuthStateChange((_event, session) => {
      if (cancelled) return;
      hydrateCloudUser(
        session?.user
          ? { id: session.user.id, email: session.user.email ?? "", emailConfirmed: Boolean(session.user.email_confirmed_at), createdAt: session.user.created_at }
          : null,
      );
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [hydrateCloudUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await storeSignIn(email, password);
    if (result.ok) notify();
    return result;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string, organization = "") => {
      const result = await storeSignUp(email, password, displayName, organization);
      if (result.ok) notify();
      return result;
    },
    [],
  );

  const signOut = useCallback(() => {
    storeSignOut();
    notify();
  }, []);

  const updateProfile = useCallback((patch: { displayName?: string; organization?: string }) => {
    updateCurrentUser(patch);
    notify();
  }, []);

  const cloudSignIn = useCallback(
    async (email: string, password: string) => {
      const result = await apiCloudSignIn(email, password);
      if (result.ok) hydrateCloudUser(result.user);
      return result;
    },
    [hydrateCloudUser],
  );

  const cloudSignUp = useCallback(
    async (email: string, password: string) => {
      const result = await apiCloudSignUp(email, password);
      if (result.ok) hydrateCloudUser(result.user);
      return result;
    },
    [hydrateCloudUser],
  );

  const cloudSignOut = useCallback(async () => {
    await apiCloudSignOut();
    pulledForUserId.current = null;
    setCloudUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      isSignedIn: user !== null,
      signIn,
      signUp,
      signOut,
      updateProfile,

      cloudUser,
      isCloudSignedIn: cloudUser !== null,
      isCloudConfigured: isSupabaseConfigured(),
      cloudSessionRestoring,
      cloudSignIn,
      cloudSignUp,
      cloudSignOut,
      requestPasswordReset: apiRequestPasswordReset,
      completePasswordReset: apiCompletePasswordReset,
      resendEmailConfirmation: apiResendEmailConfirmation,
      changeSignedInPassword: apiChangeSignedInPassword,

      accountMode: cloudUser ? "cloud" : user ? "device-local" : "signed-out",
    }),
    [user, signIn, signUp, signOut, updateProfile, cloudUser, cloudSessionRestoring, cloudSignIn, cloudSignUp, cloudSignOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
