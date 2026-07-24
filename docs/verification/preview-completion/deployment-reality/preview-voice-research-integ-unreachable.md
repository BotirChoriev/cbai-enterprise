# Preview broker unreachable — diagnosis

**Host under test:** `https://preview-voice-research-integ.cbai-enterprise.pages.dev`
**Broker base (operator):** `…/api/voice` (client POSTs `…/api/voice/session`)
**Date:** 2026-07-22
**Local `doctor:voice`:** PASS (localhost broker) — unrelated to Preview.

## Executive root cause

Unauthenticated probes to this Preview host show **Cloudflare Access** intercepting `/api/voice/session` with **302 → Access login HTML**. The Voice client uses `redirect: "manual"` and classifies many non-JSON / blocked responses as UI **`unreachable`** (“The secure voice backend is unreachable.”).

Local doctor PASS only proves `.dev.vars` + `127.0.0.1:8788`. It does **not** validate Preview Pages Functions, Preview build vars, or Access policy.

**This agent cannot redeploy:** no `CLOUDFLARE_API_TOKEN` / Wrangler auth / valid `gh` token in the environment.

---

## Probe evidence (no secrets)

| Check | Result | Classification |
|-------|--------|----------------|
| `GET /` | 200 Access login HTML | Cloudflare Access |
| `GET /api/voice/session` | **302** HTML → Access login Location | Access redirect (not broker JSON) |
| `OPTIONS /api/voice/session` | **403** Cloudflare HTML | Access / edge block (CORS preflight dies) |
| `POST /api/voice/session` | **302** Access login | Access redirect |
| `GET /api/voice` | **302** Access | No public Function JSON |

Location host (query redacted):
`https://cbai-enterprise-pages.cloudflareaccess.com/cdn-cgi/access/login/preview-voice-research-integ.cbai-enterprise.pages.dev`

---

## How the UI gets “unreachable”

Client: `fetch(brokerUrl + "/session", { redirect: "manual" })` → `classifyBrokerHttpResponse` → `mapBrokerCodeToIssue`.

| HTTP reality | Client code | UI issue / copy |
|--------------|-------------|-----------------|
| 302 Access | `AUTHENTICATION_FAILED` | auth-failed notice (not unreachable) |
| 403 (Access HTML **or** `origin_blocked` JSON) | `ORIGIN_BLOCKED` | **`unreachable`** ← same user-facing string |
| Network / CORS failure | `ERROR` | **`unreachable`** |
| 404 HTML (no Function) | `ERROR` | **`unreachable`** |
| 503 `backend_required` | `BACKEND_REQUIRED` | backend required |
| Missing `NEXT_PUBLIC_VOICE_BROKER_URL` | `BACKEND_REQUIRED` | backend required |

So the exact string the user reported is consistent with **403 origin/Access**, **CORS/network**, or **missing Function response** — not with a healthy ephemeral mint.

---

## Checklist answers

### 1. Cloudflare Pages deployment status
**EXTERNAL_BLOCKED** without dashboard/API token. Host resolves and Access app exists → deployment almost certainly exists, but commit/health not confirmed via Wrangler.

### 2. Worker/Function logs
**EXTERNAL_BLOCKED** — no CF API access. Source in repo: `functions/api/voice/session.ts` (Pages Function for `/api/voice/session`).

### 3. `NEXT_PUBLIC_VOICE_BROKER_URL`
Must be **build-time** on this Preview:

`https://preview-voice-research-integ.cbai-enterprise.pages.dev/api/voice`

- Must match the **exact** Preview origin users open (not localhost, not production, not a different branch alias unless CORS+origins allow it).
- Changing it requires a **Preview rebuild**.
- Local `.env.local` points at **127.0.0.1** (doctor only) — irrelevant to Preview.

### 4. Is `/api/voice` deployed and responding?
**Not proven through Access.** Unauthenticated traffic never reaches Function JSON. After Access login, Network tab must show `POST …/api/voice/session` with `Content-Type: application/json` (not HTML).

### 5. Fix + redeploy
**Cannot execute from this environment.** Operator steps below.

---

## Operator fix sequence (Preview only — do not touch production/main)

1. **Cloudflare Zero Trust / Access**
   - Either complete Access login in the same browser before testing Voice, **or** add a Bypass policy for `https://preview-voice-research-integ.cbai-enterprise.pages.dev/api/voice*` (service token / bypass for that path) so `fetch` is not redirected to HTML.
   - Confirm API requests send Access cookies (`credentials` same-origin) or use a bypass.

2. **Pages → Preview settings (this branch/deployment)**
   - **Build variable:** `NEXT_PUBLIC_VOICE_BROKER_URL=https://preview-voice-research-integ.cbai-enterprise.pages.dev/api/voice`
   - **Runtime secrets:** `OPENAI_API_KEY` set; `VOICE_ALLOWED_ORIGINS` includes exactly:
     `https://preview-voice-research-integ.cbai-enterprise.pages.dev`
     (plus any hash deploy origin you also use).

3. **Rebuild & redeploy Preview** after any `NEXT_PUBLIC_*` change.

4. **Verify in DevTools (after Access)**
   - `POST /api/voice/session` → **200** JSON with `clientSecret` field present (do not copy/share value).
   - If **403** JSON `origin_blocked` → fix `VOICE_ALLOWED_ORIGINS` (runtime; no rebuild).
   - If **503** `backend_required` → missing `OPENAI_API_KEY` or empty origins.
   - If **302/HTML** → still Access.

5. Re-test Voice Operator; “unreachable” should clear once JSON 200 is returned.

---

## Explicit limits

- No commit / no production deploy / main untouched from this diagnosis.
- Redeploy **blocked** here: missing Cloudflare API credentials.
- Secrets not printed.
