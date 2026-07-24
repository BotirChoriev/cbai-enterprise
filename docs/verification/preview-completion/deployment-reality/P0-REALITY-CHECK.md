# P0 Preview Deployment Reality Check

**Date:** 2026-07-22
**Branch:** `preview/spatial-world-intelligence`
**HEAD:** `18a8c23b99ace725c43cfa384141ae7799643c28`
**Policy:** No commit / push / production deploy / main changes. No product code changes (none proven as preview-only defects).

---

## 1. Git state

| Item | Value |
|------|-------|
| Branch | `preview/spatial-world-intelligence` |
| HEAD | `18a8c23` (`docs: add architecture census and preview verification`) |
| Parent product commit | `e918ef1` (`feat: integrate spatial intelligence voice and operational workflows`) — ancestor of HEAD |
| Working tree | **DIRTY** — uncommitted Preview Completion work + prior excluded untracked artifacts |
| Deployed commit (stated) | `18a8c23` |
| Local `main` tip | `20da65e` (not touched) |
| Production commit cited by operator | `d09b25e` (present in repo history; production domain not modified) |

**Important:** Dirty local tree does **not** affect the already-deployed Preview at `18a8c23`. Uncommitted Preview Completion broker hardening is **not** on that deployment.

---

## 2. Commit `18a8c23` feature presence (tree verified)

| Capability | Present at `18a8c23`? | Evidence |
|------------|----------------------|----------|
| Spatial World UI + globe | **Yes** | `components/spatial-world/*`; `PlatformHome` → `SpatialWorldIntelligenceHome` |
| Voice Operator | **Yes** | `components/voice-operator/*`; wired in `app/(dashboard)/layout.tsx` |
| Operational Object System | **Yes** | `components/operational-objects/*`; provider in dashboard layout |
| Localization EN/UZ/RU/TR | **Yes** | `lib/i18n/` (148 files in tree) |
| Stage 1 canonical contracts | **Yes** | `lib/canonical-contracts/*` (16 files) |
| Pages Function broker source | **Yes** | `functions/api/voice/session.ts` |
| Static export | **Yes** | `next.config.ts` `output: "export"` (UI static; broker via Pages Functions) |

---

## 3. Product code changes this check

**None.** No preview-only product defect was proven that required a code fix. Blocker is environment/Access/operator URL selection.

---

## 4. Stable Cloudflare branch alias

| URL | Role | Access |
|-----|------|--------|
| `https://preview-spatial-world-intelligence.cbai-enterprise.pages.dev` | **Stable branch alias** for `preview/spatial-world-intelligence` | **Cloudflare Access** login required |
| `https://d0fec898.cbai-enterprise.pages.dev` | Deployment-specific hash URL (same Preview family) | **Cloudflare Access** login required |
| `https://spatial-world-intelligence.cbai-enterprise.pages.dev` | Alternate slug (also Access-gated) | Access |
| `https://checkbalanceai.global` | Production custom domain | No Access; **old** production surface |
| `https://cbai-enterprise.pages.dev` | Production Pages default | No Access; same production-era app title |

**Operator guidance:** Prefer the **stable alias**, not production. Hash URL is fine for a specific deployment but Access still applies.

---

## 5–7. Preview environment audit (names only — no secret values)

| Variable | Kind | Expected for Preview | Verified live? |
|----------|------|----------------------|----------------|
| `NEXT_PUBLIC_VOICE_BROKER_URL` | **Build-time** public | `https://preview-spatial-world-intelligence.cbai-enterprise.pages.dev/api/voice` (or matching hash host + `/api/voice`) | **EXTERNAL_BLOCKED** — cannot read CF dashboard or authenticated JS bundle without Access |
| `OPENAI_API_KEY` | **Runtime** secret (Pages Function) | Set in Preview encrypted env; never in browser | **EXTERNAL_BLOCKED** — not probed for values |
| `VOICE_ALLOWED_ORIGINS` | **Runtime** | Must include exact Preview origins used in browser, e.g. `https://preview-spatial-world-intelligence.cbai-enterprise.pages.dev` **and** optionally `https://d0fec898.cbai-enterprise.pages.dev` | **EXTERNAL_BLOCKED** until Access JWT + JSON broker response |

Repo contract (`.env.example` / `.dev.vars.example`) documents these names. Values were **not** printed.

If `NEXT_PUBLIC_VOICE_BROKER_URL` is missing or points at localhost/production, a **new Preview rebuild** is required after correcting the **build** variable (build-time inlining).

---

## 8–9. `/api/voice/session` as Pages Function + safe probes

**Source at `18a8c23`:** `functions/api/voice/session.ts` → `handleVoiceSessionBrokerRequest`.

### Unauthenticated Preview (hash) probes

| Method | Result | Classification |
|--------|--------|----------------|
| GET | 302 HTML Access login | **Cloudflare Access redirect** |
| OPTIONS | 403 Access/edge HTML | **Cloudflare Access redirect** (not broker JSON) |
| POST | 302 HTML Access login | **Cloudflare Access redirect** |

**Conclusion:** Broker JSON behavior (origin_blocked / backend_required / invalid_api_key / success) **cannot** be classified until a human Access session exists. HTML redirect ≠ missing Function by itself.

### Production contrast (curl only; no production mutations)

| Host | POST `/api/voice/session` | Classification |
|------|---------------------------|----------------|
| `checkbalanceai.global` | **405** empty body | Production does **not** expose working voice broker Function (explains “no Voice Operator” on production) |
| `cbai-enterprise.pages.dev` | GET returns SPA HTML | Static production app; not Preview Spatial Voice stack |

---

## 10. Failure taxonomy (how to distinguish after Access)

| Symptom | Classification |
|---------|----------------|
| Browser shows “Sign in · Cloudflare Access” / `cdn-cgi/access/login` | **Cloudflare Access redirect** |
| App loads but Voice stays backend-required; Network has no broker host | **Missing build variable** `NEXT_PUBLIC_VOICE_BROKER_URL` → rebuild |
| Broker POST JSON `error: backend_required` (503) | **Missing runtime secret** `OPENAI_API_KEY` and/or empty `VOICE_ALLOWED_ORIGINS` |
| Broker POST JSON `error: origin_blocked` (403) | **Blocked origin** — add exact Preview origin to `VOICE_ALLOWED_ORIGINS` (runtime; may not need full rebuild if only runtime vars change) |
| Broker POST JSON `error` classified invalid_api_key / quota | **Invalid OpenAI credential** / quota |
| Network failure / 5xx without JSON | **Broker unavailable** |
| Browser permission prompt denied | **Microphone permission failure** |
| Broker 200 but SDP/WebRTC fails | **WebRTC failure** |
| User opened `checkbalanceai.global` | **Wrong environment** (production) — not a Preview Voice defect |

---

## 11. Rebuild recommendation

- Changing **`NEXT_PUBLIC_VOICE_BROKER_URL`** → **must trigger a new Preview rebuild**.
- Changing only **`OPENAI_API_KEY`** / **`VOICE_ALLOWED_ORIGINS`** (runtime) → usually **no** full rebuild; wait for Functions binding update; retest POST.
- Recommended broker URL for stable alias:
  - `https://preview-spatial-world-intelligence.cbai-enterprise.pages.dev/api/voice`
- Recommended `VOICE_ALLOWED_ORIGINS` entries (exact HTTPS origins, comma-separated):
  - `https://preview-spatial-world-intelligence.cbai-enterprise.pages.dev`
  - `https://d0fec898.cbai-enterprise.pages.dev` (if operators use hash links)

---

## 12. Safari / UI verification on Preview

| Check | Status |
|-------|--------|
| Open Preview URL (not production) | **Blocked** by Cloudflare Access for agent browser |
| New CBAI logo / Spatial globe / Voice Operator / nav / EN·UZ·RU·TR / mic / audible / Stop·Close | **MANUAL_REQUIRED** after Access login in Safari |
| Agent Chromium | Reached Access login only — screenshot saved |

This agent **cannot** complete Safari VoiceOver/mic hardware checks without your Access login.

---

## 13. Evidence artifacts

| Artifact | Path / note |
|----------|-------------|
| Probe summary | `docs/verification/preview-completion/deployment-reality/probe-summary.txt` |
| Access gate screenshot | `docs/verification/preview-completion/deployment-reality/01-preview-access-gate.png` |
| Network classification | Access HTML/302 on Preview broker; production POST 405 |

No API keys, ephemeral credentials, or signed URLs captured.

---

## 14. Exact root cause

**Primary root cause of the user’s “old UI / no Voice Operator” observation:**
They tested **production** (`checkbalanceai.global` / production Pages), which is still the **pre–Spatial Voice** surface and does **not** serve a working `/api/voice/session` broker (POST **405**).

**Primary root cause blocking agent Preview verification of Voice:**
Preview hosts (`d0fec898…` and stable alias `preview-spatial-world-intelligence…`) are behind **Cloudflare Access**. Unauthenticated requests never reach the app or JSON broker — they get Access login HTML.

**Not proven (yet):** missing `NEXT_PUBLIC_VOICE_BROKER_URL`, wrong origins, or bad OpenAI key on Preview — those require Access-authenticated Network tab / broker JSON.

---

## 15. Remaining blockers (EXTERNAL / MANUAL)

1. **Human Cloudflare Access login** to Preview (stable alias preferred).
2. After Access: confirm build-time broker URL + runtime secrets/origins (dashboard or Network).
3. If build var wrong → **rebuild Preview**.
4. Safari checklist: logo, globe, Voice, mic audio, nav Research/Countries/My Work, session survival, Stop/Close, locales.
5. Do **not** use `checkbalanceai.global` for this acceptance.

---

## Explicit confirmations

- No commit
- No push
- No production deploy
- main untouched
- Secrets not printed
- No product code changes in this check

**Stop for human approval** — please Access-login Preview and share whether Voice dock appears; then we can classify broker JSON without touching main.
