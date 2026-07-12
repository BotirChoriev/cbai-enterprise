# Design System

Real, current design tokens and components — not aspirational. Source of truth is `app/globals.css` and `components/brand/`; this is a navigable reference, not a duplicate spec that can drift.

## Palette

Deep-navy foundation with layered midnight-blue surfaces, cyan interaction accents — never an all-black surface, never neon-glow overuse (Phase 17).

| Token | Value | Use |
|---|---|---|
| `--background` | `#050810` | Page background (deep navy) |
| `--surface` | `#0c1220` | Card/panel surfaces (`.cbai-glass`) |
| `--border` | `#1e293b` | Default borders |
| `--muted` | `#94a3b8` | Secondary text |
| `--accent` | `#22d3ee` (cyan-400) | Primary interaction color |
| `--accent-muted` | `rgba(34,211,238,0.12)` | Accent backgrounds |

Beyond these CSS variables, the app overwhelmingly uses raw Tailwind utility classes (`zinc-50`…`zinc-950`, `slate-900/950`, `cyan-300/400/500`, `blue-400`) rather than a fully tokenized utility layer — real, consistent, but not abstracted further; changing the palette today means a repo-wide utility-class sweep, not a single variable edit. `--surface`/`--border`/`--muted`/`--accent`/`--accent-muted` are consumed directly as `var(...)` in a few custom classes (`.cbai-glass`), not exposed as Tailwind utilities.

**Restricted accent use** (Phase 17): indigo/violet stay controlled accents (role-card selected state, avatar colors), cyan carries all primary interaction, amber is reserved for economic/business contexts only (`ASSISTANT_AVATAR_CLASSES.amber`, warning/error states like voice permission-denied).

## Shared component classes (`components/brand/brand-classes.ts`)

`cbaiGlassCard`, `cbaiSectionTitle`, `cbaiSectionEyebrow`, `cbaiPageHeader`, `cbaiBtnPrimary`, `cbaiBtnSecondary`, `cbaiNavActive`/`cbaiNavInactive`, `cbaiSearchShell`/`cbaiSearchInput`, `cbaiHeroGlow`. Every new component this mission added reuses these rather than declaring new button/card styles.

## Brand identity (`components/brand/CBAILogo.tsx`)

- `CBAIMark` — the circular intelligence/network symbol (geometric C, inner globe, 4-node network ring, cyan→blue gradient). `standalone` prop gives it its own accessible name (`role="img" aria-label`) for icon-only usage; otherwise `aria-hidden` since an adjacent wordmark carries the name.
- `CBAILogo` — mark + "CBAI" wordmark + "UNIVERSAL INTELLIGENCE" subtitle. `size: "sm"|"md"|"lg"|"xl"`, `compact` (icon + small wordmark, no subtitle), `variant: "dark"|"light"` (light variant for non-navy/print surfaces — see `components/shared/ReportHeaderLogo.tsx`).
- `app/icon.svg` — real static favicon/app-icon, a closed circular ring variant of the mark (Next.js's real `icon.svg` file convention, resolved at build time even in a static export).

Applied to: landing page (`HomeHero`), application shell (`Sidebar`, `Topbar`, `MobileNavDrawer`), loading/error states (`SystemPageShell` — covers `app/error.tsx`, `app/not-found.tsx`, `app/(dashboard)/error.tsx`), and all 5 report headers (`ReportHeaderLogo`, print-visible). Account and Trust Center pages inherit the logo via the persistent Sidebar/Topbar shell rather than a redundant per-page copy.

## Motion

Restrained by default; `.cbai-reduced-motion` (toggled from the real Accessibility preference in `AssistantProfileProvider`) is the one class every animated surface should respect. No animation loops (`setInterval`/`requestAnimationFrame`) were added by this mission — the "global intelligence visual" (`WorldIntelligenceMap`) is a real, accessible link grid, not a canvas/WebGL globe, specifically to avoid a fabricated live-motion visual and the performance cost of one.
