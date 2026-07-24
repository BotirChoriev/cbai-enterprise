# Privacy, legal, and copyright model (design)

**Not legal advice. Jurisdiction-specific questions → qualified counsel (REQUIRES_HUMAN_REVIEW).**

## Privacy principles (aligned to Trust page intent)

Evidence: `components/trust/*`, constitution docs under `docs/CBAI-Constitution-v1.md`. Runtime enforcement: PARTIAL at best.

- Private by default for user work products (projects, missions, OO, intake).
- No silent profile mutation from voice identity statements.
- Locale provenance: do not silently machine-translate official quotations (`docs/architecture/locale-provenance-policy.md`).
- Separate: platform UI copy | localized summary | official source content.

## Five-layer product access (Phase F)

| Layer | Purpose | Today |
|-------|---------|-------|
| 1 Public / Guest knowledge | Open research catalogs | PROVEN entity/search/home |
| 2 Personal Cabinet | Private projects/files/conversations | PARTIAL (`/workspace`, my-work strong; files empty) |
| 3 Team Workspace | Roles, invites, shared objects | PARTIAL org-OS; `/teams` drafts |
| 4 Publication / Public Registry | Explicit publish workflow | PARTIAL UI only |
| 5 Restricted Evidence Integrity | Forensics | DOCUMENTATION_ONLY |

## Rights model for every uploaded or published item (required fields)

- author, uploader, rights holder, co-authors
- source URL, citation, license, permission basis
- allowed uses, derivative restrictions
- embargo date, publication status, consent state
- dispute state, takedown state, jurisdiction note

### Rules

1. Uploading ≠ owning copyright.
2. Publication requires explicit confirmation (and co-author authority when applicable).
3. Official titles/quotations remain source material — never silently rewritten.
4. Support correction, withdrawal, dispute, takedown.
5. Do not make universal legal claims in product copy.
6. Investor/Government lenses are **non-advisory** / research workspaces — keep disclaimers accurate (`/investor`, `/government` copy).

## Current gaps

| Need | Status |
|------|--------|
| Durable rights object | Missing |
| Embargo / unlisted visibility | Missing |
| Takedown workflow | Missing |
| Production Terms/Privacy counsel sign-off | REQUIRES_HUMAN_REVIEW (`/trust` text exists) |
| Forensic legal authority recording | Design only (`09-*.md`) |

## Copyright / publication findings

`/publications` is a readiness checklist (PARTIAL), not a registry. Scientific intake does not store license metadata PROVEN. Share affordances must not imply public distribution without Layer 4 workflow.
