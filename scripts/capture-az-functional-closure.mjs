/**
 * Capture A–Z functional closure screenshots (Playwright).
 * Expects a static server already serving `out/` (e.g. npx serve out -l 3013).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE || "http://127.0.0.1:3013";
const OUT = join("docs/verification/az-functional-closure/after");

const shots = [
  ["my-work", "/my-work"],
  ["my-work-object-missing", "/my-work?object=does-not-exist"],
  ["companies", "/companies?company=apple"],
  ["universities", "/universities"],
  ["research", "/research"],
  ["evidence", "/evidence"],
  ["graph", "/graph"],
  ["rooms", "/rooms"],
  ["scientific-documents", "/scientific-documents"],
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const [name, path] of shots) {
  const url = `${BASE}${path}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(800);
    const file = join(OUT, `${name}-1440.png`);
    mkdirSync(dirname(file), { recursive: true });
    await page.screenshot({ path: file, fullPage: false });
    console.log("ok", name);
  } catch (error) {
    console.error("fail", name, error);
  }
}

// Mobile sheet check
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/my-work`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(600);
await page.screenshot({ path: join(OUT, "my-work-390.png"), fullPage: false });

await browser.close();
console.log("done", OUT);
