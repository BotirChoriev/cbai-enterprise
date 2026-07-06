# 04 — Entity Standard

**Document ID:** CBAI-Standard-04-Entity  
**Version:** 1.0.0  
**Status:** Official

---

## Purpose

Define how CBAI models intelligence objects — countries, companies, universities, government institutions, and future entity types. All modules normalize to a common consumption shape; domain modules own authoritative data; adapters transform without duplicating.

---

## Principles

- **Entity-first** — UI, search, graph, and reasoning consume normalized entities
- **Single source of truth** — data lives in `lib/{module}.ts`; adapters map to Entity
- **Golden Rule** — unavailable fields use honest labels, never invented values
- **Platform Consistency** — all entity routes follow the same intelligence block pattern
- **Evidence First** — every displayed field declares evidence scope

---

## Architecture

```
Domain Module (lib/countries.ts, lib/companies.ts, …)
        │
        ▼
Adapter (lib/{module}.adapter.ts) → Entity
        │
        ├── Global Search index
        ├── Knowledge Graph nodes
        ├── Intelligence blocks (UI)
        └── Reasoning / Evidence (future)
```

**Universal Entity** is the runtime shape. Domain types (`Country`, `Company`, `University`) are authoring shapes.

---

## Rules

1. No entity route renders bespoke detail layouts when shared entity components suffice.
2. Entity IDs are stable slugs — never regenerated on deploy.
3. Intelligence blocks show evidence status per section (available, not connected, planned).
4. Scores and AI summaries are forbidden on compliant routes unless backed by verified evidence chain.
5. New entity types require domain module, adapter, graph node type, and constitution audit.
6. `/countries` is the Golden Rule reference implementation for entity UX.

---

## Entity types

### Countries

| Aspect | Standard |
|--------|----------|
| Ontology | Sovereign geographic-economic intelligence unit |
| Route | `/countries` |
| Registry scope | Local catalog facts (name, code, region, capital) |
| Extended data | Requires connected indicators (economy, governance, …) |
| Status | Active — Golden Rule reference |

### Companies

| Aspect | Standard |
|--------|----------|
| Ontology | Commercial organization intelligence unit |
| Route | `/companies` |
| Registry scope | Catalog facts (name, industry, country ref, founded) |
| Extended data | Financial and innovation indicators when sources connect |
| Status | Active — must match countries honesty pattern |

### Universities

| Aspect | Standard |
|--------|----------|
| Ontology | Academic and research institution |
| Route | `/universities` |
| Registry scope | Catalog facts (name, city, country, type) |
| Extended data | Research and education indicators when sources connect |
| Status | Active — no rankings or league tables |

### Government institutions

| Aspect | Standard |
|--------|----------|
| Ontology | Public sector body (ministry, agency, regulator) |
| Route | Planned (`/institutions` or nested under countries) |
| Registry scope | Official gazette and administrative registries |
| Applicable indicators | Governance, public services, procurement, budget |
| Status | Declared — schema prepared in indicator framework |

### Future entities

| Type | Status | Notes |
|------|--------|-------|
| Investor | Declared | Fund, VC, sovereign wealth — investment indicators |
| Person | Declared | Public officials, researchers — strict privacy governance |
| NGO / multilateral | Planned | Institution subtype |
| Infrastructure asset | Planned | Graph node, not primary entity route |

---

## Intelligence blocks (entity UI pattern)

Each entity detail view uses consistent blocks:

1. Registry facts (always labeled source)
2. Applicable indicators (status per indicator)
3. Relationships (with evidence status)
4. Persona value (honest guidance)
5. Trust / methodology footer

Order may vary; honesty and status labels may not.

---

## Allowed

- Local registry fields with "Available — local registry"
- Indicator lists with not_connected / planned status
- Empty sections with "Not connected" and required source names
- Six persona sections with role-specific honest guidance
- Entity icons and initials from catalog (no fake logos)

---

## Forbidden

- Fabricated `aiSummary`, investment scores, risk scores, AI readiness percentages
- University league table rankings or "Top 10" positioning
- Company "confidence" or "recommendation" labels without evidence
- Duplicate entity stores in graph or search separate from domain modules
- Entity fields with plausible invented numbers (GDP, revenue, enrollment) when sources disconnected

---

## Examples

**Compliant — country block**

> **Capital:** Tashkent · Source: local registry  
> **GDP:** Not connected · Required: World Bank national accounts indicator

**Compliant — company block**

> **Industry:** Technology · Source: local registry  
> **Patent filings:** Not connected · Indicator: patent-filing-disclosure

**Non-compliant**

> **AI Readiness:** 94.2% · **Risk:** Low · **Recommendation:** Strong buy

---

## Future expansion

- Government institution module and adapter
- Investor and person entities with privacy tiering
- Entity watchlists and temporal snapshots
- Cross-entity comparison views (methodology-first, no ranking tables)
- Entity API resources per [11 — API Standard](./11-api-standard.md)
- Subnational entities (regions, cities) as graph nodes

---

## Cross-references

- [01 — Constitution](./01-cbai-constitution.md)
- [03 — Indicator Standard](./03-indicator-standard.md)
- [05 — Relationship Standard](./05-relationship-standard.md)
- [07 — Persona Standard](./07-persona-standard.md)
- `docs/CBAI-Domain-Model-v1.md`
