# 08 — Design Standard

**Document ID:** CBAI-Standard-08-Design  
**Version:** 1.0.0  
**Status:** Official

---

## Purpose

Define the visual and layout discipline for CBAI Enterprise across web surfaces. Design communicates trust through restraint — mission control, not marketing site or sci-fi demo.

---

## Principles

- **Evidence First** — clarity over decoration; every element earns its place
- **Political Neutrality** — no national, partisan, or ideological symbolism
- **Transparency** — status labels, hierarchy, and unavailable states are visually clear
- **Platform Consistency** — shared spacing, typography, and components across routes
- **Golden Rule (brand)** — no visual element implies certainty without evidence

---

## Architecture

```
Brand Foundation (docs/brand/cbai-brand-foundation.md)
        │
        ▼
Design Tokens (Tailwind v4, zinc palette, accent colors)
        │
        ▼
Shared Components (cards, entity layout, status badges)
        │
        ▼
Route Modules (countries, companies, universities, search, graph, home)
        │
        ▼
Responsive Breakpoints → Mobile Standard (10)
```

---

## Rules

1. Use platform spacing scale: 4px base, 8px increments (`p-2`, `p-4`, `gap-6`, `gap-8`).
2. Content max-width aligns with dashboard shell (1280px / `max-w-7xl`).
3. Status labels use consistent badge variants (connected, not connected, planned, unavailable).
4. Dark mode is primary; light mode must meet contrast requirements ([09 — Accessibility](./09-accessibility-standard.md)).
5. No gradient placeholder marks in production — use approved logo or wordmark.
6. Data values use monospace; section labels use uppercase tracking.
7. Cards group related intelligence; one primary entity focus per view.

---

## Platform spacing

| Token | Value | Usage |
|-------|-------|-------|
| Base unit | 4px | Fine adjustments |
| Standard increment | 8px | Padding, gaps |
| Section gap | 24–32px | Between intelligence blocks |
| Page padding | 16–24px mobile, 32px desktop | Route containers |
| Card padding | 16–24px | Inner content |

---

## Typography

| Role | Style |
|------|-------|
| Page title | Semibold, large, zinc-50 (dark) / zinc-900 (light) |
| Section label | Uppercase, tracking-wide, text-xs, zinc-500 |
| Body | Regular, zinc-300 (dark) / zinc-700 (light) |
| Data / codes | Monospace, zinc-200 |
| Status | Semibold xs, semantic color (not red/green judgment) |

Font stack: system UI sans + monospace for data (no decorative display fonts).

---

## Icons

- Lucide or inline SVG — consistent stroke width
- Semantic icons only (shield for trust, link for source, alert for unavailable)
- No national flags as primary entity icons unless explicit country flag field with neutrality notice
- No robot/brain sci-fi icons for AI surfaces — use pipeline or document metaphors

---

## Cards

- Rounded corners: `rounded-lg` or `rounded-xl` consistently
- Border: subtle zinc-800 (dark) / zinc-200 (light)
- Background: zinc-900/50 or zinc-950 (dark); white/zinc-50 (light)
- No fake chart cards with invented data — empty states with honest copy
- Trust blocks and persona blocks use same card primitive

---

## Dark mode (primary)

- Base: zinc-950 background, zinc-900 surfaces
- Accents: sky, violet, cyan — sparingly for links and focus
- Avoid pure black (#000) large fields — use zinc-950
- Status colors: informational blue/amber, not success/failure judgment green/red for scores

---

## Light mode

- Base: white / zinc-50
- Text: zinc-900 body, zinc-600 secondary
- Same accent discipline as dark
- Required for accessibility preference and print/PDF export (future)

---

## Desktop

- Multi-column layouts for entity detail (main + sidebar)
- Graph: three-panel layout (entity | canvas | connections)
- Search gateway: grouped sections, not infinite single column
- Minimum viewport design target: 1280×800

---

## Tablet

- Breakpoint: 768px–1023px
- Collapse sidebars below main content
- Touch targets minimum 44×44px
- Graph panels stack or tab between entity / canvas / connections

---

## Mobile

- Breakpoint: below 768px
- Single column; progressive disclosure via accordions
- Sticky section nav for long entity pages (future)
- Full mobile rules: [10 — Mobile Standard](./10-mobile-standard.md)

---

## Allowed

- Dark-first zinc palette with sky/violet/cyan accents
- Evidence status badges on every intelligence block
- Empty states with illustration-free text guidance
- Pipeline SVG diagrams (search, home) without fake metrics
- Bloomberg-grade density with clear hierarchy

---

## Forbidden

- "NEURAL LINK ACTIVE", holographic gradients, cyberpunk demo aesthetics
- Confidence progress bars without verified evidence chain
- Decorative charts with invented time series
- Inconsistent spacing between entity routes
- National flag hero backgrounds implying endorsement
- Consumer chatbot bubbles as primary layout for intelligence routes

---

## Examples

**Compliant — status badge**

> `NOT CONNECTED` — amber/zinc badge, uppercase, no percentage

**Compliant — entity card**

> Title · Subtitle · Registry fact row · Indicator list with statuses · Persona footer

**Non-compliant**

> Glowing 96.1% confidence ring around company logo

---

## Future expansion

- Design token package export for iOS/Android
- Figma component library synced to code
- Light mode parity audit across all routes
- PDF report template ([brand foundation](../brand/cbai-brand-foundation.md))
- Motion guidelines (reduced motion default)

---

## Cross-references

- [09 — Accessibility Standard](./09-accessibility-standard.md)
- [10 — Mobile Standard](./10-mobile-standard.md)
- [07 — Persona Standard](./07-persona-standard.md)
- `docs/brand/cbai-brand-foundation.md`
