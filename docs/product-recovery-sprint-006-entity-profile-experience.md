# Product Recovery Sprint 006 — Entity Profile Experience

**Goal:** Any profile answers what/ evidence/ missing/ decision/ reports in under 2 minutes — no instructions needed.

---

## Profiles improved

| Section | Change |
|---------|--------|
| Overview | Shared `EntityOverviewSection` — type, country, available info, next action |
| Evidence | Shared `EntityEvidenceSection` — connected count, source status, review line |
| Missing evidence | Compact gap cards — why, source, next step only |
| Decision package | Short sections, max 4 lines each, plain labels |
| Reports | List + “Open reports →”, no export wording |
| Compare | Standalone `#compare` section after reports |

Country, Company, and University use the same structure and shared components.

---

## Friction removed

- Removed step-by-step `EntityProfileFlow` instruction nav
- Removed collapsible “More detail” block
- Removed pipeline, indicator explorer, and timeline from profiles
- Removed 4-stat evidence grid (planned/not connected noise)
- Removed indicator IDs and connector jargon from gap cards
- Removed duplicate methodology/trust from entity pages
- Removed decision package title/readiness subtitle jargon
- Removed heavy borders — lighter `bg-zinc-900/50` cards

---

## Compare link fix

- Compare moved out of `<details>` into `EntityCompareSection` with `id="compare"`
- Search “Compare evidence” deep link scrolls directly to visible comparison
- No manual expansion required

---

## Mobile fixes

- Section spacing reduced (`space-y-6`)
- Next-step buttons full-width on mobile (`EntityProfileSection`)
- Evidence stats 2-column grid on all widths
- Gap cards single column, compact padding
- Reports CTA full-width on mobile

---

## Remaining issues

- Decision package lines still use builder text (internal IDs in some lines)
- Country/Company/University relationship panels still below main column on list pages
- Compare section is after Reports (optional — not in main five-step scroll)

---

## User value added

Users open any profile and scroll: Overview → Evidence → Missing → Decision → Reports — each section answers one question with plain language and a clear next action.

---

## Verification

Run `npm run lint` and `npm run build`. No commit.
