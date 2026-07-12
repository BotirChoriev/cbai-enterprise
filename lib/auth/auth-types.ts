/**
 * Real local authentication (Authentication + User Platform Foundation mission).
 *
 * This is a genuine account system — sign up, sign in, sign out, a real hashed-and-salted
 * credential, a real session — but it is honestly a LOCAL DEVICE account, not a secure
 * server-verified one. There is no server in a static export to verify a password against, no
 * rate limiting, no email verification, and no cross-device sync. Every place this account shows
 * up in the UI says so plainly, the same way "Personal Operator" already does for profile data.
 * See lib/storage/storage-provider.ts for how this connects to (a currently unconfigured) cloud
 * backend later.
 */

export type User = {
  id: string;
  email: string;
  displayName: string;
  organization: string;
  /** SHA-256 hex digest of `${salt}:${password}` — real hashing (Web Crypto), not plaintext, but
   * still a local-only credential with no server-side verification. */
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
};

/** Never expose the credential fields to callers outside the auth store itself. */
export type PublicUser = Omit<User, "passwordHash" | "passwordSalt">;

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    organization: user.organization,
    createdAt: user.createdAt,
  };
}

export type Session = {
  userId: string;
  createdAt: string;
};

export type AuthResult =
  | { ok: true; user: PublicUser }
  | { ok: false; error: string };

export const LOCAL_ACCOUNT_NOTICE =
  "Local account — your email and password are stored, hashed and salted, on this device only. " +
  "There is no server to verify them against, so this is not a secure substitute for a real " +
  "cloud account. Nothing here is synced across devices.";
