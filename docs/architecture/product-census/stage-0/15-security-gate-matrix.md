# Security gate matrix (Stage 0.5)

Documentation only — **no security fixes implemented**.
Do not claim the platform is secure or production-ready.

| ID | Risk | Affected modules | Present mitigation | Missing control | Blocks Stage 1 contracts? | Blocks Stage 2 consolidation? | Production blocker | Required future owner |
|----|------|------------------|--------------------|-----------------|---------------------------|-------------------------------|--------------------|----------------------|
| **SF-1** | Voice broker mints ephemeral Realtime credentials with **origin allowlist only** → spend/abuse | `functions/api/voice/session.ts`; `lib/voice-operator/session-broker/pages-voice-session-broker.ts`; local `scripts/local-voice-broker.mjs` | Origin CORS/allowlist; refuses returning `sk-*`; body size cap | End-user auth on mint; rate limits; quotas; abuse monitoring | **No** — contracts/docs OK | **Partial** — must not expand broker surface without plan | **Yes** | Voice broker / platform security owner |
| **SF-2** | Device-local sign-in treated as collaboration trust | `lib/auth/auth-store.ts`; auth-collab routes; `AuthProvider` | Honest dual-mode labeling in places; guest action policy PARTIAL | Server-verified identity for team/publish/forensics; cloud-required gates | **No** — Stage 1 may define trust interfaces | **Yes** for consolidating team stores as “shared” | **Yes** for team features | Auth + organization-os |
| **SF-3** | Client-writable audit history | `cbai-organization-audit`, `cbai-collaboration-audit`, `cbai-genesis-audit`, `cbai-ontology-audit` | Audit events recorded in UX flows | Append-only server log; integrity hashing; non-repudiation | **No** | **Yes** if claiming forensic/audit integrity | **Yes** for forensics/compliance claims | Audit / forensics owner |
| **SF-4** | Incomplete IDOR / RLS / object authorization | Static export; localStorage stores; optional `supabase/migrations/*` RLS | RLS SQL exists for cloud path; namespaced keys reduce casual collision | Server authz on every mutation; object ACL; tested IDOR suite in prod config | **No** — type-level ownership OK | **Yes** for merging stores across users/workspaces | **Yes** for multi-user cloud | Supabase/persistence + org-OS |
| **SF-5** | Missing publication rights/consent workflow | `components/publications/PublicationReadinessClient.tsx`; voice Level 3 | Confirmation checkboxes in UI; private-by-default intent | Durable rights object; co-author consent; embargo/takedown; no voice auto-publish enforcement as sole gate | **No** — interface types OK | **Yes** for enabling publish consolidation | **Yes** for public registry | Publication / rights owner |

## Notes

- Stage 1 **must not hide** these blockers (document in contracts).
- Stage 1 **must not implement** broker auth, RLS rollout, or publication enablement (those are later stages).
- CSS-disabled buttons are **not** authorization.
