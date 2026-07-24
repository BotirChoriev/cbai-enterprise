# Unknowns and blockers

## Unknowns (UNVERIFIED)

1. Full UI string coverage across EN/UZ/RU/TR on every panel (locale plumbing PROVEN; completeness PARTIAL).
2. Whether any hidden dynamic import reaches `lib/intelligence/**` outside static app/components graph.
3. Production Supabase project configuration and RLS effectiveness in the deployed environment (EXTERNAL).
4. Exact genesis surfaces still mounted in default My Work vs dead stores.
5. ShareButton / public link behavior matrix per entity.
6. CSRF/CSP headers as served by Cloudflare Pages in production.
7. Reduced-motion and 400% zoom behavior on spatial globe + dense evidence panels.
8. Whether `/analytics`, `/dashboard`, `/core`, `/workflows` retain unique PROVEN value vs pure legacy.
9. Completeness of cloud outbox sync for projects/missions when both modes used.
10. Live OpenAI Realtime E2E on Safari/Chrome with valid broker secrets (often EXTERNAL_BLOCKED).

## Blockers (EXTERNAL_BLOCKED or REQUIRES_HUMAN_REVIEW)

| Blocker | Type | Impact |
|---------|------|--------|
| Valid voice broker credentials / spend controls for live Realtime proof | EXTERNAL_BLOCKED | Cannot claim voice audio PROVEN end-to-end |
| Object storage provider choice | EXTERNAL_BLOCKED | Blocks Stage 5 |
| Legal counsel for Terms/Privacy/publication/forensics jurisdiction | REQUIRES_HUMAN_REVIEW | Blocks Stages 6–7 and production claims |
| Security review of origin-only voice mint | REQUIRES_HUMAN_REVIEW | Blocks safe preview scale-up |
| Human approval to quarantine/archive/delete candidates | REQUIRES_HUMAN_REVIEW | Blocks Stage 2 cleanup |
| Backup ownership for user localStorage data | REQUIRES_HUMAN_REVIEW | Blocks Stage 0 completion in real ops |
| Product decision: cloud-required vs device-local for team features | REQUIRES_HUMAN_REVIEW | Blocks Stage 4 policy |
| Policy lock on voice session survive-nav vs teardown | REQUIRES_HUMAN_REVIEW | Docs/tests previously oscillated; code currently survives internal nav |

## Explicit non-claims

- Not production-ready.
- Not secure-by-default.
- Not courtroom-admissible.
- Not feature-complete for collaboration/forensics/feedback.
