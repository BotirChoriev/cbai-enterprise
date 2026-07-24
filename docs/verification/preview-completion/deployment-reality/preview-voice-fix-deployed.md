# Preview voice unreachable — fix deployed

**Branch pushed:** `preview/voice-research-integration` → `9a25738`
**Preview host:** `https://preview-voice-research-integ.cbai-enterprise.pages.dev`
**Production / main:** not modified

## Code fixes

1. **Same-origin broker URL** on `*.pages.dev` — browser always POSTs `{page.origin}/api/voice/session` when the build enables the broker, so hash vs branch-alias mismatches and missing Access cookies on cross-origin fetches are avoided. Local doctor (`127.0.0.1:8788`) unchanged.
2. **`credentials: "include"`** on mint fetch so Cloudflare Access session cookies are sent.
3. **`VOICE_ALLOWED_ORIGINS` wildcard** `https://*.cbai-enterprise.pages.dev` supported.
4. **403 HTML Access** classified as `AUTHENTICATION_FAILED` (not origin_blocked → “unreachable”).

## Operator runtime (Cloudflare Pages → this Preview)

After the new deploy finishes building:

1. **Build var** (rebuild if changed):
   `NEXT_PUBLIC_VOICE_BROKER_URL=https://preview-voice-research-integ.cbai-enterprise.pages.dev/api/voice`
2. **Runtime** `VOICE_ALLOWED_ORIGINS` should include at least:
   `https://preview-voice-research-integ.cbai-enterprise.pages.dev,https://*.cbai-enterprise.pages.dev`
3. Keep `OPENAI_API_KEY` set.
4. Access-login the Preview host before testing Voice (or bypass Access for `/api/voice*`).

## Verify

DevTools → `POST /api/voice/session` → **200** `application/json` (not HTML/302/403).
