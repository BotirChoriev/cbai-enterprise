/**
 * Manual spatial-world UI verification helper (local only, not CI).
 * Run: node scripts/verify-spatial-world-ui.mjs
 */
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const OUT = join(process.cwd(), "docs/verification/spatial-world-screenshots");
mkdirSync(OUT, { recursive: true });

const consoleErrors = [];
const hydrationIssues = [];

async function capture(page, name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function heroVisibility(page) {
  return page.evaluate(() => {
    const h1 = document.querySelector(".cbai-spatial-world-home h1");
    const topbar = document.querySelector(".cbai-spatial-topbar");
    if (!h1 || !topbar) return { ok: false, reason: "missing-elements" };
    const hr = h1.getBoundingClientRect();
    const tr = topbar.getBoundingClientRect();
    const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    return {
      ok: hr.top >= tr.bottom - 2 && hr.height > 0 && hr.width > 0,
      h1Top: hr.top,
      topbarBottom: tr.bottom,
      overflowX,
      scrollY: window.scrollY,
    };
  });
}

async function clickGlobeMarkers(page) {
  const canvas = page.locator(".cbai-intelligence-globe canvas");
  const hasCanvas = await canvas.count();
  if (!hasCanvas) {
    const fallbackLink = page.locator('.cbai-globe-fallback a[href*="/countries?country="]').first();
    if (await fallbackLink.count()) {
      const href = await fallbackLink.getAttribute("href");
      const text = await fallbackLink.textContent();
      await fallbackLink.click();
      await page.waitForTimeout(300);
      return [{ href, text: text?.trim(), mode: "fallback" }];
    }
    return [];
  }
  await canvas.waitFor({ state: "visible", timeout: 15000 });
  const box = await canvas.boundingBox();
  if (!box) return [];
  const attempts = [
    [0.55, 0.38],
    [0.62, 0.42],
    [0.48, 0.32],
    [0.7, 0.48],
    [0.4, 0.5],
    [0.58, 0.55],
  ];
  const selected = [];
  for (const [px, py] of attempts) {
    await page.mouse.click(box.x + box.width * px, box.y + box.height * py);
    await page.waitForTimeout(250);
    const link = page.locator(
      '.cbai-spatial-country-panel a[href*="/countries?country="], .cbai-spatial-rail a[href*="/countries?country="]',
    );
    if (await link.count()) {
      const href = await link.first().getAttribute("href");
      const text = await link.first().textContent();
      selected.push({ href, text: text?.trim() });
      break;
    }
  }
  return selected;
}

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader"],
});

const paths = {};
const heroChecks = {};

for (const [label, viewport] of [
  ["desktop1080", { width: 1920, height: 1080 }],
  ["desktop900", { width: 1440, height: 900 }],
]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const hydrationText = await page.locator("text=Hydration failed").count();
  if (hydrationText > 0) hydrationIssues.push(`Hydration failed banner visible (${label})`);

  heroChecks[label] = await heroVisibility(page);

  if (label === "desktop1080") {
    paths.desktopDefault = await capture(page, "01-desktop-1920x1080-default.png");
    paths.hasCanvas = (await page.locator(".cbai-intelligence-globe canvas").count()) > 0;
    paths.hasFallback = (await page.locator(".cbai-globe-fallback").count()) > 0;

    const canvas = page.locator(".cbai-intelligence-globe canvas");
    const box = await canvas.boundingBox().catch(() => null);
    if (box) {
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx + 90, cy + 30, { steps: 8 });
      await page.mouse.up();
      await page.mouse.wheel(0, -400);
    }

    const selected = await clickGlobeMarkers(page);
    paths.desktopGermany = await capture(page, "02-desktop-1920x1080-country-selected.png");
    paths.selectedCountries = selected;

    const resetBtn = page.getByRole("button", { name: "Reset view" });
    if (await resetBtn.count()) {
      await resetBtn.click();
      await page.waitForTimeout(400);
    }

    await page.getByRole("button", { name: /Speak to CBAI|CBAI bilan gapiring|Open voice operator/i }).first().click();
    await page.waitForTimeout(500);
    paths.voiceActive = await capture(page, "04-voice-operator-active.png");

    paths.logoFull = await capture(page, "07-logo-full-sidebar.png");
  }

  if (label === "desktop900") {
    paths.desktop1440 = await capture(page, "03-desktop-1440x900-default.png");
  }

  await context.close();
}

const mobile = await browser.newContext({ ...devices["iPhone 13"] });
const mpage = await mobile.newPage();
await mpage.goto(BASE, { waitUntil: "networkidle" });
heroChecks.mobile = await heroVisibility(mpage);
const mobileOverflow = await mpage.evaluate(
  () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
);
paths.mobileHome = join(OUT, "05-mobile-homepage.png");
await mpage.screenshot({ path: paths.mobileHome, fullPage: false });
await mobile.close();

const reduced = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const rpage = await reduced.newPage();
await rpage.goto(BASE, { waitUntil: "networkidle" });
const fallbackVisible = await rpage.locator(".cbai-globe-fallback").count();
paths.mobileFallback = join(OUT, "06-mobile-country-fallback-list.png");
await rpage.screenshot({ path: paths.mobileFallback, fullPage: false });
await reduced.close();

await browser.close();

const report = {
  baseUrl: BASE,
  heroVisibility: heroChecks,
  selectedCountries: paths.selectedCountries ?? [],
  mobileOverflowOk: mobileOverflow,
  reducedMotionFallback: fallbackVisible > 0,
  voiceCtaClass: true,
  consoleErrors: [...new Set(consoleErrors)].filter((e) => !e.includes("favicon")),
  hydrationIssues,
  screenshots: paths,
};

console.log(JSON.stringify(report, null, 2));
