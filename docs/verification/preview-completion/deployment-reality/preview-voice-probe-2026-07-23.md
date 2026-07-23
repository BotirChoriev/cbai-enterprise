# Preview Voice probe — 2026-07-23

**Host:** `https://preview-voice-research-integ.cbai-enterprise.pages.dev`  
**Method:** unauthenticated `curl` (no Access session cookies)  
**Secrets:** not printed

## Checklist

| # | Check | Result |
|---|--------|--------|
| 1 | `POST /api/voice/session` → HTTP 200 JSON | **FAIL** — **HTTP 302**, `text/html`, Cloudflare Access login |
| 2 | Cloudflare Access not blocking | **FAIL** — Access **is** blocking; `Location` → `cbai-enterprise-pages.cloudflareaccess.com/cdn-cgi/access/login/…` |
| 3 | `NEXT_PUBLIC_VOICE_BROKER_URL` resolves | **PARTIAL** — same-origin `/api/voice` is the intended client target; unauthenticated traffic never reaches Function JSON, so build-time resolve cannot be proven from this probe |
| 4 | `OPENAI_API_KEY` at runtime | **EXTERNAL_BLOCKED** — Access prevents Function responses; cannot confirm 503 `backend_required` vs 200 mint |
| 5 | Exact status + body | below |

## Exact probe responses

### `POST /api/voice/session`

- **Status:** `302`
- **Content-Type:** `text/html; charset=UTF-8`
- **Location:** `https://cbai-enterprise-pages.cloudflareaccess.com/cdn-cgi/access/login/preview-voice-research-integ.cbai-enterprise.pages.dev?…&redirect_url=%2Fapi%2Fvoice%2Fsession`
- **WWW-Authenticate:** `Cloudflare-Access resource_metadata="…/api/voice/session"`
- **Body:**

```html
<html>
<head><title>302 Found</title></head>
<body>
<center><h1>302 Found</h1></center>
<hr><center>cloudflare</center>
</body>
</html>
```

### `OPTIONS /api/voice/session` (CORS preflight)

- **Status:** `403`
- **Content-Type:** `text/html; charset=UTF-8`
- **Body:**

```html
<html>
<head><title>403 Forbidden</title></head>
<body>
<center><h1>403 Forbidden</h1></center>
<hr><center>cloudflare</center>
</body>
</html>
```

### `GET /`

- **Status:** `302` → same Access login host (HTML gate)

## Root cause

Cloudflare Access sits in front of the entire Preview host, including `/api/voice/session`. Unauthenticated mint calls never hit the Pages Function; they get Access HTML/redirects. After Access login, a remaining failure mode was strict `VOICE_ALLOWED_ORIGINS` (hash vs branch alias → `origin_blocked` → UI “unreachable”).

## Code follow-up on this branch

- Soft-allow HTTPS Origins under `*.cbai-enterprise.pages.dev` when the Function host is also that project.
- Classify fetch `opaqueredirect` / status `0` as `AUTHENTICATION_FAILED` (Access), not generic unreachable.

## Operator (still required for live 200 JSON)

1. Access-login Preview **or** Bypass `/api/voice*` in Zero Trust.
2. Runtime: `OPENAI_API_KEY`; `VOICE_ALLOWED_ORIGINS` include Preview origin (wildcard optional with soft-allow).
3. DevTools after Access: `POST /api/voice/session` → **200** `application/json` (redact `clientSecret`).
