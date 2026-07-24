# Security freeze — release blockers (Stage 0)

**Do not claim the platform is secure or production-ready.**
These items are **release blockers** for any scaled/preview claim beyond local engineering use.

| ID | Blocker | Evidence | Why blocked |
|----|---------|----------|-------------|
| SF-1 | Voice broker credential minting authorized by **origin allowlist only** | `functions/api/voice/session.ts`, `lib/voice-operator/session-broker/pages-voice-session-broker.ts` | Unauthenticated callers from allowed origins can mint ephemeral Realtime credentials → spend/abuse |
| SF-2 | Device-local auth treated as collaboration trust | `lib/auth/auth-store.ts`; collab page gates using `isSignedIn` | Browser-local hashes are not server-verified identity |
| SF-3 | Client-writable audit keys | `cbai-organization-audit`, `cbai-collaboration-audit`, `cbai-genesis-audit`, `cbai-ontology-audit` | Audit trail not append-only or integrity-protected |
| SF-4 | Incomplete IDOR / RLS enforcement | Static export + optional Supabase; many mutations are localStorage-only | Cross-workspace isolation not server-enforced in Local Mode |
| SF-5 | Missing publication copyright/rights workflow | `components/publications/PublicationReadinessClient.tsx` in-memory checklist | No durable rights/co-author/embargo/takedown model |

Related census: `docs/architecture/product-census/07-security-threat-model.md`.

Stage 0 does **not** remediate these. Remediation belongs to later stages after human approval.
