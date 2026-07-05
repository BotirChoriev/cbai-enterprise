# BUILD-016 — Platform Stabilization Report

**Build ID:** BUILD-016  
**Date:** July 5, 2026  
**Mission:** Stabilize the existing CBAI Enterprise platform without redesign  
**Status:** Analysis complete — **no code changes made yet**

---

## Executive Summary

The CBAI Enterprise codebase is **functionally stable** and **Cloudflare static-export compatible**. Lint and build pass with 18 static routes. TypeScript strict mode is enabled and clean.

BUILD-016 should be a **surgical cleanup**: remove verified dead code, strip BUILD debug labels, restore missing Cloudflare redirect config, and document deploy settings. No UI redesign, no new features, no module removal.

| Check | Result |
|-------|--------|
| Lint | ✅ Pass (0 errors) |
| Build (`output: "export"`) | ✅ Pass — 18 static routes → `out/` |
| TypeScript strict | ✅ Enabled, build type-check passes |
| All sidebar routes exist | ✅ 14/14 |
| Entity Framework | ✅ Intact across intelligence modules |
| Dead component files | ⚠️ 6 confirmed unused |
| BUILD debug labels | ⚠️ 2 in production UI |
| `public/_redirects` | ❌ Missing (CF regression) |
| Internal deep links | ⚠️ Partial — routes valid, `?id=` ignored |

---

## 1. Repository Analysis

### 1.1 Stack & config

| Item | Value |
|------|-------|
| Next.js | 16.2.10 |
| React | 19.2.4 |
| TypeScript | 5.x, `strict: true` |
| Tailwind | v4 via `@tailwindcss/postcss` |
| Export mode | `output: "export"` in `next.config.ts` |
| Images | `unoptimized: true` (required for static export) |
| Dependencies | `next`, `react`, `react-dom` only — no external UI libs |

### 1.2 Route inventory (preserved — 15 pages + root)

| Route | File | Client? | Module status |
|-------|------|---------|---------------|
| `/` | `app/page.tsx` | RSC | Meta-refresh → `/dashboard` |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | RSC | Full |
| `/core` | `app/(dashboard)/core/page.tsx` | Client | Full |
| `/countries` | `app/(dashboard)/countries/page.tsx` | Client | Full + Entity Framework |
| `/companies` | `app/(dashboard)/companies/page.tsx` | Client | Full + Entity Framework |
| `/universities` | `app/(dashboard)/universities/page.tsx` | Client | Full + Entity Framework |
| `/search` | `app/(dashboard)/search/page.tsx` | Client | Full |
| `/graph` | `app/(dashboard)/graph/page.tsx` | Client | Full |
| `/reasoning` | `app/(dashboard)/reasoning/page.tsx` | Client | Full |
| `/ai-control` | `app/(dashboard)/ai-control/page.tsx` | RSC | Full |
| `/agents` | `app/(dashboard)/agents/page.tsx` | RSC | Full |
| `/knowledge` | `app/(dashboard)/knowledge/page.tsx` | RSC | Full |
| `/workflows` | `app/(dashboard)/workflows/page.tsx` | RSC | Placeholder UI |
| `/analytics` | `app/(dashboard)/analytics/page.tsx` | RSC | Placeholder UI |
| `/settings` | `app/(dashboard)/settings/page.tsx` | RSC | Placeholder UI |

**Note:** Placeholder pages (`workflows`, `analytics`, `settings`) are valid routes with intentional "coming soon" content — **do not remove** per BUILD-016 rules.

### 1.3 Layouts

| File | Role |
|------|------|
| `app/layout.tsx` | Root — fonts, metadata, dark theme |
| `app/(dashboard)/layout.tsx` | App shell — Sidebar + Topbar + main |

### 1.4 Lib modules (20 files — all in use)

| Module | Files | Consumed by |
|--------|-------|-------------|
| Entity Framework | `lib/entity/*` (3) | All intelligence UI |
| Countries | `countries.ts`, `countries.adapter.ts` | Countries page, search, graph, reasoning |
| Companies | `companies.ts`, `companies.adapter.ts` | Companies page, search, graph, reasoning |
| Universities | `universities.ts`, `universities.adapter.ts` | Universities page, search, graph, reasoning |
| Global Search | `global-search.ts` | Search page, reasoning engine |
| Knowledge Graph | `lib/graph/*` (3) | Graph page, reasoning engine |
| Reasoning Engine | `lib/reasoning/*` (3) | Reasoning page |
| Platform mocks | `core.ts`, `agents.ts`, `knowledge.ts` | Core, agents, knowledge pages |
| Navigation | `navigation.ts` | Sidebar |

### 1.5 Active components (55 of 61 files)

All components under domain folders (`entity/`, `graph/`, `reasoning/`, etc.) are imported and used. Layout, UI, and module components form a closed dependency graph with no orphan imports detected.

---

## 2. Dead Code — Verified Unused (safe to remove)

The following files have **zero imports** anywhere in the application codebase. They are orphaned from BUILD-001 when `app/page.tsx` was changed to redirect to `/dashboard`.

| File | Lines (approx) | Reason orphaned |
|------|----------------|-----------------|
| `components/Hero.tsx` | ~50 | Landing page removed |
| `components/Footer.tsx` | ~90 | Landing page removed |
| `components/Navigation.tsx` | ~120 | Landing page removed |
| `components/Features.tsx` | ~100 | Landing page removed |
| `components/AISection.tsx` | ~60 | Landing page removed |
| `components/Stats.tsx` | ~40 | Landing page removed (not `agents/AgentStats.tsx`) |

**Verification method:** `grep` for `@/components/Hero`, `@/components/Footer`, etc. — no matches in `app/`, `components/` (except self), or `lib/`.

### 2.1 Unused public assets (safe to remove)

| File | Referenced in code? |
|------|---------------------|
| `public/vercel.svg` | ❌ No |
| `public/file.svg` | ❌ No |
| `public/window.svg` | ❌ No |

**Keep:** `public/.nojekyll` — useful for static hosting; no harm.

### 2.2 Unused export (optional — not a file)

| Export | File | Recommendation |
|--------|------|----------------|
| `getTotalReasoningDuration()` | `lib/reasoning/reasoning.engine.ts` | Remove export or function — never imported |

**BUILD-016 scope decision:** Removing an unused exported function is stabilization, not a feature change. Recommended.

---

## 3. BUILD Debug Labels — Remove

Two production UI strings expose internal build IDs:

| File | Line | Current text | Proposed replacement |
|------|------|--------------|----------------------|
| `app/(dashboard)/graph/page.tsx` | ~49 | `BUILD-013 · Relationship Engine` | `Relationship Engine` or remove subtitle line |
| `components/reasoning/ReasoningInput.tsx` | ~28 | `BUILD-014 · Cognitive Engine` | `Cognitive Engine` or remove subtitle line |

**Rule compliance:** Removing debug labels is not a redesign — the hero structure, typography, and layout stay identical.

---

## 4. Internal Navigation Verification

### 4.1 Sidebar navigation ✅

`lib/navigation.ts` defines 14 items. All `href` values map to existing pages:

| Nav label | href | Page exists |
|-----------|------|-------------|
| Dashboard | `/dashboard` | ✅ |
| CBAI Core | `/core` | ✅ |
| Countries | `/countries` | ✅ |
| Companies | `/companies` | ✅ |
| Universities | `/universities` | ✅ |
| Global Search | `/search` | ✅ |
| Knowledge Graph | `/graph` | ✅ |
| Reasoning Engine | `/reasoning` | ✅ |
| AI Control | `/ai-control` | ✅ |
| AI Agents | `/agents` | ✅ |
| Knowledge | `/knowledge` | ✅ |
| Workflows | `/workflows` | ✅ |
| Analytics | `/analytics` | ✅ |
| Settings | `/settings` | ✅ |

`NavIcon.tsx` icon union covers all 14 icon keys — no missing mappings.

Sidebar active-state logic (`pathname === href || pathname.startsWith(href)`) is safe given unique path prefixes.

### 4.2 Cross-module links ⚠️

| Source | Target | Route valid? | Entity selection? |
|--------|--------|--------------|-------------------|
| `Sidebar.tsx` | All nav hrefs | ✅ | N/A |
| `SearchResults.tsx` | `/countries`, `/companies`, `/universities` via `getEntityHref()` | ✅ | ❌ No `?id=` — lands on default entity |
| `GraphInspector.tsx` | `${route}?id=${entityId}` | ✅ | ❌ Pages ignore `searchParams` |
| `ReasoningSummary.tsx` | `${getEntityHref(entity)}?id=${entity.id}` | ✅ | ❌ Pages ignore `searchParams` |

**BUILD-016 decision:** Fixing `searchParams` would change app behavior (entity pre-selection). Per rules ("Do NOT add new features"), **do not fix deep links in BUILD-016**. Document as known limitation. Routes themselves are valid.

### 4.3 Decorative navigation (not broken — out of scope)

| Element | Location | Status |
|---------|----------|--------|
| Topbar search | `Topbar.tsx` | Input only — no navigation |
| Topbar ⌘K | `Topbar.tsx` | Display only |
| Topbar notifications / user menu | `Topbar.tsx` | Buttons only |

These are demo placeholders, not broken links. **Do not remove** (would be UI change).

---

## 5. Import Verification ✅

### 5.1 Path alias

All application imports use `@/` alias — consistent with `tsconfig.json` paths.

### 5.2 No broken imports detected

- Full lint pass: 0 errors
- Full build pass: TypeScript compilation succeeds
- No unresolved module errors

### 5.3 Import graph health

```
app/(dashboard)/*/page.tsx
    → components/{module}/*
    → lib/{module}.ts | lib/{module}.adapter.ts
    → lib/entity/*

lib/graph/graph.builder.ts
    → lib/countries|companies|universities + adapters (no duplicated entity data)

lib/reasoning/reasoning.engine.ts
    → lib/global-search.ts, lib/graph/graph.builder.ts
```

No circular dependencies observed. Entity Framework remains the single normalization path for intelligence entities.

---

## 6. TypeScript Strict Mode ✅

### 6.1 Compiler config (`tsconfig.json`)

```json
"strict": true
"noEmit": true
"isolatedModules": true
```

### 6.2 Verification results

| Check | Result |
|-------|--------|
| `any` usage | None found |
| `@ts-ignore` / `@ts-expect-error` | None found |
| `eslint-disable` | None found |
| Build type-check | Passes |
| Optional field handling | `entity.icon?` guarded with `entityTypeIconPaths` fallbacks in graph/reasoning components |

**No TypeScript changes required for BUILD-016.**

---

## 7. Cloudflare Pages Compatibility

### 7.1 Current static export config ✅

```typescript
// next.config.ts
output: "export"
images: { unoptimized: true }
```

Build output: `out/` with flat `.html` files per route (`dashboard.html`, `countries.html`, etc.) plus `index.html` and `404.html`.

### 7.2 Missing / regressed items ❌

| Item | Status | Impact |
|------|--------|--------|
| `public/_redirects` | **Missing** | No CDN-level `/ → /dashboard` or 404 fallback |
| Root redirect | Meta-refresh in `app/page.tsx` | Works but slower; depends on HTML load |
| README deploy docs | Boilerplate | No CF build instructions |
| Node version pin | None | CF may use inconsistent Node version |

### 7.3 Recommended `public/_redirects` (restore from BUILD-015 P0)

```
/ /dashboard 302
/* /404.html 404
```

Cloudflare matches static assets before redirect rules — prebuilt routes unaffected.

### 7.4 Cloudflare Pages settings (unchanged — document only)

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Output directory | `out` |
| Node.js version | 20 |

### 7.5 Static export constraints — all satisfied ✅

| Constraint | Status |
|------------|--------|
| No API routes | ✅ |
| No server actions | ✅ |
| No middleware | ✅ |
| No `process.env` runtime deps | ✅ |
| No dynamic routes | ✅ |
| `next/image` with `unoptimized` | ✅ |

---

## 8. Planned BUILD-016 Changes (implementation phase)

The following changes are **approved for implementation** after this report. They comply with all BUILD-016 rules.

### 8.1 Delete — dead code only

```
components/Hero.tsx
components/Footer.tsx
components/Navigation.tsx
components/Features.tsx
components/AISection.tsx
components/Stats.tsx
public/vercel.svg
public/file.svg
public/window.svg
```

### 8.2 Edit — debug label removal (text only, same layout)

| File | Change |
|------|--------|
| `app/(dashboard)/graph/page.tsx` | Replace `BUILD-013 · Relationship Engine` → `Relationship Engine` |
| `components/reasoning/ReasoningInput.tsx` | Replace `BUILD-014 · Cognitive Engine` → `Cognitive Engine` |

### 8.3 Add — Cloudflare static hosting

| File | Change |
|------|--------|
| `public/_redirects` | Restore root redirect + 404 fallback |

### 8.4 Edit — unused export cleanup

| File | Change |
|------|--------|
| `lib/reasoning/reasoning.engine.ts` | Remove unused `getTotalReasoningDuration()` export |

### 8.5 Explicitly NOT in BUILD-016 scope

| Item | Reason |
|------|--------|
| Fix `?id=` deep links | Behavior change |
| Wire Topbar search | Feature |
| Unify page headers | Redesign |
| Remove demo identity ("Acme Corp", "Jane Doe") | UI/content change |
| Remove placeholder pages content | Module removal / redesign |
| Update README | Out of scope unless explicitly requested |
| Add CI / tests / auth | New infrastructure |

---

## 9. Verification checklist (post-implementation)

After code changes, run:

```bash
npm run lint
npm run build
```

Confirm:

- [ ] 18 static routes still build
- [ ] `out/_redirects` present after build
- [ ] No imports reference deleted files
- [ ] No BUILD-0* strings in `app/` or `components/` (except `docs/`)
- [ ] Entity Framework pages unchanged
- [ ] All 14 sidebar routes reachable

---

## 10. Risk assessment

| Change | Risk | Mitigation |
|--------|------|------------|
| Delete 6 landing components | None | Zero imports verified |
| Delete 3 public SVGs | None | Zero code references |
| Remove BUILD labels | None | Text-only, same DOM structure |
| Restore `_redirects` | Low | Standard CF pattern; static assets matched first |
| Remove unused export | None | Never imported |

---

## 11. Conclusion

BUILD-016 is ready to execute as a **minimal, low-risk stabilization pass**:

1. **6 dead component files** + **3 unused public SVGs** can be deleted safely  
2. **2 BUILD debug labels** should be stripped  
3. **`public/_redirects`** should be restored for Cloudflare Pages  
4. **1 unused export** can be removed  
5. **Everything else stays** — routes, modules, Entity Framework, UI patterns, placeholder pages, demo content  

No code has been modified during this analysis phase. Proceed to implementation upon approval.

---

*BUILD-016 Report — analysis only, no application changes made.*
