# CBAI Alpha 0.3 RC-1 Workspace Sprint — Report

**Sprint:** Alpha 0.3 RC-1  
**Date:** July 2026  
**Routes:** `/government`, `/investor`, `/citizen`

## Summary

Three constitution-compliant **evidence-readiness workspaces** were added for Government, Investor, and Citizen personas. Each workspace shows indicator domain coverage, source connection status, methodology, personas, and trust principles — no dashboards, fake scores, charts, or recommendations.

## Created Files

### Data layers

| File | Purpose |
|------|---------|
| `lib/workspaces/index.ts` | Shared types, domain/topic/source builders, status helpers |
| `lib/workspaces/government.ts` | Government Intelligence Workspace model |
| `lib/workspaces/investor.ts` | Investor Intelligence Workspace model |
| `lib/workspaces/citizen.ts` | Citizen Intelligence Workspace model |

### Shared components

| File |
|------|
| `components/workspaces/WorkspaceHero.tsx` |
| `components/workspaces/WorkspaceCoverageGrid.tsx` |
| `components/workspaces/WorkspaceSourceCoverage.tsx` |
| `components/workspaces/WorkspaceMethodology.tsx` |
| `components/workspaces/WorkspacePersonas.tsx` |
| `components/workspaces/WorkspaceTrust.tsx` |
| `components/workspaces/WorkspaceEntityLinks.tsx` |
| `components/workspaces/WorkspaceFeedbackNotice.tsx` |

### Workspace shells

| File |
|------|
| `components/workspaces/GovernmentWorkspace.tsx` |
| `components/workspaces/InvestorWorkspace.tsx` |
| `components/workspaces/CitizenWorkspace.tsx` |

### Routes

| File |
|------|
| `app/(dashboard)/government/page.tsx` |
| `app/(dashboard)/investor/page.tsx` |
| `app/(dashboard)/citizen/page.tsx` |

## Modified Files

| File | Change |
|------|--------|
| `lib/navigation.ts` | Added **Intelligence Workspaces** section with Government, Investor, Citizen |
| `components/layout/NavIcon.tsx` | Icons for government, investor, citizen |

## Removed / Avoided Fake Data

- **No new routes created with mock dashboards** — all three are greenfield evidence-readiness pages
- **No charts, KPIs, scores, sentiment indices, or investment recommendations**
- **No citizen feedback voting** — future Satisfied / Unsatisfied / No Opinion documented only
- **No political advice or unrest scoring**
- Status labels only: **Connected**, **Available Information**, **Planned**, **Evidence Source Not Connected**, **Insufficient Evidence**

## Architecture Summary

```
lib/workspaces/index.ts          ← shared builders
lib/workspaces/{government,investor,citizen}.ts
        ↓
components/workspaces/*          ← reusable section UI
components/workspaces/{Government,Investor,Citizen}Workspace.tsx
        ↓
app/(dashboard)/{government,investor,citizen}/page.tsx
```

**Data sources (real only):**

- Global Indicator Framework — domain and indicator connection status
- Evidence Infrastructure — `OFFICIAL_EVIDENCE_SOURCES` with connection labels
- Entity registries — country/company/university counts for investor entity links

## Route Summary

| Route | Workspace | Key sections |
|-------|-----------|--------------|
| `/government` | Government Intelligence | Governance coverage, public service areas, sources |
| `/investor` | Investor Intelligence | Investment evidence map, entity links, opportunity readiness |
| `/citizen` | Citizen Intelligence | Citizen topics, feedback notice (future), evidence coverage |

## Constitution Compliance

| Rule | Status |
|------|--------|
| No fake data / scores / charts | ✓ |
| No political advice or sentiment | ✓ |
| Honest unavailable labels | ✓ |
| Official source priority | ✓ |
| Six personas per workspace | ✓ |
| Restricted paths untouched | ✓ |

## Remaining Gaps

1. Only `cbai-local-registry` connected — most domains show **Evidence Source Not Connected**
2. Citizen feedback not implemented (by design this release)
3. Report export and full intelligence reports still unavailable
4. Platform Home may not yet list workspace routes in module grid

## Verification

```bash
npm run lint
npm run build
```

No commit created per sprint instructions.
