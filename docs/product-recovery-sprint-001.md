# Product Recovery Sprint 001

**Goal:** Remove friction, reduce complexity, activate existing functionality — product only.

---

## User Friction Removed

| Area | Change |
|------|--------|
| Navigation | Removed inactive routes (Core, Graph, Agents, Workflows, Settings) from sidebar |
| Homepage | Removed roadmap, languages, trust duplicates, persona maze; show only live modules |
| Search | Removed pipeline, future architecture, runtime status, evidence watch sections |
| Dashboard | Replaced runtime simulator with actionable product dashboard |
| Entity profiles | Five-step flow: Overview → Evidence → Missing Evidence → Decision Package → Reports |
| Reports | Removed export teasing, trust, personas, diagnostics, pipeline duplicate |
| Evidence Explorer | One evidence summary; removed lifecycle, methodology, trust, personas, pipeline |
| Reasoning / Governance | Removed duplicate methodology, trust, personas, legacy diagnostics |
| Workspaces | Removed methodology, trust, persona, and future feedback blocks |
| Core | Replaced inactive shell with links to live modules |

---

## Existing Features Activated

- **Company & university journeys** — same decision package + reports flow as countries
- **Search → profile** — all entity types link to integrated profiles with clear next step
- **Dashboard** — surfaces Search, Countries, Evidence, Reports with live counts
- **Decision Intelligence** — company/university use `researcher-cross-entity` template
- **Supporting information** — pipeline, indicators, comparison, timeline collapsed by default

---

## Duplicate Sections Removed

- Repeated trust blocks on entity profiles, reports, evidence, reasoning, workspaces
- Repeated methodology on entity profiles (merged into decision package)
- Repeated evidence gap summary/sources on simplified entity pages
- Repeated pipeline descriptions on reports and evidence explorer
- Repeated persona “after sources connect” cards on entity profiles
- Homepage platform map, global impact, live status, roadmap

---

## Demo Elements Removed

- “Export Future” section on Reports
- “Coming soon” Settings from navigation (route unchanged, not advertised)
- Search “Future-Ready Architecture” and runtime integration panels
- Planned/disconnected category tiles on search (hidden, not shown as disabled)
- Home module cards for non-available modules
- Dashboard runtime metrics feed and BUILD integration cards
- Core mission control / thinking pipeline UI (inactive capability hidden)

---

## Real User Value Added

A first-time visitor can:

1. Search or open Dashboard and see **what works today**
2. Open a country, company, or university and follow **one reading order**
3. Understand **evidence vs missing evidence** without repeated cards
4. Read a **single decision package** with methodology and limitations
5. See **available reports** without export teasing

Success path: Search → Country → Evidence → Decision Package → Reports — no “what next?” dead ends.

---

## Verification

Run `npm run lint` and `npm run build` after changes.

No commits in this sprint.
