// Real browser regression tests for the "Full Real-User Experience Audit" mission — unlike every
// other scripts/test-*.ts suite (pure-function/source-string checks, no DOM), this one drives a
// real Chromium browser via Playwright against the real dev server, because several of the P0
// bugs this mission found (a React hydration mismatch, a duplicate-key warning, a command-bar
// resolution gap) are only observable by actually rendering the app — the previous absence of a
// browser tool in this environment was a real, repeatedly-documented gap (see
// docs/known-limitations.md), not a deliberate choice.
//
// Requires `npm run dev` running on http://localhost:3000 — this suite checks reachability first
// and skips everything with one clear message if the server isn't up, rather than hanging or
// failing confusingly. Not part of the default zero-dependency suites; run explicitly:
//   npm run dev &
//   npm run test:browser-regression

import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium, type Browser } from "playwright";

const BASE = "http://localhost:3000";

async function isServerUp(): Promise<boolean> {
  try {
    const res = await fetch(BASE + "/", { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

const serverUp = await isServerUp();
if (!serverUp) {
  test("browser regression suite requires a running dev server", { skip: true }, () => {});
} else {
  let browser: Browser;

  test("setup", async () => {
    browser = await chromium.launch();
  });

  test("1. Every core route renders with zero console/page errors (real hydration-mismatch and duplicate-key regression guard)", async () => {
    const routes = [
      "/", "/my-work", "/search", "/countries", "/companies", "/universities",
      "/research", "/research/microbiology", "/knowledge", "/reports", "/trust", "/settings", "/about",
    ];
    for (const route of routes) {
      const page = await browser.newPage();
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message.split("\n")[0]));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text().split("\n")[0]);
      });
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(2400);
      assert.deepEqual(errors, [], `${route} produced console/page errors: ${JSON.stringify(errors)}`);
      await page.close();
    }
  });

  test("2. Typing a bare real entity name into the top command bar opens that entity (regression: previously fell through to 'not recognized')", async () => {
    const page = await browser.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(2400);
    const topSearch = page.locator('input[name="q"]').first();
    await topSearch.fill("Japan");
    await topSearch.press("Enter");
    await page.waitForTimeout(1000);
    assert.equal(page.url(), BASE + "/countries?country=japan");
    await page.close();
  });

  test("3. Full project workflow: create, add note, appear in My Work, reopen, persist across a real refresh", async () => {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message.split("\n")[0]));
    await page.goto(BASE + "/my-work", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    await page.locator("#project-title").fill("Regression Test Project");
    await page.locator("#project-description").fill("A project created by the automated regression suite.");
    await page.locator('button:has-text("Create Project")').click();
    await page.waitForTimeout(1000);
    const projectUrl = page.url();
    assert.match(projectUrl, /\/my-work\?project=/);

    const noteInput = page.locator('textarea[placeholder*="note" i]').first();
    await noteInput.fill("A regression-suite note for persistence verification.");
    await page.locator('button:has-text("Add Note")').click();
    await page.waitForTimeout(500);

    await page.goto(BASE + "/my-work", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    let bodyText = await page.locator("body").innerText();
    assert.ok(bodyText.includes("Regression Test Project"), "New project must appear in My Work's project list");

    await page.locator('a:has-text("Regression Test Project")').first().click();
    await page.waitForTimeout(800);
    assert.equal(page.url(), projectUrl);
    bodyText = await page.locator("body").innerText();
    assert.ok(bodyText.includes("regression-suite note"), "Reopened project must show the real saved note");

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    bodyText = await page.locator("body").innerText();
    assert.ok(bodyText.includes("Regression Test Project"), "Project title must survive a real page refresh");
    assert.ok(bodyText.includes("regression-suite note"), "Note must survive a real page refresh");

    assert.deepEqual(errors, [], `Project workflow produced page errors: ${JSON.stringify(errors)}`);
    await page.close();
  });

  test("4. Language switch is real, persists across a refresh, and never leaks a raw translation key", async () => {
    const page = await browser.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(2400);
    await page.locator("summary").first().click();
    await page.waitForTimeout(300);
    await page.locator("text=/O.zbek/i").first().click();
    await page.waitForTimeout(600);

    let bodyText = await page.locator("body").innerText();
    assert.ok(bodyText.includes("Yangi loyiha"), "Homepage must show real Uzbek text after switching");
    const rawKeyLeak = bodyText.match(/\b(?:home|project|navigation|common)\.[a-zA-Z.]+\b/);
    assert.equal(rawKeyLeak, null, `A raw translation key leaked into visible text: ${rawKeyLeak?.[0]}`);

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    bodyText = await page.locator("body").innerText();
    assert.ok(bodyText.includes("Yangi loyiha"), "Language preference must persist across a real refresh");
    await page.close();
  });

  test("5. No horizontal overflow at mobile viewport width on Home or My Work", async () => {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    for (const route of ["/", "/my-work"]) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(route === "/" ? 2400 : 500);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      assert.ok(scrollWidth <= clientWidth, `${route} has horizontal overflow at 375px (scrollWidth=${scrollWidth})`);
    }
    await page.close();
  });

  test("teardown", async () => {
    await browser.close();
  });
}
