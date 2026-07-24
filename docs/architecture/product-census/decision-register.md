# Decision register — Product Census 2026-07-22

Decisions below are **audit recommendations**. Implementation requires separate human approval.

| ID | Decision | Status | Evidence |
|----|----------|--------|----------|
| D-001 | Work only on `preview/spatial-world-intelligence`; do not touch `main` | ACCEPTED for this audit | git branch |
| D-002 | Audit outputs only under `docs/architecture/product-census/` | ACCEPTED | this folder |
| D-003 | Canonical orchestration = Voice Operator + platform-actions + FDE | RECOMMENDED | layout providers; tests |
| D-004 | Quarantine `lib/intelligence/**` as non-UI (no new app imports) | RECOMMENDED | zero app/components imports |
| D-005 | Canonical evidence UI = explorer/infra/gap/comparison/runtime at `/knowledge` | RECOMMENDED | nav + EvidenceExplorer |
| D-006 | Research evidence MERGEs types later; do not delete research keys | RECOMMENDED | `lib/research/*` stores |
| D-007 | Canonical graph = `lib/graph` + LON + living-graph | RECOMMENDED | `/graph` |
| D-008 | Government ≠ Governance — keep both | RECOMMENDED | routes + intent-matcher |
| D-009 | Organization-os is canonical team/org; quarantine UI-orphaned `lib/collaboration` growth | RECOMMENDED | import graph |
| D-010 | Device-local auth is demo-tier; not production identity alone | RECOMMENDED | `lib/auth/auth-store.ts` |
| D-011 | Voice broker must gain user auth + rate limits before scaled preview | RECOMMENDED | `functions/api/voice/session.ts` |
| D-012 | Forensic workspace is design-only until Stage 7; not `/knowledge` | RECOMMENDED | CAP-032 |
| D-013 | Feedback system does not exist — design Stage 8 | RECOMMENDED | CAP-031 |
| D-014 | First implementation stages after approval: 0 → 1 → 2 only | RECOMMENDED | `15-*.md` |
| D-015 | No commit/push/deploy from this census | ACCEPTED | safety rules |
| D-016 | Voice action levels 0–3 with accessible confirmation for 2–3 | RECOMMENDED | action-levels + FDE confirm |
| D-017 | Nav “Evidence” href remains `/knowledge` until redirect plan approved | RECOMMENDED | `lib/navigation.ts` |
| D-018 | Build numbered docs are historical, not proof of completeness | ACCEPTED | Phase C |
| D-019 | DELETE_CANDIDATE items require explicit future approval | ACCEPTED | Phase N |
| D-020 | Unknown fields and user text preservation are non-negotiable in migrations | RECOMMENDED | locale-provenance-policy |

## Open decisions (need human)

- Cloud-required for teams?
- Survive-nav voice session as permanent policy?
- Timeline for external security/legal review?
- Whether to hide `/agents` immediately?
