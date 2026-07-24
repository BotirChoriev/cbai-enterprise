/**
 * Full-platform UI verification (local only, not CI).
 * Run: node scripts/verify-platform-ui.mjs
 */
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const OUT = join(process.cwd(), "docs/verification/platform-completion-screenshots");
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { path: "/", name: "01-spatial-home.png" },
  { path: "/my-work", name: "03-my-work.png" },
  { path: "/research", name: "04-research.png" },
  { path: "/knowledge", name: "05-evidence.png" },
  { path: "/graph", name: "06-knowledge-graph.png" },
  { path: "/countries", name: "07-countries.png" },
  { path: "/investor", name: "08-investor.png" },
  { path: "/governance", name: "09-governance.png" },
  { path: "/reports", name: "10-reports.png" },
  { path: "/trust", name: "11-trust.png" },
];

const consoleErrors = [];
const hydrationIssues = [];
const overflowIssues = [];

async function auditPage(page, label) {
  const hydrationText = await page.locator("text=Hydration failed").count();
  if (hydrationText > 0) hydrationIssues.push(`${label}: hydration banner`);

  const metrics = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const topbar = document.querySelector(".cbai-platform-topbar, .cbai-spatial-topbar");
    let heroOk = true;
    if (h1 && topbar) {
      const hr = h1.getBoundingClientRect();
      const tr = topbar.getBoundingClientRect();
      heroOk = hr.top >= tr.bottom - 2;
    }
    return {
      heroOk,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      scrollY: window.scrollY,
    };
  });
  if (metrics.overflowX) overflowIssues.push(label);
  return metrics;
}

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader"],
});

const paths = {};
const heroChecks = {};

const desktop = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const dpage = await desktop.newPage();
dpage.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
dpage.on("pageerror", (err) => consoleErrors.push(String(err)));

for (const route of ROUTES) {
  await dpage.goto(`${BASE}${route.path}`, { waitUntil: "networkidle" });
  await dpage.waitForTimeout(900);
  heroChecks[route.path] = await auditPage(dpage, route.path);
  paths[route.name] = join(OUT, route.name);
  await dpage.screenshot({ path: paths[route.name], fullPage: false });
}

await dpage.goto(BASE, { waitUntil: "networkidle" });
await dpage.getByRole("button", { name: /Open voice operator|Ovoz operatorini ochish/i }).first().click();
await dpage.waitForTimeout(500);
paths["12-voice-ready.png"] = join(OUT, "12-voice-ready.png");
await dpage.screenshot({ path: paths["12-voice-ready.png"], fullPage: false });

paths["02-logo-full.png"] = join(OUT, "02-logo-full.png");
await dpage.screenshot({ path: paths["02-logo-full.png"], fullPage: false });

await desktop.close();

const mobile = await browser.newContext({ ...devices["iPhone 13"] });
const mpage = await mobile.newPage();
for (const route of [
  { path: "/", name: "13-mobile-home.png" },
  { path: "/research", name: "15-mobile-research.png" },
  { path: "/knowledge", name: "16-mobile-evidence.png" },
  { path: "/my-work", name: "18-mobile-my-work.png" },
]) {
  await mpage.goto(`${BASE}${route.path}`, { waitUntil: "networkidle" });
  await mpage.waitForTimeout(700);
  paths[route.name] = join(OUT, route.name);
  await mpage.screenshot({ path: paths[route.name], fullPage: false });
}
await mpage.goto(BASE, { waitUntil: "networkidle" });
await mpage.getByRole("button", { name: /Open voice operator|Ovoz/i }).first().click();
await mpage.waitForTimeout(400);
paths["17-mobile-voice-dock.png"] = join(OUT, "17-mobile-voice-dock.png");
await mpage.screenshot({ path: paths["17-mobile-voice-dock.png"], fullPage: false });
await mobile.close();

await browser.close();

console.log(
  JSON.stringify(
    {
      baseUrl: BASE,
      heroChecks,
      overflowIssues,
      hydrationIssues,
      consoleErrors: [...new Set(consoleErrors)].filter((e) => !e.includes("favicon") && !e.includes("WebGL")),
      screenshots: paths,
      headlessWebGlNote: "Globe may show country-registry fallback in headless Chromium.",
    },
    null,
    2,
  ),
);
