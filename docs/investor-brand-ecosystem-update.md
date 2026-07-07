# CBAI Investor Brand + Ecosystem Update

**Mission:** Premium institutional brand direction and four-ecosystem vision on the public product surface.  
**Constraints:** No fake data, no new backend architecture, no demo/alpha shell on public journey.

---

## Brand changes

### Visual system
- **Background:** Midnight navy `#050810` (body + layout shell)
- **Accent:** Unified cyan `#22d3ee` — replaced sky/violet gradients on public chrome
- **Surfaces:** Glass-style cards via `.cbai-glass` and `cbaiGlassCard` tokens
- **Typography:** Geist sans, clean section eyebrows, sentence-case headings on profiles

### Logo
- **`components/brand/CBAILogo.tsx`** — Foundation Mark (Concept A) SVG placeholder
- Wordmark: **CBAI**
- Tagline: **Official Evidence Intelligence**
- Used in sidebar (expanded) and homepage hero

### Shared tokens
- **`components/brand/brand-classes.ts`** — buttons, cards, nav active states, page headers
- **`app/globals.css`** — CSS variables for midnight surface and accent

---

## Ecosystem section added

### Data
- **`lib/cbai-ecosystems.ts`** — four ecosystems with honest status labels

| Ecosystem | Status |
|-----------|--------|
| Public Intelligence | Available today |
| Research Intelligence | In development |
| Economic Intelligence | Future workspace |
| Governance Intelligence | In development |

### UI
- **`components/platform/home/HomeEcosystems.tsx`** — “CBAI Ecosystems” grid on homepage
- Only Public Intelligence links to Search (active today)
- Research, Economic, Governance show status badges — not presented as fully active

---

## Demo chrome removed

| Removed / hidden | Location |
|------------------|----------|
| Enterprise Alpha | Sidebar |
| CBAI Enterprise + gradient C logo | Sidebar → CBAILogo |
| Jane Doe / Admin | Topbar |
| Fake notification bell + dot | Topbar |
| Fake agents/workflows search | Topbar → wired `/search` form |
| Platform Context header | Hidden on public journey routes |
| Dashboard, Workspaces, Governance, Reasoning from sidebar | `lib/navigation.ts` |
| Decision package copy | Entity pages, dashboard, sidebar footer |
| Start exploring → Reports bypass | Homepage (replaced with Search CTA) |
| Evidence Explorer label | Nav + page → “Evidence” |

**Internal routes still exist** (`/agents`, `/workflows`, `/settings`, `/core`, workspaces) but are not promoted in public navigation.

---

## Pages updated

| Page | Changes |
|------|---------|
| `/` | New hero, logo, ecosystems, what works today, premium glass search |
| `/search` | Glass search form, Public Intelligence note |
| `/countries`, `/companies`, `/universities` | Premium page headers, plain copy |
| `/knowledge` | Renamed header to Evidence, glass page header |
| `/analytics` | Glass page header, copy polish |
| `/dashboard` | Updated journey copy, glass cards (not in public nav) |
| Layout | Midnight background, simplified topbar |
| Sidebar | Public nav only, cyan accent, CBAILogo |

---

## Remaining inactive areas

- `/agents` — mock data (URL only, not in nav)
- `/workflows`, `/settings` — coming soon (URL only)
- `/core` — inactive module grid (URL only)
- `/graph` — knowledge graph (URL only)
- Workspaces: `/government`, `/investor`, `/citizen` (URL only)
- `/reasoning`, `/ai-control` — internal (URL only)
- Research / Economic / Governance ecosystems — not fully built; marked honestly on home
- Report cards — readiness status only; no document generation

---

## Investor readiness notes

**Improved**
- 30-second comprehension: hero + ecosystems explain what CBAI is and long-term vision
- Public Intelligence clearly marked as what works today
- Demo shell removed from topbar and sidebar
- Unified cyan institutional aesthetic on journey pages
- Plain language on entity pages (no decision package / framework terms)

**Still needed for full investor demo**
- Redirect or hide mock routes at URL level (`/agents`, etc.)
- Slim entity page focus mode when arriving from search
- Apply brand tokens to remaining zinc-800 cards inside profile sections
- Gap card topic titles still from data layer

**Estimated investor readiness:** **7 / 10** (up from ~4/10 before this update)

---

## Verification

- `npm run lint` — pending
- `npm run build` — pending
