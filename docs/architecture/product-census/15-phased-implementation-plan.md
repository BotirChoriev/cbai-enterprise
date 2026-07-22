# Phased implementation plan (recommend only — not started)

## Stage 0 — Freeze and data backup
- **Goal:** Immutable backup of user-relevant stores + git tree; continue freeze discipline.
- **Prerequisites:** This census approved.
- **Files likely affected:** ops runbooks only (not product).
- **Migration:** export localStorage key inventory; optional Supabase dump.
- **Rollback:** restore from backup.
- **Tests:** backup restore drill.
- **Acceptance:** backup hash recorded; no product edits.
- **Reviewer:** eng lead + data owner.
- **Risks:** incomplete key list.
- **Effort:** S.

## Stage 1 — Canonical types and ownership boundaries
- **Goal:** Introduce shared types for Person, Workspace, Project, Mission, OO, EvidenceItem, Source, Claim, Hypothesis, Analysis, Decision without breaking old records.
- **Prerequisites:** Stage 0.
- **Files:** `lib/**/types`, ontology/OO/project/evidence adapters; docs domain model.
- **Migration:** additive fields + unknownFields bag; dual-read.
- **Rollback:** feature flag off; old readers remain.
- **Tests:** migration idempotency; locale provenance.
- **Acceptance:** type map published; no silent text rewrite.
- **Reviewer:** architecture + i18n.
- **Risks:** over-modeling.
- **Effort:** L.

## Stage 2 — Store/provider/orchestrator consolidation
- **Goal:** Enforce canonical orchestration (voice + platform-actions + FDE); quarantine `lib/intelligence` imports; merge evidence type adapters; stop dual collab stores growth.
- **Prerequisites:** Stage 1 types.
- **Files:** `lib/intelligence/**` (quarantine boundaries), `lib/evidence*`, `lib/collaboration`, providers in layout.
- **Migration:** none destructive; import lint.
- **Rollback:** revert boundary package.
- **Tests:** existing voice/FDE/evidence/epic suites green.
- **Acceptance:** no new app imports of quarantined trees; docs match.
- **Reviewer:** platform eng.
- **Risks:** hidden script dependents.
- **Effort:** L.

## Stage 3 — Personal Cabinet
- **Goal:** Replace empty `/workspace`/`/files` shells with private-by-default cabinet over projects/OO/files metadata.
- **Prerequisites:** Stages 0–2.
- **Files:** `components/workspace/*`, my-work links, auth gates.
- **Migration:** preserve existing keys.
- **Rollback:** route flag to empty shell.
- **Tests:** auth-collab + my-work.
- **Acceptance:** guest cannot see private objects.
- **Reviewer:** product + security.
- **Effort:** L.

## Stage 4 — Team Workspace and permissions
- **Goal:** Bind `/teams` to organization-os; server-side authz when cloud; invitations/revocation/audit.
- **Prerequisites:** Stage 3; Supabase or equivalent.
- **Files:** `lib/organization-os/*`, teams UI, RLS migrations.
- **Migration:** map team drafts → org memberships carefully.
- **Rollback:** local-only mode.
- **Tests:** `test:organization-multi-user`, RLS.
- **Acceptance:** IDOR tests pass in cloud mode.
- **Reviewer:** security.
- **Effort:** L.

## Stage 5 — Upload and media pipeline
- **Goal:** Quotas, type validation, malware scan hooks, expiring URLs; wire scientific intake to real blobs.
- **Prerequisites:** Stage 4 authz.
- **Files:** scientific-intake, files UI, new storage adapters.
- **Migration:** metadata records gain storage pointers.
- **Rollback:** disable uploads.
- **Tests:** upload limits; rejection paths.
- **Acceptance:** no original mutation; audit on access.
- **Reviewer:** security + privacy.
- **Effort:** L.

## Stage 6 — Publication and rights workflow
- **Goal:** Layer 4 registry with license/co-author/embargo/takedown.
- **Prerequisites:** Stages 4–5.
- **Files:** `publications/*`, rights model types.
- **Migration:** none from in-memory stubs (export if needed).
- **Rollback:** disable publish actions.
- **Tests:** Level 3 voice cannot single-shot publish.
- **Acceptance:** explicit confirm + rights fields required.
- **Reviewer:** counsel + product.
- **Effort:** L.

## Stage 7 — Evidence Integrity pilot
- **Goal:** Restricted forensic workspace pilot implementing flow in `09-*.md` for authorized roles only.
- **Prerequisites:** Stages 4–5; counsel review of scope.
- **Files:** new forensic module (not reuse `/knowledge` casually).
- **Migration:** none from research evidence by default.
- **Rollback:** feature flag off.
- **Tests:** hash/CoC/audit immutability.
- **Acceptance:** no guilt inference; human sign-off required.
- **Reviewer:** counsel + forensic advisor.
- **Effort:** XL.

## Stage 8 — Feedback/security/incident operations
- **Goal:** Canonical Feedback object + restricted triage.
- **Prerequisites:** Stage 3 identity.
- **Files:** new feedback module; settings entry.
- **Tests:** redaction required for attachments.
- **Acceptance:** security category restricted path.
- **Effort:** M.

## Stage 9 — Accessibility and localization closure
- **Goal:** WCAG 2.2 closure pass; locale leakage zero on priority surfaces.
- **Prerequisites:** stable IA.
- **Files:** UI shells, i18n dictionaries, globe a11y alternatives.
- **Tests:** locale scripts + a11y checklist.
- **Effort:** L.

## Stage 10 — Controlled preview pilot
- **Goal:** Limited users on `preview/spatial-world-intelligence` (or successor) with backup + feedback.
- **Acceptance:** no P0 open on authz/voice broker abuse.
- **Effort:** M.

## Stage 11 — Independent security/legal review
- **Goal:** External review of threat model, RLS, broker, publication, forensics scope.
- **Acceptance:** written findings; no self-attest “secure.”
- **Effort:** M external.

## Stage 12 — Production decision
- **Goal:** Go/no-go with explicit residual risks.
- **Acceptance:** human approval recorded in decision register.
- **Effort:** S decision / XL if rebuilds required.

---

## First three stages only (for approval now)

**Stage 0 → Stage 1 → Stage 2** as sequenced above.
**Do not implement** until explicit human approval after this census.
