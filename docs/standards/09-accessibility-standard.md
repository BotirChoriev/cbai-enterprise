# 09 — Accessibility Standard

**Document ID:** CBAI-Standard-09-Accessibility  
**Version:** 1.0.0  
**Status:** Official

---

## Purpose

Ensure CBAI Enterprise is usable by people with disabilities and assistive technologies. Accessibility is a constitutional requirement for **Human Benefit** — intelligence platforms must not exclude operators who rely on keyboard, screen readers, or high-contrast modes.

---

## Principles

- **WCAG 2.1 Level AA** — minimum conformance target for all user-facing routes
- **Perceivable** — information not conveyed by color alone
- **Operable** — keyboard and pointer access to all interactive elements
- **Understandable** — clear labels, consistent navigation, readable status language
- **Robust** — valid semantic HTML and ARIA where needed

---

## Architecture

```
Semantic HTML (headings, landmarks, lists)
        │
        ▼
Keyboard navigation & focus management
        │
        ▼
ARIA enhancements (where native semantics insufficient)
        │
        ▼
Contrast & responsive text (Design Standard 08)
        │
        ▼
Testing (automated axe + manual screen reader passes)
```

Accessibility applies to web now; mobile native apps inherit equivalent requirements ([10 — Mobile](./10-mobile-standard.md)).

---

## Rules

1. All interactive elements must be reachable and operable via keyboard alone.
2. Focus order must follow visual reading order.
3. Color contrast minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA).
4. Status must not rely on color alone — include text label (e.g. "Not connected").
5. Images and icons require `alt` text or `aria-hidden` when decorative.
6. Graph canvas must expose textual alternative (edge list, entity summary panel).
7. Motion respects `prefers-reduced-motion`.
8. Form inputs require associated labels and error descriptions.

---

## WCAG AA checklist (platform)

| Criterion | CBAI application |
|-----------|------------------|
| 1.1.1 Non-text content | Alt text for logos; decorative SVGs hidden |
| 1.3.1 Info and relationships | Heading hierarchy h1→h2→h3 on entity pages |
| 1.4.3 Contrast | Zinc palette audited in light and dark |
| 2.1.1 Keyboard | Search, nav, graph selection without mouse |
| 2.4.1 Bypass blocks | Skip to main content link in shell |
| 2.4.7 Focus visible | Focus ring on all interactive elements |
| 3.3.2 Labels | Search inputs, filters labeled |
| 4.1.2 Name, role, value | Buttons and tabs have accessible names |

---

## Keyboard

- `Tab` / `Shift+Tab` — move focus through interactive elements
- `Enter` / `Space` — activate buttons and links
- `Escape` — close modals and dismiss panels
- Graph: arrow keys for node cycling (when implemented); selection announced to screen readers
- No keyboard traps except intentional modal dialogs with escape path

---

## Screen readers

- Page `<title>` reflects entity name and route
- Landmarks: `header`, `nav`, `main`, `footer`
- Live regions (`aria-live="polite"`) for async status updates — not for fake score changes
- Evidence status announced as text: "GDP, not connected"
- Relationship lists readable without canvas visualization

---

## Contrast

| Surface | Foreground | Minimum ratio |
|---------|------------|---------------|
| Dark body text | zinc-300 on zinc-950 | 4.5:1 |
| Dark muted | zinc-500 on zinc-950 | 4.5:1 for large text only |
| Light body | zinc-700 on white | 4.5:1 |
| Status badges | text + border, not color alone | 4.5:1 |

Audit both dark (primary) and light modes before route sign-off.

---

## ARIA

**Use when:**

- Custom tabs, accordions, comboboxes without native elements
- Graph selection state (`aria-selected`, `aria-current`)
- Loading states (`aria-busy`)

**Avoid:**

- Redundant ARIA on native elements (`role="button"` on `<button>`)
- `aria-label` hiding visible text inconsistently
- ARIA live regions for decorative animations

---

## Allowed

- Skip links, focus rings, visible focus styles
- Textual status alongside color badges
- Graph connections panel as screen-reader-accessible edge list
- High-contrast mode via light theme or OS preference
- Accessibility statement page (future)

---

## Forbidden

- Keyboard-inaccessible graph as only relationship view
- Color-only red/green for risk or investment judgment
- Auto-playing animations without reduced-motion fallback
- Placeholder buttons with no accessible name
- Inaccessible custom dropdowns in search or nav
- Removing focus outlines without replacement

---

## Examples

**Compliant**

```html
<span class="badge">Not connected</span>
<span class="sr-only">GDP data not connected to World Bank source</span>
```

**Compliant — graph fallback**

> Connections panel lists: "Stanford — research partner — NVIDIA (evidence available)"

**Non-compliant**

> Red/green dot only indicating "good/bad" investment climate

---

## Future expansion

- Automated axe-core in CI per route
- Screen reader test script for six persona blocks
- iOS VoiceOver and Android TalkBack parity matrix
- Accessibility conformance report (VPAT)
- User-configurable text size and contrast themes

---

## Cross-references

- [08 — Design Standard](./08-design-standard.md)
- [10 — Mobile Standard](./10-mobile-standard.md)
- [07 — Persona Standard](./07-persona-standard.md)
- [01 — Constitution](./01-cbai-constitution.md)
