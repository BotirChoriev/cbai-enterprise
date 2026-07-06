# Home Platform Evolution Report

**Build:** Platform Evolution Phase 1 — Home Page Transformation  
**Date:** July 6, 2026  
**Scope:** Platform Experience only (`/` home route)  
**Intelligence engine:** Not modified

---

## Summary

The home page (`/`) was transformed from a module grid with runtime snapshot into a **constitution-compliant platform entrance**. A first-time visitor can now understand what CBAI is, who it serves, how it works, and where to begin — within the 20-second goal — without fake metrics, demo KPIs, or marketing hype.

Primary CTA: **Begin with Countries** → `/countries` (Golden Rule reference module).

---

## Created files

| File | Purpose |
|------|---------|
| `lib/platform-home.ts` | Honest static content: personas, modules, principles, capabilities, roadmap, languages |
| `components/platform/PlatformHome.tsx` | Home page orchestrator (10 sections) |
| `components/platform/home/HomeHero.tsx` | Section 1 — Hero |
| `components/platform/home/HomePersonas.tsx` | Sections 2 & 7 — Persona cards |
| `components/platform/home/HomeModules.tsx` | Section 3 — Platform modules with status badges |
| `components/platform/home/HomeFlow.tsx` | Section 4 — Evidence flow |
| `components/platform/home/HomePrinciples.tsx` | Section 5 — Platform principles |
| `components/platform/home/HomePlatformStatus.tsx` | Section 6 — Real capabilities + runtime snapshot |
| `components/platform/home/HomeLanguagesRoadmap.tsx` | Sections 8 & 9 — Languages and roadmap |
| `components/platform/home/HomeFooter.tsx` | Section 10 — Footer |
| `components/platform/home/HomeSection.tsx` | Shared section wrapper |
| `components/platform/home/StatusBadge.tsx` | Available / In Progress / Evidence Not Connected badges |

---

## Modified files

| File | Change |
|------|--------|
| `app/(dashboard)/page.tsx` | Replaced module grid with `PlatformHome` |
| `app/globals.css` | Added theme CSS variables for dark/light readiness |

**Not modified:** `lib/intelligence/**`, runtime, orchestrator, evidence engine, algorithms.

**Preserved but unused on home:** `components/platform/PlatformRuntimeStatus.tsx` (runtime data now shown honestly in `HomePlatformStatus`).

---

## Architecture summary

```
app/(dashboard)/page.tsx
  └── PlatformHome.tsx (server component)
        ├── lib/platform-home.ts          ← content layer (i18n-ready structure)
        ├── HomeHero … HomeFooter         ← presentation sections
        └── HomePlatformStatus
              └── collectRuntimeDashboardData()  ← read-only; no engine changes
```

**Design decisions:**

- **Content separated from UI** — `lib/platform-home.ts` holds all copy and status labels for future locale bundles (`@cbai/content`).
- **Honest module status** — Each module declares Available, In Progress, or Evidence Not Connected based on current audit state.
- **Runtime snapshot** — Real in-process observability values only; labeled as local session data, not production telemetry.
- **Responsive layout** — Grid breakpoints (`sm`, `lg`, `xl`), horizontal scroll on flow for narrow viewports, min touch targets on CTA (44px).
- **Accessibility** — Section `aria-labelledby`, form labels on language selector, semantic headings.

---

## Home page sections

| # | Section | Implementation |
|---|---------|----------------|
| 1 | Hero | Headline, explanation, difference statement, single CTA |
| 2 | Who Uses CBAI | Six persona cards with value propositions |
| 3 | Platform Modules | Nine modules with honest today-descriptions and status |
| 4 | How CBAI Works | Evidence → Analysis → Confidence → Trust → Decision Intelligence |
| 5 | Platform Principles | Six constitutional principles |
| 6 | Current Platform Status | Capability grid + labeled runtime snapshot |
| 7 | Supported Personas | Same personas with entry links |
| 8 | Languages | Selector (disabled) + planned locale list |
| 9 | Platform Roadmap | Verified phases from transformation master plan |
| 10 | Footer | Mission, constitution reference, principles, version |

---

## Persona improvements

| Persona | Before | After |
|---------|--------|-------|
| General Citizen | No home guidance | Value statement + link to country registry |
| Investor | No entry point | Transparency scope explained; link to countries |
| Government Leader | No entry point | Evidence-only governance framing; link to countries |
| Student | No entry point | Factual registry path; case studies marked as planned |
| Researcher | No entry point | Graph entry; fabrication removal noted |
| Academic | No entry point | Methodology blocks path via countries |

Home page constitution score (route `/`) improves from **85 → ~92** (estimated): no fake data, clear mission, persona value for all six audiences.

---

## Constitution compliance

| Rule | Status |
|------|--------|
| No demo / fake numbers | ✅ No fabricated KPIs, charts, or activity feeds |
| No fake AI metrics | ✅ Runtime values labeled as local session only |
| No marketing hype | ✅ Plain language; no superlatives |
| Evidence Intelligence positioning | ✅ Hero and principles state platform law |
| No unavailable promises | ✅ Module cards and roadmap mark In Progress honestly |
| Golden Rule (persona value) | ✅ All six personas addressed on home |
| NO DEMO LAW | ✅ "Insufficient evidence" posture reflected in module statuses |

---

## Platform score impact (estimated)

| Dimension | Before | After (home route) |
|-----------|--------|---------------------|
| Platform Experience (`/`) | 62 | ~88 |
| Constitution (`/`) | 85 | ~92 |
| Persona coverage on home | 0 / 6 clear | 6 / 6 addressed |

Overall platform scores unchanged until entity routes (P0) are remediated.

---

## Verification

```
npm run lint   ✅ passed
npm run build  ✅ passed (18 static routes)
```

Static export compatible. No intelligence engine files modified.

---

*No commit created per mission instructions.*
