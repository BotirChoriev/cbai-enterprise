#!/usr/bin/env node
/**
 * Disable Cloudflare Access on Pages Preview deployments by deleting the
 * auto-created Access application for this Pages project.
 *
 * Does NOT touch Production custom domains. Does NOT modify git/main.
 *
 * Required env:
 *   CLOUDFLARE_API_TOKEN  — token with Account Access: Apps and Policies (Edit)
 *   CLOUDFLARE_ACCOUNT_ID — dash.cloudflare.com/<ACCOUNT_ID>/...
 *
 * Optional:
 *   PAGES_ACCESS_APP_NAME — substring match (default: "cbai-enterprise" or "pages")
 *   DRY_RUN=1             — list matching apps only, do not delete
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… node scripts/disable-pages-preview-access.mjs
 */

const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
const nameHint = (process.env.PAGES_ACCESS_APP_NAME ?? "cbai-enterprise").toLowerCase();

if (!token || !accountId) {
  console.error(
    "Missing CLOUDFLARE_API_TOKEN and/or CLOUDFLARE_ACCOUNT_ID.\n" +
      "Create a token at https://dash.cloudflare.com/profile/api-tokens\n" +
      "with Account → Access: Apps and Policies → Edit.",
  );
  process.exit(1);
}

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const err = JSON.stringify(json.errors ?? json, null, 2);
    throw new Error(`Cloudflare API ${res.status} ${path}\n${err}`);
  }
  return json;
}

const listed = await cf(`/accounts/${accountId}/access/apps`);
const apps = Array.isArray(listed.result) ? listed.result : [];

const matches = apps.filter((app) => {
  const name = String(app.name ?? "").toLowerCase();
  const domain = String(app.domain ?? app.aud ?? "").toLowerCase();
  return (
    name.includes(nameHint) ||
    name.includes("pages") ||
    domain.includes("cbai-enterprise.pages.dev") ||
    domain.includes("*.cbai-enterprise.pages.dev")
  );
});

console.log(`Found ${apps.length} Access app(s); ${matches.length} match Preview Pages filter.`);
for (const app of matches) {
  console.log(`- id=${app.id} name=${JSON.stringify(app.name)} domain=${JSON.stringify(app.domain)}`);
}

if (matches.length === 0) {
  console.log("No matching Access apps. Preview may already be public, or the app name differs.");
  console.log("All apps:");
  for (const app of apps) {
    console.log(`- id=${app.id} name=${JSON.stringify(app.name)} domain=${JSON.stringify(app.domain)}`);
  }
  process.exit(0);
}

if (dryRun) {
  console.log("DRY_RUN=1 — not deleting.");
  process.exit(0);
}

for (const app of matches) {
  // Prefer deleting only clear Pages-preview Access apps.
  const name = String(app.name ?? "").toLowerCase();
  const domain = String(app.domain ?? "").toLowerCase();
  const looksLikePagesPreview =
    name.includes("pages") ||
    domain.includes("pages.dev") ||
    name.includes("cbai-enterprise");
  if (!looksLikePagesPreview) {
    console.log(`Skipping ${app.id} (does not look like Pages Preview Access).`);
    continue;
  }
  await cf(`/accounts/${accountId}/access/apps/${app.id}`, { method: "DELETE" });
  console.log(`Deleted Access app ${app.id} (${app.name}).`);
}

console.log("Done. Verify: curl -sS -o /dev/null -w '%{http_code}\\n' -X POST https://preview-voice-research-integ.cbai-enterprise.pages.dev/api/voice/session -H 'Content-Type: application/json' -d '{}'");
console.log("Expect Function JSON (200/403/503/405) — not 302 HTML to cloudflareaccess.com.");
