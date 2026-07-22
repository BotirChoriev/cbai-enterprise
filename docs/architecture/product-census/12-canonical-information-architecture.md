# Canonical information architecture

**Goal:** one Intelligence Operating System — progressive disclosure, not a portal farm.
**Current baseline:** `lib/navigation.ts` (`primaryNavSections`, `secondaryNavSections`).

## Proposed primary structure

### CORE
- Home → `/` (Spatial World Intelligence)
- My Work → `/my-work`
- Search → `/search`

### INTELLIGENCE
- Countries → `/countries`
- Companies → `/companies`
- Universities → `/universities`
- Research → `/research` (workspace/canvas as progressive disclosure)
- Evidence → `/knowledge` (keep href; consider alias `/evidence` only after redirect plan)
- Knowledge Graph → `/graph`

### COLLABORATION (disclosure by auth + role)
- Personal Cabinet → `/workspace` (evolve from shell)
- Teams → bind `/teams` + `/organization` (single mental model)
- Conversations → `/messages` (when real)
- Files → `/files` (when real)
- Publications → `/publications` (Layer 4 workflow)

*Do not dump these into the primary sidebar until non-placeholder.*

### OPERATIONS
- Reports → `/reports`
- Investor → `/investor`
- Government → `/government`

### OVERSIGHT
- Governance → `/governance` (`/ai-control` alias or redirect)
- Trust → `/trust`
- Forensic Evidence → **authorized roles only** (no route today)

### SYSTEM
- Settings → `/settings`
- About → `/about`
- Administration → authorized only (no route today)

## Progressive disclosure rules

1. Guest: CORE + INTELLIGENCE + Trust/About + limited Operations read.
2. Signed-in personal: + My Work depth + Personal Cabinet.
3. Team member: + Teams/Files/Conversations per role.
4. Publisher role: + Publications workflow.
5. Forensic role: + Forensic Evidence.
6. Hide `/agents` or keep noindex stub until a real runtime exists.
7. Legacy `/dashboard`, `/core`, `/workflows`, `/analytics`: demote/ARCHIVE after redirect plan — do not compete with Home/Reports.

## Naming clarity

| Term | Meaning |
|------|---------|
| Evidence | Research source coverage (`/knowledge`) |
| Forensic Evidence | Restricted integrity workspace (future) |
| Government | Public-admin research lens |
| Governance | Platform rules / control center |
| Workspace (personal) | Cabinet shell |
| Workspaces (plural) | Role lenses (investor/gov/citizen) |

## Feel test

First viewport Home must remain one composition (spatial globe) — already the product direction (`PlatformHome` / spatial-world). Secondary modules must feel like lenses on the same OS, not separate sites.
