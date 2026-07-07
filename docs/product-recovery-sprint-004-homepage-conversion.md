# Product Recovery Sprint 004 — Homepage Conversion

**Goal:** A new visitor understands CBAI in under 30 seconds and knows where to start.

---

## Before

- Long hero with multiple labels and browse links mixed with search
- Footer with mission, constitution, evidence policy, methodology columns
- Architecture wording: “evidence-based profiles,” five-step scroll explanation inline with search
- Placeholder: “Uzbekistan, Apple, Oxford”
- Secondary “Or open directly” section without clear priority
- Search not visually dominant; supporting copy competed for attention

---

## After

Single-column conversion page:

```
Hero (What is CBAI?)
↓
One clear sentence
↓
Search (visual focus)
↓
Three examples: Japan · Apple · Harvard University
↓
What happens after search (5 steps)
↓
Available today (5 checkmarks)
↓
Start exploring (Search, Countries, Companies, Universities, Reports)
```

- Max ~12 words per sentence
- No module grid, footer blocks, or jargon
- Search box enlarged with prominent placeholder

---

## User conversion improvements

| Question | Answer on page |
|----------|----------------|
| What is CBAI? | Search countries, companies, universities; see official evidence |
| What can I do today? | “Available today” checklist — only live actions |
| Where do I start? | Search box + three one-click examples |

- Examples map to Country / Company / University types
- “Start exploring” links only to working routes
- After-search steps set expectations before first click

---

## Removed complexity

- `HomeFooter` removed from homepage (mission, constitution, build metadata)
- Browse-direct section merged into “Start exploring”
- Duplicate “what to type” / “what happens next” blocks consolidated
- Marketing headline replaced with direct Q&A structure
- Visual noise reduced: no borders between every block, more vertical whitespace

---

## Remaining issues

- `/analytics` route label is “Reports” in UI but URL is not `/reports` (existing route, not changed)
- Search page still uses broader example list from `SEARCH_SUPPORTED_SUGGESTIONS`
- Compare evidence requires expanding “More detail” on profiles (known from Sprint 003)

---

## Verification

Run `npm run lint` and `npm run build`. No commit.
