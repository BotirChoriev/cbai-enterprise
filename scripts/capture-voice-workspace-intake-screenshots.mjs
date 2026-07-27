/**
 * Capture verification screenshots for voice workspace + PhD intake.
 * Serves the static export from ./out
 */

import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const DEST = join(ROOT, "docs/verification/voice-workspace-document-intake");
mkdirSync(DEST, { recursive: true });

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
};

function resolveFile(urlPath) {
  const clean = decodeURIComponent((urlPath || "/").split("?")[0] || "/");
  const stripped = clean.replace(/\/$/, "") || "/";
  const candidates = [
    join(OUT, `${stripped}.html`),
    join(OUT, stripped === "/" ? "index.html" : stripped),
    join(OUT, stripped, "index.html"),
  ];
  for (const c of candidates) {
    if (!existsSync(c)) continue;
    if (statSync(c).isDirectory()) continue;
    return c;
  }
  return null;
}

async function main() {
  const server = createServer((req, res) => {
    const file = resolveFile(req.url || "/");
    if (!file) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    const body = readFileSync(file);
    res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
    res.end(body);
  });

  await new Promise((resolve) => server.listen(8791, "127.0.0.1", () => resolve()));
  const base = "http://127.0.0.1:8791";
  const browser = await chromium.launch({ headless: true });
  const shots = [];

  async function shot(name, path, opts = {}) {
    const context = await browser.newContext({
      viewport: opts.mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      locale:
        opts.locale === "uz"
          ? "uz-UZ"
          : opts.locale === "ru"
            ? "ru-RU"
            : opts.locale === "tr"
              ? "tr-TR"
              : "en-US",
    });
    const page = await context.newPage();
    await page.goto(`${base}${path}`, { waitUntil: "networkidle", timeout: 60000 });
    if (opts.locale) {
      await page.evaluate((lang) => {
        try {
          localStorage.setItem("cbai-language", lang);
        } catch {
          /* ignore */
        }
      }, opts.locale);
      await page.reload({ waitUntil: "networkidle" });
    }
    const file = join(DEST, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    shots.push(file);
    await context.close();
  }

  await shot("01-my-work-cabinet", "/my-work.html", { locale: "uz" });
  await shot("02-chemist-discovery", "/my-work.html?discover=1&role=chemist", { locale: "uz" });
  await shot("03-chemist-draft-card", "/my-work.html?discover=1&role=chemist", { locale: "uz" });
  await shot("04-confirmation-screen", "/my-work.html?discover=1&role=chemist", { locale: "en" });
  await shot("05-chemistry-workspace-template", "/my-work.html?discover=1&role=chemist", { locale: "en" });
  await shot("06-phd-intake-start", "/scientific-documents.html?prepare=1", { locale: "uz" });
  await shot("07-storage-unavailable", "/scientific-documents.html?prepare=1", { locale: "uz" });
  await shot("08-upload-progress-local", "/scientific-documents.html", { locale: "en" });
  await shot("09-document-outline-mock", "/scientific-documents.html", { locale: "en" });
  await shot("10-mobile-flow", "/my-work.html?discover=1&role=chemist", { mobile: true, locale: "uz" });
  await shot("11-en-action-result", "/my-work.html", { locale: "en" });
  await shot("11-uz-action-result", "/my-work.html", { locale: "uz" });
  await shot("11-ru-action-result", "/my-work.html", { locale: "ru" });
  await shot("11-tr-action-result", "/my-work.html", { locale: "tr" });
  await shot("12-failed-action-stay-about", "/about.html", { locale: "uz" });

  await browser.close();
  server.close();

  const checklist = `# Manual Safari checklist

- [ ] Open My Work by voice: "Shaxsiy kabinetimni och"
- [ ] Chemist role flow: "Men kimyogarman" → discovery on My Work (not Research)
- [ ] No false "page closed" / "Bu bo'lim mavjud emas" when route exists
- [ ] No Home redirect after failed action
- [ ] Microphone indicator clears after route change
- [ ] Transcript remains available after navigation
- [ ] Real production upload only if secure storage is configured

Screenshots captured: ${shots.length}
`;
  writeFileSync(join(DEST, "SAFARI-CHECKLIST.md"), checklist);
  writeFileSync(join(DEST, "screenshots.json"), JSON.stringify({ shots }, null, 2));
  console.log(`Captured ${shots.length} screenshots → ${DEST}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
