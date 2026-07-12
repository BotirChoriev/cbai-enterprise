/**
 * Real local account storage — same isBrowser-guarded localStorage pattern every other store in
 * this app already uses (see lib/context/context-history.ts, lib/project/project-store.ts).
 * Accounts and sessions live in fixed, non-namespaced keys (there is nothing to own them by yet —
 * this *is* the identity store); every other store namespaces its own keys by the session this
 * file produces (see lib/storage/namespaced-key.ts).
 */

import type { User, PublicUser, Session, AuthResult } from "@/lib/auth/auth-types";
import { toPublicUser } from "@/lib/auth/auth-types";
import { generateSalt, hashPassword, verifyPassword } from "@/lib/auth/auth-crypto";

const USERS_KEY = "cbai-auth-users";
const SESSION_KEY = "cbai-auth-session";
const MIN_PASSWORD_LENGTH = 8;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isUser(value: unknown): value is User {
  const v = value as User;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.id === "string" &&
    typeof v.email === "string" &&
    typeof v.displayName === "string" &&
    typeof v.organization === "string" &&
    typeof v.passwordHash === "string" &&
    typeof v.passwordSalt === "string" &&
    typeof v.createdAt === "string"
  );
}

function isSession(value: unknown): value is Session {
  const v = value as Session;
  return typeof v === "object" && v !== null && typeof v.userId === "string" && typeof v.createdAt === "string";
}

function newId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Honestly empty outside a browser or on a corrupt read — never throws, never fabricates a user. */
export function loadUsers(): User[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isUser);
  } catch {
    return [];
  }
}

function saveUsers(users: readonly User[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession(): Session | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null): void {
  if (!isBrowser()) return;
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

/** Real, synchronous session read — safe to call from any store's key-namespacing logic. */
export function getCurrentUserId(): string | null {
  return readSession()?.userId ?? null;
}

export function getCurrentUser(): PublicUser | null {
  const session = readSession();
  if (!session) return null;
  const user = loadUsers().find((u) => u.id === session.userId);
  return user ? toPublicUser(user) : null;
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  organization = "",
): Promise<AuthResult> {
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (!displayName.trim()) {
    return { ok: false, error: "Enter your name." };
  }

  const users = loadUsers();
  if (users.some((u) => normalizeEmail(u.email) === normalizedEmail)) {
    return { ok: false, error: "An account with this email already exists on this device." };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const user: User = {
    id: newId(),
    email: normalizedEmail,
    displayName: displayName.trim(),
    organization: organization.trim(),
    passwordHash,
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, user]);
  writeSession({ userId: user.id, createdAt: new Date().toISOString() });
  return { ok: true, user: toPublicUser(user) };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = normalizeEmail(email);
  const user = loadUsers().find((u) => normalizeEmail(u.email) === normalizedEmail);
  if (!user) {
    return { ok: false, error: "No account with this email on this device." };
  }

  const valid = await verifyPassword(password, user.passwordSalt, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Incorrect password." };
  }

  writeSession({ userId: user.id, createdAt: new Date().toISOString() });
  return { ok: true, user: toPublicUser(user) };
}

export function signOut(): void {
  writeSession(null);
}

export function updateCurrentUser(patch: Partial<Pick<User, "displayName" | "organization">>): PublicUser | null {
  const session = readSession();
  if (!session) return null;
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === session.userId);
  if (index === -1) return null;
  const updated: User = { ...users[index], ...patch };
  const next = [...users];
  next[index] = updated;
  saveUsers(next);
  return toPublicUser(updated);
}
