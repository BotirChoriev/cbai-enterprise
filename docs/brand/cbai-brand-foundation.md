# CBAI Brand Identity Foundation

**Document:** CBAI Brand Foundation v1.0  
**Status:** Official design specification (documentation only)  
**Scope:** Complete visual language for CBAI Enterprise Intelligence Platform  
**Alignment:** CBAI Constitution · Golden Rule · Evidence-First Intelligence

---

## 1. Brand Philosophy

CBAI (Constitutional Balanced AI) is an **evidence-first, politically neutral, enterprise intelligence platform**. The brand exists to communicate trust through restraint—not through spectacle.

The visual identity must express:

| Core value | Brand expression |
|------------|------------------|
| **Evidence First** | Clarity over decoration; every visual element earns its place |
| **Political Neutrality** | No national, partisan, or ideological symbolism |
| **Balance** | Symmetry, proportion, and calm composition |
| **Transparency** | Open layouts, readable hierarchy, disclosed states |
| **Trust** | Consistency, predictability, professional gravitas |
| **Global Intelligence** | Universal forms; no region-specific iconography |
| **Professional Enterprise** | Bloomberg-grade seriousness; boardroom-ready |
| **Timeless design** | Avoid trend cycles; design for decades, not quarters |

CBAI does not look like a consumer chatbot, a social app, or a sci-fi product demo. It looks like **infrastructure for serious decisions**.

**Golden Rule (brand):** If a visual element implies certainty without evidence, it does not belong in the CBAI brand system.

---

## 2. Logo Meaning

The CBAI mark represents a vertical chain of intelligence discipline:

```
Evidence → Balance → Knowledge → Global Intelligence → Trusted Decisions
```

**Evidence** — The foundation layer; nothing is asserted without source connectivity.  
**Balance** — Equilibrium between competing signals; no single narrative dominates.  
**Knowledge** — Structured understanding derived from verified inputs.  
**Global Intelligence** — Scope without territorial symbolism; universal application.  
**Trusted Decisions** — The outcome enabled by the chain above.

The logo is not a mascot, not a metaphor for "AI thinking," and not a promise of omniscience. It is a **seal of methodological rigor**.

---

## 3. Logo Geometry

The primary mark is constructed on a **square grid** with golden-ratio subdivisions (1:1.618) for proportional harmony.

**Primary construction elements:**

- **Foundation bar** — Horizontal baseline representing evidence grounding (full grid width at bottom third)
- **Balance axis** — Vertical centerline; all symmetry references this axis
- **Knowledge node** — Central geometric form (circle or rounded square) at the intersection of foundation and axis
- **Intelligence arc** — Subtle upper curve or paired lines suggesting global reach without globe clichés
- **Decision point** — Small terminal mark at apex (dot or short serif) indicating resolved output

All angles are **0°, 45°, or 90°** only. No arbitrary rotations. Curves use consistent radius tokens (see Corner Radius Rules).

Letterform **CBAI** when used alongside the mark follows geometric sans construction with optically corrected stroke weights.

---

## 4. Grid System

| Grid type | Specification |
|-----------|---------------|
| **Logo grid** | 24×24 unit master artboard |
| **Baseline unit** | 1 unit = 1/24 of mark height |
| **Subdivisions** | 2, 4, 6, 8, 12 unit guides |
| **Golden ratio** | Major elements spaced at 8:13 unit ratio where applicable |
| **UI grid (platform)** | 4px base; 8px spacing increments |
| **Content max-width** | 1280px (7xl) aligned with dashboard shell |

Logo and UI grids are **independent but harmonized** — logo units do not map 1:1 to UI pixels; scale proportionally.

---

## 5. Safe Area

Minimum clear space around the logo equals **1× the height of the knowledge node** (central element) on all sides.

```
┌─────────────────────────────┐
│         safe area           │
│    ┌─────────────────┐      │
│    │                 │      │
│    │   CBAI MARK     │      │
│    │                 │      │
│    └─────────────────┘      │
│         safe area           │
└─────────────────────────────┘
```

No text, icons, borders, or UI chrome may enter the safe area. On busy backgrounds, increase safe area to **1.5×** node height.

---

## 6. Minimum Size

| Context | Minimum size |
|---------|--------------|
| **Print** | 12mm mark height (16mm with wordmark) |
| **Digital — full mark** | 24px height |
| **Digital — favicon** | 16px (simplified icon only) |
| **Digital — app icon** | 32px source within 1024px canvas |
| **Wordmark only** | 80px width minimum |

Below minimum sizes, use **icon-only simplified mark** (see Favicon Rules). Never scale below legibility threshold.

---

## 7. Primary Colors

Primary palette is **restrained, neutral-first, evidence-calm**. No neon, no gradient-as-brand.

| Token | Hex | Role |
|-------|-----|------|
| `cbai-ink` | `#09090B` | Primary text, logo on light |
| `cbai-surface` | `#18181B` | Primary dark background |
| `cbai-surface-elevated` | `#27272A` | Cards, panels |
| `cbai-border` | `#3F3F46` | Dividers, strokes |
| `cbai-accent` | `#0EA5E9` | Primary action, evidence-connected state |
| `cbai-accent-muted` | `#0284C7` | Hover, secondary emphasis |
| `cbai-white` | `#FAFAFA` | Primary text on dark, logo reverse |

**Accent usage rule:** Sky blue (`cbai-accent`) indicates **connected evidence or active intelligence state**—not decoration. Maximum 10% of any viewport.

---

## 8. Secondary Colors

Semantic colors for status and intelligence layers—never for logo primary form.

| Token | Hex | Role |
|-------|-----|------|
| `cbai-healthy` | `#34D399` | Evidence sufficient, healthy runtime |
| `cbai-degraded` | `#FBBF24` | Insufficient evidence, degraded state |
| `cbai-blocked` | `#F87171` | Blocked, insufficient trust |
| `cbai-neutral` | `#A1A1AA` | Unavailable, not connected |
| `cbai-violet` | `#8B5CF6` | Knowledge graph (secondary module) |
| `cbai-cyan` | `#22D3EE` | Entity intelligence (countries module accent) |

Secondary colors **never appear in the logo mark**. They are platform semantic only.

---

## 9. Typography

| Role | Typeface | Fallback stack |
|------|----------|----------------|
| **Primary UI** | Geist Sans | `Geist, system-ui, -apple-system, sans-serif` |
| **Monospace / data** | Geist Mono | `Geist Mono, ui-monospace, monospace` |
| **Reports (PDF)** | Inter | `Inter, Helvetica, Arial, sans-serif` |

**Scale (platform):**

| Level | Size | Weight | Use |
|-------|------|--------|-----|
| Display | 32px / 2rem | 600 | Page titles |
| Heading 1 | 24px / 1.5rem | 600 | Section headers |
| Heading 2 | 18px / 1.125rem | 600 | Card titles |
| Body | 14px / 0.875rem | 400 | Default content |
| Caption | 12px / 0.75rem | 400 | Metadata, evidence status |
| Label | 10px / 0.625rem | 500 | Uppercase tracking labels |

Letter-spacing for uppercase labels: `0.05em–0.1em`. Line height: 1.5 body, 1.25 headings.

---

## 10. Icon Style

- **Stroke-based** icons (1.5px stroke at 24px viewBox)
- **Rounded caps and joins**
- **No filled AI metaphors** (brains, robots, sparks)
- **Semantic icons only:** navigation, status, entity type, evidence state
- Icon grid: 24×24px; optical padding 2px
- Color: inherit from text or semantic token—never multicolor icons in UI chrome

Entity icons use **type-based geometric abbreviations** (country code, company initials)—not flags or logos.

---

## 11. Corner Radius Rules

| Element | Radius |
|---------|--------|
| **Buttons (primary)** | 8px (`rounded-lg`) |
| **Cards / panels** | 12px (`rounded-xl`) |
| **Inputs** | 8px |
| **Badges / pills** | 6px |
| **Logo internal curves** | Consistent 2-unit radius on 24-unit grid |
| **Avatars** | 8px (not circular—rounded square for enterprise tone) |

Avoid pill-shaped everything. Prefer **subtle rounding** over full capsules except for status badges.

---

## 12. Spacing Rules

Base unit: **4px**. Standard increments: 4, 8, 12, 16, 24, 32, 48, 64.

| Context | Spacing |
|---------|---------|
| Card padding | 20px (5 units) |
| Section gap | 32px (8 units) |
| Page padding | 24px mobile / 32px desktop |
| Sidebar item | 12px vertical, 12px horizontal |
| Form field gap | 16px |

Whitespace is **evidence of confidence**—crowded layouts imply hidden complexity.

---

## 13. Dark Theme

**Primary platform theme.** Default for CBAI Enterprise.

| Element | Value |
|---------|-------|
| Background | `cbai-ink` / `#09090B` |
| Surface | `#18181B` (zinc-950) |
| Elevated surface | `#18181B` at 50% opacity over ink |
| Text primary | `#FAFAFA` (zinc-50) |
| Text secondary | `#A1A1AA` (zinc-400) |
| Text muted | `#71717A` (zinc-500) |
| Border | `#27272A` (zinc-800) |
| Accent | `#0EA5E9` (sky-500) |

Logo: **white mark on dark** or **single-color accent**—never full-color on dark.

---

## 14. Light Theme

Secondary theme for print, PDF cover pages, and external reports.

| Element | Value |
|---------|-------|
| Background | `#FFFFFF` |
| Surface | `#FAFAFA` |
| Text primary | `#09090B` |
| Text secondary | `#52525B` |
| Border | `#E4E4E7` |
| Accent | `#0284C7` |

Logo: **ink mark on white**. Minimum contrast ratio 7:1 for mark against background.

---

## 15. Motion Principles

Motion communicates **state change**, not personality.

| Principle | Rule |
|-----------|------|
| **Duration** | 150ms micro; 250ms standard; 400ms max for layout |
| **Easing** | `cubic-bezier(0.4, 0, 0.2, 1)` — ease-out for enter, ease-in for exit |
| **Purpose** | Loading evidence, panel expand, status transition only |
| **Forbidden** | Bouncing logos, pulsing "AI active" indicators, particle effects |
| **Reduced motion** | Respect `prefers-reduced-motion`; instant state change fallback |

No autoplay animations on dashboard. Runtime health indicators use **static color**, not ping animation (except optional subtle pulse at 0.5 opacity for critical alerts only).

---

## 16. Accessibility

- All interactive elements keyboard-focusable with visible focus ring (`ring-sky-500/30`)
- Focus order follows visual hierarchy
- Color never sole indicator of state—pair with text label
- Touch targets minimum 44×44px
- Screen reader labels for all icon-only controls
- Evidence status announced as text, not color alone

---

## 17. WCAG Compliance

| Standard | Target |
|----------|--------|
| **WCAG version** | 2.1 Level AA minimum |
| **Text contrast** | 4.5:1 body; 3:1 large text |
| **UI component contrast** | 3:1 against adjacent colors |
| **Non-text contrast** | 3:1 for icons and borders conveying meaning |
| **Logo on dark** | White on `#09090B` exceeds 7:1 |
| **Accent on dark** | Sky-500 on zinc-950 verified for large text and icons |

Audit cadence: each major release. Document exceptions with remediation plan.

---

## 18. Report Branding

Intelligence and compliance reports use a **formal, print-first** sub-system.

- Cover: logo top-left, report title centered, date and version footer
- Header bar: 4px `cbai-accent` left edge stripe (evidence indicator)
- Body: Inter 11pt, 1.6 line height
- Section dividers: 1px `cbai-border`, 32px margin
- Page numbers: bottom-right, muted caption style
- Confidentiality footer: optional; never default fake classification levels

Report titles use sentence case, not ALL CAPS shouting.

---

## 19. Dashboard Branding

Dashboard is the **operational face** of CBAI.

- Sidebar: ink background, white wordmark, section labels in caption style
- No decorative hero gradients exceeding 5% opacity
- Stat cards: elevated surface, monospace for numeric runtime data
- Health status uses semantic colors (healthy/degraded/blocked) with text labels
- "Insufficient Evidence" and "Not Available" states use neutral styling—never red for missing data alone

Dashboard must never imply activity that observability does not confirm.

---

## 20. Country Intelligence Branding

Country module uses **cyan accent** (`#22D3EE`) as secondary module identifier—never flag colors or map palettes by nation.

- Headers: "CBAI Country Intelligence" + constitution compliance subline
- Evidence blocks: card grid with status badges (connected / insufficient / not connected)
- Neutrality notice: always visible on country detail views
- No score color bars without verified evidence
- Persona sections: equal visual weight; no investor persona elevated over others

Geographic data displays **registry facts**—maps are optional and must be non-political (no disputed border styling in brand materials).

---

## 21. Investor Report Branding

Investor-facing exports require **heightened restraint**.

- No projected returns graphics in brand templates
- Risk language uses "Insufficient Evidence" when sources disconnected
- Disclaimers: political neutrality notice + evidence methodology footer
- Charts: monochrome + single accent; no 3D, no stock-photo aesthetics
- Cover subtitle: "Evidence-Based Intelligence — Not Investment Advice"

CBAI brand on investor materials **never implies endorsement** of any jurisdiction or asset.

---

## 22. PDF Branding

| Element | Specification |
|---------|---------------|
| Page size | A4 (210×297mm) primary; Letter optional |
| Margins | 20mm all sides |
| Logo placement | Top-left header, 10mm height |
| Font embedding | Inter subset embedded |
| Links | Accent color, underline on hover (digital PDF) |
| Metadata | Title, Author: CBAI Enterprise, Subject: Intelligence Report |

PDFs exported from platform include generation timestamp and observability version in footer metadata—factual, not marketing.

---

## 23. Watermark Rules

Watermarks are **rare and functional**—not decorative.

| Use case | Watermark |
|----------|-----------|
| Draft / preview | "DRAFT — Not for distribution" at 8% opacity, 45° diagonal |
| Confidential (user-applied) | User-supplied label only; CBAI does not default CONFIDENTIAL |
| Demo environments | "Enterprise Alpha" at 5% opacity |

Never watermark with fake security classifications. Watermark must not impair WCAG contrast of body text.

---

## 24. Favicon Rules

- **Size:** 16×16, 32×32, 48×48 multi-resolution ICO
- **Form:** Simplified icon-only mark (knowledge node + foundation bar; no wordmark)
- **Colors:** `cbai-accent` mark on `cbai-ink` background, or inverse for light browser chrome
- **Legibility:** Test at 16px; eliminate fine lines below 2px stroke
- **No:** Animated favicons, emoji favicons, flag favicons

---

## 25. App Icon Rules

- **Canvas:** 1024×1024px master
- **Safe zone:** Inner 80% (iOS/Android mask compatibility)
- **Background:** Solid `cbai-ink` or `cbai-surface`—no gradients
- **Mark:** Centered simplified logo at 60% of safe zone height
- **Corner radius:** Applied by OS; design on square canvas
- **No:** Gloss effects, shadows, or "AI glow"

---

## 26. Forbidden Usage

**Never:**

- Stretch, rotate, or skew the logo
- Change logo colors outside approved palette
- Add shadows, glows, outlines, or emboss
- Place logo on busy photography without contrast overlay
- Combine logo with forbidden symbols (see mission brief)
- Use logo to imply government endorsement
- Use outdated version after rebrand
- Create derivative marks without brand approval
- Use CBAI mark on partisan campaign materials
- Display fake scores or confidence in branded templates

---

## 27. Brand Voice

| Attribute | Expression |
|-----------|------------|
| **Tone** | Calm, precise, authoritative |
| **Personality** | Senior analyst, not salesperson |
| **Sentence style** | Short declarative; active voice |
| **Jargon** | Technical when needed; always defined |
| **Claims** | Evidence-qualified; "may," "when connected," "insufficient evidence" |
| **Avoid** | Hype, superlatives, "revolutionary," "disruptive," "magic" |

**Example — on brand:**  
"Runtime health is degraded. Three queue items pending evaluation."

**Example — off brand:**  
"Our AI supercharges your global insights instantly!"

---

## 28. Visual Tone

**Keywords:** Restrained · Precise · Global · Trustworthy · Timeless · Enterprise · Evidence-calmed

**References (tone, not copying):** Bloomberg Terminal clarity, Apple product restraint, Stripe developer trust, Notion information hierarchy, OpenAI research sobriety.

**Anti-references:** Crypto dashboards, consumer AI chat apps, sci-fi HUD interfaces, political campaign sites, startup gradient landing pages.

Photography (if used): abstract architecture, neutral workspaces, data environments—never flags, handshakes with politicians, or robot stock imagery.

---

## 29. Future Logo Evolution

Logo evolution follows **constitutional amendment process**, not trend response.

| Phase | Trigger |
|-------|---------|
| **v1.0** | Current foundation (this document) |
| **v1.x** | Optical refinements; no semantic change |
| **v2.0** | Major platform milestone; requires constitution review |

Evolution constraints: preserve evidence→balance→knowledge chain meaning; maintain geometric construction; never add figurative AI elements.

Deprecation period for old marks: **minimum 12 months** parallel support in templates.

---

## 30. Versioning

| Field | Value |
|-------|-------|
| **Brand foundation version** | 1.0.0 |
| **Document date** | July 2026 |
| **Owner** | CBAI Enterprise Design Authority |
| **Review cycle** | Annual or upon major platform release |
| **Change log** | Maintained in `docs/brand/CHANGELOG.md` (future) |
| **Related docs** | `logo-concepts.md`, CBAI Constitution, Golden Rule |

Semantic versioning:

- **Major:** Logo form or primary palette change
- **Minor:** New application rules (e.g., PDF template)
- **Patch:** Clarifications, typo fixes

---

## Summary

The CBAI brand is **infrastructure for trusted intelligence**—not a consumer AI product identity. Every rule in this foundation serves evidence, neutrality, and enterprise permanence. Visual execution follows documentation; final SVG assets are produced only after concept selection and constitutional approval.

**Next step:** Review three logo concepts in `logo-concepts.md` and select direction for Phase 2 asset production.
