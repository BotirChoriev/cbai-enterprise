/**
 * BUILD-039 — Test environment gate (never prints secret values).
 */

export type SharedBackendTestEnv = {
  readonly url: string;
  readonly anonKey: string;
  readonly userAEmail: string;
  readonly userAPassword: string;
  readonly userBEmail: string;
  readonly userBPassword: string;
  readonly userCEmail?: string;
  readonly userCPassword?: string;
};

export function readSharedBackendTestEnv(): SharedBackendTestEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const userAEmail = process.env.CBAI_TEST_USER_A_EMAIL?.trim();
  const userAPassword = process.env.CBAI_TEST_USER_A_PASSWORD?.trim();
  const userBEmail = process.env.CBAI_TEST_USER_B_EMAIL?.trim();
  const userBPassword = process.env.CBAI_TEST_USER_B_PASSWORD?.trim();
  if (!url || !anonKey || !userAEmail || !userAPassword || !userBEmail || !userBPassword) {
    return null;
  }
  return {
    url,
    anonKey,
    userAEmail,
    userAPassword,
    userBEmail,
    userBPassword,
    userCEmail: process.env.CBAI_TEST_USER_C_EMAIL?.trim(),
    userCPassword: process.env.CBAI_TEST_USER_C_PASSWORD?.trim(),
  };
}

export function sharedBackendTestsBlockedReason(): string {
  const env = readSharedBackendTestEnv();
  if (!env) {
    return "INFRASTRUCTURE BLOCKED — set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, CBAI_TEST_USER_A_EMAIL, CBAI_TEST_USER_A_PASSWORD, CBAI_TEST_USER_B_EMAIL, CBAI_TEST_USER_B_PASSWORD";
  }
  return "";
}
