# CBAI Production Readiness Report

**Status:** Preview / closed-alpha assessment only.  
**Production remains untouched.** This document does not authorize a production launch.

Last assessed: 2026-07-23  
Scope: `preview/voice-research-integration` and related preview surfaces.

---

## 1. Executive summary

CBAI is **not production-ready**. Core product surfaces exist in preview with honest empty/planned states, but launch blockers remain around secrets governance, end-to-end RLS verification on shared backends, backup/DR drills, retention policy enforcement, and payment/billing (billing is test-mode simulation only).

**Verdict:** Do not promote this codebase to Production until every blocker in §9 is cleared with evidence.

---

## 2. Security

| Area | Status | Notes |
|------|--------|-------|
| Auth (local + cloud gate) | Partial | Local mode and cloud account gate exist; production IdP hardening incomplete |
| Session cookies / tokens | Partial | Preview broker and Supabase patterns only |
| CSRF / origin checks | Partial | Voice broker origin allowlist exists for preview |
| Dependency audit | Planned | Run `npm audit` and license review before launch |
| Threat model | Planned | No signed production threat model yet |

Guidance:

- Never commit `.env`, `.dev.vars`, API keys, or service-role tokens.
- Treat all preview credentials as non-production.
- Disable any debug endpoints that expose upstream diagnostics outside local/preview.

---

## 3. Secrets audit guidance

1. Search the repo and CI logs for patterns: `API_KEY`, `SECRET`, `SERVICE_ROLE`, `PRIVATE_KEY`, `Bearer `.
2. Confirm `.gitignore` covers `.env*`, `.dev.vars`, and local credential dumps.
3. Rotate any key that ever appeared in chat logs, screenshots, or shared docs.
4. Prefer platform secret stores (e.g. Cloudflare / Vercel / Supabase dashboard) over files on disk.
5. Document which roles may read which secrets; keep production service role out of browser bundles.

**This report does not contain secrets.**

---

## 4. Row Level Security (RLS)

| Check | Status |
|-------|--------|
| Migrations define RLS policies for org-scoped tables | Partial (preview migrations) |
| Policies verified with multi-user tests | Partial — see `test:rls` / org multi-user scripts |
| Production RLS drill with real tenants | **Blocked** — Production untouched |

Requirement before launch: prove that user A in org X cannot read org Y rows for every shared table.

---

## 5. Authorization (AuthZ)

| Check | Status |
|-------|--------|
| Organization membership gates | Partial |
| Role-based admin surfaces | Partial / planned |
| User modes ≠ RBAC | Confirmed by design (Phase 3) |
| Billing-admin role | Test-mode note only (Phase 11) — not a payment authority |

---

## 6. Backups

| Check | Status |
|-------|--------|
| Device-local data | User-device responsibility; no server backup |
| Supabase preview backups | Provider defaults only — confirm PITR for production project |
| Documented restore path | See `CBAI-DATA-RECOVERY.md` — drill not yet evidence-complete |

---

## 7. Rollback

| Check | Status |
|-------|--------|
| Static/export rollback notes | See `CBAI-ROLLBACK-PLAN.md` |
| Supabase roll-forward preference | Documented |
| Automated rollback runbook drill | **Blocked** until production project exists (untouched) |

---

## 8. Disaster recovery (DR)

| Check | Status |
|-------|--------|
| RPO / RTO targets | Not signed |
| Failover region | Not configured for Production |
| Incident response doc | See `CBAI-INCIDENT-RESPONSE.md` |
| Tabletop exercise | Planned |

---

## 9. Retention

| Check | Status |
|-------|--------|
| Evidence / mission retention policy | Planned |
| Voice session retention | Preview-only; no production retention SLA |
| Legal hold / deletion requests | Planned |

Do not claim GDPR/CCPA compliance until legal review completes.

---

## 10. Launch checklist (human)

- [ ] Secrets audit clean (no keys in git or client bundles)
- [ ] RLS multi-tenant proof for all shared tables
- [ ] AuthZ matrix reviewed and signed
- [ ] Backup restore drill passed with evidence
- [ ] Rollback drill passed with evidence
- [ ] DR RPO/RTO signed; tabletop completed
- [ ] Retention + deletion policy signed
- [ ] Accessibility smoke on primary flows
- [ ] Locale coverage for EN/RU/UZ (TR if shipped)
- [ ] No fabricated metrics, camera feeds, or live payment charges
- [ ] Production project still **not** created until blockers clear

---

## 11. Machine-readable blockers

See `lib/production-readiness/checklist.ts` — `PRODUCTION_LAUNCH_BLOCKERS` and `isProductionLaunchAllowed()`.

`isProductionLaunchAllowed()` must remain `false` while Production is untouched and blockers remain.

---

## 12. Related documents

- `docs/operations/CBAI-ROLLBACK-PLAN.md`
- `docs/operations/CBAI-DATA-RECOVERY.md`
- `docs/operations/CBAI-INCIDENT-RESPONSE.md`
- `docs/operations/CBAI-CLOSED-ALPHA-RUNBOOK.md`
- `docs/operations/CBAI-ALPHA-EXIT-CRITERIA.md`
