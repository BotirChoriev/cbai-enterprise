/**
 * Intelligence OS final-closure visual capture (Chromium / Playwright).
 * Captures critical routes under UZ dark at multiple viewports.
 * Does not claim audible Realtime success.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const BASE = process.env.CBAI_BASE_URL ?? "http://localhost:3000";
const OUT = "docs/verification/intelligence-os-final-closure/after";

const VIEWPORTS = [
  { name: "1920", width: 1920, height: 1080 },
  { name: "1280", width: 1280, height: 800 },
  { name: "390", width: 390, height: 844 },
];

const ROUTES = [
  { id: "home", path: "/" },
  { id: "companies", path: "/companies" },
  { id: "research", path: "/research" },
  { id: "research-topic", path: "/research/biodiversity-mapping" },
  { id: "about", path: "/about" },
  { id: "reports", path: "/reports" },
  { id: "rooms", path: "/rooms" },
  { id: "investor", path: "/investor" },
  { id: "government", path: "/government" },
  { id: "governance", path: "/governance" },
  { id: "settings", path: "/settings" },
  { id: "graph", path: "/graph" },
  { id: "evidence", path: "/evidence" },
  { id: "my-work", path: "/my-work" },
];

async function setUzLocale(page) {
  await page.addInitScript(() => {
    const profile = {
      preferredLanguage: "uz",
      translationLanguage: "uz",
      workspaceRole: null,
    };
    try {
      localStorage.setItem("cbai-assistant-profile:local", JSON.stringify(profile));
      localStorage.setItem("cbai-assistant-profile", JSON.stringify(profile));
    } catch {
      /* ignore */
    }
    document.documentElement.classList.add("theme-dark");
    document.documentElement.classList.remove("theme-light");
  });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await setUzLocale(page);

  // Warm home once so locale hydrates
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const route of ROUTES) {
      const file = join(OUT, `${route.id}-uz-dark-${vp.name}.png`);
      mkdirSync(dirname(file), { recursive: true });
      await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: file, fullPage: false });
      console.log("wrote", file);
    }
  }

  // Voice open states on companies @1280
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${BASE}/companies`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const openBtn = page.getByRole("button", { name: /Ovozli Operatorni ochish|Open Voice Operator|Открыть|Sesli/i }).first();
  if (await openBtn.count()) {
    await openBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(OUT, "companies-voice-open-uz-dark-1280.png"), fullPage: false });
    console.log("wrote companies-voice-open");
  }

  // Home closed voice count visual
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, "home-closed-voice-uz-dark-1280.png"), fullPage: false });

  await browser.close();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
