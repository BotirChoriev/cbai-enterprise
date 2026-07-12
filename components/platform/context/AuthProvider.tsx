"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { PublicUser, AuthResult } from "@/lib/auth/auth-types";
import {
  getCurrentUser,
  signIn as storeSignIn,
  signUp as storeSignUp,
  signOut as storeSignOut,
  updateCurrentUser,
} from "@/lib/auth/auth-store";

type AuthValue = {
  user: PublicUser | null;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName: string, organization?: string) => Promise<AuthResult>;
  signOut: () => void;
  updateProfile: (patch: { displayName?: string; organization?: string }) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

// Same real-external-store pattern as AssistantProfileProvider — the server snapshot is always
// signed-out (no session exists during static generation), reconciled with the real local session
// on the client via useSyncExternalStore, never a setState-in-effect cascade.
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

  const value = useMemo<AuthValue>(
    () => ({
      user,
      isSignedIn: user !== null,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }),
    [user, signIn, signUp, signOut, updateProfile],
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
