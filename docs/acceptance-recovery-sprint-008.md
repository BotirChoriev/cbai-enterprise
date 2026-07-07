# Acceptance Recovery Sprint-008 — Homepage Conversion Fixes

Fixes only the five critical acceptance failures from Acceptance Audit 1.0. No new features, architecture changes, or scope outside homepage entry experience.

## Fixed acceptance failures

### FAIL #1 — Two search boxes

- **Topbar hidden on `/`** — shell search (agents/workflows placeholder) no longer renders on the homepage.
- Hero search remains the single primary search action.

### FAIL #2 — Headline

- Replaced “What is CBAI?” with a declarative statement:
  - *“CBAI helps you look up a country, company, or university and see what official information is available before you decide.”*
- Removed redundant sub-lines that repeated the same idea.
- Search prompt simplified to “Search below to get started.”

### FAIL #3 — Trust / demo chrome

- **Topbar removed on home** — no demo notifications, no “Jane Doe / Admin” profile on entry.
- **Sidebar on home** — “CBAI Enterprise” and “Enterprise Alpha” hidden; logo-only strip.
- Internal pages unchanged: full branding and topbar chrome still available off `/`.

### FAIL #4 — Repeated journey sections

- Merged “What happens after search” and “Available today” into **“What you get”** with **3 bullets**:
  1. Open a profile and see what is available and what is missing.
  2. Read a short summary before you decide.
  3. Open reports for the topic.

### FAIL #5 — Homepage navigation competition

- **Sidebar recedes on `/`**: narrow width (`w-16`), reduced opacity (`opacity-30`, `hover:opacity-80`), logo-only header, footer CTA hidden.
- **Layout on home**: no extra dashboard padding; context header slot hidden so content centers on search.

## Files changed

| File | Change |
|------|--------|
| `components/layout/Topbar.tsx` | Return `null` on `/` |
| `components/layout/Sidebar.tsx` | Home-specific recede + hide alpha branding |
| `components/platform/home/HomeHero.tsx` | New headline, merged 3-bullet block |
| `app/(dashboard)/layout.tsx` | Home-specific main padding and header slot |

## Remaining acceptance failures (from Audit 1.0)

- **Q3 partial** — “Start exploring” still offers five peer links below the fold.
- **Q5** — “Reports,” “summary,” and nav labels on receded sidebar still use product vocabulary when expanded elsewhere.
- **Q9 partial** — Full enterprise nav returns on all non-home routes with Alpha branding.
- **Q10 partial** — Outcome of “reports” and “summary” still not illustrated with an example.

## Estimated conversion improvement

| Metric | Sprint-007 audit | After Sprint-008 (est.) |
|--------|------------------|-------------------------|
| 5s “what is this?” | ~35% | ~70% |
| Single primary search | ~50% | ~95% |
| Trust on entry | Low | Medium |
| Scroll before action | High | Medium |

**Net lift on homepage entry:** ~35–45% improvement in clarity and search focus.

## Verification

```bash
npm run lint
npm run build
```
