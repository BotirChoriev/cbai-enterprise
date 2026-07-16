# EPIC Maturity Matrix

Honest assessment — 2026-07-16. Status dimensions per EPIC.

Legend: ✅ Functional/Verified · 🟡 Foundation/Partial · ⬜ Proposed/Planned · 🔒 Restricted

| EPIC | Architecture | Product | User workflow | Data | Trust | Test | Production |
|------|-------------|---------|---------------|------|-------|------|------------|
| EPIC-01 | ✅ | ✅ | ✅ | 🟡 local | ✅ accountability | ✅ | ⬜ |
| EPIC-02 | ✅ | 🟡 | 🟡 | 🟡 local | ✅ | ✅ | ⬜ |
| EPIC-03 | 🟡 | 🟡 | 🟡 | 🟡 local | 🟡 | ✅ | ⬜ |
| EPIC-04 | 🟡 | ⬜ | ⬜ | ⬜ | 🟡 rules | ✅ | ⬜ |
| EPIC-05 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🟡 research only | ⬜ |
| EPIC-06 | ✅ | 🟡 | 🟡 | 🟡 declared | ✅ | ✅ | ⬜ |
| EPIC-07 | ✅ | 🟡 | 🟡 | 🟡 catalog | ✅ | ✅ | ⬜ |
| EPIC-08 | ✅ | ✅ | ✅ | 🟡 local catalogs | ✅ | ✅ | ⬜ |
| EPIC-09 | 🟡 | 🟡 | 🟡 | 🟡 local | ✅ | ✅ | ⬜ |
| EPIC-10 | ✅ | ✅ | ✅ | 🟡 local | ✅ | ✅ | ⬜ |
| EPIC-11 | 🟡 | 🟡 | 🟡 | 🟡 local | ✅ | ✅ | ⬜ |
| EPIC-12 | 🟡 | 🟡 | 🟡 | 🟡 local | ✅ | ✅ | ⬜ |
| EPIC-13 | ✅ | 🟡 | 🟡 | — | ✅ | ✅ | ⬜ |
| EPIC-14 | ⬜ | ⬜ | 🔒 preview | ⬜ | 🟡 | 🟡 | ⬜ |
| EPIC-15 | 🟡 | 🟡 | 🟡 | 🟡 optional cloud | 🟡 | ✅ | ⬜ |

---

## EPIC-02 detail (current focus)

| Requirement | Status |
|-------------|--------|
| Mission created and persisted | ✅ `mission-store.ts` |
| Mission links to real projects | ✅ `MissionCreationFlow` |
| Questions/evidence from project artifacts | ✅ lifecycle derivation |
| Missing knowledge visible | ✅ canvas + context layer |
| Human Impact editable and persistent | ✅ `HumanImpactPanel` |
| Report readiness reflects real rules | ✅ `report-readiness.ts` |
| Mission Thread opens real surfaces | ✅ timeline hrefs |
| Resume after reload | ✅ localStorage + hydration guards |
| Stage shows exists/missing/next action | ✅ `mission-lifecycle.ts` |
| Mission context across routes | ✅ `MissionContextProvider` |
| Human Decision Boundary on conclusions | ✅ canvas, reports, reasoning |
| Legacy Trail from real artifacts | ✅ `legacy-trail.ts` |

---

## Completion criteria for "Verified"

An EPIC reaches **Verified** when:

1. All acceptance criteria in its EPIC document are checked
2. `npm run test:epic-governance` passes
3. Domain test suite passes
4. `npm run test:browser-regression` passes for affected routes
5. No misleading active capabilities without accountability registration

**Production-ready** additionally requires EPIC-15 gates (auth, cloud, deployment, incident handling).
