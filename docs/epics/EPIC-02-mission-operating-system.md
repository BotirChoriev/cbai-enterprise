# EPIC-02 — Mission Operating System

**Status:** In implementation  
**Owner:** CBAI Product  
**Constitution:** `docs/standards/01-cbai-constitution.md` (authoritative — not duplicated here)  
**Supreme Principles:** `lib/constitution/supreme-principles.ts`

---

## Purpose

Mission Center, lifecycle, Mission Thread, context, questions, evidence, reasoning, impact, report, legacy, continuity.

---

## Constitution alignment

- Evidence First — all claims trace to stored artifacts or honest unavailable labels
- Capability Before Status — no title or diploma gates in this EPIC's active surfaces
- Humanity First — features serve understanding and welfare, not engagement metrics
- Technology Expands Human Potential — human decision boundary preserved

See also: `docs/product/CBAI-EPIC-OPERATING-MODEL.md`

---

## Real user problem

Users need a mission-driven, evidence-first operating environment — not a chatbot or dashboard — that connects their questions, projects, evidence, impact review, and reusable knowledge across routes.

---

## Product outcome

Mission Center, lifecycle, Mission Thread, context, questions, evidence, reasoning, impact, report, legacy, continuity.

---

## Architecture boundary

**In scope:** lib/intelligence-os/mission-*, components/canvas/, components/mission/

**Out of scope:** Fabricated collaborators, simulated external APIs, global human rankings, profession-only portals.

---

## Implementation phases

1. **Foundation** — types, stores, honest labels, module accountability
2. **Functional** — real user workflows on device-local data
3. **Verified** — browser regression + Node test suites pass
4. **Production-ready** — cloud sync, auth, and scale (EPIC-15 dependency)

---

## Dependencies

| EPIC | Relationship |
|------|--------------|
| EPIC-01 | Constitution and accountability |
| EPIC-02 | Mission context for dependent surfaces |
| EPIC-06 | Evidence provenance |
| EPIC-15 | Production deployment |

---

## Data requirements

Device-local storage (`localStorage`) for Phase 1. Cloud persistence requires EPIC-15 Supabase connection.

---

## Privacy considerations

Default device-local. No silent profile inference. User controls visibility for capability signals (EPIC-03).

---

## Fairness considerations

No status, wealth, country, or institution prestige as hidden proxies. See `docs/product/CBAI-DISCOVERY-FAIRNESS.md`.

---

## Safety limitations

Device-local only. No cloud mission sync. Collaboration stage is documentation-only.

---

## Measurable acceptance criteria

- [ ] Real user workflow completable without fabricated data
- [ ] Module accountability registered for active routes
- [ ] Human Decision Boundary on conclusion surfaces
- [ ] Tests pass: `npm run test:epic-governance`, relevant domain suites
- [ ] Browser regression: zero hydration errors on primary routes

---

## Browser verification

`npm run test:browser-regression` — primary routes, language sweeps, mobile overflow, mission continuity.

---

## Test requirements

Domain-specific Node tests under `scripts/test-*`. EPIC mapping: `npm run test:epic-governance`.

---

## Rollout conditions

- Lint, TypeScript, build pass
- No raw translation keys on primary routes
- Accessibility preserved (focus rings, aria labels)
- Do not mark Production-ready until EPIC-15 gates met

---

## Genuine remaining limitations

Device-local only. No cloud mission sync. Collaboration stage is documentation-only.

---

## Status dimensions

| Dimension | State |
|-----------|-------|
| Architecture | Established |
| Product | In implementation |
| User workflow | Active |
| Data | Device-local |
| Trust | Module accountability registered |
| Test | Node + browser suites |
| Production | Not until EPIC-15 |
