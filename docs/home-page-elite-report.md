# Home Page Elite Report

**Build:** Final Home Page Architecture (Elite)  
**Date:** July 6, 2026  
**Route:** `/`  
**Version:** 0.1.0 · Build `elite-home-final`  
**Scope:** Platform experience only — no changes to `lib/intelligence/*`, runtime, orchestrator, evidence engine, reasoning, agents, or Cloudflare export compatibility.

---

## Before vs After

| Dimension | Before (Pro Evolution ~95 target) | After (Elite Final) |
|-----------|-------------------------------------|---------------------|
| **Hero** | Two-column headline + principles + dual CTAs; search on separate route | Search is the visual center; topic cards answer “What would you like to understand today?” |
| **10-second clarity** | Strong but search required navigation | What / why / who / action / trust visible in hero + topic grid |
| **Global search** | Secondary CTA to `/search` | Embedded GET form in hero → `/search?q=` with honest placeholder |
| **Personas** | Shorter cards, one link each | Full schema: sentence, primary action, supported modules, current + future capability; entire card clickable |
| **Modules** | Purpose, evidence, current/future | Adds **dependencies** field; no unavailable features promised |
| **Platform map** | Text flow section | Dedicated SVG vertical architecture diagram |
| **Trust** | 6 pillars (“Why trust CBAI?”) | **Trust Center** — 8 constitutional principles with explanations |
| **Global impact** | One-sentence audiences | 6 tiles with **current value** + **future roadmap** |
| **Languages & roadmap** | Combined section | Split: Languages (10 locales) + verified Roadmap timeline |
| **Footer** | Mission + version line | Mission, Constitution, Evidence Policy, Transparency, Methodology, Documentation, Version, Build |
| **Design system** | Pro spacing/typography | `.home-page` / `.home-section` tokens, light theme hooks, focus rings |
| **Obsolete sections** | `HomeFlow`, `HomeLanguagesRoadmap` | Removed — map + timeline replace them |

---

## Section-by-Section Delivery

### 1. Hero

- **Headline:** “The operating system for evidence-based global intelligence”
- **Sub-headline:** Neutral infrastructure positioning
- **Evidence-first explanation:** CBAI exists for evidence-based decisions; missing sources labeled honestly
- **Three constitutional principles:** Evidence First, Transparent Methodology, No Fabricated Data (in hero grid)
- **Primary CTA:** Explore Global Intelligence → `/countries`
- **Secondary CTA:** Browse Platform Modules → `#platform-modules`
- **SVG illustration:** `HomeHeroIllustration.tsx` (layer stack, server-rendered)
- **Topic cards:** Country, Company, University, Governance, Global Search (linked); Investment, Public Procurement, Human Rights (disabled with “Evidence Source Not Connected”)

### 2. Global Search

- **Component:** `HomeHeroSearch.tsx` — native `<form method="get" action="/search">`
- **Placeholder:** “Search countries, companies, universities, procurement, governance…”
- **No autocomplete, no fake suggestions**
- **Search page:** Initializes query from `?q=` via lazy `useState(readSearchQueryParam)` (platform UX fix in `app/(dashboard)/search/page.tsx`)

### 3. Personas

- **Data:** `PLATFORM_PERSONAS` in `lib/platform-home.ts`
- **Fields:** title, one sentence, primary action, supported modules, current capability, future capability
- **Interaction:** Full-card links to role-relevant routes (`/countries`, `/companies`, `/search`, etc.)

### 4. Platform Modules

- **Data:** `HOME_MODULES` with purpose, evidence status, available today, planned expansion, dependencies
- **Status badges:** Available · In Progress · Evidence Not Connected (no percentages)

### 5. Platform Map

- **Component:** `HomePlatformMap.tsx`
- **SVG flow:** Countries → Companies → Universities → Knowledge Graph → Evidence → Reasoning → Decision Intelligence
- **`role="img"`** with descriptive `aria-label`

### 6. Trust Center

- **Component:** `HomeTrust.tsx`
- **Eight pillars:** Evidence First, Transparent Methodology, Political Neutrality, Human Oversight, Source Attribution, Explainability, Confidence Calculation, No Fabricated Data
- **Semantic heading:** `sr-only` h2 in `PlatformHome.tsx` + visible “Trust Center” label in component

### 7. Global Impact

- **Component:** `HomeGlobalImpact.tsx`
- **Six audiences:** Citizen, Investor, Government, Student, Researcher, Academic
- **Each tile:** current value + future roadmap (honest, no fabricated outcomes)

### 8. Live Platform Status

- **Component:** `HomePlatformStatus.tsx`
- **Groups:** Available, In Progress, Evidence Not Connected
- **Source:** Static capability registry in `lib/platform-home.ts` — not live polling (no fake “live” counters)

### 9. Languages

- **Component:** `HomeLanguages.tsx`
- **Displayed:** English (available), Uzbek, Spanish, French, Arabic, Chinese, Japanese, Korean, Russian (Planned)
- **Architecture-ready:** locale codes + native labels for future i18n bundles

### 10. Roadmap

- **Component:** `HomeRoadmapTimeline.tsx`
- **Phases:** Foundation, Entity Intelligence, Search, Knowledge Graph, Investor/Government/Citizen Intelligence, Mobile, API
- **Status:** Verified phases only — complete, in progress, or planned

### 11. Footer

- **Component:** `HomeFooter.tsx`
- **Sections:** Mission, Constitution, Evidence Policy, Transparency, Methodology, Documentation
- **Meta line:** Version 0.1.0 · Build elite-home-final · Final Home Architecture

---

## UX Improvements

1. **Search-first entry** — Primary action is understanding, not browsing marketing copy.
2. **Topic cards** — Immediate routing or honest “not connected” for unavailable evidence domains.
3. **Scannable personas & modules** — Structured fields replace long prose; every card is actionable or informative.
4. **Trust as product feature** — Eight principles with short explanations, not slogans.
5. **Architecture visibility** — SVG map shows how entity layers connect to decision intelligence.
6. **Reduced cognitive load** — Section rhythm via `clamp()` spacing; `max-w-6xl` content width.
7. **No dead-end promises** — Dependencies and evidence status on every module card.

---

## Architecture Improvements

```
lib/platform-home.ts                    ← single static content source (i18n-ready)
  ├── HOME_HERO, HERO_TOPIC_CARDS       ← hero + topic routing
  ├── HOME_SEARCH                       ← form contract (/search?q=)
  ├── PLATFORM_PERSONAS                 ← full persona schema
  ├── HOME_MODULES                      ← modules + dependencies
  ├── TRUST_PILLARS (×8)                ← trust center
  ├── GLOBAL_IMPACT                     ← audience tiles
  ├── PLATFORM_CAPABILITIES             ← live status grouping
  ├── HOME_LANGUAGES                    ← locale registry
  ├── ROADMAP_TIMELINE                  ← verified phases
  └── HOME_FOOTER, PLATFORM_*           ← footer + build metadata

components/platform/PlatformHome.tsx    ← server orchestrator (no "use client")
components/platform/home/*              ← section components (mostly server)
  ├── HomeHeroSearch.tsx                ← only client boundary for form (native GET, no JS required)
  └── HomeHeroIllustration.tsx          ← pure SVG

app/(dashboard)/page.tsx                ← renders PlatformHome
app/(dashboard)/search/page.tsx         ← reads ?q= on load (platform UX)
```

- **Content/schema separation:** All copy and status labels live in `lib/platform-home.ts` for future locale bundles.
- **No intelligence layer changes:** Home reads static platform registry only.
- **Cloudflare static export:** Home route remains `○` (Static) — verified in build output.

---

## Accessibility (WCAG AA Target)

| Area | Implementation |
|------|----------------|
| **Headings** | Single h1 in hero; h2 per section via `HomeSection`; Trust Center uses `sr-only` h2 + visible label |
| **Keyboard** | All topic cards, persona cards, module links, CTAs — focus-visible rings (`outline-sky-400`) |
| **ARIA** | Topic grid `aria-label`; platform map `role="img"` + `aria-label`; disabled topics use `aria-disabled` |
| **Contrast** | Zinc palette on dark background; light theme tokens via `html.theme-light` |
| **Screen readers** | `.sr-only` utility in `globals.css`; semantic `<header>`, `<footer>`, `<section>` |
| **Forms** | Search input has associated `<label>` (visually hidden) in `HomeHeroSearch` |

---

## Performance

| Technique | Detail |
|-----------|--------|
| **Server components** | `PlatformHome` and all section components except search form wrapper are server-rendered |
| **No hydration on home** | Hero search uses native HTML form — works without JavaScript |
| **Small client boundary** | Search page remains client-only (existing); home adds zero new client state |
| **SVG over images** | Illustration and platform map are inline SVG — no image requests |
| **Static generation** | `/` prerendered at build time |
| **Build time** | ~2s compile, ~1.7s TypeScript, 18 static pages |

---

## Constitution Compliance

| Rule | Compliance |
|------|------------|
| No fake metrics | No percentages, scores, or counters on home |
| No fake charts | Platform map is architectural diagram, not data visualization |
| No fake AI | No “AI insights” or confidence scores on home |
| No fake activity | No activity feeds or “users online” |
| No fabricated statistics | Status from static honest registry |
| No marketing language | Factual capability descriptions |
| No exaggerated claims | Future capabilities labeled “planned” or “in progress” |
| No placeholders pretending active | Disconnected topics show “Evidence Source Not Connected” |
| Evidence first | Every module states evidence status and dependencies |

**Untouched (per mission):** `lib/intelligence/*`, runtime, orchestrator, evidence engine, reasoning, agents.

---

## Future Mobile Readiness

- **Responsive grid:** Hero stacks on mobile; topic cards 2-column → 4-column on large screens
- **Touch targets:** `min-h-11` on CTAs; `min-h-[4.5rem]` on topic cards
- **Clamp spacing:** Section gaps scale with viewport
- **i18n-ready content:** Language registry + centralized copy in `platform-home.ts`
- **Roadmap includes Mobile + API phases** — not implemented on home, only listed as planned
- **Native search form:** Hero search works on mobile browsers without JS hydration

---

## Files Changed (Elite)

### Created

| File | Purpose |
|------|---------|
| `components/platform/home/HomeHeroSearch.tsx` | Hero GET search form |
| `components/platform/home/HomePlatformMap.tsx` | SVG architecture diagram |
| `components/platform/home/HomeLanguages.tsx` | Language availability grid |
| `components/platform/home/HomeRoadmapTimeline.tsx` | Verified roadmap timeline |
| `docs/home-page-elite-report.md` | This report |

### Modified

| File | Change |
|------|--------|
| `lib/platform-home.ts` | Elite schemas: topics, personas, modules, trust×8, impact, languages, roadmap, footer, `PLATFORM_VERSION` |
| `components/platform/home/HomeHero.tsx` | Search-centered layout, topic cards, CTAs |
| `components/platform/home/HomePersonas.tsx` | Full persona schema, clickable cards |
| `components/platform/home/HomeModules.tsx` | Dependencies field |
| `components/platform/home/HomeTrust.tsx` | Trust Center (8 pillars) |
| `components/platform/home/HomeGlobalImpact.tsx` | Current value + future roadmap |
| `components/platform/home/HomePlatformStatus.tsx` | Grouped honest status |
| `components/platform/home/HomeFooter.tsx` | Expanded footer columns + version/build |
| `components/platform/home/HomeSection.tsx` | Design system classes |
| `components/platform/PlatformHome.tsx` | Final section order |
| `app/globals.css` | `.home-page`, `.home-section`, light theme, `.sr-only` |
| `app/(dashboard)/search/page.tsx` | Initialize from `?q=` query param |

### Deleted

| File | Reason |
|------|--------|
| `components/platform/home/HomeFlow.tsx` | Replaced by `HomePlatformMap` |
| `components/platform/home/HomeLanguagesRoadmap.tsx` | Split into `HomeLanguages` + `HomeRoadmapTimeline` |

---

## Verification

```bash
npm run lint   # ✓ passed
npm run build  # ✓ passed — 18 static pages, / is ○ Static
```

**No git commit** — per mission instructions.

---

## Summary

The CBAI home page is now the final Evidence Intelligence Platform entrance: search-centered hero, honest topic routing, structured personas and modules, SVG platform map, eight-pillar Trust Center, multilingual and roadmap preparation, and constitution-compliant copy throughout. Intelligence engines and Cloudflare export compatibility remain unchanged.
