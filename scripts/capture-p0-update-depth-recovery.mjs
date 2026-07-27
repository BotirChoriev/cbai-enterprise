/**
 * P0 browser acceptance — route matrix + viewport captures for update-depth recovery.
 * Uses existing Next.js on :3000. Does not start a server.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_BASE_URL ?? "http://127.0.0.1:3000";
const OUT = join(process.cwd(), "docs/verification/p0-update-depth-recovery");

const ROUTES = [
  "/",
  "/my-work",
  "/search",
  "/countries",
  "/companies",
  "/universities",
  "/research",
  "/evidence",
  "/graph",
  "/rooms",
  "/reports",
  "/investor",
  "/government",
  "/settings",
  "/about",
];

const VIEWPORTS = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "390x844", width: 390, height: 844 },
];

function hasUpdateDepth(text) {
  return /Maximum update depth|getServerSnapshot should be cached|KUTILMAGAN XATO|Nimadir noto‘g‘ri ketdi/i.test(
    text,
  );
}

async function main() {
  mkdirSync(join(OUT, "after"), { recursive: true });
  mkdirSync(join(OUT, "before"), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const matrix = [];

  const fresh = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await fresh.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(800);
    const body = await page.locator("body").innerText();
    const failed =
      hasUpdateDepth(body) ||
      consoleErrors.some((e) => /Maximum update depth|getServerSnapshot/i.test(e));
    matrix.push({
      route,
      storage: "fresh",
      ok: !failed,
      updateDepth: consoleErrors.filter((e) => /Maximum update depth|getServerSnapshot/i.test(e)),
      unexpectedBoundary: /KUTILMAGAN XATO/i.test(body),
    });
    if (route === "/evidence") {
      await page.screenshot({ path: join(OUT, "after", "evidence-fresh-1440.png"), fullPage: false });
    }
    consoleErrors.length = 0;
  }

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  for (const route of ["/my-work", "/evidence", "/rooms", "/settings", "/"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    const body = await page.locator("body").innerText();
    matrix.push({
      route: `spa:${route}`,
      storage: "session-carry",
      ok: !hasUpdateDepth(body),
      unexpectedBoundary: /KUTILMAGAN XATO/i.test(body),
    });
  }

  await page.goto(`${BASE}/evidence`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const langBtn = page.getByRole("button", { name: /Til sozlamalari|Language|interface language/i }).first();
  if ((await langBtn.count()) > 0) {
    await langBtn.click().catch(() => undefined);
    await page.getByRole("button", { name: /English/i }).first().click().catch(() => undefined);
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: /Oʻzbek|Uzbek/i }).first().click().catch(() => undefined);
    await page.waitForTimeout(400);
  }
  const afterLocale = await page.locator("body").innerText();
  matrix.push({
    route: "/evidence",
    action: "locale-toggle",
    ok: !hasUpdateDepth(afterLocale),
  });
  await page.screenshot({ path: join(OUT, "after", "evidence-locale-stable.png"), fullPage: false });

  const launcher = page.getByRole("button", { name: /Ovoz operatorini ochish|Open Voice|Voice Operator/i });
  matrix.push({
    check: "voice-launcher-visible",
    ok: (await launcher.count()) > 0,
  });

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${BASE}/evidence`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);
    const body = await page.locator("body").innerText();
    const ok = !hasUpdateDepth(body);
    matrix.push({ route: "/evidence", viewport: vp.name, ok });
    await page.screenshot({
      path: join(OUT, "after", `evidence-${vp.name}.png`),
      fullPage: false,
    });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/evidence`, { waitUntil: "domcontentloaded" });
  const light = page.getByRole("radio", { name: /Yorug|Light/i });
  if ((await light.count()) > 0) {
    await light.first().click().catch(() => undefined);
    await page.waitForTimeout(500);
  }
  const lightBody = await page.locator("body").innerText();
  matrix.push({ route: "/evidence", theme: "light", ok: !hasUpdateDepth(lightBody) });
  await page.screenshot({ path: join(OUT, "after", "evidence-light.png"), fullPage: false });

  await fresh.close();

  const legacy = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await legacy.addInitScript(() => {
    const profile = {
      preferredLanguage: "uz",
      translationLanguage: "uz",
      themeMode: "dark",
      accessibility: { reducedMotion: false, highContrast: false, largerText: false },
      notifications: {},
    };
    try {
      localStorage.setItem("cbai-assistant-profile:local", JSON.stringify(profile));
      localStorage.setItem("cbai.local-evidence.v1", "[]");
    } catch {
      /* ignore */
    }
  });
  const legacyPage = await legacy.newPage();
  await legacyPage.goto(`${BASE}/evidence`, { waitUntil: "domcontentloaded" });
  await legacyPage.waitForTimeout(800);
  const legacyBody = await legacyPage.locator("body").innerText();
  matrix.push({
    route: "/evidence",
    storage: "legacy-profile",
    ok: !hasUpdateDepth(legacyBody),
  });
  await legacyPage.screenshot({
    path: join(OUT, "after", "evidence-legacy-profile.png"),
    fullPage: false,
  });
  await legacy.close();

  await browser.close();

  const failed = matrix.filter((row) => row.ok === false);
  writeFileSync(join(OUT, "trigger-matrix.json"), JSON.stringify({ base: BASE, matrix, failed }, null, 2));
  console.log(JSON.stringify({ total: matrix.length, failed: failed.length }, null, 2));
  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
