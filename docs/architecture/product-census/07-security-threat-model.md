# Security threat model (census)

**Claim level:** PARTIAL static review of architecture and known code paths. Not a penetration test. Not “secure.”

## Assets

- User projects, missions, OO, research notes, org memberships (localStorage / optional Supabase)
- Auth credentials (device-local password hashes; Supabase sessions)
- Voice transcripts / mic streams
- Ephemeral OpenAI Realtime keys
- Evidence/knowledge source metadata
- Future forensic originals (not implemented)

## Threats and current posture

| Threat | Current posture | Evidence | Priority |
|--------|-----------------|----------|----------|
| Account takeover | Device-local hashes in `localStorage`; cloud depends on Supabase | `lib/auth/auth-store.ts` | High for prod |
| IDOR / cross-workspace leak | Client-side filters; RLS only if Supabase configured | migrations `0002`, `0006`; many stores | High |
| Broken role enforcement | UI roles on `/teams` drafts; org memberships client-side | CAP-018/024 | High |
| Invitation abuse | Invitations in localStorage / optional cloud | org invitation store | Medium |
| Malicious uploads / malware / zip bombs / oversized files | No real upload pipeline PROVEN | scientific-intake metadata only | Latent High |
| XSS in documents/comments | React defaults help; rich HTML UNVERIFIED | comments PLACEHOLDER | Medium |
| CSRF | Static export; cookie auth patterns limited; Supabase cookie flows need review | UNVERIFIED | Medium |
| CORS errors / misconfig | Voice broker CORS/origin checks | `pages-voice-session-broker.ts` | Medium |
| SSRF | Broker calls OpenAI; user URL fetch in connectors UNVERIFIED | REQUIRES_HUMAN_REVIEW | Medium |
| Prompt injection in uploads/docs | Voice/tools + future docs | platform-actions allowlist helps | High |
| Secret exposure | Broker refuses sk in responses; `.dev.vars` excluded from audit | broker + `.gitignore` | High ops |
| Insecure signed URLs | N/A until object storage | EXTERNAL | — |
| Public-link leakage | ShareButton / publication stubs | `components/shared/ShareButton.tsx` PARTIAL | Medium |
| Audit log tampering | Client-writable audit keys | org/collab/genesis audit stores | High for forensics |
| Unauthorized publication | `/publications` confirmation UI only; not durable | CAP-024 | High |
| Accidental AI disclosure | Voice may narrate on-screen context | operator policy PARTIAL | High |
| Voice-session persistence / stale mic | Lifecycle tests; survive-nav policy | `test-voice-session-lifecycle`; provider | High |
| Abusive automated commands | Action registry + levels + confirm | `lib/platform-actions`, action-levels | Medium |
| Data deletion / backup failure | No backup product PROVEN | localStorage fragility | High |
| Insider access | Single-tenant browser model | n/a | Medium cloud |

## Voice broker specific (UNSAFE cluster)

`functions/api/voice/session.ts` mints ephemeral Realtime credentials based on **origin allowlist**, not end-user authentication. Missing: per-user auth, rate limits, abuse quotas. Misconfigured `VOICE_ALLOWED_ORIGINS` can burn spend.

## Recommendations (design — not implemented here)

- Least privilege; RBAC + contextual ABAC for forensics/publication
- MFA for privileged and forensic roles
- Server-side authorization on every mutation (Supabase RLS or equivalent) — **CSS-disabled buttons are not authorization**
- TLS in transit; encryption at rest for cloud objects
- Expiring signed URLs; file-type validation; malware scanning; upload limits/quotas
- Rate limiting on broker and APIs; CSRF controls; strict CORS; CSP + output encoding
- Secret scanning; session revocation; append-only audit trail
- Backup/restore tests; incident-response workflow; deletion/export requests
- Privacy-by-default; retention; legal holds

## Product Access Model (five layers) — security view

1. **Public/Guest** — catalogs only; Operator Level 0–1; no private memory.
2. **Personal Cabinet** — private-by-default; explicit control; no silent profile mutation.
3. **Team Workspace** — roles + invitations + per-object ACL + audit.
4. **Publication Registry** — explicit confirm, co-author consent, embargo, takedown.
5. **Restricted Evidence Integrity / Forensics** — high-assurance auth, immutable originals, CoC — **not built**.

Unregistered users: public/general only. Operator may explain account-required features but must not fabricate accounts/teams (`auth-action-policy` intent).
