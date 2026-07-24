# Legal & policy surfaces — Draft — requires legal review

**Status:** Draft architecture / product copy only. **Not** legally approved.
**Production public release:** EXTERNAL_BLOCKED until counsel review.

## Surfaces (product)

| Topic | Route / owner | Status |
|-------|---------------|--------|
| Privacy Policy | `/trust` + this draft | Draft |
| Terms of Use | `/trust` + this draft | Draft |
| Cookie/session disclosure | Settings / Auth | Draft |
| Voice/microphone disclosure | Voice Operator dock + Settings | Implemented UX copy; legal text Draft |
| File processing disclosure | Scientific intake | Draft |
| Data retention | organization-os / storage contracts | Architecture only |
| Account deletion/export | Account settings path | PENDING / EXTERNAL_BLOCKED for cloud delete |
| Copyright/DMCA-style reporting | Publication workflow SF-5 | Architecture; counsel EXTERNAL_BLOCKED |
| Publication moderation | Visibility + rights confirmation | Partial code; legal EXTERNAL_BLOCKED |
| Research integrity | Evidence provenance policy | Architecture |
| Responsible AI limitation | Voice identity + instructions | Product enforced; legal Draft |
| Human decision authority | FDE confirmation Level 3 | Product enforced |

## Non-negotiable product rules (already coded)

- Private by default
- No auto-publication
- Voice Level 3 cannot finalize publication without confirmation
- No silent translation of user content
- Virus scan unavailable → EXTERNAL_BLOCKED, never claim “safe”

## Counsel checklist (human)

1. Review Privacy / Terms English + localized summaries
2. Approve microphone / Realtime / file processing disclosures
3. Approve DMCA/takedown contact path
4. Approve retention and deletion timelines

Until then: label all legal pages **“Draft — requires legal review”**.
