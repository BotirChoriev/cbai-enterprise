# 10 — Mobile Standard

**Document ID:** CBAI-Standard-10-Mobile  
**Version:** 1.0.0  
**Status:** Official

---

## Purpose

Define how CBAI Enterprise delivers constitution-compliant intelligence on mobile surfaces — responsive web, future iOS and Android clients, and offline-ready experiences. Mobile is an equal platform surface, not a degraded afterthought.

---

## Principles

- **Platform Consistency** — same evidence honesty rules as desktop
- **Human Benefit** — mobile users receive full status transparency
- **Golden Rule** — no mobile-only fabricated scores to simplify UI
- **Progressive disclosure** — depth on demand, not hidden unavailable data
- **Offline readiness** — cache registry facts; never cache invented intelligence

---

## Architecture

```
Responsive Web (Next.js static export — current)
        │
        ├── Breakpoints: mobile / tablet / desktop (Design 08)
        │
        ├── Future: iOS native client
        ├── Future: Android native client
        └── Future: Desktop wrapper (Electron/Tauri)
                │
                ▼
        Shared API contracts (11) + local registry cache
```

**Current state:** Web responsive only. Native clients planned; standards apply at design time.

---

## Rules

1. All entity routes must be usable at 375px viewport width without horizontal scroll (except graph canvas).
2. Touch targets minimum 44×44 CSS pixels.
3. Mobile UI must show same evidence status labels as desktop — no simplification to fake scores.
4. Offline mode may serve cached registry facts with sync timestamp — not stale evaluations.
5. Native apps must use shared design tokens and persona structure from standards 07–09.
6. Push notifications (future) may alert on evidence connection changes — not promotional rankings.

---

## iOS

| Requirement | Standard |
|-------------|----------|
| Minimum version | iOS 16+ (target at launch) |
| Framework | SwiftUI recommended |
| Accessibility | VoiceOver parity with web ([09](./09-accessibility-standard.md)) |
| Safe areas | Respect notch and home indicator |
| Typography | Dynamic Type support |
| Offline | Core registry SQLite cache + sync metadata |
| Authentication | Face ID / Touch ID for tenant apps (future) |

**Forbidden on iOS:** App Store screenshots with fabricated scores; hidden desktop-only disclaimers.

---

## Android

| Requirement | Standard |
|-------------|----------|
| Minimum version | API 26+ (Android 8.0) |
| Framework | Jetpack Compose recommended |
| Accessibility | TalkBack parity |
| Material | Adapt CBAI tokens — do not use Material defaults that conflict with brand |
| Offline | Room database for registry cache |
| Back navigation | Predictable back stack per entity |

---

## Responsive web

| Breakpoint | Layout |
|------------|--------|
| < 768px | Single column, stacked intelligence blocks |
| 768–1023px | Two column where appropriate |
| ≥ 1024px | Full desktop layout |

- Navigation: collapsible shell menu
- Graph: tabbed panels (entity / graph / connections) on mobile
- Search gateway: stacked sections with anchor nav
- Tables: horizontal scroll only with visible scroll hint — prefer card layout

---

## Offline readiness

| Data class | Offline behavior |
|------------|------------------|
| Local registry facts | Cache with `lastSyncedAt` |
| Indicator registry | Cache static definitions (versioned) |
| Connected source data | Not available offline unless explicitly synced |
| Evaluations / scores | Not cached until verified evaluation layer exists |
| Graph edges | Cache catalog edges; show evidence status |

**Sync strategy (future):** Background sync on connectivity restore; conflict resolution favors source timestamp.

---

## Allowed

- Responsive Tailwind layouts matching design standard
- Accordion persona sections on narrow viewports
- "Offline — registry cache from {date}" banner
- Native apps sharing API schema with web
- PDF export triggered from mobile web (future)

---

## Forbidden

- Mobile-only demo scores to " improve engagement"
- Hiding "not connected" labels on small screens
- Graph-only relationship view without list fallback
- Infinite scroll with fabricated preview cards
- iOS/Android apps that bypass evidence standards
- Offline mode inventing data when cache empty

---

## Examples

**Compliant — mobile entity header**

> Uzbekistan · Asia  
> Capital: Tashkent · Local registry  
> [Indicators ▼] accordion

**Compliant — offline banner**

> Offline mode · Registry data from July 4, 2026 · Indicators require connection

**Non-compliant**

> Swipe for AI investment score ⭐⭐⭐⭐⭐

---

## Future expansion

- Native iOS and Android v1 with registry + indicator browse
- Biometric session for enterprise tenants
- Widget: entity watchlist status (no scores)
- Share sheet with source attribution links
- Mobile CI screenshot regression against forbidden patterns

---

## Cross-references

- [08 — Design Standard](./08-design-standard.md)
- [09 — Accessibility Standard](./09-accessibility-standard.md)
- [11 — API Standard](./11-api-standard.md)
- [01 — Constitution](./01-cbai-constitution.md)
