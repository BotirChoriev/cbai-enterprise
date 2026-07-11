# CBAI Current Progress

Snapshot as of EPIC-02. Update this file, not a new one, as state changes.

## Real and working today

- **Research Intelligence** (`/research`, `/research/[topicId]`): 65 catalog topics, real
  static generation per topic, full Gap → Decision → Readiness → Health → Workflow engine
  stack, Research Cockpit, URL-driven evidence selection (`?evidence=`), honest empty states
  for notes/findings/timeline (no persistence exists yet, so these are always empty — not a
  bug).
- **Universal Intelligence Foundation** (`lib/foundation/`): ten pillars defined, one working
  adapter (Research), verified by successful `npm run build` (structural type-check against
  every real engine output).
- **Public entry experience**: hero, three-ecosystem model, capability flow, audience section,
  trust section — all real, honest content, no fabricated statistics.
- **Public search / Evidence Core** (`/search`, `/countries`, `/companies`, `/universities`):
  functional profile search and review; per the last constitution-compliance audit
  (`docs/platform-transformation-master-plan.md`), `/countries` is compliant but `/companies`
  and `/universities` still contain fabricated confidence scores — a known, pre-existing issue,
  not introduced by this Epic and not yet fixed.

## Honest placeholders (explicitly labeled as such in-product)

- `/research/evidence` and `/research/review` — standalone pages, each rendering a single
  hardcoded placeholder record with in-page copy stating "no live data is connected yet."
- Notes, Findings, and Workspace Timeline sections in the Review Workspace — always empty,
  because no persistence layer exists anywhere in this platform.
- `getWorkspaceMemory()` — always returns `undefined`; "Continue where you left off" always
  shows "No previous session recorded yet."

## In development / future workspace (labeled honestly on the homepage)

- **Governance Intelligence** — no live external data, no route from its ecosystem card.
- **Economic Intelligence** — same.

## Explicitly not started this Epic (by design)

- No deep rewrite of Research Intelligence's internal engines to literally implement the
  Foundation interfaces — only a translation adapter and one zero-risk type alias
  (`ReviewOpenQuestion`). A full internal rewrite was judged too high-risk to attempt without a
  way to visually/behaviorally verify the result in this environment.
- No Governance or Economic foundation adapter — nothing real to adapt yet.
- No wiring of `IntelligenceFoundationView` into any UI component — it is currently proven only
  at the type level (`npm run build`) and is available for a future Epic to render.

## Known technical debt

- `/companies` and `/universities` fabricated-score issue (see above) — pre-existing, not
  addressed by EPIC-01 or EPIC-02.
- `lib/research/entities/` (a separate, broader entity/relationship catalog — organisms,
  diseases, technologies, publications, etc.) is not yet connected to the Foundation's
  `Relationship` pillar or to the topic detail page's workflow at all. The Foundation's
  research adapter currently derives relationships only from `ResearchTopic.relatedMethods` /
  `relatedEvidenceTypes`. Flagged as a natural next integration point, not attempted this Epic
  to keep the change set verifiable.
- `lib/research/review/` (the standalone `ResearchReview`/`ReviewAssignment`/etc. domain from
  the RI-BUILD-027 series) remains disconnected from any real topic — still only consumed by
  the standalone `/research/review` placeholder page.
