/**
 * Visual verification for Ontology + Forward-Deployed Engines (local only).
 * Run: PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright node scripts/verify-ontology-forward-deployed-engines-ui.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const OUT = join(process.cwd(), "docs/verification/ontology-forward-deployed-engines");
const VIEWPORTS = [
  { name: "desktop-1920", width: 1920, height: 1080 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];

const ROUTES = [
  { path: "/research", file: "research-engine" },
  { path: "/knowledge", file: "evidence-engine" },
  { path: "/countries", file: "country-intelligence" },
  { path: "/companies", file: "organization-engine" },
  { path: "/governance", file: "governance-review" },
  { path: "/my-work", file: "my-work-engine" },
  { path: "/reports", file: "reports-governance" },
  { path: "/government", file: "government-evidence" },
  { path: "/graph", file: "graph-relationships" },
  { path: "/", file: "home-mission" },
];

mkdirSync(join(OUT, "states"), { recursive: true });
for (const vp of VIEWPORTS) mkdirSync(join(OUT, vp.name), { recursive: true });

const consoleErrors = [];
const hydrationIssues = [];

async function shot(page, dir, name) {
  const path = join(OUT, dir, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function openEngineIfPossible(page) {
  const button = page.getByRole("button", { name: /start|boshla|запуст|başlat|open|propose|engine/i }).first();
  if (await button.count()) {
    await button.click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(600);
  }
}

const browser = await chromium.launch();
const report = { base: BASE, captured: [], consoleErrors, hydrationIssues };

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    colorScheme: "dark",
  });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push({ viewport: vp.name, text: msg.text() });
    const text = msg.text();
    if (/hydrat/i.test(text)) hydrationIssues.push({ viewport: vp.name, text });
  });
  page.on("pageerror", (err) => consoleErrors.push({ viewport: vp.name, text: String(err) }));

  for (const route of ROUTES) {
    await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(400);
    const path = await shot(page, vp.name, `${route.file}-dark`);
    report.captured.push(path);
  }

  if (vp.name === "desktop-1920") {
    await page.goto(`${BASE}/research`, { waitUntil: "networkidle" });
    await openEngineIfPossible(page);
    report.captured.push(await shot(page, "states", "research-engine-opened"));
    const confirm = page.getByRole("button", { name: /confirm|tasdiq|подтверд|onay/i }).first();
    if (await confirm.count()) {
      report.captured.push(await shot(page, "states", "confirmation"));
    }
    const timeline = page.locator("text=/execution|timeline|holat|состояние/i").first();
    if (await timeline.count()) {
      report.captured.push(await shot(page, "states", "execution-timeline"));
    }
  }

  await context.close();
}

// Light theme sample + locale stress (UZ)
const light = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  colorScheme: "light",
});
const lightPage = await light.newPage();
await lightPage.goto(`${BASE}/research`, { waitUntil: "networkidle" });
report.captured.push(await shot(lightPage, "states", "research-light"));
await lightPage.evaluate(() => {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (/profile|language|locale|assistant/i.test(key)) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            if ("preferredLanguage" in parsed) parsed.preferredLanguage = "uz";
            if ("language" in parsed) parsed.language = "uz";
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        } catch {
          /* ignore */
        }
      }
    }
  } catch {
    /* ignore */
  }
});
await lightPage.goto(`${BASE}/research`, { waitUntil: "networkidle" });
report.captured.push(await shot(lightPage, "states", "research-uz-stress"));
await lightPage.goto(`${BASE}/governance`, { waitUntil: "networkidle" });
report.captured.push(await shot(lightPage, "states", "governance-uz-stress"));
await light.close();

await browser.close();

writeFileSync(join(OUT, "capture-log.json"), JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      captured: report.captured.length,
      consoleErrors: consoleErrors.length,
      hydrationIssues: hydrationIssues.length,
      sampleErrors: consoleErrors.slice(0, 5),
    },
    null,
    2,
  ),
);
