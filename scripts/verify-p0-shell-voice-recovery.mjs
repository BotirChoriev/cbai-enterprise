/**
 * P0 shell + Voice Operator geometry & screenshot acceptance (Chromium).
 * Does NOT claim audible Safari Realtime success.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_BASE_URL ?? "http://localhost:3000";
const OUT = "docs/verification/p0-shell-voice-recovery";
const AFTER = join(OUT, "after");

const VIEWPORTS = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "390x844", width: 390, height: 844 },
];

const ROUTES = [
  { id: "home", path: "/" },
  { id: "my-work", path: "/my-work" },
  { id: "search", path: "/search" },
  { id: "countries", path: "/countries" },
  { id: "companies", path: "/companies" },
  { id: "universities", path: "/universities" },
  { id: "research", path: "/research" },
  { id: "evidence", path: "/evidence" },
  { id: "graph", path: "/graph" },
  { id: "rooms", path: "/rooms" },
  { id: "reports", path: "/reports" },
  { id: "investor", path: "/investor" },
  { id: "government", path: "/government" },
  { id: "governance", path: "/governance" },
  { id: "settings", path: "/settings" },
  { id: "about", path: "/about" },
];

function profileJson(lang) {
  return JSON.stringify({
    name: "",
    operatorName: "",
    avatar: "orb",
    voiceInputEnabled: true,
    preferredLanguage: lang,
    translationLanguage: lang,
    speechLanguage: lang,
    workspaceRole: "researcher",
    timezone: "",
    country: "",
    organization: "",
    notifications: { evidenceUpdates: false, missionActivity: false, weeklySummary: false },
    accessibility: { reducedMotion: true, highContrast: false, largerText: false },
    themeMode: "dark",
    displayDensity: "standard",
  });
}

async function seedLocale(page, lang) {
  await page.addInitScript((code) => {
    const raw = code;
    try {
      localStorage.setItem("cbai-assistant-profile:local", raw);
      // Keep bare key aligned so legacy readers cannot flip locale mid-session.
      localStorage.setItem("cbai-assistant-profile", raw);
    } catch {
      /* ignore */
    }
  }, profileJson(lang));
}

function boxInside(box, vw, vh, pad = 1) {
  if (!box) return false;
  return (
    box.x >= -pad &&
    box.y >= -pad &&
    box.x + box.width <= vw + pad &&
    box.y + box.height <= vh + pad
  );
}

async function measureGeometry(page, label) {
  const viewport = page.viewportSize();
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const vw = window.innerWidth;
    const main = document.querySelector(".cbai-platform-main");
    const h1 = document.querySelector("h1");
    const sidebar = document.querySelector(".cbai-platform-sidebar");
    const topbar = document.querySelector(".cbai-platform-topbar");
    const launchers = [...document.querySelectorAll('[data-voice-entry="launcher"]')];
    const docks = [...document.querySelectorAll('[data-voice-dock="open"]')];
    const mics = [...document.querySelectorAll('[data-voice-action="mic"]')];
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const mainRect = rect(main);
    const rightEmpty = mainRect ? Math.max(0, vw - (mainRect.x + mainRect.width)) : 0;

    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      main: mainRect,
      h1: rect(h1),
      sidebar: rect(sidebar),
      topbar: rect(topbar),
      launcherCount: launchers.length,
      dockCount: docks.length,
      micCount: mics.length,
      launcherBoxes: launchers.map(rect),
      dockBoxes: docks.map(rect),
      micBoxes: mics.map(rect),
      rightEmptyGuess: rightEmpty,
      htmlLang: document.documentElement.lang,
    };
  });

  const issues = [];
  if (metrics.scrollWidth > metrics.clientWidth + 1) {
    issues.push(`horizontal overflow scrollWidth=${metrics.scrollWidth} clientWidth=${metrics.clientWidth}`);
  }
  if (!metrics.main || metrics.main.width < 240) {
    issues.push(`main content width too small: ${metrics.main?.width ?? 0}`);
  }
  if (metrics.h1 && !boxInside(metrics.h1, viewport.width, viewport.height, 4)) {
    issues.push("h1 clipped outside viewport");
  }
  if (metrics.topbar && metrics.h1) {
    const overlapY =
      metrics.topbar.y + metrics.topbar.height > metrics.h1.y + 2 &&
      metrics.h1.y < metrics.topbar.y + metrics.topbar.height;
    if (overlapY && metrics.h1.x < metrics.topbar.x + metrics.topbar.width) {
      // Only flag when h1 is under the sticky topbar band.
      if (metrics.h1.y < metrics.topbar.y + metrics.topbar.height - 4) {
        issues.push("topbar overlaps h1");
      }
    }
  }
  for (const box of metrics.launcherBoxes) {
    if (!boxInside(box, viewport.width, viewport.height, 2)) {
      issues.push("launcher outside viewport");
    }
  }
  for (const box of metrics.dockBoxes) {
    if (!boxInside(box, viewport.width, viewport.height, 2)) {
      issues.push("dock outside viewport");
    }
  }
  for (const box of metrics.micBoxes) {
    if (!boxInside(box, viewport.width, viewport.height, 2)) {
      issues.push("mic control outside viewport");
    }
  }
  // Phantom blank column heuristic: large unused right space on desktop while main is narrow.
  if (viewport.width >= 1280 && metrics.main && metrics.main.width < viewport.width * 0.45 && metrics.rightEmptyGuess > 360) {
    issues.push(`suspicious blank right column (~${Math.round(metrics.rightEmptyGuess)}px)`);
  }

  return { label, viewport, metrics, issues };
}

async function main() {
  mkdirSync(AFTER, { recursive: true });
  mkdirSync(join(OUT, "geometry"), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const report = { base: BASE, startedAt: new Date().toISOString(), cases: [] };
  let failures = 0;

  // --- UZ dark route sweep + geometry ---
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await seedLocale(page, "uz");

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Closed home
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 90000 });
      await page.waitForTimeout(900);
      let geo = await measureGeometry(page, `home-closed-uz-${vp.name}`);
      if (geo.metrics.launcherCount !== 1) {
        geo.issues.push(`expected 1 launcher closed, got ${geo.metrics.launcherCount}`);
      }
      if (geo.metrics.dockCount !== 0) {
        geo.issues.push(`expected 0 docks closed, got ${geo.metrics.dockCount}`);
      }
      if (geo.metrics.htmlLang !== "uz") {
        geo.issues.push(`expected html lang=uz, got ${geo.metrics.htmlLang}`);
      }
      await page.screenshot({ path: join(AFTER, `home-closed-uz-dark-${vp.name}.png`) });
      report.cases.push(geo);
      failures += geo.issues.length;

      // Open dock
      const launcher = page.locator('[data-voice-entry="launcher"]').first();
      if (await launcher.count()) {
        await launcher.click({ timeout: 5000 });
        await page.waitForTimeout(500);
      }
      geo = await measureGeometry(page, `home-open-uz-${vp.name}`);
      if (geo.metrics.dockCount !== 1) {
        geo.issues.push(`expected 1 dock open, got ${geo.metrics.dockCount}`);
      }
      if (geo.metrics.micCount !== 1) {
        geo.issues.push(`expected 1 mic in dock, got ${geo.metrics.micCount}`);
      }
      if (geo.metrics.launcherCount !== 0) {
        geo.issues.push(`expected 0 launchers when open, got ${geo.metrics.launcherCount}`);
      }
      await page.screenshot({ path: join(AFTER, `home-open-uz-dark-${vp.name}.png`) });
      report.cases.push(geo);
      failures += geo.issues.length;

      // Close for next routes
      const closeBtn = page.locator('[data-voice-action="close"]').first();
      if (await closeBtn.count()) {
        await closeBtn.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(300);
      }

      // Route gallery (subset at 1280 + full set at 1920 / 390)
      const routeSet =
        vp.name === "1280x800" || vp.name === "1920x1080" || vp.name === "390x844"
          ? ROUTES
          : ROUTES.filter((r) => ["home", "companies", "research", "settings"].includes(r.id));

      for (const route of routeSet) {
        if (route.id === "home") continue;
        await page.goto(`${BASE}${route.path}`, { waitUntil: "domcontentloaded", timeout: 90000 });
        await page.waitForTimeout(600);
        geo = await measureGeometry(page, `${route.id}-closed-uz-${vp.name}`);
        if (geo.metrics.htmlLang !== "uz") {
          geo.issues.push(`locale flipped to ${geo.metrics.htmlLang} on ${route.path}`);
        }
        if (geo.metrics.launcherCount !== 1) {
          geo.issues.push(`expected 1 launcher on ${route.path}, got ${geo.metrics.launcherCount}`);
        }
        await page.screenshot({
          path: join(AFTER, `${route.id}-closed-uz-dark-${vp.name}.png`),
        });
        report.cases.push(geo);
        failures += geo.issues.length;
      }
    }

    await context.close();
  }

  // --- EN baseline @1280 ---
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await seedLocale(page, "en");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(AFTER, "home-closed-en-dark-1280x800.png") });
    const geo = await measureGeometry(page, "home-closed-en-1280");
    report.cases.push(geo);
    failures += geo.issues.length;
    await context.close();
  }

  // --- Light theme home @1280 ---
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.addInitScript((raw) => {
      try {
        const profile = JSON.parse(raw);
        profile.themeMode = "light";
        localStorage.setItem("cbai-assistant-profile:local", JSON.stringify(profile));
        localStorage.setItem("cbai-assistant-profile", JSON.stringify(profile));
      } catch {
        /* ignore */
      }
    }, profileJson("en"));
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE}/companies`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(AFTER, "companies-closed-en-light-1280x800.png") });
    const geo = await measureGeometry(page, "companies-light-en-1280");
    report.cases.push(geo);
    failures += geo.issues.length;
    await context.close();
  }

  report.finishedAt = new Date().toISOString();
  report.failureCount = failures;
  writeFileSync(join(OUT, "geometry", "summary.json"), JSON.stringify(report, null, 2));

  const failedCases = report.cases.filter((c) => c.issues.length);
  console.log(`P0 geometry cases: ${report.cases.length}, failing: ${failedCases.length}, issues: ${failures}`);
  for (const c of failedCases.slice(0, 40)) {
    console.log(`- ${c.label}: ${c.issues.join("; ")}`);
  }

  await browser.close();
  if (failures > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
