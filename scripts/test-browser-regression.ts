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
      // /graph regression guard (baseline audit): EntityNode.tsx previously fed entity.icon (a text
      // badge, e.g. "AAPL"/"MIT"/"US") into an SVG <path d>, throwing a real, reproducible parse
      // error for every real country/company/university node — confirmed live before the fix.
      "/graph",
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
    await page.locator("summary[data-cbai-language-selector]").click();
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

  test("6. Account page defaults to the tab that actually works in this deployment (regression: previously always opened on Cloud Account, putting a real-looking sign-in form in front of every visitor even when no Supabase project is connected)", async () => {
    const page = await browser.newPage();
    await page.goto(BASE + "/account", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const bodyText = await page.locator("body").innerText();
    // "Stays on this device only" is real copy unique to the Device-Local form body — unlike the
    // page's static header text (present regardless of tab), this only renders when that tab is
    // actually active, so it's a genuine regression guard, not a string that would pass either way.
    // This dev environment has no NEXT_PUBLIC_SUPABASE_* configured, so the default tab must be
    // Device-Local — the same real check (isCloudConfigured) the component itself uses.
    assert.ok(
      bodyText.includes("Stays on this device only"),
      "Cloud is unconfigured here, so the page must default to the Device-Local view, not Cloud",
    );
    await page.close();
  });

  test("7. Home becomes a real 'Continuing' console once a real project exists — zero hydration errors, not just an empty greeting (BUILD-009 continuity-first homepage)", async () => {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message.split("\n")[0]));

    await page.goto(BASE + "/my-work", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.locator("#project-title").fill("Continuity Regression Project");
    await page.locator("#project-description").fill("Created to verify Home resumes real work honestly.");
    await page.locator('button:has-text("Create Project")').click();
    await page.waitForTimeout(1000);

    // The real bug this guards: loadProjects() was read unconditionally in HomeIntelligenceFeed
    // (and, before the fix, inside resolveNextStep too), so the server's empty-project render
    // never matched the client's real one the instant a project existed — a genuine "server
    // rendered <div>, client rendered <ul>" hydration error, only visible by actually creating a
    // project and then loading Home in the same session, not by loading Home fresh.
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const bodyText = await page.locator("body").innerText();
    assert.ok(
      bodyText.includes("Continuity Regression Project"),
      "Home must show the real project as the primary 'Continuing' state, not a generic greeting",
    );
    assert.deepEqual(errors, [], `Home with a real project produced page errors: ${JSON.stringify(errors)}`);

    // Must also survive a real refresh (the exact scenario that first surfaced the bug — hydration
    // mismatches only throw once, on the render right after real data first appears).
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    assert.deepEqual(errors, [], `Reloading Home with a real project produced page errors: ${JSON.stringify(errors)}`);

    await page.close();
  });

  test("8. No horizontal overflow at required viewports on primary routes (BUILD-009 responsive audit)", async () => {
    const routes = [
      "/", "/my-work", "/search", "/countries", "/companies", "/universities",
      "/research", "/reports", "/trust", "/about", "/graph", "/settings", "/account",
    ];
    const viewports = [
      { width: 320, height: 568 },
      { width: 375, height: 812 },
      { width: 390, height: 844 },
      { width: 414, height: 896 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
      for (const route of routes) {
        await page.goto(BASE + route, { waitUntil: "networkidle" });
        await page.waitForTimeout(route === "/" ? 2400 : 600);
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        assert.ok(
          scrollWidth <= clientWidth,
          `${route} has horizontal overflow at ${viewport.width}px (scrollWidth=${scrollWidth}, clientWidth=${clientWidth})`,
        );
      }
      await page.close();
    }
  });

  test("9. Language sweeps (EN/UZ/RU/TR) — no raw keys on primary routes, About restored (BUILD-009)", async () => {
    const routes = ["/", "/about", "/graph", "/reports", "/countries"];
    const languages: { label: RegExp; marker: RegExp; code: string }[] = [
      { code: "en", label: /English/i, marker: /My Work|Search/i },
      { code: "uz", label: /O.zbek/i, marker: /Mening ishlarim|Qidiruv/i },
      { code: "ru", label: /Русский/i, marker: /Моя работа|Поиск/i },
      { code: "tr", label: /Türk/i, marker: /Çalışmam|Ara/i },
    ];

    for (const [langIndex, lang] of languages.entries()) {
      const page = await browser.newPage();
      await page.goto(BASE + "/", { waitUntil: "networkidle" });
      await page.waitForTimeout(2400);
      if (langIndex > 0) {
        await page.locator("summary[data-cbai-language-selector]").click();
        await page.waitForTimeout(300);
        await page.locator(`text=${lang.label}`).first().click();
        await page.waitForTimeout(600);
      }

      for (const route of routes) {
        await page.goto(BASE + route, { waitUntil: "networkidle" });
        await page.waitForTimeout(route === "/" ? 2400 : 800);
        const bodyText = await page.locator("body").innerText();
        const rawKeyLeak = bodyText.match(
          /\b(?:home|project|navigation|common|entityIntelligence|graphUi|aboutPage|reportsModel)\.[a-zA-Z.]+\b/,
        );
        assert.equal(
          rawKeyLeak,
          null,
          `${lang.code} ${route} leaked a raw translation key: ${rawKeyLeak?.[0]}`,
        );
      }

      if (lang.code === "en") {
        await page.goto(BASE + "/about", { waitUntil: "networkidle" });
        await page.waitForTimeout(800);
        await page.locator("#about-manifesto-heading").scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        const aboutText = await page.locator("body").innerText();
        assert.ok(aboutText.includes("Twelve principles"), "About must include full philosophy section");
        assert.ok(
          aboutText.includes("What CBAI does not claim to do today"),
          "About must include limitations section",
        );
        assert.ok(
          aboutText.includes("Real capabilities by maturity state"),
          "About must include roadmap maturity section",
        );
        assert.ok(
          aboutText.includes("The CBAI Manifesto") || aboutText.includes("Twenty working beliefs"),
          "About must include manifesto section",
        );
      }

      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const persisted = await page.locator("body").innerText();
      assert.ok(lang.marker.test(persisted), `${lang.code} language must persist after reload`);

      await page.close();
    }
  });

  test("10. Graph and entity intelligence panels use translated chrome (BUILD-009 Uzbek regression)", async () => {
    const page = await browser.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(2400);
    await page.locator("summary[data-cbai-language-selector]").click();
    await page.waitForTimeout(300);
    await page.locator("text=/O.zbek/i").first().click();
    await page.waitForTimeout(600);

    await page.goto(BASE + "/graph", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const graphText = await page.locator("body").innerText();
    assert.ok(graphText.includes("Afsona"), "Graph legend must render translated Uzbek heading");
    assert.ok(graphText.includes("Barcha turlar"), "Graph type filter must render translated All Types label");

    await page.goto(BASE + "/countries", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "Japan" }).click();
    await page.waitForTimeout(1200);
    const countryText = await page.locator("body").innerText();
    assert.ok(
      countryText.includes("Intellekt konteksti") || countryText.includes("Mamlakat"),
      "Country profile must render translated intelligence chrome",
    );

    await page.close();
  });

  test("teardown", async () => {
    await browser.close();
  });
}
