# Product Recovery Sprint 005 — Search Conversion

**Goal:** Search is the fastest way to enter CBAI — recognize, understand, open, next step in ~10 seconds.

---

## Search flow

```
Search input (focus)
↓
Single match → auto-open profile
Multiple matches → compact list
No match → clear message + 3 examples
↓
Open profile → evidence → reports
```

---

## Before

- Large bordered hero with title and helper paragraph
- Group headers (Countries / Companies / Universities) adding scroll
- Three equal-weight action buttons per card
- Long descriptions and duplicate empty-state copy
- Eight example chips (Governance, Procurement, etc.)
- Generic no-results message about “evidence” and “topic routes”
- Wide layout (`max-w-6xl`) pushing results below fold

---

## After

- Search input only — one line hint when empty
- Flat compact result list (no group sections)
- Each card: name · type · country · short description · next step
- Primary: **Open profile →** · Secondary text links: Compare evidence · Reports
- Three examples only: Japan · Apple · Harvard University
- Exact no-results: “No matching country, company, or university was found.”
- Narrow layout (`max-w-2xl`) — results near input

---

## User friction removed

| Removed | Why |
|---------|-----|
| Hero title block | Redundant with nav |
| Category grid under search | Secondary dashboard |
| Group section headers | Extra scroll |
| Large bordered cards | Visual noise |
| “View report readiness” label | Jargon — now “Reports” |
| 8 example chips | Overchoice |
| `noResultsDetail` paragraph | Duplicate explanation |
| Empty-state border box | Unnecessary chrome |

---

## Remaining issues

- Compare evidence still opens collapsed “More detail” on profiles
- Auto-match counts all entity types — mixed-type single results still show list if 2+ groups
- `SEARCH_SUPPORTED_SUGGESTIONS` in lib unchanged (used elsewhere if any)

---

## User value result

First-time users type a name, see a compact answer to what/why/next on each card, and open a profile in one click — with single-match auto-navigation unchanged.

---

## Verification

Run `npm run lint` and `npm run build`. No commit.
