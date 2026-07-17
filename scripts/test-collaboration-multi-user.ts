// BUILD-039 — Collaboration multi-user Playwright journey (requires live Supabase).

import { test } from "node:test";
import { sharedBackendTestsBlockedReason } from "@/lib/persistence/test-env-gate";

test("B039-COL collaboration multi-user journey", async () => {
  const blocked = sharedBackendTestsBlockedReason();
  if (blocked) {
    console.log(`SKIP collaboration multi-user: ${blocked}`);
    console.log("Collaboration shared adapter browser journey pending full Supabase collaboration wiring.");
    return;
  }
  console.log("Collaboration multi-user Playwright suite placeholder — extend after shared collaboration adapter is live-verified.");
});
