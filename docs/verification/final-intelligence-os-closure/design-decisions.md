# Design decisions — Final Intelligence OS Closure

## DD-CLOS-001 — Local voice port occupation

**Options**
- A: Always exit when 8788/3000 busy (current prior behavior).
- B: Kill whatever holds the port.
- C: Probe for healthy CBAI broker/app; reuse if healthy; otherwise exit with precise identify/stop guidance (never kill).

**Scores (clarity / IOS identity / a11y / scale / responsive / risk)**
- A: 6/5/7/6/n-a/3 — clear but brittle; fails when a healthy broker already runs.
- B: 4/3/3/4/n-a/2 — dangerous; can kill unrelated processes.
- C: 9/8/8/9/n-a/8 — deterministic, safe, matches developer reality.

**Selected:** C
**Implemented in:** `scripts/dev-voice.mjs`, `scripts/voice-dev-utils.mjs`, `scripts/doctor-voice.mjs`

## DD-CLOS-002 — Canonical Evidence route

**Options**
- A: Keep Evidence at `/knowledge` only.
- B: Move exclusively to `/evidence` and break `/knowledge`.
- C: Add `/evidence` as canonical; keep `/knowledge` as compatible alias to the same surface.

**Selected:** C — matches IA contract without breaking deep links.

## DD-CLOS-003 — Spatial home light-mode shell (pending live verify)

**Options**
- A: Keep light sidebar + dark canvas (mixed shells).
- B: Force entire home chrome (sidebar+topbar+canvas) onto deep navy spatial atmosphere in light theme.
- C: Invert home to warm light canvas globe (loses Spatial OS identity).

**Selected:** B (already tokenized via `.cbai-spatial-home-chrome`; verify live and strengthen if needed).

## DD-CLOS-004 — Home sidebar IA source

**Options**
- A: Keep abbreviated `operatingNavigationItems` on Spatial home only.
- B: Duplicate a second home-only nav config.
- C: Always render canonical `primaryNavSections` + progressive `secondaryNavSections` on every route (spatial styling on home).

**Scores:** A fails Phase 3 IA (missing My Work/Graph/Investor/Government/Governance/About). B drifts. C: 10/10/9/10/9/8.

**Selected:** C — `OperatingNavigator.tsx`. Settings + About promoted into primary System section.

## DD-CLOS-005 — Globe environment fallback

**Options**
- A: Force fallback for all `innerWidth < 768` at first paint (sticky).
- B: Always attempt WebGL; only reduced-motion forces list.
- C: Environment fallback for reduced-motion OR (narrow ∧ coarse pointer); re-evaluate on resize/media change; WebGL failure separate.

## DD-CLOS-006 — Home mission strip

**Options**
- A: Keep EngineRouteEntryStrip Mission Engine on Spatial home.
- B: Restyle the strip only.
- C: Suppress engine strip on `/` — Spatial home already owns Speak + Operator + mission continue.

**Selected:** C — removes duplicate mission CTA / white-panel feel on home.

## DD-CLOS-007 — UZ About title

**Options**
- A: Keep `Haqida`.
- B: Use `CBAI haqida` for page title (nav already uses this).
- C: Longer marketing title.

**Selected:** B — matches closure copy requirement.
