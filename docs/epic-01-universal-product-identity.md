# EPIC-01 — Universal Product Identity, Positioning, and Platform Entry Experience

## Official product definition

> CBAI is a universal Intelligence Operating System that helps people and organizations
> observe, measure, analyze, connect evidence, identify problems, compare options, understand
> consequences, and make informed human decisions. CBAI never makes the final decision —
> humans do.

## The three ecosystems

CBAI's first major ecosystems, all built on one shared Intelligence Core (evidence, workflow,
and human decision support):

1. **Research Intelligence — flagship.** Missions, evidence, review, readiness, health, and a
   deterministic workflow engine. Real and available today at `/research` (64 catalog research
   topics).
2. **Governance Intelligence.** Countries, institutions, law, and public administration
   evidence. Never ranks or labels a country as "best." In development.
3. **Economic Intelligence.** Official economic indicators, markets, and investment evidence.
   Never issues investment commands or fabricated forecasts. Future workspace.

Public search across countries, companies, and universities (`/search`) is the shared entry
point into the Intelligence Core — not a fourth competing ecosystem.

## Human sovereignty principle

CBAI may observe, measure, analyze, connect, explain, compare, and recommend with evidence. It
never commands, silently ranks people/states/institutions as "best," replaces professional
judgment, fabricates conclusions, presents itself as a source, or hides uncertainty. Final
judgment and responsibility always belong to humans.

## Universal / domain-agnostic rule

CBAI is not designed for one profession, discipline, institution type, or country. Domains
(Research, Governance, Economic, and future ecosystems) are extensions of one permanent
Intelligence Core.

## What this Epic changed

- **Metadata** (`app/layout.tsx`): replaced generic "Enterprise AI Platform" title/description
  with the Intelligence Operating System positioning above.
- **Logo** (`components/brand/CBAILogo.tsx`): preserved — the existing mark is functional,
  accessible (`aria-hidden` icon + real text wordmark), and consistently sized/used across the
  app. Reduced glow/blur intensity only, to move it toward the "calm, restrained" direction
  without introducing unverified new artwork. A full mark replacement (e.g. the "Foundation
  Mark" concept in `docs/brand/logo-concepts.md`) was considered but deliberately deferred —
  implementing new SVG geometry from a written spec without any way to visually verify the
  result carries real risk of shipping something broken or worse than what exists today.
- **Hero** (`components/platform/home/HomeHero.tsx`): new headline ("Evidence, connected. /
  Decisions, still human."), a category eyebrow, a positioning paragraph, and exactly two CTAs
  (primary → `/research`, secondary → `/search`) plus three example search chips as an optional
  tertiary path. Removed the inline search form to avoid a third competing primary action.
- **Hero visual** (`components/platform/home/HomeHeroVisual.tsx`): replaced the decorative
  glowing-globe SVG with a compact panel rendering the real `CBAI_ECOSYSTEMS` list — product
  composition from real data, not decoration.
- **Ecosystems** (`lib/cbai-ecosystems.ts`, `HomeEcosystems.tsx`): Research Intelligence is now
  `available-today` with a real `/research` link and a "Flagship" badge, its bullets rewritten
  to describe what was actually built (mission, evidence, review, readiness/health/workflow
  engines) rather than aspirational copy. "Public Intelligence" renamed to "Evidence Core" and
  reordered last, reframed as the shared entry point rather than a fourth ecosystem.
- **New sections**: `HomeCapabilityFlow.tsx` (the ten-stage Observe→...→Human Decision
  lifecycle, one connected sequence, not disconnected feature cards) and `HomeAudience.tsx` (six
  grouped audience categories covering every role named in the constitution, without
  over-emphasizing one group).
- **Trust section**: revived the existing (previously unused) `HomeTrust.tsx` +
  `TRUST_PILLARS`, rewriting the eight pillars to explicitly cover the required trust mechanics
  (sources before conclusions, uncertainty visible, explainable recommendations, comparable
  alternatives, consequences shown, AI never the source, history preserved, humans decide).
  Fixed a heading-hierarchy gap (the section header was a styled `<p>`, not a real heading) as
  part of activating it on the live page.
- **Footer**: revived the existing (previously unused) `HomeFooter.tsx`, wired as a page-level
  sibling after `<main>` rather than nested inside it.
- **Navigation** (`lib/navigation.ts`, `Sidebar.tsx`, `Topbar.tsx`): deliberately **not**
  changed. The existing sidebar-based nav already avoids a governance-only impression (Search,
  Countries, Companies, Universities, Evidence, Research, Research Workspace, Reports) and is
  used on every route in the app — restructuring it carries regression risk disproportionate to
  the audit's actual findings, which were about the *landing page's* framing, not nav labels.

## What remains demo, in development, or incomplete

- Governance and Economic Intelligence have no live external data — both are honestly labeled
  "In development" / "Future workspace" on the homepage, with no working route from their
  ecosystem cards.
- `/research/evidence` and `/research/review` remain explicitly placeholder pages (their own
  in-page copy already states this) — untouched by this Epic.
- Roughly ten other `components/platform/home/Home*.tsx` files remain unused after this Epic
  (`HomeHeroSearch`, `HomeGlobalImpact`, `HomeLanguages`, `HomeModules`, `HomePersonas`,
  `HomePlatformMap`, `HomePlatformStatus`, `HomeRoadmapTimeline`, plus `HomeHeroIllustration`).
  Left in place rather than deleted, per this session's established preserve-for-reversibility
  convention — none are wired to any route.
- Per `docs/platform-transformation-master-plan.md`'s last audit, `/companies` and
  `/universities` still contain fabricated confidence scores and rankings — out of scope for
  this Epic (landing/entry experience only) but a known, pre-existing constitution violation
  worth flagging for a future Epic.
- No visual/screenshot verification tool is available in this environment; responsive and
  visual checks below were performed via Tailwind breakpoint/class review, not rendered
  screenshots.
