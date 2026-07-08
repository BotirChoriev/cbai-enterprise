# RI-BUILD-001 — Research Intelligence Home

**Build:** Research Intelligence entry point (read-only, honest positioning)  
**Route:** `/research`

---

## Purpose

First public surface for CBAI Research Intelligence — explains the future ecosystem while showing only what is available today. No collaboration, chat, fake researchers, experiments, publications, or metrics.

---

## Files created

| File | Role |
|------|------|
| `app/(dashboard)/research/page.tsx` | Route — reads `?q=` / `?topic=` |
| `components/research/ResearchHome.tsx` | Page shell + status panel |
| `components/research/ResearchHero.tsx` | Title, subheadline, search entry |
| `components/research/ResearchEcosystemOverview.tsx` | 10 workspace area labels |
| `components/research/ResearchTopicPreview.tsx` | Example topics + honest query notice |
| `components/research/ResearchPrinciples.tsx` | Four principles cards |
| `lib/research/research-home.ts` | Static copy and topic list |
| `lib/research/index.ts` | Barrel export |

---

## Page sections

1. **Hero** — Research Intelligence title, subheadline, topic search (orientation only)
2. **Status** — In development banner; available today vs not available yet
3. **Ecosystem overview** — 10 structured workspace areas (future)
4. **Topic preview** — 6 example topics; query shows development notice
5. **Principles** — Evidence first, topics before posts, human judgment, transparent methods

---

## Navigation

- Added **Research** to public sidebar after Evidence, before Reports
- Icon: flask/lab mark in `NavIcon.tsx`
- `/research` added to `PUBLIC_JOURNEY_ROUTES`

---

## Honest constraints

- Search and topic chips do not return live database results
- No researcher accounts, collaboration, AI Notebook, or discussions
- Link to `/universities` for what exists today in Public Intelligence

---

## Verification

- `npm run lint` — pass
- `npm run build` — pass
