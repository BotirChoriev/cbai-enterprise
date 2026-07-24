# Remove Cloudflare Access from Preview (keep Production)

**Why code cannot fix this:** Access is an edge gate on `*.cbai-enterprise.pages.dev` Preview hosts. It returns **HTTP 302 HTML** to `cbai-enterprise-pages.cloudflareaccess.com` before the Pages Function runs. No app commit can bypass that.

**Production:** Custom domain (`checkbalanceai.global` / production branch) is **not** covered by the Pages “preview Access policy” toggle. Do **not** add Access to Production. Do **not** modify `main`.

## Preferred: disable Pages preview Access in the dashboard

You do **not** need a Zero Trust bypass policy for this.

1. Open [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages).
2. Open project **`cbai-enterprise`** (or the Pages project that owns `cbai-enterprise.pages.dev`).
3. **Settings → General**.
4. Find **Access policy** / **Enable access policy** for preview deployments.
5. **Disable** it (or Manage → delete the auto-created “Cloudflare Pages” Access application).

If Manage opens Cloudflare One and shows **“Finish your account setup”** / 404, use the API method below instead of finishing Zero Trust billing setup.

## API method (works without completing Zero Trust setup)

1. Create an API token: [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   Permission: **Account → Access: Apps and Policies → Edit**.
2. Copy **Account ID** from the dashboard URL: `dash.cloudflare.com/<ACCOUNT_ID>/...`
3. From repo root on `preview/voice-research-integration`:

```bash
export CLOUDFLARE_API_TOKEN='…'   # do not commit
export CLOUDFLARE_ACCOUNT_ID='…'
DRY_RUN=1 node scripts/disable-pages-preview-access.mjs   # list matches
node scripts/disable-pages-preview-access.mjs              # delete Pages Access app(s)
```

4. Verify Preview is public to the Function (not Access):

```bash
curl -sS -D - -o /tmp/voice.body -X POST \
  'https://preview-voice-research-integ.cbai-enterprise.pages.dev/api/voice/session' \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://preview-voice-research-integ.cbai-enterprise.pages.dev' \
  -d '{"language":"en","origin":"https://preview-voice-research-integ.cbai-enterprise.pages.dev"}'
```

- **Success path:** HTTP **200** `application/json` with `clientSecret` (redact), or **403/503** JSON from the broker (`origin_blocked` / `backend_required`) — still proves Access is gone.
- **Still broken:** HTTP **302** + `cloudflareaccess.com` Location.

## After Access is removed

Runtime on this Preview (Pages project vars — not git):

- `OPENAI_API_KEY` set
- `VOICE_ALLOWED_ORIGINS` includes `https://preview-voice-research-integ.cbai-enterprise.pages.dev` (and optionally `https://*.cbai-enterprise.pages.dev`)
- Build: `NEXT_PUBLIC_VOICE_BROKER_URL=https://preview-voice-research-integ.cbai-enterprise.pages.dev/api/voice`

No `main` / Production deploy required for this change.
