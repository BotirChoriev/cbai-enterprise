# Product Recovery Sprint 002 — Live User Flow QA

**Goal:** Validate and fix the first-time user journey — product QA only.

---

## Flows Tested

| # | Flow | Result |
|---|------|--------|
| 1 | Home → Search | Fixed — clearer headline, placeholder examples, primary CTA to Search |
| 2 | Search → Entity profile | Fixed — single match auto-opens any entity type; dead-end topic cards removed |
| 3 | Country profile (5-step flow) | Pass — Overview → Evidence → Missing Evidence → Decision Package → Reports |
| 4 | Company profile | Pass — same flow via `buildCompanyUserJourney` |
| 5 | University profile | Pass — same flow via `buildUniversityUserJourney` |
| 6 | Reports | Fixed — export status hidden; labels simplified |
| 7 | Dashboard | Fixed — “Where do I start?” with Search CTA |
| 8 | Navigation | Pass — Start / Intelligence / Workspaces / Governance only |

---

## Friction Found

1. **Home** — Long theory (principles, sub-headline); primary CTA went to Countries not Search; vague placeholder.
2. **Search** — Auto-open only for single country; company/university required extra click.
3. **Search results** — `future_modules` and unlinked topic cards were dead ends; inconsistent entity cards.
4. **Decision Package** — Duplicated Evidence / Missing Evidence sections already shown above; template slug exposed.
5. **Reports (entity profile)** — No link to Reports Center; export tease on main Reports page.
6. **Coverage panels** — Long infrastructure copy and duplicate “Coverage policy” row.
7. **Dashboard** — Generic “what you can do” without explicit start path.

---

## Fixes Made

- Home hero shortened; “Start with a name” + example placeholder; “Open Search” CTA; browse links retained.
- Search auto-redirect for any single registry match (country, company, university).
- Search results hide `future_modules`; only show linked topics; unified “Open profile →” cards.
- Decision Package shows sources, methodology, limitations, human review only (no duplicate evidence blocks).
- Entity Reports section adds “Open Reports Center →” button.
- Reports page removes export status column and audience noise.
- Coverage panels shortened; removed duplicate policy row on country/company/university.
- Dashboard leads with “Where do I start?” and Search button.

---

## Remaining Issues

| Issue | Notes |
|-------|-------|
| Reasoning / Workspaces | Out of core journey — not on critical path; kept in nav for advanced users |
| Supporting information | Pipeline, indicators, comparison collapsed — optional depth |
| `/settings`, `/core`, `/agents` | Routes exist but not in nav (intentionally hidden) |
| Planned indicator counts | Shown as honest status labels in Evidence section — not promoted as available |

---

## User Value Result

A first-time user can complete:

**Home → Search → Profile → Evidence → Missing Evidence → Decision Package → Reports**

without dead-end cards, duplicate evidence summaries, export teasing, or unclear next steps.

---

## Verification

Run `npm run lint` and `npm run build` after changes.

No commit in this sprint.
