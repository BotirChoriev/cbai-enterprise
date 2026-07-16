# CBAI Discovery Fairness

**EPIC:** EPIC-04  
**Code:** `lib/discovery/discovery-engine.ts`, `lib/epics/capability-safety-rules.ts`

**Constitution:** [`docs/standards/01-cbai-constitution.md`](../standards/01-cbai-constitution.md)

---

## Purpose

Discovery and opportunity matching must connect complementary capabilities — never create popularity contests or prestige proxies.

---

## Fairness rules

- No status-based ranking
- No country prestige proxy
- No university prestige proxy
- Recommendation explanations required before any match is shown
- Privacy and consent before matching
- Bias audit before expansion
- No fabricated collaborators or opportunities
- No private data exposure in emerging talent discovery

---

## Current honest state

`runDiscoveryEngine()` returns `connected: false` with an explicit limitation string. No external network. No simulated recommendations.

**Do not expand Discovery UI until EPIC-03 user controls and consent flows exist.**

---

## Architecture before implementation

1. Consent model for visibility and matching
2. Explanation schema for every recommendation
3. Bias audit checklist in EPIC-04 acceptance criteria
4. Governance test guards in `test-epic-governance.ts`
