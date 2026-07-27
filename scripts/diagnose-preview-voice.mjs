/**
 * Safe Preview voice broker diagnostic — never prints secrets or credentials.
 *
 * Usage:
 *   node scripts/diagnose-preview-voice.mjs
 *   PREVIEW_ORIGIN=https://preview-spatial-world-intell.cbai-enterprise.pages.dev node scripts/diagnose-preview-voice.mjs
 */
const origin = (process.env.PREVIEW_ORIGIN ?? "https://preview-spatial-world-intell.cbai-enterprise.pages.dev").replace(
  /\/$/,
  "",
);
const sessionUrl = `${origin}/api/voice/session`;

function classifyBody(status, contentType, body) {
  const ct = (contentType ?? "").toLowerCase();
  const text = body.slice(0, 400).toLowerCase();
  if (status >= 300 && status < 400) return "redirect";
  if (text.includes("cloudflareaccess")) return "cloudflare_access_html_or_redirect";
  if (ct.includes("text/html") || text.includes("<!doctype") || text.includes("<html")) return "html_not_json";
  try {
    const parsed = JSON.parse(body);
    if (parsed.clientSecret || parsed.client_secret) return "ephemeral_credential_json";
    if (parsed.error) return `broker_error:${String(parsed.error)}`;
    return "json_other";
  } catch {
    return "malformed_or_non_json";
  }
}

async function main() {
  /** @type {Record<string, unknown>} */
  const report = {
    preview_origin: origin,
    broker_url_resolved: true,
    broker_base: `${origin}/api/voice`,
    route_reachable: false,
    origin_allowed: "unknown",
    response_class: "unreachable",
    http_status: null,
    content_type: null,
    ephemeral_credential_returned: false,
    secrets_logged: false,
  };

  try {
    const options = await fetch(sessionUrl, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });
    report.options_status = options.status;
  } catch {
    report.options_status = "network_error";
  }

  try {
    const response = await fetch(sessionUrl, {
      method: "POST",
      redirect: "manual",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: origin,
      },
      body: JSON.stringify({ language: "uz", origin }),
    });
    const contentType = response.headers.get("content-type");
    const body = await response.text();
    report.http_status = response.status;
    report.content_type = contentType;
    report.route_reachable = true;
    report.response_class = classifyBody(response.status, contentType, body);
    if (report.response_class === "ephemeral_credential_json") {
      report.origin_allowed = true;
      report.ephemeral_credential_returned = true;
    } else if (String(report.response_class).includes("origin_blocked")) {
      report.origin_allowed = false;
    }
  } catch (error) {
    report.route_reachable = false;
    report.response_class = "network_error";
    report.error_name = error instanceof Error ? error.name : "unknown";
  }

  console.log(JSON.stringify(report, null, 2));
}

await main();
