import test from "node:test";
import assert from "node:assert/strict";
import { readSharedBackendTestEnv, sharedBackendTestsBlockedReason } from "@/lib/persistence/test-env-gate";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

test("live cloud Problem snapshot hydrates the owner-namespaced local cache", async (t) => {
  const blocked = sharedBackendTestsBlockedReason();
  if (blocked) {
    t.skip(blocked);
    return;
  }
  const env = readSharedBackendTestEnv()!;
  const localStorage = new MemoryStorage();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => true,
    },
  });

  const { __resetSupabaseClientForTests, getSupabaseBrowserClient } = await import("@/lib/supabase/client");
  const { pullCloudDataToLocal } = await import("@/lib/supabase/pull-sync");
  __resetSupabaseClientForTests();
  const client = getSupabaseBrowserClient();
  assert.ok(client, "Configured browser client must exist");

  const signedIn = await client.auth.signInWithPassword({
    email: env.userAEmail,
    password: env.userAPassword,
  });
  assert.equal(signedIn.error, null, signedIn.error?.message);
  const ownerId = signedIn.data.user?.id;
  assert.ok(ownerId);

  const remote = await client
    .from("problem_snapshots")
    .select("local_id,payload")
    .like("local_id", "rls-verification-%")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  assert.equal(remote.error, null, remote.error?.message);
  assert.ok(remote.data, "The live RLS test fixture must be readable by its owner");

  await pullCloudDataToLocal(ownerId);
  const raw = localStorage.getItem(`cbai-problems:cloud:${ownerId}`);
  assert.ok(raw, "Cloud pull must write the owner-namespaced Problem bucket");
  const hydrated = JSON.parse(raw) as Array<{ id?: string }>;
  assert.ok(
    hydrated.some((problem) => problem.id === remote.data?.local_id),
    "Hydrated cache must contain the real remote Problem payload",
  );

  await client.auth.signOut();
  delete (globalThis as { window?: unknown }).window;
});
