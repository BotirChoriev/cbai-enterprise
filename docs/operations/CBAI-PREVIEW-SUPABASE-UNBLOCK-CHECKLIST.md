# Preview Supabase unblock checklist

**Branch:** `preview/voice-research-integration`  
**Purpose:** Operator-only steps to unblock live multi-user collaboration proof.  
**Rule:** Never commit secrets. Never put DB URL / service role / passwords in `NEXT_PUBLIC_*`.

---

## A. Cloudflare Pages — Preview build/runtime only

In Cloudflare Dashboard → Workers & Pages → `cbai-enterprise` → Settings → Environment variables:

| Variable | Environment | Required | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Preview only** | Yes | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Preview only** | Yes | anon/public key (RLS protects data) |

Do **not** add these to Production unless separately authorized.

After setting, trigger a new Preview deployment for `preview/voice-research-integration`.

---

## B. Operator machine only (migration apply)

Create a local untracked file (already gitignored), e.g. `.env.local` or shell export:

| Variable | Required | Notes |
|---|---|---|
| `SUPABASE_DB_URL` | Yes for apply | Postgres URI from Preview Supabase → Settings → Database |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes for verify | Same Preview project as Pages |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes for verify | Same Preview project as Pages |

Never commit `.env.local`. Never use Production DB URL.

---

## C. Live test credentials (Preview-only users)

| Variable | Role |
|---|---|
| `CBAI_TEST_USER_A_EMAIL` / `CBAI_TEST_USER_A_PASSWORD` | Owner/admin |
| `CBAI_TEST_USER_B_EMAIL` / `CBAI_TEST_USER_B_PASSWORD` | Invited collaborator |
| `CBAI_TEST_USER_C_EMAIL` / `CBAI_TEST_USER_C_PASSWORD` | Unrelated org user |
| `CBAI_TEST_BASE_URL` | Preview alias, e.g. `https://preview-voice-research-integ.cbai-enterprise.pages.dev` |

Create users in the **Preview** Supabase Auth panel only. Do not reuse production accounts.

---

## D. Optional

| Variable | Where | Purpose |
|---|---|---|
| `RESEND_API_KEY` | Cloudflare Pages Function secrets | Real invitation email |
| `INVITE_EMAIL_FROM` | Pages Function secrets | Sender identity |

If absent: invitation remains valid; UI must say “Email delivery not configured”; Preview copy-link only.

---

## E. Apply order (only when preflight `okToApply: true`)

Preview project may be empty. `npm run apply:enterprise-migrations` auto-detects:

- **No `organizations` table** → apply `0001`…`0010` (skips `0003` verification SELECTs)
- **Orgs present, `storage_objects` missing** → resume `0008` then `0009`/`0010`
- **`organizations` already present with storage** → apply `0009` then `0010` only

```bash
npm run preflight:enterprise-migration
npm run apply:enterprise-migrations
```

Stop if preflight reports blockers. Never point `SUPABASE_DB_URL` at Production.

---

## F. Verification gate before claiming live collaboration

All must be true:

1. Preview Supabase URL + anon key active in Pages Preview  
2. Migrations 0009 and 0010 applied and verified live  
3. `SupabaseCollaborationRepository` selected in a real cloud session  
4. User A and User B collaborate successfully  
5. User C denied by live RLS  
6. Cross-org ID manipulation denied  
7. Preview deployment verified for the expected commit  
