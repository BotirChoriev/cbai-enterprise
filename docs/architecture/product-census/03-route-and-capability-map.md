# Route and capability map

Evidence: `find app -name page.tsx`, `lib/navigation.ts`, page imports (census explore). Status is reachability + implementation depth, not marketing completeness.

| Route | Nav placement | Primary capability IDs | Integration status | Notes |
|-------|---------------|------------------------|--------------------|-------|
| `/` | Primary Home | CAP-001 | PROVEN_AND_INTEGRATED | Spatial globe home |
| `/my-work` | Primary | CAP-004,005,006,027 | PROVEN_AND_INTEGRATED | Projects, OO, missions |
| `/search` | Primary | CAP-021 | PROVEN_AND_INTEGRATED | Search gateway |
| `/countries` | Intelligence | CAP-007 | PROVEN_AND_INTEGRATED | Entity list/detail |
| `/companies` | Intelligence | CAP-007 | PROVEN_AND_INTEGRATED | |
| `/universities` | Intelligence | CAP-007 | PROVEN_AND_INTEGRATED | |
| `/research` | Intelligence | CAP-008 | PROVEN_AND_INTEGRATED | Topics |
| `/research/[topicId]` | via research | CAP-008 | PROVEN_AND_INTEGRATED | |
| `/research/workspace` | Advanced | CAP-008 | PROVEN_AND_INTEGRATED | |
| `/research/canvas` | via research | CAP-008 | PROVEN_AND_INTEGRATED | |
| `/knowledge` | Intelligence as “Evidence” | CAP-009 | PROVEN_AND_INTEGRATED | **No `/evidence` route** |
| `/graph` | Intelligence KG | CAP-010 | PROVEN_AND_INTEGRATED | |
| `/reports` | Operations | CAP-020 | PROVEN_AND_INTEGRATED | |
| `/investor` | Operations | CAP-012 | PROVEN_AND_INTEGRATED | Non-advisory lens |
| `/government` | Operations | CAP-013 | PROVEN_AND_INTEGRATED | ≠ Governance |
| `/governance` | Oversight | CAP-014 | PARTIAL | Preview-labeled UI |
| `/ai-control` | alias | CAP-014 | PARTIAL | Same client as governance |
| `/trust` | Oversight | CAP-015 | PROVEN_AND_INTEGRATED | Reference constitution |
| `/citizen` | Advanced | CAP-028 | PROVEN_AND_INTEGRATED | Secondary disclosure |
| `/reasoning` | Advanced | CAP-011 | PROVEN_AND_INTEGRATED | |
| `/settings` | System | CAP-002 diagnostics | PARTIAL | Voice DX panels |
| `/about` | System | — | PROVEN | Brand/about |
| `/account` | account | CAP-017 | PARTIAL | Dual auth |
| `/reset-password` | account | CAP-017 | PARTIAL | |
| `/organization` | not primary nav | CAP-018 | PROVEN_AND_INTEGRATED | Org OS |
| `/workspace` | not primary nav | CAP-024 | PARTIAL | Personal shell |
| `/files` | not primary nav | CAP-024 | PLACEHOLDER | `SimpleEmptyWorkspace` |
| `/messages` | not primary nav | CAP-024 | PLACEHOLDER | |
| `/notifications` | not primary nav | CAP-024 | PLACEHOLDER | |
| `/teams` | not primary nav | CAP-024 | PARTIAL | localStorage drafts |
| `/publications` | not primary nav | CAP-024 | PARTIAL | in-memory readiness |
| `/scientific-documents` | not primary nav | CAP-024 | PARTIAL | intake queued_pending only |
| `/agents` | hidden / noindex | CAP-025 | PARTIAL | runtime_not_connected |
| `/dashboard` | legacy | CAP-029 | PARTIAL | IA clutter risk |
| `/core` | legacy | CAP-029 | PARTIAL | |
| `/workflows` | legacy | CAP-029 | PARTIAL | |
| `/analytics` | legacy | CAP-029 | PARTIAL | overlaps Reports |
| `/` layout global | n/a | CAP-002,003,022 | PARTIAL/PROVEN | Voice + Engine providers |

## Public journey set

`lib/navigation.ts` `PUBLIC_JOURNEY_ROUTES` includes `/`, search, entities, knowledge, research*, reports, analytics, governance, ai-control, dashboard. Collab routes are **not** listed as public journey — gated in page clients (PARTIAL enforcement; device-local sign-in accepted).

## Unmapped product expectation

| Expected capability | Route today | Status |
|---------------------|-------------|--------|
| Forensic Evidence | none | DOCUMENTATION_ONLY (see `09-evidence-integrity-and-forensics.md`) |
| Feedback / incident | none dedicated | DOCUMENTATION_ONLY (see `10-feedback-and-incident-loop.md`) |
| Administration | none dedicated | UNVERIFIED |
| Teams as first-class nav | `/teams` exists, not in `primaryNavSections` | PARTIAL progressive disclosure OK |
