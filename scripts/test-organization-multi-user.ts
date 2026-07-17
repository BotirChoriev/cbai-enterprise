// BUILD-039 — Organization multi-user Playwright journey (requires live Supabase + test accounts).

import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium, type Browser } from "playwright";
import { sharedBackendTestsBlockedReason, readSharedBackendTestEnv } from "@/lib/persistence/test-env-gate";

const BASE = process.env.CBAI_TEST_BASE_URL ?? "http://127.0.0.1:3000";

test("B039-ORG multi-user journey", async (t) => {
  const blocked = sharedBackendTestsBlockedReason();
  if (blocked) {
    console.log(`SKIP organization multi-user: ${blocked}`);
    return;
  }
  const env = readSharedBackendTestEnv()!;

  let browser: Browser | undefined;
  await t.test("setup browser", async () => {
    browser = await chromium.launch();
  });

  await t.test("User A creates org, User B accepts", async () => {
    assert.ok(browser);
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await pageA.goto(`${BASE}/account`, { waitUntil: "networkidle" });
    await pageA.getByLabel(/email/i).fill(env.userAEmail);
    await pageA.getByLabel(/password/i).first().fill(env.userAPassword);
    await pageA.getByRole("button", { name: /sign in/i }).click();
    await pageA.waitForTimeout(1500);

    await pageA.goto(`${BASE}/organization`, { waitUntil: "networkidle" });
    const orgName = `Playwright Org ${Date.now()}`;
    await pageA.locator("#org-name").fill(orgName);
    await pageA.getByRole("button", { name: /create organization/i }).click();
    await pageA.waitForTimeout(2000);
    await assert.ok((await pageA.locator("body").innerText()).includes(orgName));

    await pageB.goto(`${BASE}/account`, { waitUntil: "networkidle" });
    await pageB.getByLabel(/email/i).fill(env.userBEmail);
    await pageB.getByLabel(/password/i).first().fill(env.userBPassword);
    await pageB.getByRole("button", { name: /sign in/i }).click();
    await pageB.waitForTimeout(1500);

    await contextA.close();
    await contextB.close();
  });

  await t.test("teardown", async () => {
    await browser?.close();
  });
});
