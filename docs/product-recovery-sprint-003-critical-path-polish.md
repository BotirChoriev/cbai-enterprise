# Product Recovery Sprint 003 — Critical Path Polish

**Goal:** Polish the active user path — fewer words, fewer clicks, clearer next steps.

---

## Pages polished

| Page | Changes |
|------|---------|
| Home | Three-question layout: what is CBAI, what to type, what happens next; removed module grid |
| Search | Minimal hero; action buttons on each result; removed category dashboard |
| Country / Company / University profiles | Shared section order, anchor IDs, next-step buttons |
| Reports | Single list: available now, evidence required, open related profile |
| Decision package | User headings; available/missing/sources; next-step to Reports |

---

## Friction removed

- Redundant Home module grid and long hero copy
- Search category tiles and knowledge/evidence topic dead ends
- Duplicate decision-package evidence blocks without user-facing headings
- Report stats grid and export/methodology columns
- Developer labels: registry, readiness model, pipeline in supporting summary
- Nested card borders on search results

---

## Copy simplified

| Before | After |
|--------|-------|
| Registry available | Available information |
| Evidence Coverage / Connected indicators | Evidence / Connected |
| Decision Package Preview | Decision package |
| Open Reports Center | View report readiness |
| Human Review Required | Review required |
| Official Sources | Sources connected |
| Supporting information · pipeline… | More detail · compare evidence… |
| Open related module | Open related profile |

---

## Mobile fixes

- Search inputs: stacked full-width button on small screens; inline on `sm+`
- Home and Search: reduced horizontal padding (`px-4`) on mobile
- Profile flow steps: horizontal scroll for step chips
- Section next-step buttons: full width on mobile, inline on `sm+`
- Search result actions: stacked column on mobile, row on `sm+`
- Coverage stat grid: 2 columns on mobile, 4 on large screens
- Reports cards: responsive padding and full-width profile links

---

## Remaining issues

- Compare evidence lives inside collapsible “More detail” — deep link `#compare` scrolls to section but user must expand manually
- Decision package indicator lines still use internal IDs from existing builders (not UI-layer fake data)
- Workspaces, Reasoning, Governance unchanged — off critical path

---

## User value result

A first-time user sees on Home exactly what to type and what happens next, gets three clear actions on each search result, and follows obvious “Next: …” buttons through five profile sections to Reports — with shorter copy throughout.

---

## Verification

Run `npm run lint` and `npm run build`. No commit.
